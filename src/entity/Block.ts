import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { Transaction } from './Transaction'

@Entity()
export class Block {
	@PrimaryColumn()
	number: number
	@Column()
	hash: string
	@Column()
	difficulty: string
	@Column()
	extraData: string
	@Column()
	gasLimit: number
	@Column()
	gasUsed: number
	@Column()
	logsBloom: string
	@Column()
	miner: string
	@Column()
	nonce: string
	@Column()
	size: number
	@Column()
	timestamp: Date
	@Column()
	parentHash: string
	@Column({ nullable: true })
	receiptsRoot: string
	@Column()
	sha3Uncles: string
	@Column()
	stateRoot: string
	@Column()
	totalDifficulty: string
	@Column({ nullable: true })
	transactionsRoot: string
	@OneToMany(() => Transaction, transaction => transaction.block)
	transactions: Transaction[]
}
