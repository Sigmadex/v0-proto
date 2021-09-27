const fs = require('fs')
const Cake = artifacts.require('CakeToken')

class WebArtifacts {
  constructor() {
    this.contracts = {}
  }
  upsert(
    contract,
    abi,
    networkId,
    chainId,
    address
  ) {
    this.contracts[contract] = {
      [networkId]: {
        [chainId]: {
          abi,
          address
        }
      }
    }
    const data = JSON.stringify(this)
    fs.writeFileSync('web-artifacts/contracts.json', data, (err) => {
      if (err) {
        throw err
      }
      console.log("artifact written to the web artifacts directory")
  })
  }
}
const webData = new WebArtifacts()


async function main() {
  let accounts = await web3.eth.getAccounts()
  let networkId = await web3.eth.net.getId()
  let chainId = await web3.eth.getChainId()
  const contract = await new web3.eth.Contract(Cake.abi)
  await contract.deploy({
    data: Cake.bytecode
  }).send({
    from: accounts[0],
    gas: 15000000,
    gasPrice:'30000000000000'
  }).then((instCake) => {
    webData.upsert(
      'CakeToken',
      Cake.abi,
      networkId,
      chainId,
      instCake._address
    )
  })
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
