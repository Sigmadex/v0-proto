const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../../scripts/deploy.js')
const { deploy } = require('../../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceBlocks } = require('../../utilities.js')
const { BN, fetchState, calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount } = require('../helpers.js')

const MockERC20 = artifacts.require('MockERC20')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyRewardFacet = artifacts.require('ReducedPenaltyRewardFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')

contract("TokenFarmFacet", (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let users = [alice, bob]
  let sdexFacet;
  let toolShedFacet;
  let tokenFarmFacet;
  let sdexVaultFacet;
  let rewardFacet;
  let reducedPenaltyRewardFacet;
  let reducedPenaltyReward;
  let rPRAddress;
  let tokenA;
  let tokenB;
  let tokens;
  const blocksToStake = 10
  let diamondAddress
  let stakeAmount = web3.utils.toWei('20', 'ether')
  let poolid;

  before(async () => {
    diamondAddress = await deployDiamond()

    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
    toolShedFacet = new web3.eth.Contract(ToolShedFacet.abi, diamondAddress)
    tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)
    sdexVaultFacet = new web3.eth.Contract(SdexVaultFacet.abi, diamondAddress)
    rewardFacet = new web3.eth.Contract(RewardFacet.abi, diamondAddress)
    reducedPenaltyRewardFacet = new web3.eth.Contract(ReducedPenaltyRewardFacet.abi, diamondAddress)

    rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()
    reducedPenaltyReward = new web3.eth.Contract(ReducedPenaltyReward.abi, rPRAddress)


    let erc20TotalSupply = web3.utils.toWei('1000000', 'ether')
    tokenA = await deploy(owner, MockERC20, ['ERC20A', 'ERC20A', erc20TotalSupply])
    tokenB = await deploy(owner, MockERC20, ['ERC20B', 'ERC20B', erc20TotalSupply])
    tokens = [tokenA, tokenB]
    const amount = web3.utils.toWei('2000', 'ether')
    await tokenA.methods.transfer(alice, amount).send({ from: owner });
    await tokenB.methods.transfer(alice, amount).send({ from: owner });
    await tokenA.methods.transfer(bob, amount).send({ from: owner });
    await tokenB.methods.transfer(bob, amount).send({ from: owner });
  })
  it("adds reduced penalty reward to tokensA, B, and sdex", async () => {
    await rewardFacet.methods.addReward(tokenA._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenB._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(diamondAddress, rPRAddress).send({from:owner})
    const validRewardsA = await rewardFacet.methods.getValidRewardsForToken(tokenA._address).call()
    const validRewardsB = await rewardFacet.methods.getValidRewardsForToken(tokenB._address).call()
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
    assert.equal(validRewardsA[0], rPRAddress)
    assert.equal(validRewardsB[0], rPRAddress)
    assert.equal(validRewardsSdex[0], rPRAddress)
  })
  it("adds pool", async () => {
    let poolLength1 = await tokenFarmFacet.methods.poolLength().call()
    assert.equal(poolLength1, 1)
    let totalAllocPoints1 = await toolShedFacet.methods.totalAllocPoint().call()
    assert.equal(totalAllocPoints1, 1000)

    let newPoolAllocPoints = '2000'
    await tokenFarmFacet.methods.add(
      [tokenA._address, tokenB._address],
      newPoolAllocPoints,
      [rPRAddress],
      true
    ).send(
      {from:owner}
    )
    let poolLength2 = await tokenFarmFacet.methods.poolLength().call()
    assert.equal(poolLength2, 2)
    let totalAllocPoints2 = await toolShedFacet.methods.totalAllocPoint().call()
    assert.equal(totalAllocPoints2, 1000 + Number(newPoolAllocPoints))

    const blockNumber = await web3.eth.getBlockNumber()
    const poolInfo = await tokenFarmFacet.methods.poolInfo(poolLength2-1).call()
    assert.equal(poolInfo.tokenData[0].token, tokenA._address)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    assert.equal(poolInfo.tokenData[0].accSdexPerShare, 0)
    assert.equal(poolInfo.tokenData[1].token, tokenB._address)
    assert.equal(poolInfo.tokenData[1].supply, 0)
    assert.equal(poolInfo.tokenData[1].accSdexPerShare, 0)
    assert.equal(poolInfo.allocPoint, 2000)
    assert.equal(poolInfo.lastRewardBlock, blockNumber)
    try {
      await tokenFarmFacet.methods.add(
        [tokenA._address, tokenB._address],
        newPoolAllocPoints,
        [rPRAddress],
        true
      ).send(
        {from:alice}
      )
      assert.fail('add pool should only be owner')
    } catch (e) {
      assert.include(e.message, 'LibDiamond: Must be contract owner')
    }
  })
  /*
  it("updates a pool", async () => {
    let poolid = await tokenFarmFacet.methods.poolLength().call() - 1
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    await toolShedFacet.methods.updatePool(poolid).send({from:owner})
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const blockNumber = await web3.eth.getBlockNumber()
    assert.equal(poolInfo2.tokenData[0].token, tokenA._address)
    assert.equal(poolInfo2.tokenData[0].supply, 0)
    assert.equal(poolInfo2.tokenData[0].accSdexPerShare, 0)
    assert.equal(poolInfo2.tokenData[1].token, tokenB._address)
    assert.equal(poolInfo2.tokenData[1].supply, 0)
    assert.equal(poolInfo2.tokenData[1].accSdexPerShare, 0)
    assert.equal(poolInfo2.allocPoint, 2000)
    assert.equal(poolInfo2.lastRewardBlock, blockNumber)
  })
  */
  it("allows a user to stake", async () => {
    let allocPoints = '2000'
    poolid = await tokenFarmFacet.methods.poolLength().call() - 1

    await tokenA.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    await tokenB.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)


    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount, stakeAmount], blocksToStake, ADDRESSZERO, 0).send({from:alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)

    // Pool
    assert.equal(state2.pool.tokenData[0].token, tokenA._address)
    assert.equal(state2.pool.tokenData[0].supply, stakeAmount)
    assert.equal(state2.pool.tokenData[0].accSdexPerShare, 0)
    assert.equal(state2.pool.tokenData[1].token, tokenB._address)
    assert.equal(state2.pool.tokenData[1].supply, stakeAmount)
    assert.equal(state2.pool.tokenData[1].accSdexPerShare, 0)
    assert.equal(state2.pool.allocPoint, 2000)
    assert.equal(state2.pool.lastRewardBlock, state2.blockNumber)

    //User
    assert.equal(state2[alice].userInfo.tokenData[0].amount, stakeAmount)
    assert.equal(state2[alice].userInfo.tokenData[1].amount, stakeAmount)
    assert.equal(state2[alice].userInfo.tokenData[0].totalRewardDebt, 0)
    assert.equal(state2[alice].userInfo.tokenData[1].totalRewardDebt, 0)
    assert.equal(state2[alice].userInfo.positions[0].endBlock - state2[alice].userInfo.positions[0].startBlock, blocksToStake)
    assert.equal(state2[alice].userInfo.positions[0].amounts[0], stakeAmount)
    assert.equal(state2[alice].userInfo.positions[0].amounts[1], stakeAmount)
    assert.equal(state2[alice].userInfo.positions[0].nftReward, ADDRESSZERO)
    assert.equal(state2[alice].userInfo.positions[0].nftid, 0)
    assert.equal(state2[alice].userInfo.lastRewardBlock, 0)

    //Tokens
    assert.equal(BN(state2[alice][tokenA._address]).toString(), BN(state1[alice][tokenA._address]).sub(BN(stakeAmount)).toString())
    assert.equal(BN(state2[alice][tokenB._address]).toString(), BN(state1[alice][tokenB._address]).sub(BN(stakeAmount)).toString())
    assert.equal(state2[alice].sdex, 0)
    assert.equal(BN(state2[diamondAddress][tokenA._address]).toString(), BN(state1[diamondAddress][tokenA._address]).add(BN(stakeAmount)).toString())
    assert.equal(BN(state2[diamondAddress][tokenB._address]).toString(), BN(state1[diamondAddress][tokenB._address]).add(BN(stakeAmount)).toString())
    assert.equal(state2[diamondAddress].sdex, 0)

    //Token reward Globals
    assert.equal(state2.rewardGlobals[tokenA._address].blockAmountGlobal, BN(stakeAmount).mul(BN(blocksToStake)).toString())
    assert.equal(state2.rewardGlobals[tokenA._address].rewarded, 0)
    assert.equal(state2.rewardGlobals[tokenA._address].penalties, 0)
    assert.equal(state2.rewardGlobals[tokenB._address].blockAmountGlobal, BN(stakeAmount).mul(BN(blocksToStake)).toString())
    assert.equal(state2.rewardGlobals[tokenB._address].rewarded, 0)
    assert.equal(state2.rewardGlobals[tokenB._address].penalties, 0)
  })
  it("Premature Withdraw is penalized", async () => {
    const positionid = 0
    const blocksAhead = blocksToStake / 2
    await advanceBlocks(blocksAhead) // half of the staked Time

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)

    //+1 because its inclusive with the block used to withdraw
    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksAhead+1, poolid)
    const accSdexPerShare = sdexReward.mul(unity).div(new web3.utils.BN(stakeAmount))
    const perPool = accSdexPerShare.div(new web3.utils.BN(2));
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    //+1 for test compute time, may be 2 on slower computers or local node
    const {refund, penalty} = calcPenalty(blocksAhead+1, blocksToStake, stakeAmount)

    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)

    // Pool
    assert.equal(state2.pool.tokenData[0].token, tokenA._address)
    assert.equal(state2.pool.tokenData[0].supply, 0)
    assert.equal(state2.pool.tokenData[0].accSdexPerShare, perPool.toString())
    assert.equal(state2.pool.tokenData[1].token, tokenB._address)
    assert.equal(state2.pool.tokenData[1].supply, 0)
    assert.equal(state2.pool.tokenData[1].accSdexPerShare, perPool.toString())
    assert.equal(state2.pool.allocPoint, 2000)
    assert.equal(state2.pool.lastRewardBlock, state2.blockNumber)

    //User

    assert.equal(state2[alice].userInfo.tokenData[0].amount, 0)
    assert.equal(state2[alice].userInfo.tokenData[1].amount, 0)
    assert.equal(state2[alice].userInfo.tokenData[0].totalRewardDebt, 0)
    assert.equal(state2[alice].userInfo.tokenData[1].totalRewardDebt, 0)
    assert.equal(state2[alice].userInfo.positions[0].endBlock - state2[alice].userInfo.positions[0].startBlock, blocksToStake)
    assert.equal(state2[alice].userInfo.positions[0].amounts[0], 0)
    assert.equal(state2[alice].userInfo.positions[0].amounts[1], 0)
    assert.equal(state2[alice].userInfo.positions[0].nftReward, ADDRESSZERO)
    assert.equal(state2[alice].userInfo.positions[0].nftid, 0)

    //Tokens
    const aliceDiffA = BN(state2[alice][tokenA._address]).sub(BN(state1[alice][tokenA._address]))
    const aliceDiffB = BN(state2[alice][tokenB._address]).sub(BN(state1[alice][tokenB._address]))

    assert.equal(aliceDiffA.toString(), refund.toString())
    assert.equal(aliceDiffB.toString(), refund.toString())

    //const diamondDiffA = BN(state1[diamondToken][tokenA._address]).sub(BN(state2[diamondToken][tokenA._address]))
    //const diamondDiffB = BN(state1[diamondToken][tokenB._address]).sub(BN(state2[diamondToken][tokenB._address]))
    assert.equal(BN(state1[diamondAddress][tokenA._address]).sub(refund).toString(), BN(state2[diamondAddress][tokenA._address]).toString())
    assert.equal(BN(state1[diamondAddress][tokenB._address]).sub(refund).toString(), BN(state2[diamondAddress][tokenB._address]).toString())
    assert.equal(state2[diamondAddress].sdex, sdexReward)

    //Token reward Globals
    let tokenARewardData = await toolShedFacet.methods.tokenRewardData(tokenA._address).call()
    let tokenBRewardData = await toolShedFacet.methods.tokenRewardData(tokenB._address).call()
    let sdexRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    let accSdexPenaltyPool = await toolShedFacet.methods.accSdexPenaltyPool().call()
    assert.equal(state2.rewardGlobals[tokenA._address].blockAmountGlobal, 0)
    assert.equal(state2.rewardGlobals[tokenB._address].blockAmountGlobal, 0)
    assert.equal(state2.rewardGlobals[tokenA._address].rewarded, 0)
    assert.equal(state2.rewardGlobals[tokenB._address].rewarded, 0)
    assert.equal(state2.rewardGlobals[tokenA._address].penalties, penalty)
    assert.equal(state2.rewardGlobals[tokenB._address].penalties, penalty)
    assert.equal(state2.rewardGlobals[diamondAddress].blockAmountGlobal, 0)
    assert.equal(state2.rewardGlobals[diamondAddress].rewarded, 0)
    assert.equal(state2.rewardGlobals[diamondAddress].penalties, 0)
    assert.equal(state2.accSdexPenaltyPool, sdexReward.toString())
    assert.equal(state2.accSdexRewardPool, 0)
  })

  it("allows a user to Stake, and is Rewarded", async () => {
    await tokenA.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    await tokenB.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount, stakeAmount], blocksToStake, ADDRESSZERO, 0).send({from:alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)

    const positionid = state2[alice].userInfo.positions.length - 1
    const position = state2[alice].userInfo.positions[positionid]
    assert.equal(position.endBlock - position.startBlock, blocksToStake)
    assert.equal(position.amounts[0], stakeAmount)
    assert.equal(position.amounts[1], stakeAmount)
    assert.equal(position.nftReward, ADDRESSZERO)
    assert.equal(position.nftid, 0)


    await advanceBlocks(blocksToStake + 1)

    const tokenARewardAmount = 
      await calcNFTRewardAmount(tokenA, toolShedFacet, diamondAddress, blocksToStake, stakeAmount)
    const tokenBRewardAmount = 
      await calcNFTRewardAmount(tokenB, toolShedFacet, diamondAddress, blocksToStake, stakeAmount)

    const sdexNFTReward = await calcSdexNFTRewardAmount(tokenFarmFacet, toolShedFacet,sdexFacet, diamondAddress, poolid, blocksToStake +2, alice, positionid)

    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)

    let aliceRPRA = await reducedPenaltyReward.methods.balanceOf(alice, 1).call()
    let aliceRPRB = await reducedPenaltyReward.methods.balanceOf(alice, 2).call()
    let aliceRPRSdex = await reducedPenaltyReward.methods.balanceOf(alice, 3).call()

    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksToStake+1+1, poolid)
    const accSdexPerShare1 = BN(state2.pool.tokenData[0].accSdexPerShare)
    const accSdexPerShare2 =accSdexPerShare1.add(sdexReward.mul(unity).div(BN(stakeAmount).mul(BN(2))))
    const perPool = accSdexPerShare2;


    // Pool
    assert.equal(state3.pool.tokenData[0].token, tokenA._address)
    assert.equal(state3.pool.tokenData[0].supply, 0)
    assert.equal(state3.pool.tokenData[0].accSdexPerShare, perPool.toString())
    assert.equal(state3.pool.tokenData[1].token, tokenB._address)
    assert.equal(state3.pool.tokenData[1].supply, 0)
    assert.equal(state3.pool.tokenData[1].accSdexPerShare, perPool.toString())
    assert.equal(state3.pool.allocPoint, 2000)
    assert.equal(state3.pool.lastRewardBlock, state3.blockNumber)

    // User
    assert.equal(state3[alice].userInfo.tokenData[0].amount, 0)
    assert.equal(state3[alice].userInfo.tokenData[1].amount, 0)
    //assert.equal(state3[alice].userInfo.tokenData[0].totalRewardDebt, 0)
    //assert.equal(state3[alice].userInfo.tokenData[1].totalRewardDebt, 0)
    assert.equal(state3[alice].userInfo.positions[positionid].endBlock - state3[alice].userInfo.positions[positionid].startBlock, blocksToStake)
    assert.equal(state3[alice].userInfo.positions[positionid].amounts[0], 0)
    assert.equal(state3[alice].userInfo.positions[positionid].amounts[1], 0)
    assert.equal(state3[alice].userInfo.positions[positionid].nftReward, ADDRESSZERO)
    assert.equal(state3[alice].userInfo.positions[positionid].nftid, 0)

    // Tokens

    const aliceDiffA = BN(state2[alice][tokenA._address]).add(BN(stakeAmount))
    const aliceDiffB = BN(state2[alice][tokenB._address]).add(BN(stakeAmount))
    const aliceDiffSdex = BN(state1[alice].sdex).add(sdexReward)
    const diamondDiffA = BN(state2[diamondAddress][tokenA._address]).sub(BN(stakeAmount))
    const diamondDiffB = BN(state2[diamondAddress][tokenB._address]).sub(BN(stakeAmount))
    assert.equal(aliceDiffA.toString(), state3[alice][tokenA._address])
    assert.equal(aliceDiffB.toString(), state3[alice][tokenB._address])
    assert.equal(aliceDiffSdex.toString(), state3[alice].sdex)
    assert.equal(diamondDiffA.toString(), state3[diamondAddress][tokenA._address])
    assert.equal(diamondDiffB.toString(), state3[diamondAddress][tokenB._address])
    assert.equal(state2[diamondAddress].sdex, state3[diamondAddress].sdex)

    //Token Globals
    assert.equal(state3.rewardGlobals[tokenA._address].blockAmountGlobal, 0)
    assert.equal(state3.rewardGlobals[tokenB._address].blockAmountGlobal, 0)
    assert.equal(state3.rewardGlobals[tokenA._address].rewarded, tokenARewardAmount.toString())
    assert.equal(state3.rewardGlobals[tokenB._address].rewarded, tokenBRewardAmount.toString())
    assert.equal(state3.rewardGlobals[tokenA._address].penalties, 0)
    assert.equal(state3.rewardGlobals[tokenB._address].penalties, 0)

    assert.equal(state3.rewardGlobals[diamondAddress].penalties, 0) 
    assert.equal(state3.rewardGlobals[diamondAddress].rewarded, 0) 
    assert.equal(state3.rewardGlobals[diamondAddress].blockAmountGlobal, 0) 

    assert.equal(state3.accSdexPenaltyPool, 0)
    console.log('rewardpoolamount', state3.accSdexRewardPool)
    assert.equal(state3.accSdexRewardPool, sdexNFTReward.toString())

    //Reduced Penalty Rewards
    assert.equal(aliceRPRA, 1)
    assert.equal(aliceRPRB, 1)
    assert.equal(aliceRPRSdex, 1)
    const reductionAmountA = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(1).call()
    const reductionAmountB = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(2).call()
    const reductionAmountSdex = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(3).call()
    assert.equal(reductionAmountA.amount, tokenARewardAmount.toString())
    assert.equal(reductionAmountB.amount, tokenBRewardAmount.toString())
    assert.equal(reductionAmountSdex.amount, sdexNFTReward.toString())

    /*
    */
    //Diamond sdex accounting
    //
  })

  it("can deposit using reduced penalty reward", async () => {
    let aliceRPid = 1
    let aliceRPAmount = await reducedPenaltyReward.methods.balanceOf(alice, aliceRPid).call()
    let reductionAmount = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(aliceRPid).call()
    assert.equal(tokenA._address, reductionAmount.token)

    await tokenA.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    await tokenB.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount, stakeAmount], blocksToStake,
      reducedPenaltyReward._address, aliceRPid).send({from:alice})

    const blocksAhead = blocksToStake / 2
    await advanceBlocks(blocksAhead) 

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)

    const positionid = state2[alice].userInfo.positions.length - 1
    const position = state2[alice].userInfo.positions[positionid]
    assert.equal(position.endBlock - position.startBlock, blocksToStake)
    assert.equal(position.amounts[0], stakeAmount)
    assert.equal(position.amounts[1], stakeAmount)
    assert.equal(position.nftReward, reducedPenaltyReward._address)
    assert.equal(position.nftid, aliceRPid)


    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)
    let aliceRPRA = await reducedPenaltyReward.methods.balanceOf(alice, 1).call()
    let aliceRPRB = await reducedPenaltyReward.methods.balanceOf(alice, 2).call()
    let aliceRPRSdex = await reducedPenaltyReward.methods.balanceOf(alice, 3).call()


    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksAhead+1, poolid)
    const accSdexPerShare1 = new web3.utils.BN(state2.pool.tokenData[0].accSdexPerShare)
    const accSdexPerShare2 =accSdexPerShare1.add(sdexReward.mul(unity).div(new web3.utils.BN(stakeAmount).mul(new web3.utils.BN(2))))
    const perPool = accSdexPerShare2;
  // Pool
    assert.equal(state3.pool.tokenData[0].token, tokenA._address)
    assert.equal(state3.pool.tokenData[0].supply, 0)
    assert.equal(state3.pool.tokenData[0].accSdexPerShare, perPool.toString())
    assert.equal(state3.pool.tokenData[1].token, tokenB._address)
    assert.equal(state3.pool.tokenData[1].supply, 0)
    assert.equal(state3.pool.tokenData[1].accSdexPerShare, perPool.toString())
    assert.equal(state3.pool.allocPoint, 2000)
    assert.equal(state3.pool.lastRewardBlock, state3.blockNumber)

  // User
    assert.equal(state3[alice].userInfo.tokenData[0].amount, 0)
    assert.equal(state3[alice].userInfo.tokenData[1].amount, 0)
  //assert.equal(state3[alice].userInfo.tokenData[0].totalRewardDebt, 0)
  //assert.equal(state3[alice].userInfo.tokenData[1].totalRewardDebt, 0)
    assert.equal(state3[alice].userInfo.positions[positionid].endBlock - state3[alice].userInfo.positions[positionid].startBlock, blocksToStake)
    assert.equal(state3[alice].userInfo.positions[positionid].amounts[0], 0)
    assert.equal(state3[alice].userInfo.positions[positionid].amounts[1], 0)
    assert.equal(state3[alice].userInfo.positions[positionid].nftReward, reducedPenaltyReward._address)
    assert.equal(state3[alice].userInfo.positions[positionid].nftid, 1)


  // Tokens
    const {refund, penalty} = calcPenalty(blocksAhead+1, blocksToStake, stakeAmount)
    const aliceTokenA2 = state2[alice][tokenA._address]
    const aliceTokenA3 = state3[alice][tokenA._address]
    const aliceTokenB2 = state2[alice][tokenB._address]
    const aliceTokenB3 = state3[alice][tokenB._address]
    const aliceSdex2 = state2[alice].sdex
    const aliceSdex3 = state3[alice].sdex
    const diamondTokenA2 = state2[diamondAddress][tokenA._address]
    const diamondTokenB2 = state2[diamondAddress][tokenB._address]
    const diamondTokenA3 = state3[diamondAddress][tokenA._address]
    const diamondTokenB3 = state3[diamondAddress][tokenB._address]
    const diamondSdex2 = state2[diamondAddress].sdex
    const diamondSdex3 = state3[diamondAddress].sdex
    
    const aliceDiffA = BN(aliceTokenA2).add(BN(reductionAmount.amount)).add(refund)
    const aliceDiffB = BN(aliceTokenB2).add(refund)
    const diamondDiffA = BN(diamondTokenA2).sub(refund).sub(BN(reductionAmount.amount))
    const diamondDiffB = BN(diamondTokenB2).sub(refund)
    assert.equal(aliceDiffA.toString(), aliceTokenA3)
    assert.equal(aliceDiffB.toString(), aliceTokenB3)
    assert.equal(aliceSdex2, aliceSdex3)
    assert.equal(diamondDiffA.toString(), diamondTokenA3)
    assert.equal(diamondDiffB.toString(), diamondTokenB3)
    assert.equal(BN(diamondSdex2).add(sdexReward).toString(), diamondSdex3)

  //Token Globals
    let tokenARewardData = state3.rewardGlobals[tokenA._address]
    let tokenBRewardData = state3.rewardGlobals[tokenB._address]
    let sdexRewardData = state3.rewardGlobals[diamondAddress]
    
    assert.equal(tokenARewardData.blockAmountGlobal, 0)
    assert.equal(tokenARewardData.penalties, penalty.sub(BN(reductionAmount.amount)))
    
    assert.equal(tokenBRewardData.blockAmountGlobal, 0)
    assert.equal(tokenBRewardData.penalties, penalty)

    assert.equal(sdexRewardData.penalties, 0)
    assert.equal(sdexRewardData.rewarded, 0)
    assert.equal(sdexRewardData.blockAmountGlobal, 0)

    assert.equal(state3.accSdexPenaltyPool, sdexReward.toString())
    assert.equal(state2.accSdexRewardPool, state3.accSdexRewardPool)

  //Reduced Penalty Rewards
    assert.equal(aliceRPRA, 1)
    const reductionAmountA = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(1).call()
    assert.equal(reductionAmountA.amount, 0)



  })
})
