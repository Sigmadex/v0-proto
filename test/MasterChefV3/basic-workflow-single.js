const fromExponential = require('from-exponential')

const {
  advanceBlocks,
  advanceTime,
  advanceChain,
  ADDRESSZERO
} = require('../utilities.js');

const CakeToken = artifacts.require('CakeToken');
const SyrupBar = artifacts.require('SyrupBar');
const MasterChef = artifacts.require('MasterChef');
const MockBEP20 = artifacts.require('pancake/pancake-farm/libs/MockBEP20');
const CakeVault = artifacts.require('CakeVault');
const CookBook = artifacts.require('CookBook');
const Kitchen = artifacts.require('Kitchen');
const AutoCakeChef = artifacts.require('AutoCakeChef');
const SelfCakeChef = artifacts.require('SelfCakeChef');
const MasterPantry = artifacts.require('MasterPantry');
const Cashier = artifacts.require("Cashier");
const ACL = artifacts.require('ACL');

async function calcCakeReward(pantry, blocksAhead, poolId) {
  const cakePerBlock = (await pantry.cakePerBlock()).toString()
  const totalAllocPoints = (await pantry.totalAllocPoint()).toString()
  const cakeAllocPoints= (await pantry.getPoolInfo.call(poolId)).allocPoint.toString()
  // only one block ahead, advance time doesn't jump block like one would think
  let numer = (blocksAhead)*cakePerBlock*cakeAllocPoints
  const numerator = new web3.utils.BN(fromExponential(numer))
  const denominator = new web3.utils.BN(totalAllocPoints)
  const cakeReward = numerator.div(denominator)
  return cakeReward
}

contract('MasterChef Single User Tests', () => {
  let accounts;
  let alice, bob, carol, dev, cakeVaultreasury, cakeVaultAdmin, minter, owner = '';
  let cake, syrup = null;
  let erc20A, erc20B = null;
  let chef, selfCakeChef, autoCakeChef = null;
  let pantry, kitchen, cookBook = null;
  let cashier = null;
  let cakeVault;
  let acl;
  const unity = new web3.utils.BN(fromExponential(1e27))

  before(async () => {
    accounts = await web3.eth.getAccounts()
    dev = accounts[0]
    minter = accounts[1]
    cakeVaultTreasury = accounts[2]
    cakeVaultAdmin = accounts[3]
    alice = accounts[4]
    bob = accounts[5]
    carol = accounts[6]
    owner = accounts[8]

    let acl = await ACL.new({ from: minter })

    cake = await CakeToken.new(
      acl.address,
      {from: minter}
    )
    syrup = await SyrupBar.new(
      cake.address,
      acl.address,
      {from: minter}
    )

    let cakePerBlock = web3.utils.toWei('1', 'ether')
    pantry = await MasterPantry.new(
      cake.address,
      syrup.address,
      acl.address,
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
    cashier = await Cashier.new(
      pantry.address,
      acl.address,
      kitchen.address,
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
      cashier.address,
      { from: minter }
    )
    chef = await MasterChef.new(
      pantry.address,
      kitchen.address,
      cookBook.address,
      cashier.address,
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
    await acl.setCashier(cashier.address, { from: minter })

    await pantry.setCakeVault(cakeVault.address, { from: minter })

    await cake.mintExecutive(bob, web3.utils.toWei('1', 'ether'), {from: minter})
    await cake.mintExecutive(carol, web3.utils.toWei('1', 'ether'), {from: minter})


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
  
  it("updates a pool", async() => {
    let poolId = (await pantry.poolLength()).toString() - 1
    let poolInfo = await pantry.getPoolInfo.call(poolId)
    assert.equal(poolInfo.tokenData[0].token, erc20a.address)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    assert.equal(poolInfo.tokenData[0].accCakePerShare, 0)
    assert.equal(poolInfo.tokenData[1].token, erc20b.address)
    assert.equal(poolInfo.tokenData[1].supply, 0)
    assert.equal(poolInfo.tokenData[1].accCakePerShare, 0)
    assert.equal(poolInfo.allocPoint, '2000')
    assert.equal(poolInfo.lastRewardBlock, await web3.eth.getBlockNumber())
    await kitchen.updatePool(poolId)
    poolInfo = await pantry.getPoolInfo.call(poolId)
  })

  it("allows user to stake", async () => {
    let allocPoints = '2000'
    let poolId = (await pantry.poolLength()).toString() - 1
    let stakeAmount = web3.utils.toWei('20', 'ether')
    await erc20a.approve(
      chef.address,
      stakeAmount,
      { from: alice }
    );
    await erc20b.approve(
      chef.address,
      stakeAmount,
      { from: alice }
    );

    assert.equal((await cake.balanceOf(alice)).toString(), '0');

    let aliceErc20ABalance1 = await erc20a.balanceOf(alice)
    let aliceErc20BBalance1 = await erc20b.balanceOf(alice)
    const hourInSeconds = 3600
    await chef.deposit(
      poolId,
      [stakeAmount, stakeAmount],
      hourInSeconds,
      ADDRESSZERO,
      0,
      { from: alice }
    )
    let poolInfo = await pantry.getPoolInfo.call(poolId)
    assert.equal(poolInfo.tokenData[0].token, erc20a.address)
    assert.equal(poolInfo.tokenData[0].supply, stakeAmount)
    assert.equal(poolInfo.tokenData[0].accCakePerShare, 0)
    assert.equal(poolInfo.tokenData[1].token, erc20b.address)
    assert.equal(poolInfo.tokenData[1].supply, stakeAmount)
    assert.equal(poolInfo.tokenData[1].accCakePerShare, 0)
    assert.equal(poolInfo.allocPoint, '2000')
    assert.equal(poolInfo.lastRewardBlock, await web3.eth.getBlockNumber())
    let aliceErc20ABalance2 = await erc20a.balanceOf(alice)
    let aliceErc20BBalance2 = await erc20b.balanceOf(alice)
    assert.equal(
      aliceErc20ABalance1 - aliceErc20ABalance2,
      stakeAmount
    )
    assert.equal(
      aliceErc20BBalance1 - aliceErc20BBalance2,
      stakeAmount
    )

    assert.equal(
      await erc20a.balanceOf(chef.address),
      stakeAmount
    )
    assert.equal(
      await erc20b.balanceOf(chef.address),
      stakeAmount
    )

    let userInfo = await pantry.getUserInfo.call(poolId, alice)
    assert.equal((await cake.balanceOf(alice)).toString(), '0');
    assert.equal(
      userInfo.tokenData[0].amount,
      stakeAmount
    )
    assert.equal(
      userInfo.tokenData[1].amount,
      stakeAmount
    )

    assert.equal(
      (await pantry.tokenRewardData(erc20a.address)).timeAmountGlobal.toString(),
      stakeAmount * hourInSeconds
    )
    assert.equal(
      (await pantry.tokenRewardData(erc20b.address)).timeAmountGlobal.toString(),
      stakeAmount * hourInSeconds
    )
  })

  it("allows a user to withdraw prematurely, but is penalized", async () => {
    let poolId = (await pantry.poolLength()).toString() - 1
    let aliceErc20ABalance1 = await erc20a.balanceOf(alice)
    let aliceErc20BBalance1 = await erc20b.balanceOf(alice)

    assert.equal((await pantry.getPoolInfo.call(poolId)).tokenData[0].token, erc20a.address)
    assert.equal((await pantry.getPoolInfo.call(poolId)).tokenData[1].token, erc20b.address)
    
    let stakeAmount = web3.utils.toWei('20', 'ether')
    const hourInSeconds = 3600
    const blocksForward = 1

    await advanceBlocks(blocksForward)


    await chef.withdraw(
      poolId,
      0,
      { from: alice }
    )
    assert.equal((await erc20a.balanceOf(chef.address)).toString(), 0)
    assert.equal((await erc20b.balanceOf(chef.address)).toString(), 0)
    
    let userInfo = await pantry.getUserInfo.call(poolId, alice)
    
    assert.equal(userInfo.positions[0].amounts[0], 0)
    assert.equal(userInfo.positions[0].amounts[1], 0)
    assert.equal(userInfo.tokenData[0].amount, 0)
    assert.equal(userInfo.tokenData[1].amount, 0)
    
    const cakeReward = await calcCakeReward(pantry, blocksForward+1, 1)

    // penalty depends on internal clock between deposit and withdrawl time, may
    // be slightly different as per computer, 2 seconds for me
    //
    const proportion2 = unity.mul(new web3.utils.BN(2)).div(new web3.utils.BN(hourInSeconds))
    const refundERC20A = (new web3.utils.BN(stakeAmount)).mul(proportion2).div(unity)
    const penaltyERC20A = (new web3.utils.BN(stakeAmount)).sub(refundERC20A)
    assert.equal((await cake.balanceOf(alice)).toString(), 0);
    assert.equal(
      userInfo.tokenData[0].amount,
      0
    )
    assert.equal(
      userInfo.tokenData[1].amount,
      0
    )
    const stakeBN = new web3.utils.BN(stakeAmount)
    const accCakePerShare = cakeReward.mul(unity).div(stakeBN)
    poolInfo = await pantry.getPoolInfo.call(poolId)
    assert.equal(poolInfo.tokenData[0].token, erc20a.address)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    assert.equal(poolInfo.tokenData[0].accCakePerShare, accCakePerShare.toString() / 2)
    assert.equal(poolInfo.tokenData[1].token, erc20b.address)
    assert.equal(poolInfo.tokenData[1].supply, 0)
    assert.equal(poolInfo.tokenData[1].accCakePerShare, accCakePerShare.toString() / 2)
    assert.equal(poolInfo.allocPoint, '2000')
    assert.equal(poolInfo.lastRewardBlock, await web3.eth.getBlockNumber())

    assert.equal((await cake.balanceOf(cashier.address)).toString(), cakeReward.toString());
    assert.equal((await erc20a.balanceOf(cashier.address)).toString(), penaltyERC20A.toString() )
    assert.equal((await erc20a.balanceOf(alice)).sub(aliceErc20ABalance1), refundERC20A.toString())

    assert.equal(
      (await pantry.tokenRewardData(erc20a.address)).timeAmountGlobal.toString(),
      0
    )
    assert.equal(
      (await pantry.tokenRewardData(erc20b.address)).timeAmountGlobal.toString(),
      0
    )
  })

  it("allows a user to withdraw, and is rewarded", async () => {
    let stakeAmount = web3.utils.toWei('20', 'ether')
    let poolId = (await pantry.poolLength()).toString() - 1
    const hourInSeconds = 3600
    await erc20a.approve(
      chef.address,
      stakeAmount,
      { from: alice }
    );
    await erc20b.approve(
      chef.address,
      stakeAmount,
      { from: alice }
    );
    
    await chef.deposit(
      poolId,
      [stakeAmount, stakeAmount],
      hourInSeconds,
      ADDRESSZERO,
      0,
      { from: alice }
    )

    await advanceChain(360, 10) // 360 blocks, 10 seconds per block 

    const penaltyPoolErc20a = await erc20a.balanceOf(cashier.address)
    const globalTimeAmountErc20a = await pantry.tokenRewardData(erc20a.address)
    const localTimeAmount =  fromExponential(new web3.utils.BN(hourInSeconds) * stakeAmount)
    console.log('test localtimeamount', localTimeAmount.toString())
    const proportion = localTimeAmount / globalTimeAmountErc20a
    console.log('test proportion', proportion)
    const rewardAmountErc20a = proportion * penaltyPoolErc20a
  

    await chef.withdraw(
      poolId,
      1,
      { from: alice }
    )

    
  })

  it('can manual stake cake', async () => {
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    const hourInSeconds = 3600
    let bobCake = (await cake.balanceOf(bob)).toString()
    let kitchenCake = (await cake.balanceOf(kitchen.address)).toString()

    await cake.approve(
      selfCakeChef.address,
      cakeDeposit,
      {from: bob}
    )

    await selfCakeChef.enterStaking(
      cakeDeposit,
      hourInSeconds,
      ADDRESSZERO,
      0,
      {from: bob}
    )

    assert.equal((await cake.balanceOf(bob)).toString(), 0)
    assert.equal((await cake.balanceOf(selfCakeChef.address)).toString(), cakeDeposit)

    const bobUserInfo = await pantry.getUserInfo.call(0, bob)
    assert.equal(bobUserInfo.tokenData[0].amount, cakeDeposit)
    assert.equal(bobUserInfo.tokenData[0].rewardDebt, 0)
    assert.equal(
      bobUserInfo.positions[0].timeEnd - bobUserInfo.positions[0].timeStart,
      hourInSeconds
    )
    assert.equal(bobUserInfo.positions[0].amounts[0], cakeDeposit)

    assert.equal(
      (await pantry.tokenRewardData(cake.address)).timeAmountGlobal.toString(),
      cakeDeposit * hourInSeconds
    )
  })

  it("can manual withdraw cake stake", async () => {
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    const penaltyCake1 = (await cake.balanceOf(cashier.address))
    const bobCake1 = (await cake.balanceOf(bob))
    const hourInSeconds = 3600
    await selfCakeChef.leaveStaking(0, { from: bob })
    const bobCake2 = (await cake.balanceOf(bob))
    const penaltyCake2 = (await cake.balanceOf(cashier.address))
    
    // Time elapsed on my computer is 1 second, may be different on different machines
    const proportion1 = unity.mul(new web3.utils.BN(1)).div(new web3.utils.BN(hourInSeconds))
    const refundERC20A = (new web3.utils.BN(cakeDeposit)).mul(proportion1).div(unity)
    const penaltyERC20A = (new web3.utils.BN(cakeDeposit)).sub(refundERC20A)
    
    const cakeReward = (await calcCakeReward(pantry, 1, 0))
    
    assert.equal(penaltyCake2 - penaltyCake1, Number(cakeReward) + Number(penaltyERC20A))
    assert.equal(bobCake2 - bobCake1, Number(refundERC20A))

    const bobUserInfo = await pantry.getUserInfo.call(0, bob)
    assert.equal(bobUserInfo.positions[0].amounts[0], 0)
    assert.equal(bobUserInfo.tokenData[0].amount, 0)
    assert.equal(bobUserInfo.tokenData[0].amount, 0)

    const poolInfo = await pantry.getPoolInfo.call(0)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    const blockNumber = await web3.eth.getBlockNumber()
    assert.equal(poolInfo.lastRewardBlock, blockNumber)

    assert.equal(
      (await pantry.tokenRewardData(cake.address)).timeAmountGlobal.toString(),
      0
    )
  })
  
  it("can deposit (auto) cake", async() => {
    let carolBalance1 = (await cake.balanceOf(carol)).toString()
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    await cake.approve(
      cakeVault.address,
      cakeDeposit,
      {from: carol}
    )
    const hourInSeconds = 3600
    await cakeVault.deposit(
      cakeDeposit,
      hourInSeconds,
      ADDRESSZERO,
      0,
      {from: carol}
    )

    //cake vault state
    // Alice get shares in Cake Vault
    assert.equal(cakeDeposit,(await cakeVault.userInfo(carol)).shares.toString())
    assert.equal((await cakeVault.userInfo(chef.address)).shares.toString(), 0)
    assert.equal((await cakeVault.userInfo(cakeVault.address)).shares.toString(), 0)
    //have to user custom getter for position info
    const positions = (await cakeVault.getUserInfo(carol)).positions
    assert.equal(positions[0].timeEnd - positions[0].timeStart, hourInSeconds);
    assert.equal(positions[0].amount, cakeDeposit)


    //cake token state
    let carolBalance2 =  (await cake.balanceOf(carol)).toString()
    assert.equal(carolBalance1 - carolBalance2, cakeDeposit)
    assert.equal((await cake.balanceOf(cakeVaultTreasury)).toString(), 0)
    assert.equal((await cake.balanceOf(dev)).toString(), 0)
    assert.equal((await cake.balanceOf(autoCakeChef.address)).toString(), cakeDeposit)
    assert.equal((await cake.balanceOf(cakeVault.address)).toString(), 0)

    //master chef state
    assert.equal((await pantry.getUserInfo(0, carol)).tokenData.length, 0)
    assert.equal((await pantry.getUserInfo(0, cakeVault.address)).tokenData[0].amount.toString(), cakeDeposit)

    assert.equal(
      (await pantry.tokenRewardData(cake.address)).timeAmountGlobal.toString(),
      cakeDeposit * hourInSeconds
    )

    //syrup state
    assert.equal((await syrup.balanceOf(carol)).toString(), 0)
    assert.equal((await syrup.balanceOf(cakeVault.address)).toString(), cakeDeposit)
    assert.equal((await syrup.balanceOf(autoCakeChef.address)).toString(), 0)
  })

  it("harvest function restakes cake", async () => {
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    const hourInSeconds = 3600
    let carolBalance2 =  (await cake.balanceOf(carol)).toString()
    const cakeReward = await calcCakeReward(pantry, 1, 0)
    const performanceFee = (await cakeVault.performanceFee())
    const callFee = (await cakeVault.callFee())
    
    const currentPerformanceFee = cakeReward * performanceFee / 10000
    const currentCallFee = Math.floor(cakeReward * callFee / 10000)
    const cakeIter =Number(cakeDeposit) +Number(cakeReward) - currentPerformanceFee - currentCallFee
    await cakeVault.harvest()
    assert.equal((await cake.balanceOf(cakeVaultTreasury)).toString(), currentPerformanceFee)
    assert.equal((await cake.balanceOf(dev)).toString(), currentCallFee)

    // 1 cake per block, 100 blocks forward + current block


    let carolBalance3 =  (await cake.balanceOf(carol)).toString()
    //cake vault state
    // Alice get shares in Cake Vault
    assert.equal(cakeDeposit,(await cakeVault.userInfo(carol)).shares.toString())
    assert.equal((await cakeVault.userInfo(chef.address)).shares.toString(), 0)
    assert.equal((await cakeVault.userInfo(cakeVault.address)).shares.toString(), 0)
    // position stay standard
    const positions = (await cakeVault.getUserInfo(carol)).positions
    assert.equal(positions[0].timeEnd - positions[0].timeStart, hourInSeconds);
    assert.equal(positions[0].amount, cakeDeposit)
    //cake token state
    //Alice pays
    //assert.equal(aliceBalance1 - aliceBalance2, cakeDeposit)
    // masterchef holds the cake

    assert.equal((await cake.balanceOf(autoCakeChef.address)).toString(), cakeIter)
    assert.equal((await cake.balanceOf(cakeVault.address)).toString(), 0)

    //master chef state
    assert.equal((await pantry.getUserInfo(0, alice)).tokenData.length, 0)

    // masterchef tracks cakevaults amount of cake
    assert.equal((await pantry.getUserInfo(0, cakeVault.address)).tokenData[0].amount.toString(), cakeIter)

    //syrup state
    assert.equal((await syrup.balanceOf(alice)).toString(), 0)
    // cakevault has syrup (recipt token)
    assert.equal((await syrup.balanceOf(cakeVault.address)).toString(), cakeIter)
    assert.equal((await syrup.balanceOf(autoCakeChef.address)).toString(), 0)
  })

  it("can withdrawal cake", async() => {
    const hourInSeconds = 3600
    const currentAmount = await cakeVault.balanceOf()
    const cakeTreasury1 = await cake.balanceOf(cakeVaultTreasury)
    let carolBalance1 = (await cake.balanceOf(carol)).toString()
    const carolShares = (await cakeVault.userInfo(carol)).shares.toString()
    // the harvest paradigm
    await cakeVault.withdraw(0, {from: carol})
    let cakeInVault = await cake.balanceOf(cakeVault.address)
    const withdrawFee = (await cakeVault.withdrawFee()).toString() / 10000
    let carolBalance2 =  (await cake.balanceOf(carol)).toString()
    
    const cakeReward = await calcCakeReward(pantry, 1, 0)
    const performanceFee = (await cakeVault.performanceFee())
    const callFee = (await cakeVault.callFee())
    const currentPerformanceFee= cakeReward * performanceFee
 
    assert.equal(carolBalance2 - carolBalance1, currentAmount - (currentAmount*withdrawFee))
    assert.equal((await syrup.balanceOf(cakeVault.address)).toString(), 0)
    const treasuryDiff = (await cake.balanceOf(cakeVaultTreasury)) - cakeTreasury1
    assert.equal(treasuryDiff, Math.floor(currentAmount*withdrawFee))

    // position stay standard
    const positions = (await cakeVault.getUserInfo(carol)).positions
    assert.equal(positions[0].timeEnd - positions[0].timeStart, hourInSeconds);
    assert.equal(positions[0].amount, 0)


    assert.equal(
      (await pantry.tokenRewardData(cake.address)).timeAmountGlobal.toString(),
      0
    )
  })

  it("can withdraw cake (auto) after more elapsed time", async () => {
    let cakeInVault = await cake.balanceOf(cakeVault.address)
    let carolUserInfoVault = await cakeVault.userInfo(carol)
    let carolUserInfo = await pantry.getUserInfo(0, carol);
    let chefUserInfo = await pantry.getUserInfo(0, chef.address);
    let vaultUserInfo = await pantry.getUserInfo(0, cakeVault.address)
    assert.equal(carolUserInfo.tokenData.length, 0)
    assert.equal(carolUserInfo.lastRewardBlock, 0)
    assert.equal(carolUserInfoVault.shares.toString(), 0)
    let carolBalance1 = (await cake.balanceOf(carol))
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    let hourInSeconds = 3600
    await cake.approve(
      cakeVault.address,
      cakeDeposit,
      {from: carol}
    )
    await cakeVault.deposit(
      cakeDeposit,
      hourInSeconds,
      ADDRESSZERO,
      0,
      {from: carol}
    )
    
    assert.equal(
      (await pantry.tokenRewardData(cake.address)).timeAmountGlobal.toString(),
      cakeDeposit * hourInSeconds
    )
    vaultUserInfo = await pantry.getUserInfo(0, cakeVault.address)

    
    const withdrawFeePeriod = (await cakeVault.withdrawFeePeriod()).toString()
    await advanceTime(withdrawFeePeriod)

    let positions = (await cakeVault.getUserInfo(carol)).positions
    assert.equal(positions[1].timeEnd - positions[1].timeStart, hourInSeconds);
    assert.equal(positions[1].amount, cakeDeposit)
    const carolShares = (await cakeVault.userInfo(carol)).shares.toString()
    await cakeVault.withdraw(1, {from: carol})
    const cakeReward = await calcCakeReward(pantry, 1, 0)
    let carolBalance2 =  (await cake.balanceOf(carol))
    assert.equal((carolBalance1.add(cakeReward)).toString(), carolBalance2.toString())
    positions = (await cakeVault.getUserInfo(carol)).positions
    assert.equal(positions[1].timeEnd - positions[1].timeStart, hourInSeconds);
    assert.equal(positions[1].amount, 0)

    carolUserInfo = await pantry.getUserInfo(0, carol);
    chefUserInfo = await pantry.getUserInfo(0, chef.address);
    vaultUserInfo = await pantry.getUserInfo(0, cakeVault.address)
    const poolInfo = await pantry.getPoolInfo.call(0)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    carolUserInfoVault = await cakeVault.userInfo(carol)
    assert.equal(carolUserInfoVault.shares.toString(), 0)

    assert.equal(
      (await pantry.tokenRewardData(cake.address)).timeAmountGlobal.toString(),
      0
    )
  })

  it("real case", async () => {})
  it("access control", async () => {})
})
