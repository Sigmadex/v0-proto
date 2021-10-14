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
const ACL = artifacts.require('ACL');

contract('MasterChefRefactor', () => {
  let accounts;
  let alice, bob, carol, dev, cakeVaultreasury, cakeVaultAdmin, penaltyAddress, minter, owner = '';
  let cake, syrup = null;
  let erc20A, erc20B = null;
  let chef, selfCakeChef, autoCakeChef = null;
  let pantry, kitchen, cookBook = null;
  let cakeVault;
  let acl;

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
    owner = accounts[8]
    cake = await CakeToken.new({from: minter})
    syrup = await SyrupBar.new(cake.address, {from: minter})

    let acl = await ACL.new({ from: minter }) 

    let cakePerBlock = web3.utils.toWei('1', 'ether')
    pantry = await MasterPantry.new(
      cake.address,
      syrup.address,
      acl.address,
      penaltyAddress,
      dev,
      cakePerBlock,
      { from: minter }
    );
    cookBook = await CookBook.new(
      pantry.address,
      {from: minter}
    );
    kitchen = await Kitchen.new(
      pantry.address,
      acl.address,
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
      cookBook.address,
      { from: minter }
    )
    chef = await MasterChef.new(
      pantry.address,
      kitchen.address,
      cookBook.address,
      { from: minter }
    ) 
    cakeVault = await CakeVault.new(
      pantry.address,
      kitchen.address,
      cookBook.address,
      autoCakeChef.address,
      cakeVaultAdmin,
      cakeVaultTreasury,
      {from: minter}
    )

    //fill ACL
    await acl.setPantry(pantry.address, { from: minter })
    await acl.setKitchen(kitchen.address, { from: minter })
    await acl.setMasterChef(chef.address, { from: minter })
    await acl.setSelfCakeChef(selfCakeChef.address, { from: minter })
    await acl.setAutoCakeChef(autoCakeChef.address, { from: minter })
    await acl.setCakeVault(cakeVault.address, { from: minter })


    await pantry.setCakeVault(cakeVault.address, { from: minter })

    await cake.mint(bob, web3.utils.toWei('1', 'ether'), {from: minter})
    await cake.mint(carol, web3.utils.toWei('1', 'ether'), {from: minter})
    
    await cake.transferOwnership(owner, { from: minter })
    await syrup.transferOwnership(owner, { from: minter })
    
    await pantry.transferOwnership(owner, { from: minter })
    await kitchen.transferOwnership(owner, { from: minter })
    
    await chef.transferOwnership(owner, { from: minter })
    await autoCakeChef.transferOwnership(owner, { from: minter })
    await selfCakeChef.transferOwnership(owner, { from: minter })
    await acl.transferOwnership(owner, { from: minter })
    
    let erc20TotalSupply = web3.utils.toWei('1000000', 'ether')
    erc20a = await MockBEP20.new('ERC20A', 'ERC20A', erc20TotalSupply, { from: minter });
    erc20b = await MockBEP20.new('ERC20B', 'ERC20B', erc20TotalSupply, { from: minter });
    await erc20a.transfer(
      bob,
      web3.utils.toWei('2000', 'ether'),
      { from: minter });
    await erc20a.transfer(
      alice,
      web3.utils.toWei('2000', 'ether'),
      { from: minter });
    await erc20b.transfer(
      bob,
      web3.utils.toWei('2000', 'ether'),
      { from: minter });
    await erc20b.transfer(
      alice,
      web3.utils.toWei('2000', 'ether'),
      { from: minter });
    
    
  })

  it("adds a yield farm", async () => {
    let poolLength = (await pantry.poolLength()).toString()
    assert.equal(poolLength, "1")
    let totalAllocPoints1 = (await pantry.totalAllocPoint()).toString()
    assert.equal(totalAllocPoints1, 1000)
    let newPoolAllocPoints = '2000'
    await chef.add(
      [erc20a.address, erc20b.address],
      newPoolAllocPoints,
      true,
      { from: owner }
    )

    poolLength = (await pantry.poolLength()).toString()
    const blockNumber = await web3.eth.getBlockNumber()
    
    assert.equal(poolLength, "2");
    const poolInfo = await pantry.getPoolInfo.call(poolLength-1)
    assert.equal(poolInfo.tokenData[0].token, erc20a.address)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    assert.equal(poolInfo.tokenData[0].accCakePerShare, 0)
    assert.equal(poolInfo.tokenData[1].token, erc20b.address)
    assert.equal(poolInfo.tokenData[1].supply, 0)
    assert.equal(poolInfo.tokenData[1].accCakePerShare, 0)
    assert.equal(poolInfo.allocPoint, 2000)
    assert.equal(poolInfo.lastRewardBlock, blockNumber)

    let finalAlloc =  await pantry.totalAllocPoint();
    assert.equal(finalAlloc - totalAllocPoints1, newPoolAllocPoints)
  })
    
})
