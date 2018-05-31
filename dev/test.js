const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();

bitcoin.createNewBlock(111, "f43434fd323d", "d22f243f43f2d");

bitcoin.createNewTransaction(100, "0000sender", "00000recipient");

console.log(bitcoin);

bitcoin.createNewBlock(222, "rveret4f43f", "3434ferververvrev");

console.log(bitcoin);

/*
still need to create mocha tests for:

- adding a Block
- adding multiple blocks
- adding new transcaction (pending)
- pending transactions are added to blocks
- block creation removes pending transactions

*/
