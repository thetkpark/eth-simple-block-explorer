// import Web3 from 'web3'
const Web3 = require('web3')
import { config } from 'dotenv'
config()

const web3 = new Web3(process.env.RPCURL as string)

export const getLatestBlockNumber = async () => {
	const blockNumber = await web3.eth.getBlockNumber()
	return blockNumber
}

export const getBlock = async (blockNumber: number) => {
	const block = await web3.eth.getBlock(blockNumber)
	return block
}

export const getTransaction = async (tx: string) => {
	return web3.eth.getTransaction(tx)
}
