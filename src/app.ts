import Fastify from 'fastify'
import { getLatestBlockNumber, getBlock } from './web3'

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

export default fastify
