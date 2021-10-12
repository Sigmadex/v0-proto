require('dotenv').config()
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-truffle5')
module.exports = {
  solidity: "0.8.7",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
      allowUnlimitedContractSize: true,
    }
  },
};
