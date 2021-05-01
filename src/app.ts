import Fastify from 'fastify'
import { getLatestBlockNumber, getBlock, getTransaction } from './web3'
import { Connection, createConnection } from 'typeorm'
import { Block } from './entity/Block'
import { Transaction } from './entity/Transaction'

const fastify = Fastify({ logger: true })

fastify.get('/api/test', async (req, res) => {
	res.send({ success: true })
})

fastify.get('/api/blockNumber', async (req, res) => {
	const conn: Connection = await createConnection()
	const blockNumberFromDb = await conn.getRepository(Block).find({
		select: ['number'],
		order: {
			number: 'DESC',
		},
		take: 1,
	})
	await conn.close()
	const blockNumberFromNetwork = await getLatestBlockNumber()
	res.send({ blockNumberFromNetwork, blockNumberFromDb: blockNumberFromDb[0].number })
})

fastify.get('/api/blocks', async (req, res) => {
	const conn: Connection = await createConnection()
	const blocks = await conn.getRepository(Block).find({
		order: { number: 'DESC' },
		take: 50,
		relations: ['transactions'],
	})
	await conn.close()
	res.send(blocks)
})

fastify.get('/api/block/:blockNumber', async (req, res) => {
	const params: any = req.params
	if (!params.blockNumber) {
		return res.status(400).send({ message: 'blocknumber should be included' })
	}
	const conn: Connection = await createConnection()
	const block = await conn
		.getRepository(Block)
		.find({ where: { number: params.blockNumber }, relations: ['transactions'] })
	await conn.close()
	if (block.length === 0) return res.status(404).send({ error: 'Block not found' })
	return res.send(block[0])
})

fastify.get('/api/tx/:tx', async (req, res) => {
	const params: any = req.params
	if (!params.tx) {
		return res.status(400).send({ message: 'transaction hash should be included' })
	}
	const conn: Connection = await createConnection()
	const tx = await conn.getRepository(Transaction).find({ where: { hash: params.tx }, relations: ['block'] })
	await conn.close()
	if (tx.length === 0) return res.status(404).send({ error: 'Transaction not found' })
	return res.send(tx[0])
})

fastify.get('/api/check-new-block', async (req, res) => {
	const conn: Connection = await createConnection()
	const blockNumberFromDb = await conn.getRepository(Block).find({
		select: ['number'],
		order: {
			number: 'DESC',
		},
		take: 1,
	})
	const blockNumberFromNetwork = await getLatestBlockNumber()
	if (blockNumberFromDb[0].number === blockNumberFromNetwork) {
		await conn.close()
		return res.send({ message: `DB and network is in sync with block number ${blockNumberFromNetwork}` })
	}

	let count = 0
	for (let num = blockNumberFromDb[0].number; num <= blockNumberFromNetwork; num += 100) {
		const insertBlockOps: Promise<any>[] = []
		const txs: Transaction[] = []
		const getBlockOps: Promise<any>[] = []
		for (let i = 0; i < 100 && i + num <= blockNumberFromNetwork; i++) {
			getBlockOps.push(getBlock(i + num))
		}
		const blocks = await Promise.all(getBlockOps)
		for (let j = 0; j < blocks.length; j++) {
			count++
			const block = blocks[j]
			const recordBlock = new Block()
			recordBlock.difficulty = block.difficulty ? block.difficulty.toString() : undefined
			recordBlock.extraData = block.extraData
			recordBlock.gasLimit = block.gasLimit
			recordBlock.gasUsed = block.gasUsed
			recordBlock.hash = block.hash
			recordBlock.logsBloom = block.logsBloom
			recordBlock.miner = block.miner
			recordBlock.nonce = block.nonce
			recordBlock.number = block.number
			recordBlock.parentHash = block.parentHash
			recordBlock.receiptsRoot = block.receiptRoot
			recordBlock.sha3Uncles = block.sha3Uncles
			recordBlock.size = block.size
			recordBlock.stateRoot = block.stateRoot
			recordBlock.timestamp = new Date(block.timestamp)
			recordBlock.totalDifficulty = block.totalDifficulty ? block.totalDifficulty.toString() : undefined
			recordBlock.transactionsRoot = block.transactionRoot

			for (let i = 0; i < block.transactions.length; i++) {
				const txHash = block.transactions[i]
				const tx = await getTransaction(txHash)
				const transaction = new Transaction()
				transaction.blockHash = tx.blockHash
				transaction.block = recordBlock
				transaction.from = tx.from
				transaction.gas = tx.gas
				transaction.gasPrice = tx.gasPrice
				transaction.hash = tx.hash
				transaction.input = tx.input
				transaction.nonce = tx.nonce
				transaction.to = tx.to
				transaction.transactionIndex = tx.transactionIndex
				transaction.value = tx.value
				transaction.type = tx.type
				transaction.v = tx.v
				transaction.s = tx.s
				transaction.r = tx.r

				txs.push(transaction)
			}

			insertBlockOps.push(conn.manager.save(recordBlock))
		}

		await Promise.all(insertBlockOps)
		await conn.manager.save(txs)
		// console.log(`Finish on block ${num} to ${num + insertBlockOps.length - 1}`)
	}

	await conn.close()
	res.send({ message: `Added ${count} blocks to db`, latestBlockNumber: blockNumberFromNetwork })
})

export default fastify
