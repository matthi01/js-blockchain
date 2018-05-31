<p><b>JS Blockchain</b></p>

<p>Blockchain Datastructure + unit testing</p>

<p>Express server / API to interact with blockchain</p>
<ul>
Endpoints:
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
</ul>

<p></p>
