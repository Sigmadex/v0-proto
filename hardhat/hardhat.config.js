require('dotenv').config()
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-truffle5')
require('hardhat-contract-sizer');

module.exports = {
  contractSizer: {
      alphaSort: true,
      disambiguatePaths: false,
      runOnCompile: true,
      strict: true,
  },
  solidity: {
    version: "0.8.10",
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  paths: {
    artifacts: "../web/src/config/artifacts"
  },
  defaultNetwork: "hardhat",
  networks: {
    docker: {
      url:'http://ganache-cli:8545',
      chainId: 1337,
      mining: {
        auto: true,
      }
    },
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        //auto: false,
        //interval: 1618
      },
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
      allowUnlimitedContractSize: false,
    },
  },
};
