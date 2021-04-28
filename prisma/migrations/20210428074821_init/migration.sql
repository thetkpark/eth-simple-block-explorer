-- CreateTable
CREATE TABLE "Transaction" (
    "blockNumber" INTEGER NOT NULL,
    "blockHash" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "nonce" INTEGER NOT NULL,
    "gas" INTEGER NOT NULL,
    "gasPrice" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "v" TEXT NOT NULL,
    "r" TEXT NOT NULL,
    "s" TEXT NOT NULL,

    PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "Block" (
    "number" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "extraData" TEXT NOT NULL,
    "gasLimit" INTEGER NOT NULL,
    "gasUsed" INTEGER NOT NULL,
    "logsBloom" TEXT NOT NULL,
    "miner" TEXT NOT NULL,
    "mixHash" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "parentHash" TEXT NOT NULL,
    "receiptsRoot" TEXT NOT NULL,
    "sha3Uncles" TEXT NOT NULL,
    "stateRoot" TEXT NOT NULL,
    "totalDifficulty" TEXT NOT NULL,
    "transactionsRoot" TEXT NOT NULL,

    PRIMARY KEY ("number")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block.hash_unique" ON "Block"("hash");

-- AddForeignKey
ALTER TABLE "Transaction" ADD FOREIGN KEY("blockNumber")REFERENCES "Block"("number") ON DELETE CASCADE ON UPDATE CASCADE;
