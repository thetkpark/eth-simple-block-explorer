const Web3 = require('web3')
// import Web3 from 'web3'
import { config } from 'dotenv'
import { Connection, createConnection } from 'typeorm'
import { Block } from './entity/Block'

config()

const init = async () => {
	const web3 = new Web3(process.env.RPCURL as string)
	const conn: Connection = await createConnection()

	const latestBlockNumber = await web3.eth.getBlockNumber()
	const totalBlockInDb = await conn.getRepository(Block).count()
	console.log(`Lastest Block from the network: ${latestBlockNumber}`)
	console.log(`Number of block in DB: ${totalBlockInDb}`)
	if (latestBlockNumber === totalBlockInDb) {
		console.info(`Database is in sync with the latest block ${latestBlockNumber}`)
		return process.exit(0)
	}

	let insertBlockOps: Promise<Block>[] = []

	for (let num = 0; num <= latestBlockNumber; num += 100) {
		const getBlockOps: Promise<any>[] = []
		for (let i = num; i < num + 100 && i <= latestBlockNumber; i++) {
			getBlockOps.push(web3.eth.getBlock(i))
		}
		const getBlocks = await Promise.all(getBlockOps)
		const insertBlockOps = getBlocks.map(block => {
			const recordBlock = new Block()
			recordBlock.difficulty = block.difficulty.toString()
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
			recordBlock.totalDifficulty = block.totalDifficulty.toString()
			recordBlock.transactionsRoot = block.transactionRoot
			return conn.getRepository(Block).save(recordBlock)
		})

		await Promise.all(insertBlockOps)
		console.log(`Finish on block ${num} to ${num + insertBlockOps.length}`)
	}
	const totalBlockInDbNew = await conn.getRepository(Block).count()
	if (latestBlockNumber === totalBlockInDbNew) {
		console.info(`Done`)
		console.info(`Database is in sync with the latest block ${latestBlockNumber}`)
		process.exit(0)
	} else {
		console.error('Somethinh went wrong')
	}
}

init()
