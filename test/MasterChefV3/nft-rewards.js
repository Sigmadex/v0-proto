
const ACL = artifacts.require('ACL');
const nft = artifacts.require('NFTRewards')
contract("NFT rewards", () => {
  let accounts;
  let dev, minter, owner = null;
  let alice, bob = null;
  let acl = null;
  let nft = null;
  let erc20a, erc20b = null;
  let cake = null;
  
  before(async() => {
    accounts = await web3.eth.getAccounts()
    dev = accounts[0]
    minter = accounts[1]
    owner = accounts[2]
    alice = accounts[3]
    bob = accounts[4]

    acl = await ACL.new({ from: minter })
    nft = await NFTRewards.new(acl.address, { from: minter })

    
  })
})
