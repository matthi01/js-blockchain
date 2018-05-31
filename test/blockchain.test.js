const assert = require("assert");
const Blockchain = require("../dev/blockchain");

let myCoin;

beforeEach(() => {
    myCoin = new Blockchain();
    myCoin.createNewBlock(111, "fty32f4ty32343", "lkj2io3j4343o");
});

describe("Blockchain Datastructure:", () => {
    it("adds a block to the chain", () => {
        assert.equal(myCoin.chain.length, 2);
    });

    it("adds multiple blocks to the chain", () => {
        myCoin.createNewBlock(222, "lkj2io3j4343o", "wf32f323d3");
        myCoin.createNewBlock(333, "wf32f323d3", "23e23sdewde");
        assert.equal(myCoin.chain.length, 4);
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

        assert.equal(myCoin.chain.length, 2);
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

    it("should hash a block", () => {
        const previousBlockHash = "h2h34h2432kj4n";
        let nonce = 100;
        const currentBlockData = [
            {
                amount: 10,
                sender: "4298234ioh234",
                recipient: "2l34n32nkkjn"
            },
            {
                amount: 20,
                sender: "erfefwefewf32",
                recipient: "wef32f23f3"
            },
            {
                amount: 30,
                sender: "g5g54gqwfwe",
                recipient: "132d1d3c32"
            }
        ];

        const originalBlockHash = myCoin.hashBlock(
            previousBlockHash,
            currentBlockData,
            nonce
        );
        let changedBlockHash;

        assert.equal(originalBlockHash.length, 64);

        //change nonce to something else, hashes should not equal
        nonce = 101;
        changedBlockHash = myCoin.hashBlock(
            previousBlockHash,
            currentBlockData,
            nonce
        );

        assert.notEqual(originalBlockHash, changedBlockHash);

        //change nonce to back to original, hashes should now equal
        nonce = 100;
        changedBlockHash = myCoin.hashBlock(
            previousBlockHash,
            currentBlockData,
            nonce
        );

        assert.equal(originalBlockHash, changedBlockHash);
    });

    it("runs proof of work correctly", () => {
        const previousBlockHash = "h2h34h2432kj4n";
        const currentBlockData = [
            {
                amount: 10,
                sender: "4298234ioh234",
                recipient: "2l34n32nkkjn"
            },
            {
                amount: 20,
                sender: "erfefwefewf32",
                recipient: "wef32f23f3"
            },
            {
                amount: 30,
                sender: "g5g54gqwfwe",
                recipient: "132d1d3c32"
            }
        ];

        const nonce = myCoin.proofOfWork(previousBlockHash, currentBlockData);

        const blockHash = myCoin.hashBlock(
            previousBlockHash,
            currentBlockData,
            nonce
        );

        assert.equal(blockHash.substr(0, 4), "0000");
    });
});
