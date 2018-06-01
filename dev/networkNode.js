const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid/v1");
const requestPromise = require("request-promise");

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

    // register new node with the blockchain
    if (myCoin.networkNodes.indexOf(newNodeUrl) == -1) {
        myCoin.networkNodes.push(newNodeUrl);
    }

    // broadcast to all other nodes already in the network
    const registerNodesPromises = [];
    myCoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + "/register-node",
            method: "POST",
            body: { newNodeUrl: newNodeUrl },
            json: true
        };

        registerNodesPromises.push(requestPromise(requestOptions));
    });

    // run all requests
    // once done, register all existing nodes with the new node
    Promise.all(registerNodesPromises)
        .then(data => {
            const bulkRegisterOptions = {
                uri: newNodeUrl + "/register-nodes-bulk",
                method: "POST",
                body: {
                    allNetworkNodes: [
                        ...myCoin.networkNodes,
                        myCoin.currentNodeUrl
                    ]
                },
                json: true
            };

            return requestPromise(bulkRegisterOptions);
        })
        .then(data => {
            res.json({
                note: "New node registered with the network successfully"
            });
        });
});

//register node with the network
// TO BE USED BY ALL OTHER NODES LISTENING FOR NEW NODES! - not being broadcast
app.post("/register-node", (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;

    // avoid adding to network if the new node is the current node itself, or if it is already in the network array
    const nodeDoesNotAlreadyExist =
        myCoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = myCoin.currentNodeUrl !== newNodeUrl;
    if (nodeDoesNotAlreadyExist && notCurrentNode) {
        myCoin.networkNodes.push(newNodeUrl);
    }

    res.json({ note: "New node registered successfully." });
});

//register multiple nodes at once - for any new nodes coming online - add all existing nodes in the network
app.post("/register-nodes-bulk", (req, res) => {
    const allNetworkNodes = req.body.allNetworkNodes;

    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeDoesNotAlreadyExist =
            myCoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = myCoin.currentNodeUrl !== networkNodeUrl;
        if (nodeDoesNotAlreadyExist && notCurrentNode) {
            myCoin.networkNodes.push(networkNodeUrl);
        }
    });

    res.json({ note: "Bulk registration successful." });
});

app.listen(port, () => {
    console.log(`server running on port ${port}...`);
});
