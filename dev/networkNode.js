const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid/v1");
const requestPromise = require("requestPromise");

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

// register a node and broadcast it to the network
// TO BE USED BY A NODE THAT IS REGISTERING ITSELF! - broadcasts to all others
app.post("/register-and-broadcast-node", (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;

    // register with blockchain
    if (myCoin.networkNodes.indexOf(newNodeUrl) == -1) {
        myCoin.networkNodes.push(newNodeUrl);
    }

    // broadcast
    const registerNodesPromises = [];
    myCoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            url: networkNodeUrl + "/registerNode",
            method: "POST",
            body: { newNodeUrl: newNodeUrl },
            json: true
        };

        registerNodesPromises.push(requestPromise(requestOptions));
    });

    Promise.all(registerNodesPromises).then(data => {
        //do something with the data...
    });
});

//register node with the network
// TO BE USED BY ALL OTHER NODES LISTENING FOR NEW NODES! - not being broadcast
app.post("/register-node", (req, res) => {
    // placeholder
});

//register multiple nodes at once - for any new nodes coming online - add all existing nodes in the network
app.post("/register-nodes-bulk", (req, res) => {
    //placeholder
});

app.listen(port, () => {
    console.log(`server running on port ${port}...`);
});
