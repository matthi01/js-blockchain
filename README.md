<p><b><u>JS Blockchain</u></b></p>

<p>Blockchain Datastructure + unit testing</p>

<p>Express server / API to interact with blockchain</p>
<b><u>Endpoints:</u></b>
<ul>
    <li>GET /blockchain</li>
        <ul>
            <li>returns entire blockchain</li>
        </ul>
    <li>POST /transaction (newTransaction)</li>
        <ul>
            <li>submits a transaction to the blockchain.</li>
            <li>called by the /transaction/broadcast endpoint for each node in the network</li>
        </ul>
    <li>GET /mine</li>
        <ul>
            <li>takes all pending transactions and mines them into a new block</li>
            <li>returns and object with the status of the mine and the newly mined block</li>
            <li>creates new transaction for the mining reward</li>
        </ul>
    <li>POST /register-and-broadcast-node (newNodeUrl)</li>
        <ul>
            <li>Called using using the url of the new node as a parameter</li>
            <li>adds the new node to the network and to all other nodes on the network</li>
            <li>will add each of the existing nodes in the network to its own network</li>
        </ul>
    <li>POST /register-node (newNodeUrl)</li>
        <ul>
            <li>used by all existing nodes on the network to listen to new nodes being added to the network</li>
        </ul>
    <li>POST /register-nodes-bulk (allNetworkNodes)</li>
        <ul>
            <li>called by /register-and-broadcast-node, adds all nodes that already exist on the network to the new node</li>
        </ul>
    <li>POST /transaction/broadcast (amount, sender, recipient)</li>
        <ul>
            <li>Submits transaction and broadcasts it throughout the network to all nodes.</li>
        </ul>
    <li>POST /receive-new-block (newBlock)</li>
        <ul>
            <li>once a block is mined, this is used to add the new block to all existing nodes on the network</li>
        </ul>

</ul>

<hr />

<p><b>Decentralized Network</b></p>
<p>Created a decentralized network by creating multiple instances of the API (renamed it to networkNode), each acting as a node.
Each of these instances is hosted on a different port, from :3000 to :3005.</p>
<p>Start instances by running npm run node_1 / ... / node_5.</p>
<p>Keeping track of all running nodes in the blockchain instance via an array of node URLs</p>

<ul>
    <li>New nodes that want to join the network need to hit the /register-and-broadcast-node endpoint with the node's url. This will add the new node to every existing node in the network.</li>
    <li>Once a transaction is submitted via the /transaction/broadcast endpoint, it will be broadcast out to every node in the network, keeoing the ledger in sync.</li>
    <li>Once a block is mined by a node via the /mine endpoint, the mined block will be broadcast to each node in the network. Each node will verify the block and choose to reject or accept the block.</li>
    <li>The miner that successfully mines the block receives the block reward as the next transaction.</li>
</ul>

<br />
<hr />

<p><b>Consensus</b></p>
<p>Compares one node to all the other nodes in the network to find discrepancies and confirm all have the right data.</p>
<p>The algorithm in this blockchain implements the longest chain rule, trusting the longest chain because it has had the most amount of work put into it.</p>
<p>Before running the consensus algorithm, need to check that the given chain that is longer is actually valid. Checking if the block hashes are correct by rehashing each block, and checking that each previous / current hash pair line up.</p>
<p>Each node will compare its length to the length of the node with the longest chain in the network. If any chain is found that is longer, the longer chain will replace the original chain.</p>

<hr />

<p>Next:
<ul>
<li>Verify sender balance when submitting transaction</li><li>Copy functionality of ethereum, store more data in the blocks</li></ul></p>
