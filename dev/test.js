const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();

console.log(bitcoin);

bitcoin.createNewBlock(111, "f43434fd323d", "d22f243f43f2d");
bitcoin.createNewBlock(222, "d22f243f43f2d", "2r32rr3434f34f");
bitcoin.createNewBlock(333, "2r32rr3434f34f", "234254gf43f43");

console.log(bitcoin);
