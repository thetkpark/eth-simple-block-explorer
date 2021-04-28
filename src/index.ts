// import Web3 from 'web3'

// const web3 = new Web3('http://34.101.153.230:8545')

// const getBlockNumber = async () => {
// 	const blockNumber = await web3.eth.getBlockNumber()
// 	const block = await web3.eth.getBlock(blockNumber)
// 	console.log(blockNumber)
// 	console.log(block)
// }

// getBlockNumber()

import fastify from './app'

const port = process.env.PORT || 3050

const start = async () => {
	try {
		await fastify.listen(port)
		console.log(`Listening on port ${port}`)
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

start()
