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
    version: "0.8.9",
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
      allowUnlimitedContractSize: false,
    }
  },
};
