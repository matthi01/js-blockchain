// MAKE SURE TO START ALL NODE INSTANCES BEFORE RUNNING THE TEST!!!

const assert = require("assert");
const requestPromise = require("request-promise");

const Blockchain = require("../dev/blockchain");

const nodeInstanceUrls = [
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005"
];

beforeEach(() => {
    const requestPromises = [];
    nodeInstanceUrls.forEach(nodeUrl => {
        if (nodeUrl === nodeInstanceUrls[0]) return;
        const requestOptions = {
            uri: nodeInstanceUrls[0] + "/register-and-broadcast-node",
            method: "POST",
            body: { newNodeUrl: nodeUrl },
            json: true
        };

        requestPromises.push(requestPromise(requestOptions));
    });

    Promise.all(requestPromises).then("OK");
});

describe("Node Instance:", () => {
    it("correctly set up network of 5 nodes", async () => {
        let requestOptions = {
            uri: nodeInstanceUrls[0] + "/blockchain",
            method: "GET",
            body: {},
            json: true
        };

        let myCoin = await requestPromise(requestOptions);

        assert.equal(myCoin.networkNodes.length, 4);

        // check a second node
        requestOptions = {
            uri: nodeInstanceUrls[4] + "/blockchain",
            method: "GET",
            body: {},
            json: true
        };

        myCoin = await requestPromise(requestOptions);

        assert.equal(myCoin.networkNodes.length, 4);
    });

    it("posts transactions and broadcasts them throughout the network", async () => {
        const requestPromises = [];
        for (let i = 1; i <= 3; i++) {
            const requestOptions = {
                uri: nodeInstanceUrls[0] + "/transaction/broadcast",
                method: "POST",
                body: {
                    amount: i * 100,
                    sender: "SENDER000" + i,
                    recipient: "RECIPIENT000" + i
                },
                json: true
            };
            await requestPromise(requestOptions);
        }

        let requestOptions = {
            uri: nodeInstanceUrls[0] + "/blockchain",
            method: "GET",
            body: {},
            json: true
        };

        let myCoin = await requestPromise(requestOptions);

        assert.equal(myCoin.pendingTransactions.length, 3);

        //check a second node
        requestOptions = {
            uri: nodeInstanceUrls[3] + "/blockchain",
            method: "GET",
            body: {},
            json: true
        };

        myCoin = await requestPromise(requestOptions);

        assert.equal(myCoin.pendingTransactions.length, 3);
    });

    it("mines a block", async () => {
        let requestOptions = {
            uri: nodeInstanceUrls[0] + "/mine",
            method: "GET",
            body: {},
            json: true
        };

        let newBlock = await requestPromise(requestOptions);
        assert.equal(newBlock.block.transactions.length, 3);
    });

    it("distributes the block across the network", async () => {
        let requestOptions = {
            uri: nodeInstanceUrls[0] + "/blockchain",
            method: "GET",
            body: {},
            json: true
        };

        let myCoin = await requestPromise(requestOptions);
        assert.equal(myCoin.chain[1].transactions.length, 3);

        requestOptions = {
            uri: nodeInstanceUrls[3] + "/blockchain",
            method: "GET",
            body: {},
            json: true
        };

        myCoin = await requestPromise(requestOptions);
        assert.equal(myCoin.chain[1].transactions.length, 3);

        requestOptions = {
            uri: nodeInstanceUrls[4] + "/blockchain",
            method: "GET",
            body: {},
            json: true
        };

        myCoin = await requestPromise(requestOptions);
        assert.equal(myCoin.chain[1].transactions.length, 3);
    });

    it("rewards the miner with the block reward", async () => {
        let requestOptions = {
            uri: nodeInstanceUrls[0] + "/blockchain",
            method: "GET",
            body: {},
            json: true
        };

        let myCoin = await requestPromise(requestOptions);
        assert.equal(myCoin.pendingTransactions.length, 1);

        // verify amount
        let rewardTransaction = myCoin.pendingTransactions[0];
        assert.equal(rewardTransaction.amount, 12.5);

        requestOptions = {
            uri: nodeInstanceUrls[0] + "/node-address",
            method: "GET",
            body: {},
            json: true
        };

        // verify sender / receiver
        let nodeAddress = await requestPromise(requestOptions);
        assert.equal(rewardTransaction.recipient, nodeAddress.nodeAddress);
        assert.equal(rewardTransaction.sender, "000");
    });
});
