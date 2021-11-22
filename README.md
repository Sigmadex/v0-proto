<br>
<img src="https://i.imgur.com/PwOJmQN.png" width="200px">
<br>
<b>// Sigmadex Version 0</b>

## Getting Started

### Hardhat
V0 uses the Hardhat Development environment

#### Install
``cd hardhat``
``npm install``
``npx hardhat compile``

#### Running the Tests
``npx hardhat test``

#### Node For Frontend-Subgraph-Metamask Integration
Input a mnemonic in the .env file (do not commit)
``cp .env.example .env``
Metmask prefers auto mine set to false, a block interval (in ms) is helpful for testing control flow, in `hardhat/hardhat.config.js`
```
mining: {
  auto: false,
  interval: 1618
}
  ```
Start Node (one should see their public keys attached to their mnemonic)

``npx hardhat node --hostname 0.0.0.0``
Deploy contracts to localhost

``npx hardhat run ./scripts/deploy.js --network localhost``
Seed With Test Data (take 278 blocks- a long time if your mining interval is big)

``npx hardhat run ./scripts/scaffold-testnet.js --network localhost``


#### Build Doc Api Spec
``npm run docgen``

### Frontend
V0 Uses a React Frontend

#### Install
``cd web``
``npm install``
``npm run start``

#### Frontend-Metamask Integration
Hardhat node utilizes `http://localhost:8545` to serve with `chainid=1337`
The metamask prompt to add network only allows https, so this one must be done manually

### Subgraph (localhost)
Sigmadex uses thegraph to query indexed events, which enables queries such as getNFTsByUser(). To learn about developing with subgraph, doing this [tutorial](https://thegraph.academy/developers/defining-a-subgraph/) and this [local development guide](https://thegraph.academy/developers/local-development/) is  recommended.

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

If you restart your blockchain node, ensure to stop docker, and run ``sudo rm -rf /data/postgres`` as the new genesis block will not match the old one and thegraph wont start its block muncher



### Docusaur
V0 uses Docusaurus To present Documentation

#### Install
``cd docusaur``
``npm install``
``npm run start``


## Sigmadex Resources

https://sigmadex.org<br>
https://blog.sigmadex.org<br>
https://t.me/Sigmadex
