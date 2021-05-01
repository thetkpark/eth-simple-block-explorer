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

export default fastify
