<br>
<img src="https://i.imgur.com/PwOJmQN.png" width="200px">
<br>
<b>// Sigmadex Version 0</b>

## Getting Started

### Hardhat
V0 uses the Hardhat Development environment.

#### Install
``cd hardhat``
``npm install``
``npx hardhat compile``

#### Running the Tests
``npx hardhat test``



#### Build Doc API Spec
``npm run docgen``


### Subgraph (localhost)
Sigmadex uses thegraph to query indexed events, which enables queries such as `getNFTsByUser()`. To learn about developing with subgraph, reviewing this [tutorial](https://thegraph.academy/developers/defining-a-subgraph/) and this [local development guide](https://thegraph.academy/developers/local-development/) is recommended.

#### Prerequisites
- ``npm install -g @graphprotocol/graph-cli``
- docker and docker compose

To start the graph localhost
Start a blockchain node with ``npx hardhat node --hostname 0.0.0.0``

``cd subgraph``
start thegraph node ``docker-compose up``

Generate the code templates ``npm run codegen``

Create the subgraph ``npm run  create-local``

Deploy the subgraph ``npm run deploy-local``

If you restart your blockchain node, ensure to stop docker, and run ``sudo rm -rf /data/postgres`` as the new genesis block will not match the old one and thegraph wont start its block muncher.

### Frontend
V0 Uses a React Frontend.

#### Install
``cd web``
``npm install``
``npm run start``

#### Frontend-Metamask Integration
Hardhat node utilizes `http://localhost:8545` to serve with `chainid=1337`
The metamask prompt to add network only allows https, so this one must be done manually.

#### Node For Frontend-Subgraph-Metamask Integration
Input a mnemonic in the .env file (do not commit)
``cd hardhat && cp .env.example .env``

A bug in hardhat with delegatecalls and automine: false prevents use of the hardhat node for frontend dev, instead

``npm install -g ganache-cli``


Start Node (one should see their public keys attached to their mnemonic)

``ganache-cli -i 1337 -b 1 --gasLimit=120000000`` optionally there is a `-m {MNEMONIC}` flag that can be used for metamask integration.
Deploy contracts to localhost, one can set the `-b` to zero if they do not wish to test event emitters and simulate delay. 

``npx hardhat run ./scripts/deploy.js --network localhost``
Seed With Test Data (take 278 blocks- a long time if your mining interval is big)

``npx hardhat run ./scripts/scaffold-testnet.js --network localhost``

#### Install
``cd web``
``npm install``
``npm run start``

``cp .env.example .env``
fill out, the `REACT_APP_SUBGRAPH_URL` is pasted in the terminal output of ``npm run deploy-local`` cmd could be `http://127.0.0.1:8000/subgraphs/name/sigmadex/subgraph`

#### Frontend-Metamask Integration
Hardhat node utilizes `http://localhost:8545` to serve with `chainid=1337`
The metamask prompt to add network only allows https, so this one must be done manually.


### Docusaur
V0 uses Docusaurus to present documentation.

#### Install
``cd docusaur``
``npm install``
``npm run start``


## Sigmadex Resources
|Resource|Link                 |
|:-------|:--------------------|
|Website|https://sigmadex.org  |
|Telegram|https://t.me/Sigmadex|
|Blog|https://blog.sigmadex.org|
|Docs|https://sigmadex.github.io/v0-proto|
