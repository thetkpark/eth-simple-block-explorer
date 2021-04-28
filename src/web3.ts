import Web3 from 'web3'

const web3 = new Web3('http://34.101.153.230:8545')

export const getLatestBlockNumber = async () => {
	const blockNumber = await web3.eth.getBlockNumber()
	return blockNumber
}

export const getBlock = async (blockNumber: number) => {
	const block = await web3.eth.getBlock(blockNumber)
	return block
}
