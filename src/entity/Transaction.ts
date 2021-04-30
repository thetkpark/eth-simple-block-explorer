import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm'
import { Block } from './Block'

@Entity()
export class Transaction {
	@ManyToOne(() => Block, block => block.number)
	block: Block
	@Column()
	blockHash: string
	@Column()
	from: string
	@Column()
	to: string
	@PrimaryColumn()
	hash: string
	@Column()
	input: string
	@Column()
	nonce: number
	@Column()
	gas: number
	@Column()
	gasPrice: string
	@Column()
	transactionIndex: number
	@Column()
	value: string
	@Column()
	type: string
	@Column()
	v: string
	@Column()
	r: string
	@Column()
	s: string
}
