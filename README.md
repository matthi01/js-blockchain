<p><b><u>JS Blockchain</u></b></p>

<p>Blockchain Datastructure + unit testing</p>

<p>Express server / API to interact with blockchain</p>
<b><u>Endpoints:</u></b>
<ul>
    <li>GET /blockchain</li>
        <ul>
            <li>returns entire blockchain</li>
        </ul>
    <li>POST /transaction (amount, sender, recipient)</li>
        <ul>
            <li>submits a transaction to the blockchain.</li>
            <li>returns a string telling which block index the transaction will be mined under</li>
            <li>moves into pending transactions of the blockchain</li>
        </ul>
    <li>GET /mine</li>
        <ul>
            <li>takes all pending transactions and mines them into a new block</li>
            <li>returns and object with the status of the mine and the newly mined block</li>
            <li>creates new transaction for the mining reward</li>
        </ul>
    <li>POST /register-and-broadcast-node (newNodeUrl)</li>
        <ul>
            <li></li>
        </ul>
    <li>POST /register-node (newNodeUrl)</li>
        <ul>
            <li></li>
        </ul>
    <li>POST /register-nodes-bulk (allNetworkNodes)</li>
        <ul>
            <li></li>
        </ul>
</ul>

<hr />

<p>Decentralized Network</p>
<p>Created a decentralized network by creating more instances of the API (renamed it to networkNode), each acting as a node.
Each of these instances is hosted on a different port, from :3000 to :3005.</p>
<p>Start instances by running npm run node_1 / ... / node_5.</p>
<p>Keeping track of all running nodes in the blockchain instance.</p>
