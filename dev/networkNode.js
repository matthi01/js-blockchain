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
    const newTransaction = req.body;
    const blockIndex = myCoin.addTransactionToPending(newTransaction);
    res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.post("/transaction/broadcast", (req, res) => {
    const newTransaction = myCoin.createNewTransaction(
        req.body.amount,
        req.body.sender,
        req.body.recipient
    );

    myCoin.addTransactionToPending(newTransaction);

    const requestPromises = [];
    myCoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + "/transaction",
            method: "POST",
            body: newTransaction,
            json: true
        };

        requestPromises.push(requestPromise(requestOptions));
    });

    Promise.all(requestPromises).then(data => {
        res.json({
            note: "Transaction broadcast successfully."
        });
    });
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

    const requestPromises = [];
    myCoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + "/receive-new-block",
            method: "POST",
            body: { newBlock: newBlock },
            json: true
        };

        requestPromises.push(requestPromise(requestOptions));
    });

    Promise.all(requestPromises)
        .then(data => {
            // miner should get the mining reward. Reward goes to this instance of the API (node)
            const requestOptions = {
                uri: myCoin.currentNodeUrl + "/transaction/broadcast",
                method: "POST",
                body: {
                    amount: 12.5,
                    sender: "000",
                    recipient: nodeAddress
                },
                json: true
            };

            return requestPromise(requestOptions);
        })
        .then(data => {
            res.json({
                note: "Block mined and broadcast successfully.",
                block: newBlock
            });
        });
});

app.post("/receive-new-block", (req, res) => {
    const newBlock = req.body.newBlock;

    // need to check the validity of the block
    const lastBlock = myCoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock.index + 1 === newBlock.index;

    if (correctHash && correctIndex) {
        myCoin.chain.push(newBlock);
        myCoin.pendingTransactions = [];

        res.json({ note: "New block received and accepted." });
    } else {
        res.json({ note: "New block was rejected." });
    }
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

app.get("/node-address", (req, res) => {
    res.json({ nodeAddress: nodeAddress });
});

app.get("/consensus", (req, res) => {
    const requestPromises = [];

    myCoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + "/blockchain",
            method: "GET",
            json: true
        };

        requestPromises.push(requestPromise(requestOptions));

        Promise.all(requestPromises).then(blockchains => {
            const currentChainLength = myCoin.chain.length;
            let maxChainLength = currentChainLength;
            let newLongestChain = null;
            let newPendingTransactions = null;

            blockchains.forEach(blockchain => {
                if (blockchain.chain.length > maxChainLength) {
                    maxChainLength = blockchain.chain.length;
                    newLongestChain = blockchain.chain;
                    newPendingTransactions = blockchain.pendingTransactions;
                }
            });

            if (
                !newLongestChain ||
                (newLongestChain && !myCoin.chainIsValid(newLongestChain))
            ) {
                res.json({
                    note: "Current chain has not been replaced",
                    chain: myCoin.chain
                });
            } else {
                myCoin.chain = newLongestChain;
                myCoin.pendingTransactions = newPendingTransactions;

                res.json({
                    note: "This chain has been replaced",
                    chain: myCoin.chain
                });
            }
        });
    });
});

// localhost:3001/block/2k3hr323uhi32uhu4uh3u4...
app.get("/block/:blockHash", (req, res) => {
    const blockHash = req.params.blockHash;
    const block = myCoin.getBlock(blockHash);
    res.json({ block: block });
});

app.get("/transaction/:transactionId", (req, res) => {
    const transactionId = req.params.transactionId;
    const transactionObj = myCoin.getTransaction(transactionId);
    res.json({
        transaction: transactionObj.transaction,
        block: transactionObj.block
    });
});

app.get("/address/:address", (req, res) => {
    const address = req.params.address;
});

app.listen(port, () => {
    console.log(`server running on port ${port}...`);
});
