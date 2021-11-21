<br>
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
Metmask prefers auto mine set to false, a block interval (in ms) is helpful for testing control flow, in `hardhat/hardhat.config.js`
```
mining: {
  auto: false,
  interval: 1618
}
  ```
Start Node (one should see their public keys attached to their mnemonic)

``npx hardhat node``
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
