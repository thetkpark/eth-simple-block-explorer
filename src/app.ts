import Fastify from 'fastify'
import { getLatestBlockNumber, getBlock, getTransaction } from './web3'

const fastify = Fastify({ logger: true })

fastify.get('/api/test', async (req, res) => {
	res.send({ success: true })
})

fastify.get('/api/blockNumber', async (req, res) => {
	const blockNumber = await getLatestBlockNumber()
	res.send({ blockNumber })
})

fastify.get('/api/block/:blockNumber', async (req, res) => {
	const params: any = req.params
	if (!params.blockNumber) {
		return res.status(400).send()
	}
	const block = await getBlock(parseInt(params.blockNumber))
	if (!block) return res.status(404).send({ error: 'Block not found' })
	return res.send(block)
})

fastify.get('/api/tx/:tx', async (req, res) => {
	const params: any = req.params
	if (!params.tx) {
		return res.status(400).send()
	}
	const tx = await getTransaction(params.tx)
	if (!tx) return res.status(404).send({ error: 'Transaction not found' })
	return res.send(tx)
})

export default fastify
