
const ACL = artifacts.require('ACL');
const nft = artifacts.require('NFTRewards')
const reducedPenalty = artifacts.require('ReducedPenaltyNFT')
contract("NFT rewards", () => {
  let accounts;
  let dev, minter, owner = null;
  let alice, bob = null;
  let nft = null;
  let reducedPenalty;
  let erc20a, erc20b = null;
  let cake = null;
  
  before(async() => {
    accounts = await web3.eth.getAccounts()
    dev = accounts[0]
    minter = accounts[1]
    owner = accounts[2]
    alice = accounts[3]
    bob = accounts[4]

    nft = await NFTRewards.new({ from: minter })
    reducedPenalty = await ReducedPenalty.new({ from: minter })
  })


})
