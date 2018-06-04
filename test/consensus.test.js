const assert = require("assert");
const Blockchain = require("../dev/blockchain");

const myCoin = new Blockchain();
let testChain;

beforeEach("", () => {
    testChain = {
        chain: [
            {
                index: 1,
                timestamp: 1528125851712,
                transactions: [],
                nonce: 0,
                hash: "",
                previousBlockHash: ""
            },
            {
                index: 2,
                timestamp: 1528125872985,
                transactions: [
                    {
                        amount: 100,
                        sender: "SENDER0001",
                        recipient: "RECIPIENT0001",
                        transactionId: "61c0bbb0680b11e886b66906e002fd58"
                    },
                    {
                        amount: 200,
                        sender: "SENDER0002",
                        recipient: "RECIPIENT0002",
                        transactionId: "61c32cb0680b11e886b66906e002fd58"
                    },
                    {
                        amount: 300,
                        sender: "SENDER0003",
                        recipient: "RECIPIENT0003",
                        transactionId: "61c32cb1680b11e886b66906e002fd58"
                    }
                ],
                nonce: 7381,
                hash:
                    "000052b9c4189def699913a77509be20109f9280a67517868e12a13048a3f6e5",
                previousBlockHash: ""
            },
            {
                index: 3,
                timestamp: 1528125998738,
                transactions: [
                    {
                        amount: 12.5,
                        sender: "000",
                        recipient: "55238400680b11e886b66906e002fd58",
                        transactionId: "61d18490680b11e886b66906e002fd58"
                    },
                    {
                        amount: 44,
                        sender: "rgerg34g433g4wf232f234f34",
                        recipient: "78ujj7j78j78788787jk7juyuujyu",
                        transactionId: "8f22c670680b11e89a624d8fa5b3bc37"
                    },
                    {
                        amount: 34,
                        sender: "cascacead33f4f34fvwefw",
                        recipient: "78k97k7j7efw344wf",
                        transactionId: "97814300680b11e89a624d8fa5b3bc37"
                    },
                    {
                        amount: 78,
                        sender: "fwesczsc2rgrwesch7hj7jyufewf",
                        recipient: "gerrgiuk9ikuiewfreg",
                        transactionId: "a374f440680b11e89a624d8fa5b3bc37"
                    }
                ],
                nonce: 83481,
                hash:
                    "0000d85b6f43f768dd53f2d5aacdaf2c1a9a0d2e1db7cfbf25aa9764f103c187",
                previousBlockHash:
                    "000052b9c4189def699913a77509be20109f9280a67517868e12a13048a3f6e5"
            },
            {
                index: 4,
                timestamp: 1528126002207,
                transactions: [
                    {
                        amount: 12.5,
                        sender: "000",
                        recipient: "55238400680b11e886b66906e002fd58",
                        transactionId: "acc6f890680b11e886b66906e002fd58"
                    }
                ],
                nonce: 58901,
                hash:
                    "00006d7950ab280f7c9d1b5982af7be3e5efaebbe953842fe046ef26b4c56954",
                previousBlockHash:
                    "0000d85b6f43f768dd53f2d5aacdaf2c1a9a0d2e1db7cfbf25aa9764f103c187"
            },
            {
                index: 5,
                timestamp: 1528126013286,
                transactions: [
                    {
                        amount: 12.5,
                        sender: "000",
                        recipient: "55238400680b11e886b66906e002fd58",
                        transactionId: "aed84c60680b11e886b66906e002fd58"
                    }
                ],
                nonce: 47016,
                hash:
                    "000039660f7077d4ca12f8095fb304d47a391367efe760c723a9a991e4b56841",
                previousBlockHash:
                    "00006d7950ab280f7c9d1b5982af7be3e5efaebbe953842fe046ef26b4c56954"
            }
        ],
        pendingTransactions: [
            {
                amount: 12.5,
                sender: "000",
                recipient: "55238400680b11e886b66906e002fd58",
                transactionId: "b572aac0680b11e886b66906e002fd58"
            }
        ],
        currentNodeUrl: "http://localhost:3001",
        networkNodes: ["http://localhost:3002", "http://localhost:3003"]
    };
});

describe("Consensus:", () => {
    it("verifies that a correct chain is valid", () => {
        assert.equal(myCoin.chainIsValid(testChain.chain), true);
    });

    it("finds an incorrect hash pair", () => {
        testChain.chain[2].previousBlockHash =
            "000052b9c4189def699913a77509be20109wefwefwfwef68e12a13048a3f6e3"; // changed digits in hash

        assert.equal(myCoin.chainIsValid(testChain.chain), false);
    });

    it("finds an incorrect block value", () => {
        testChain.chain[1].transactions[1].amount = 30; // changed value

        assert.equal(myCoin.chainIsValid(testChain.chain), false);
    });

    it("finds an tampered genesis block", () => {
        testChain.chain[0].transactions = {
            amount: 100,
            sender: "SENDER0001",
            recipient: "RECIPIENT0001",
            transactionId: "61c0bbb0680b11e886b66906e002fd58"
        };

        assert.equal(myCoin.chainIsValid(testChain.chain), false);
    });
});
