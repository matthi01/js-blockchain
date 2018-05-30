class Blockchain {
    // newTransactions will hold any transactions that have not yet been placed into a block
    constructor() {
        this.chain = [];
        this.newTransactions = [];
    }
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.newTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };

    //once the pending transactions have been added to a block, clear pending
    this.newTransactions = [];

    //append new block to the blockchain
    this.chain.push(newBlock);

    return newBlock;
};

module.exports = Blockchain;
