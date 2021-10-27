require('dotenv').config()
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-truffle5')
require('hardhat-contract-sizer');
require('hardhat-deploy');

module.exports = {
  contractSizer: {
      alphaSort: true,
      disambiguatePaths: false,
      runOnCompile: true,
      strict: true,
  },
  solidity: {
    version: "0.8.9",
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  namedAccounts: {
    deployer: 0,
    diamondAdmin: 1
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
      allowUnlimitedContractSize: false,
    }
  },
};
