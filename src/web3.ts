import Web3 from 'web3'
import dotenv from 'dotenv'
dotenv.config()

const web3 = new Web3(process.env.RPCURL as string)

export const getLatestBlockNumber = async () => {
	const blockNumber = await web3.eth.getBlockNumber()
	return blockNumber
}

export const getBlock = async (blockNumber: number) => {
	const block = await web3.eth.getBlock(blockNumber)
	return block
}
