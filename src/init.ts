const Web3 = require('web3')
// import Web3 from 'web3'
import { config } from 'dotenv'
import { Connection, createConnection } from 'typeorm'
import { Block } from './entity/Block'
import { Transaction } from './entity/Transaction'

config()

const init = async () => {
	const web3 = new Web3(process.env.RPCURL as string)
	const conn: Connection = await createConnection()

	const latestBlockNumber = await web3.eth.getBlockNumber()
	const totalBlockInDb = await conn.getRepository(Block).count()
	console.log(`Lastest Block from the network: ${latestBlockNumber}`)
	console.log(`Number of block in DB: ${totalBlockInDb}`)
	if (latestBlockNumber + 1 === totalBlockInDb) {
		console.info(`Database is in sync with the latest block ${latestBlockNumber}`)
		return process.exit(0)
	}

	for (let num = 0; num <= latestBlockNumber; num += 100) {
		const insertBlockOps: Promise<any>[] = []
		const txs: Transaction[] = []
		const getBlockOps: Promise<any>[] = []
		for (let i = 0; i < 100 && i + num <= latestBlockNumber; i++) {
			getBlockOps.push(web3.eth.getBlock(i + num))
		}
		const blocks = await Promise.all(getBlockOps)
		for (let j = 0; j < blocks.length; j++) {
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
			// recordBlock.transactions = []

			for (let i = 0; i < block.transactions.length; i++) {
				const txHash = block.transactions[i]
				const tx = await web3.eth.getTransaction(txHash)
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
		console.log(`Finish on block ${num} to ${num + insertBlockOps.length}`)
	}
	const totalBlockInDbNew = await conn.getRepository(Block).count()
	console.log('---------------------------------------------')
	console.log(`Lastest Block from the network: ${latestBlockNumber}`)
	console.log(`Number of block in DB: ${totalBlockInDb}`)
	if (latestBlockNumber + 1 === totalBlockInDbNew) {
		console.info(`Done`)
		console.info(`Database is in sync with the latest block ${latestBlockNumber}`)
		process.exit(0)
	} else {
		console.error('Somethinh went wrong')
	}
}

init()
