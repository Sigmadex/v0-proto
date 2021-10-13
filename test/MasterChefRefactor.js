const fromExponential = require('from-exponential')

const {
  advanceBlocks,
  advanceTime
} = require('./utilities.js');

const CakeToken = artifacts.require('CakeToken');
const SyrupBar = artifacts.require('SyrupBar');
const MasterChef = artifacts.require('MasterChefRefactor');
const MockBEP20 = artifacts.require('pancake/pancake-farm/libs/MockBEP20');
const CakeVault = artifacts.require('CakeVaultNew');
const CookBook = artifacts.require('CookBook');
const Kitchen = artifacts.require('Kitchen');
const AutoCakeChef = artifacts.require('AutoCakeChef');
const SelfCakeChef = artifacts.require('SelfCakeChef');
const MasterPantry = artifacts.require('MasterPantry');

contract('MasterChefRefactor', () => {
  let accounts;
  let alice, bob, carol, dev, cakeVaultreasury, cakeVaultAdmin, penaltyAddress, minter = '';
  let cake;
  let syrup;
  let erc20A;
  let erc20B;
  let chef;
  let pantry;
  let kitchen;
  let selfCakeChef;
  let autoCakeChef;
  let cakeVault;
  let cookBook;

  before(async () => {
    accounts = await web3.eth.getAccounts()
    dev = accounts[0]
    minter = accounts[1]
    cakeVaultTreasury = accounts[2]
    cakeVaultAdmin = accounts[3]
    alice = accounts[4]
    bob = accounts[5]
    carol = accounts[6]
    penaltyAddress = accounts[7]
    cake = await CakeToken.new({from: minter})
    syrup = await SyrupBar.new(cake.address, {from: minter})
    
    let cakePerBlock = web3.utils.toWei('1', 'ether')
    pantry = await MasterPantry.new(
      cake.address,
      syrup.address,
      dev,
      penaltyAddress,
      cakePerBlock,
      { from: minter }
    );
    kitchen = await Kitchen.new(
      pantry.address,
      { from: minter }
    )
    autoCakeChef = await AutoCakeChef.new(
      pantry.address,
      kitchen.address,
      { from: minter }
    )
    selfCakeChef = await SelfCakeChef.new(
      pantry.address,
      kitchen.address,
      { from: minter }
    )
    chef = await MasterChefRefactor.new(
      pantry.address,
      kitchen.address,
      { from: minter }
    )
    
    cookBook = await CookBook.new(
      pantry.address,
      {from: minter}
    );

    cakeVault = await CakeVault.new(
      cake.address,
      syrup.address,
      chef.address,
      cakeVaultAdmin,
      cakeVaultTreasury,
      {from: minter}
    )
    
  })
    
})
