const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blockchain", (req, res) => {
    res.send("yo...");
});

app.post("/transaction", (req, res) => {
    console.log(req.body);
    res.send(
        `transaction endpoint hit: amount: ${req.body.amount}, 
        sender: ${req.body.sender}, 
        recipient: ${req.body.recipient}`
    );
});

app.get("/mine", (req, res) => {
    res.send("yo...");
});

app.listen(port, () => {
    console.log(`server running on port ${port}...`);
});
