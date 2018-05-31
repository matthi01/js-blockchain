const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid/v1");

const Blockchain = require("./blockchain");

const app = express();
const port = process.argv[2];

const nodeAddress = uuid()
    .split("-")
    .join("");
const myCoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blockchain", (req, res) => {
    res.send(myCoin);
});

app.post("/transaction", (req, res) => {
    const blockIndex = myCoin.createNewTransaction(
        req.body.amount,
        req.body.sender,
        req.body.recipient
    );
    res.send(`Transaction will be added in block ${blockIndex}`);
});

app.get("/mine", (req, res) => {
    const lastBlock = myCoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = {
        transactions: myCoin.pendingTransactions,
        index: lastBlock.index + 1
    };

    const nonce = myCoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = myCoin.hashBlock(
        previousBlockHash,
        currentBlockData,
        nonce
    );

    const newBlock = myCoin.createNewBlock(nonce, previousBlockHash, blockHash);

    // miner should get the mining reward. Reward goes to this instance of the API (node)
    myCoin.createNewTransaction(12.5, "000", nodeAddress);

    res.json({
        note: "Block mined successfully.",
        block: newBlock
    });
});

app.listen(port, () => {
    console.log(`server running on port ${port}...`);
});
