const sha256 = require("sha256");
const uuid = require("uuid/v1");
const currentNodeUrl = process.argv[3];

class Blockchain {
    // pendingTransactions will hold any transactions that have not yet been placed into a block
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];

        // assign the node URL to the blockchain instance / keep track of all nodes in the network in array
        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = [];

        // need a genesis block
        this.createNewBlock(0, "", "");
    }
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };

    //once the pending transactions have been added to a block, clear pending
    this.pendingTransactions = [];

    //append new block to the blockchain
    this.chain.push(newBlock);

    return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function(
    amount,
    sender,
    recipient
) {
    const newTransaction = {
        amount: amount,
        sender: sender,
        recipient: recipient,
        transactionId: uuid()
            .split("-")
            .join("")
    };

    return newTransaction;
};

Blockchain.prototype.addTransactionToPending = function(transaction) {
    this.pendingTransactions.push(transaction);
    return this.getLastBlock().index + 1;
};

Blockchain.prototype.hashBlock = function(
    previousBlockHash,
    currentBlockData,
    nonce
) {
    const dataAsString =
        previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);

    return hash;
};

Blockchain.prototype.proofOfWork = function(
    previousBlockHash,
    currentBlockData
) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while (hash.substr(0, 4) !== "0000") {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
};

//check the hashes on the block history of the chain / check that the data in the blocks is correct
Blockchain.prototype.chainIsValid = function(blockchain) {
    let valid = true;

    //skipping genesis block
    for (i = 1; i < blockchain.length; i++) {
        const currentBlock = blockchain[i];
        const previousBlock = blockchain[i - 1];
        const blockHash = this.hashBlock(
            previousBlock.hash,
            {
                transactions: currentBlock.transactions,
                index: currentBlock.index
            },
            currentBlock.nonce
        );

        if (blockHash.substr(0, 4) !== "0000") {
            valid = false;
        }

        if (currentBlock.previousBlockHash !== previousBlock.hash) {
            valid = false;
        }
    }

    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock.nonce === 0;
    const correctPreviousBlockHash = genesisBlock.previousBlockHash === "";
    const correctHash = genesisBlock.hash === "";
    const correctTransactions = genesisBlock.transactions.length === 0;

    if (
        !correctNonce ||
        !correctPreviousBlockHash ||
        !correctHash ||
        !correctTransactions
    ) {
        valid = false;
    }

    return valid;
};

module.exports = Blockchain;
