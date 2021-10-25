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

const NFTRewards = artifacts.require('NFTRewards')
const ReducedPenaltyNFT = artifacts.require('ReducedPenaltyNFT')

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
async function calcNFTRewardAmount(token, cashier, pantry, stakeTime, stakeAmount) {
  const penaltyPoolErc20a = await token.balanceOf(cashier.address)
  const globalTimeAmountErc20a = await pantry.tokenRewardData(token.address)
  const localTimeAmount =  fromExponential(new web3.utils.BN(stakeTime) * stakeAmount)
  return new web3.utils.BN(localTimeAmount).mul(penaltyPoolErc20a).div(globalTimeAmountErc20a.timeAmountGlobal)

}

contract('MasterChef Single User Tests', () => {
  let accounts;
  let alice, bob, carol, joe, dev, cakeVaultreasury, cakeVaultAdmin, minter, owner = '';
  let cake, syrup = null;
  let erc20A, erc20B = null;
  let chef, selfCakeChef, autoCakeChef = null;
  let pantry, kitchen, cookBook = null;
  let cashier = null;
  let reductedPenalty, nftRewards = null;
  let cakeVault;
  let acl;
  const unity = new web3.utils.BN(fromExponential(1e27))
  const hourInSeconds = 3600

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
    joe = accounts[9]

    let acl = await ACL.new({ from: minter })

    nftRewards = await NFTRewards.new(acl.address, { from: minter })
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
      nftRewards.address,
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
      cashier.address,
      cakeVaultAdmin,
      cakeVaultTreasury,
      {from: minter}
    )

    reducedPenalty = await ReducedPenaltyNFT.new(
      pantry.address,
      cashier.address,
      cookBook.address,
      kitchen.address,
      acl.address,
      { from: minter }
    )
      /*
    await reducedPenalty.grantRole(
      web3.utils.keccak256("MINTER_ROLE"),
      nftRewards.address,
      {from:minter}
    )
    */



    //fill ACL
    await acl.setPantry(pantry.address, { from: minter })
    await acl.setKitchen(kitchen.address, { from: minter })
    await acl.setMasterChef(chef.address, { from: minter })
    await acl.setSelfCakeChef(selfCakeChef.address, { from: minter })
    await acl.setAutoCakeChef(autoCakeChef.address, { from: minter })
    await acl.setCakeVault(cakeVault.address, { from: minter })
    await acl.setCashier(cashier.address, { from: minter })
    await acl.setNFTRewards(nftRewards.address, { from: minter })
    await acl.setReducedPenalty(reducedPenalty.address, { from: minter })

    await pantry.setCakeVault(cakeVault.address, { from: minter })

    await cake.mintExecutive(bob, web3.utils.toWei('2', 'ether'), {from: minter})
    await cake.mintExecutive(carol, web3.utils.toWei('1', 'ether'), {from: minter})
    await cake.mintExecutive(joe, web3.utils.toWei('1', 'ether'), {from: minter})


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

  it("adds an NFT reward to the NFT Reward Factory", async () => {
    await nftRewards.addNFTReward(cake.address, reducedPenalty.address, {from:minter})
    await nftRewards.addNFTReward(erc20a.address, reducedPenalty.address, {from:minter})
    await nftRewards.addNFTReward(erc20b.address, reducedPenalty.address, {from:minter})
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
    assert.equal(userInfo.positions[0].timeEnd - userInfo.positions[0].timeStart, hourInSeconds)
    assert.equal(userInfo.positions[0].amounts[0], stakeAmount)
    assert.equal(userInfo.positions[0].amounts[1], stakeAmount)
    assert.equal(userInfo.positions[0].nftReward, ADDRESSZERO)
    assert.equal(userInfo.positions[0].nftid, 0)
  })

  it("allows a user to withdraw prematurely, but is penalized", async () => {
    let poolId = (await pantry.poolLength()).toString() - 1
    let aliceErc20ABalance1 = await erc20a.balanceOf(alice)
    let aliceErc20BBalance1 = await erc20b.balanceOf(alice)

    assert.equal((await pantry.getPoolInfo.call(poolId)).tokenData[0].token, erc20a.address)
    assert.equal((await pantry.getPoolInfo.call(poolId)).tokenData[1].token, erc20b.address)
    
    let stakeAmount = web3.utils.toWei('20', 'ether')
    const blocksForward = 1

      await advanceBlocks(blocksForward)


    assert.equal((await cake.balanceOf(cashier.address)).toString(), 0)
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


    const userInfo1 = await pantry.getUserInfo(poolId, alice)
    
    const rewardAmountErc20a = await calcNFTRewardAmount(erc20a, cashier, pantry, hourInSeconds, stakeAmount)
    const rewardAmountErc20b = await calcNFTRewardAmount(erc20b, cashier, pantry, hourInSeconds, stakeAmount)
    let poolInfo = await pantry.getPoolInfo.call(1)
    const erc20aPoolSupply = new web3.utils.BN(poolInfo.tokenData[0].supply)
    const erc20bPoolSupply = new web3.utils.BN(poolInfo.tokenData[1].supply)
    const erc20aPositionAmount = new web3.utils.BN(userInfo1.positions[1].amounts[0])
    const erc20bPositionAmount = new web3.utils.BN(userInfo1.positions[1].amounts[1])

    const penaltyPoolCake = await cake.balanceOf(cashier.address);


    assert.equal(userInfo1.tokenData[0].amount, stakeAmount)
    assert.equal(userInfo1.tokenData[1].amount, stakeAmount)
    assert.equal(userInfo1.positions[1].timeEnd - userInfo1.positions[1].timeStart, hourInSeconds)
    assert.equal(userInfo1.positions[1].amounts[0], stakeAmount)
    assert.equal(userInfo1.positions[1].amounts[1], stakeAmount)
    assert.equal(userInfo1.positions[1].nftReward, ADDRESSZERO)
    assert.equal(userInfo1.positions[1].nftid, 0)

    const cakeRewarded = await pantry.cakeRewarded()
    const cakePerBlock = await pantry.cakePerBlock()
    const amountsA = new web3.utils.BN(userInfo1.positions[1].amounts[0])

    const amountsB = new web3.utils.BN(userInfo1.positions[1].amounts[1])
    assert.equal(0, cakeRewarded.toString())
    await chef.withdraw(
      poolId,
      1,
      { from: alice }
    )

    poolInfo = await pantry.getPoolInfo.call(1)
    const poolAllocPoint =  new web3.utils.BN(poolInfo.allocPoint)
    const totalAllocPoint = await pantry.totalAllocPoint()
    const accCakePerShareA = new web3.utils.BN(poolInfo.tokenData[0].accCakePerShare)
    const accCakePerShareB = new web3.utils.BN(poolInfo.tokenData[1].accCakePerShare)
    const totalAmountA = accCakePerShareA.mul(amountsA)
    const totalAmountB = accCakePerShareB.mul(amountsB)
    const totalAmountShares = totalAmountA.add(totalAmountB)
    const blockNumber = await web3.eth.getBlockNumber()
    const startBlock = userInfo1.positions[1].startBlock
    const elapsedBlocks = new web3.utils.BN(blockNumber + 2 - startBlock)
    let totalCakeEmission =  elapsedBlocks.mul(cakePerBlock).sub(cakeRewarded)
    const cakeEmittedForPool = totalCakeEmission.mul(poolAllocPoint).div(totalAllocPoint)
    const proportion = totalAmountShares.div(cakeEmittedForPool);
    const cashierBalance = await cake.balanceOf(cashier.address)
    const rewardAmountCake = proportion.mul(cashierBalance).div(unity)
    
    // alice
    const aliceUserInfoFinal = await pantry.getUserInfo(poolId, alice)
    assert.equal(aliceUserInfoFinal.tokenData[0].amount, 0)
    assert.equal(aliceUserInfoFinal.tokenData[1].amount, 0)
    assert.equal(aliceUserInfoFinal.positions[1].timeEnd - aliceUserInfoFinal.positions[1].timeStart, hourInSeconds)
    assert.equal(aliceUserInfoFinal.positions[1].amounts[0], 0)
    assert.equal(aliceUserInfoFinal.positions[1].amounts[1], 0)
    assert.equal(aliceUserInfoFinal.positions[1].nftReward, ADDRESSZERO)
    assert.equal(aliceUserInfoFinal.positions[1].nftid, 0)

    assert.equal((await reducedPenalty.balanceOf(alice, 1)).toString(), 1)
    assert.equal((await reducedPenalty.balanceOf(alice, 2)).toString(), 1)
    assert.equal((await reducedPenalty.balanceOf(alice, 3)).toString(), 1)
    
    const reductionAmount1 = (await reducedPenalty.reductionAmounts(1));
    const reductionAmount2 = (await reducedPenalty.reductionAmounts(2));
    const reductionAmount3 = (await reducedPenalty.reductionAmounts(3));
    assert.equal(reductionAmount1.token, erc20a.address)
    assert.equal(reductionAmount2.token, erc20b.address)
    assert.equal(reductionAmount3.token, cake.address)

    assert.equal(reductionAmount1.amount.toString(), rewardAmountErc20a.toString())
    assert.equal(reductionAmount2.amount.toString(), rewardAmountErc20b.toString())
    assert.equal(reductionAmount3.amount.toString(), rewardAmountCake.toString())
    
    const globalTimeAmountErc20af = await pantry.tokenRewardData(erc20a.address)
    const globalTimeAmountErc20bf = await pantry.tokenRewardData(erc20b.address)
    const cakeRewardedFinal = await pantry.cakeRewarded()

    assert.equal(globalTimeAmountErc20af.timeAmountGlobal, 0)
    assert.equal(globalTimeAmountErc20bf.timeAmountGlobal, 0)
    assert.equal(cakeRewardedFinal.toString(), rewardAmountCake.toString())
    
  })

  it('can manual stake cake', async () => {
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    let bobCake1 = await cake.balanceOf(bob)
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

    let bobCake2 = await cake.balanceOf(bob)
    assert.equal((await cake.balanceOf(bob)), bobCake1 - bobCake2)
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

    await selfCakeChef.leaveStaking(0, { from: bob })

    const bobCake2 = (await cake.balanceOf(bob))
    const penaltyCake2 = (await cake.balanceOf(cashier.address))
    
    // Time elapsed on my computer is 1 second, may be different on different machines
    const proportion1 = unity.mul(new web3.utils.BN(1)).div(new web3.utils.BN(hourInSeconds))

    const refundERC20A = (new web3.utils.BN(cakeDeposit)).mul(proportion1).div(unity)
    const penaltyERC20A = (new web3.utils.BN(cakeDeposit)).sub(refundERC20A)
    
    const cakeReward = (await calcCakeReward(pantry, 1, 0))
    
    assert.equal(penaltyCake2 - penaltyCake1, Number(cakeReward) + Number(penaltyERC20A))
    assert.equal(bobCake2.sub(bobCake1), Number(refundERC20A))

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

  it("can manual withdraw cake after more time, and get reward", async () => {
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    let bobCake1 = await cake.balanceOf(bob)
    let cashierCake1 = await cake.balanceOf(cashier.address)
    let kitchenCake1 = await cake.balanceOf(kitchen.address)
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

    const rewardAmountCake = await calcNFTRewardAmount(cake, cashier, pantry, hourInSeconds, cakeDeposit)
    await advanceChain(360, 10) // 360 blocks, 10 seconds per block
    const cakeReward = await calcCakeReward(pantry, 362, 0 )

    await selfCakeChef.leaveStaking(1, { from: bob })

    let bobCake2 = await cake.balanceOf(bob)
    let cashierCake2 = await cake.balanceOf(cashier.address)
    let kitchenCake2 = await cake.balanceOf(kitchen.address)

    let bobNft = await reducedPenalty.balanceOf(bob, 4);
    assert.equal(bobNft.toString(), 1)
    assert.equal(rewardAmountCake.toString(), (await reducedPenalty.reductionAmounts(4)).amount.toString())

  })
  
  it("can deposit (auto) cake", async() => {
    let carolBalance1 = (await cake.balanceOf(carol)).toString()
    let cakeDeposit = web3.utils.toWei('1', 'ether')
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

  it("can withdrawal cake (penalized)", async() => {
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    let currentAmount = await cakeVault.balanceOf()
    const cakeTreasury1 = await cake.balanceOf(cakeVaultTreasury)
    let carolBalance1 = (await cake.balanceOf(carol))
    const carolShares = (await cakeVault.userInfo(carol)).shares.toString()
    // the harvest paradigm
    const penaltyPool1 = await cake.balanceOf(cashier.address)
    await cakeVault.withdraw(0, {from: carol})
    const penaltyPool2 = await cake.balanceOf(cashier.address)
    let cakeInVault = await cake.balanceOf(cakeVault.address)
    const withdrawFee = (await cakeVault.withdrawFee()).mul(unity).div(new web3.utils.BN(10000))
    const toTreasury = currentAmount.mul(withdrawFee).div(unity)
    currentAmount = currentAmount.sub(currentAmount.mul(withdrawFee).div(unity))
    let carolBalance2 =  (await cake.balanceOf(carol))
    
    const cakeReward = await calcCakeReward(pantry, 1, 0)
    const performanceFee = (await cakeVault.performanceFee())
    const callFee = (await cakeVault.callFee())
    const currentPerformanceFee= cakeReward * performanceFee
    
    const proportionTime = unity.mul(new web3.utils.BN(2)).div(new web3.utils.BN(hourInSeconds))
    const refundCake = (new web3.utils.BN(currentAmount)).mul(proportionTime).div(unity)
    const penaltyCake = (new web3.utils.BN(currentAmount)).sub(refundCake)
    assert.equal(carolBalance2.sub(carolBalance1).toString(), refundCake.toString())
    assert.equal((await syrup.balanceOf(cakeVault.address)).toString(), 0)
    const treasuryDiff = (await cake.balanceOf(cakeVaultTreasury)).sub(cakeTreasury1)
    assert.equal(treasuryDiff.toString(), toTreasury.toString())

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
    let joeUserInfoVault = await cakeVault.userInfo(joe)
    let joeUserInfo = await pantry.getUserInfo(0, joe);
    let chefUserInfo = await pantry.getUserInfo(0, chef.address);
    let vaultUserInfo = await pantry.getUserInfo(0, cakeVault.address)
    assert.equal(joeUserInfo.tokenData.length, 0)
    assert.equal(joeUserInfo.lastRewardBlock, 0)
    assert.equal(joeUserInfoVault.shares.toString(), 0)
    let joeBalance1 = (await cake.balanceOf(joe))
    let cakeDeposit = web3.utils.toWei('1', 'ether')
    await cake.approve(
      cakeVault.address,
      cakeDeposit,
      {from: joe}
    )
    await cakeVault.deposit(
      cakeDeposit,
      hourInSeconds,
      ADDRESSZERO,
      0,
      {from: joe}
    )
    
    assert.equal(
      (await pantry.tokenRewardData(cake.address)).timeAmountGlobal.toString(),
      cakeDeposit * hourInSeconds
    )
    vaultUserInfo = await pantry.getUserInfo(0, cakeVault.address)

    
    const withdrawFeePeriod = (await cakeVault.withdrawFeePeriod()).toString()

    await advanceChain(360, withdrawFeePeriod/360)

    let positions = (await cakeVault.getUserInfo(joe)).positions
    assert.equal(positions[0].timeEnd - positions[0].timeStart, hourInSeconds);
    assert.equal(positions[0].amount, cakeDeposit)
    const joeShares = (await cakeVault.userInfo(joe)).shares.toString()
    const nftRewardAmount = (await calcNFTRewardAmount(cake, cashier, pantry, hourInSeconds, cakeDeposit)).toString()
    await cakeVault.withdraw(0, {from: joe})
    const cakeReward = await calcCakeReward(pantry, 1, 0)
    let joeBalance2 =  (await cake.balanceOf(joe))
    assert.equal((joeBalance1.add(cakeReward)).toString(), joeBalance2.toString())
    positions = (await cakeVault.getUserInfo(joe)).positions
    assert.equal(positions[0].timeEnd - positions[0].timeStart, hourInSeconds);
    assert.equal(positions[0].amount, 0)

    joeUserInfo = await pantry.getUserInfo(0, joe);
    chefUserInfo = await pantry.getUserInfo(0, chef.address);
    vaultUserInfo = await pantry.getUserInfo(0, cakeVault.address)
    const poolInfo = await pantry.getPoolInfo.call(0)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    joeUserInfoVault = await cakeVault.userInfo(joe)
    assert.equal(joeUserInfoVault.shares.toString(), 0)

    assert.equal(
      (await pantry.tokenRewardData(cake.address)).timeAmountGlobal.toString(),
      0
    )
    const reductionAmount = (await reducedPenalty.reductionAmounts(5)).amount.toString()
    assert.equal(nftRewardAmount, reductionAmount)

    assert.equal((await reducedPenalty.balanceOf(joe, 5)).toString(), 1)
    assert.equal((await reducedPenalty.reductionAmounts(5)).token, cake.address)
  })

  it("can use a reducedPenalty NFT in masterChef", async () => {
    const nftId = 1
    const poolId = (await pantry.poolLength()).toString() - 1
    // =====USER=====
    // Cake
    const aliceCake1 = await cake.balanceOf(alice)
    // Pantry
    const aliceUserInfo = await pantry.getUserInfo(poolId, alice)
    assert.equal(aliceUserInfo.tokenData[0].amount, 0)
    assert.equal(aliceUserInfo.tokenData[1].amount, 0)
    const positionId = aliceUserInfo.positions.length

    const poolInfo = await pantry.getPoolInfo.call(poolId)
    // NFT
    const aliceNFT1 = await reducedPenalty.balanceOf(alice, nftId)
    assert.equal(aliceNFT1, 1)
    const nftReduction = await reducedPenalty.reductionAmounts(nftId)
    assert.equal(nftReduction.token, erc20a.address)

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

    let aliceErc20a = await erc20a.balanceOf(alice)
    let aliceErc20b = await erc20b.balanceOf(alice)
    const chefErc20a = await erc20a.balanceOf(chef.address)
    const chefErc20b = await erc20b.balanceOf(chef.address)
    
    await chef.deposit(
      poolId,
      [stakeAmount, stakeAmount],
      hourInSeconds,
      reducedPenalty.address,
      nftId,
      { from: alice }
    )
    // Pantry
    // User Info
    const userInfo2 = await pantry.getUserInfo(poolId, alice)
    const positionInfo = userInfo2.positions[positionId]
    assert.equal(userInfo2.tokenData[0].amount, stakeAmount)
    assert.equal(userInfo2.tokenData[1].amount, stakeAmount)
    assert.equal(positionInfo.amounts[0], stakeAmount)
    assert.equal(positionInfo.amounts[1], stakeAmount)
    assert.equal(positionInfo.timeEnd - positionInfo.timeStart, hourInSeconds)
    assert.equal(positionInfo.nftid, nftId)
    assert.equal(positionInfo.nftReward, reducedPenalty.address)

    //PoolInfo
    const poolInfo2 = await pantry.getPoolInfo.call(poolId)
    assert.equal(poolInfo2.tokenData[0].supply, stakeAmount)
    assert.equal(poolInfo2.tokenData[1].supply, stakeAmount)
    assert.equal(poolInfo2.tokenData[0].token, erc20a.address)
    assert.equal(poolInfo2.tokenData[1].token, erc20b.address)

    //Token Balances
    const aliceErc20a1 = await erc20a.balanceOf(alice)
    const aliceErc20b1 = await erc20b.balanceOf(alice)
    const chefErc20a1 = await erc20a.balanceOf(chef.address)
    const chefErc20b1 = await erc20b.balanceOf(chef.address)
    const cashierErc20a1 = await erc20a.balanceOf(cashier.address)
    const cashierErc20b1 = await erc20b.balanceOf(cashier.address)
    assert.equal(aliceErc20a - aliceErc20a1, stakeAmount)
    assert.equal(aliceErc20b - aliceErc20b1, stakeAmount)
    assert.equal(chefErc20a.add(new web3.utils.BN(stakeAmount)).toString(),  chefErc20a1.toString())
    assert.equal(chefErc20b.add(new web3.utils.BN(stakeAmount)).toString(),  chefErc20b1.toString())


    await chef.withdraw(
      poolId,
      positionId,
      { from: alice }
    )

    const userInfo3 = await pantry.getUserInfo(poolId, alice)
    const positionInfo3 = userInfo3.positions[positionId]
    assert.equal(userInfo3.tokenData[0].amount, 0)
    assert.equal(userInfo3.tokenData[1].amount, 0)
    assert.equal(positionInfo3.amounts[0], 0)
    assert.equal(positionInfo3.amounts[1], 0)
    assert.equal(positionInfo3.timeEnd - positionInfo.timeStart, hourInSeconds)
    assert.equal(positionInfo3.nftid, nftId)
    assert.equal(positionInfo3.nftReward, reducedPenalty.address)

    //PoolInfo
    const poolInfo3 = await pantry.getPoolInfo.call(poolId)
    assert.equal(poolInfo3.tokenData[0].supply, 0)
    assert.equal(poolInfo3.tokenData[1].supply, 0)
    assert.equal(poolInfo3.tokenData[0].token, erc20a.address)
    assert.equal(poolInfo3.tokenData[1].token, erc20b.address)

    //Token Balances
    //ERC20 A
    const aliceErc20a2 = await erc20a.balanceOf(alice)
    const aliceErc20b2 = await erc20b.balanceOf(alice)
    const chefErc20a2 = await erc20a.balanceOf(chef.address)
    const chefErc20b2 = await erc20b.balanceOf(chef.address)
    const cashierErc20a2 = await erc20a.balanceOf(cashier.address)
    const cashierErc20b2 = await erc20b.balanceOf(cashier.address)
    
    const proportion2 = unity.mul(new web3.utils.BN(1)).div(new web3.utils.BN(hourInSeconds))
    const refundERC20A = (new web3.utils.BN(stakeAmount)).mul(proportion2).div(unity)
    const penaltyERC20A = (new web3.utils.BN(stakeAmount)).sub(refundERC20A)
    const reductionAmount2 = await reducedPenalty.reductionAmounts(1)

    assert.equal(aliceErc20a1.add(refundERC20A).add(nftReduction.amount).toString(), aliceErc20a2.toString())
    assert.equal(cashierErc20a1.add(penaltyERC20A).sub(nftReduction.amount).toString(), cashierErc20a2.toString())

    assert.equal(aliceErc20b1.add(refundERC20A).toString(), aliceErc20b2.toString())
    assert.equal(cashierErc20b1.add(penaltyERC20A).toString(), cashierErc20b2.toString())

  })


  it("real case", async () => {})
  it("access control", async () => {})
})
