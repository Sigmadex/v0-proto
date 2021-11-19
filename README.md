<br><br>
<img src="https://i.imgur.com/PwOJmQN.png" width="200px">
<br><br>
Version Zero of Sigmadex
## Getting Started

### Hardhat
V0 uses the Hardhat Development environment

#### Install
``cd hardhat``
``npm install``
``npx hardhat compile``

#### Running the Tests
``npx hardhat test``

#### Node For Frontend-Metamask Integration
Input a mnemonic in the .env file (do not commit)
``cp .env.example .env``
Start Node (one should see their public keys attached to their mnemonic)
``npx hardhat node``
Deploy contracts to localhost
``npx hardhat run ./scripts/deploy.js --network localhost``
Seed With Test Data
``npx hardhat run ./scripts/scaffold-testnet.js --network localhost``


#### Build Doc Api Spec
``npm run docgen``

### Frontend
V0 Uses a React Frontend

#### Install
``cd web``
``npm install``
``npm run start``

#### Docusaur
V0 uses Docusaurus To present Documentation

#### Install
``cd docusaur``
``npm install``
``npm run start``


## Sigmadex Resources

https://sigmadex.org<br>
https://blog.sigmadex.org<br>
https://t.me/Sigmadex
