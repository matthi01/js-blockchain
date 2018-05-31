const assert = require("assert");
const Blockchain = require("../dev/blockchain");

let myCoin;

beforeEach(() => {
    myCoin = new Blockchain();
    myCoin.createNewBlock(111, "fty32f4ty32343", "lkj2io3j4343o");
});

describe("Blockchain Datastructure", () => {
    it("adds a block to the chain", () => {
        assert.equal(myCoin.chain.length, 1);
    });

    it("adds multiple blocks to the chain", () => {
        myCoin.createNewBlock(222, "lkj2io3j4343o", "wf32f323d3");
        myCoin.createNewBlock(333, "wf32f323d3", "23e23sdewde");
        assert.equal(myCoin.chain.length, 3);
    });

    it("adds new transactions as pending transactions in the chain", () => {
        let newTransaction = {
            amount: 100,
            sender: "SENDER00001",
            recipient: "RECIPIENT0001"
        };

        myCoin.createNewTransaction(
            newTransaction.amount,
            newTransaction.sender,
            newTransaction.recipient
        );

        assert.equal(myCoin.chain.length, 1);
        assert.equal(myCoin.pendingTransactions.length, 1);
        assert.deepEqual(myCoin.pendingTransactions[0], newTransaction);
    });

    it("adds pending transactions to blocks once a block is created", () => {
        myCoin.createNewTransaction(100, "SENDER00001", "RECIPIENT0001");
        myCoin.createNewTransaction(200, "SENDER00002", "RECIPIENT0002");
        myCoin.createNewTransaction(300, "SENDER00003", "RECIPIENT0003");

        assert.equal(myCoin.pendingTransactions.length, 3);

        myCoin.createNewBlock(222, "lkj2io3j4343o", "wf32f323d3");

        assert.equal(myCoin.pendingTransactions.length, 0);

        const lastBlock = myCoin.getLastBlock();

        assert.equal(lastBlock.transactions.length, 3);
    });
});
