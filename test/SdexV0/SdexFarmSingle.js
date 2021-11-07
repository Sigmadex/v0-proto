
const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../scripts/deploy.js')
const { deploy } = require('../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceBlocks } = require('../utilities.js')
const { BN, fetchState,  calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount } = require('./helpers.js')

const MockERC20 = artifacts.require('MockERC20')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyFacet = artifacts.require('ReducedPenaltyFacet')

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
  let reducedPenaltyFacet;
  let reducedPenaltyReward;
  const blocksToStake = 10
  let diamondAddress
  let stakeAmount = web3.utils.toWei('20', 'ether')
  let poolid
  
  before(async () => {
    diamondAddress = await deployDiamond()

    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
    toolShedFacet = new web3.eth.Contract(ToolShedFacet.abi, diamondAddress)
    tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)
    sdexVaultFacet = new web3.eth.Contract(SdexVaultFacet.abi, diamondAddress)
    rewardFacet = new web3.eth.Contract(RewardFacet.abi, diamondAddress)
    reducedPenaltyFacet = new web3.eth.Contract(ReducedPenaltyFacet.abi, diamondAddress)

    const rPRAddress = await reducedPenaltyFacet.methods.rPAddress().call()
    reducedPenaltyReward = new web3.eth.Contract(ReducedPenaltyReward.abi, rPRAddress)
    
    const amount = web3.utils.toWei('1000', 'ether')

    await sdexFacet.methods.executiveMint(alice, amount).send({ from: owner })
    await sdexFacet.methods.executiveMint(bob, amount).send({ from: owner })

  })
  it("adds reduced penalty reward to tokensA, B, and sdex", async () => {
    const rPRAddress = await reducedPenaltyFacet.methods.rPAddress().call()
    await rewardFacet.methods.addReward(diamondAddress, rPRAddress).send({from:owner})
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
    assert.equal(validRewardsSdex[0], rPRAddress)
  })

  it("allows a user to stake", async () => {
    poolid = await tokenFarmFacet.methods.poolLength().call() - 1
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], blocksToStake, ADDRESSZERO, poolid).send({from:alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    // Pool
    assert.equal(state2.pool.tokenData[0].token, diamondAddress)
    assert.equal(state2.pool.tokenData[0].supply, stakeAmount)
    assert.equal(state2.pool.tokenData[0].accSdexPerShare, 0)
    assert.equal(state2.pool.allocPoint, 1000)
    assert.equal(state2.pool.lastRewardBlock, state2.blockNumber)
    
    //User

    assert.equal(state2[alice].userInfo.tokenData[0].amount, stakeAmount)
    //assert.equal(state2[alice].userInfo.tokenData[0].rewardDebt, 0)
    assert.equal(state2[alice].userInfo.positions[0].endBlock - state2[alice].userInfo.positions[0].startBlock, blocksToStake)
    assert.equal(state2[alice].userInfo.positions[0].amounts[0], stakeAmount)
    assert.equal(state2[alice].userInfo.positions[0].nftReward, ADDRESSZERO)
    assert.equal(state2[alice].userInfo.positions[0].nftid, 0)
    // Double Check this ***************
    assert.equal(state2[alice].userInfo.lastRewardBlock, 0)

    //Tokens
    
    assert.equal(Number(state2[alice].sdex), BN(state1[alice].sdex).sub(BN(stakeAmount)))
    assert.equal(Number(state2[diamondAddress].sdex), stakeAmount)

    //Token reward Globals
  })

  it("Premature Withdraw is penalized", async () => {
    const positionid = 0
    const blocksAhead = blocksToStake / 2
    await advanceBlocks(blocksAhead) // 1 block, 1/2 hour


    //+1 because its inclusive with the block used to withdraw
    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksAhead+1, poolid)
    const accSdexPerShare = sdexReward.mul(unity).div(BN(stakeAmount))
    const perPool = accSdexPerShare.div(BN(2));
    //+1 for test compute time, may be 2 on slower computers or local node
    const {refund, penalty} = calcPenalty(blocksAhead+1, blocksToStake, stakeAmount)

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    // Pool
    assert.equal(state2.pool.tokenData[0].token, diamondAddress)
    assert.equal(state2.pool.tokenData[0].supply, 0)
    assert.equal(state2.pool.tokenData[0].accSdexPerShare, accSdexPerShare.toString())
    assert.equal(state2.pool.allocPoint, 1000)
    assert.equal(state2.pool.lastRewardBlock, state2.blockNumber)

    //User
    assert.equal(state2[alice].userInfo.tokenData[0].amount, 0)
    //assert.equal(state2[alice].userInfo.tokenData[0].rewardDebt, 0)
    assert.equal(state2[alice].userInfo.positions[0].endBlock - state2[alice].userInfo.positions[0].startBlock, blocksToStake)
    assert.equal(state2[alice].userInfo.positions[0].amounts[0], 0)
    assert.equal(state2[alice].userInfo.positions[0].nftReward, ADDRESSZERO)
    assert.equal(state2[alice].userInfo.positions[0].nftid, 0)

    //Tokens

    console.log(state1[diamondAddress].sdex, state2[diamondAddress].sdex)
    assert.equal(state2[diamondAddress].sdex, BN(state1[diamondAddress].sdex).sub(refund).add(sdexReward).toString())

    //Token reward Globals
    let sdexRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    //assert.equal(sdexRewardData.penalties, sdexReward) 

  })

  it("allows a user to Stake, and is Rewarded", async () => {

    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], blocksToStake, ADDRESSZERO, 0).send({from:alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    const positionid = state2[alice].userInfo.positions.length - 1
    const position = state2[alice].userInfo.positions[positionid]
    assert.equal(position.endBlock - position.startBlock, blocksToStake)
    assert.equal(position.amounts[0], stakeAmount)
    assert.equal(position.nftReward, ADDRESSZERO)
    assert.equal(position.nftid, 0)

    const blocksAhead = 11
    
    await advanceBlocks(blocksAhead) // 360 blocks, 10 seconds per block 

    const tokenARewardAmount = 
      await calcNFTRewardAmount(sdexFacet, toolShedFacet, diamondAddress, blocksToStake, stakeAmount)
    const tokenBRewardAmount = 
      await calcNFTRewardAmount(sdexFacet, toolShedFacet, diamondAddress, blocksToStake, stakeAmount)
    const sdexNFTReward = await calcSdexNFTRewardAmount(tokenFarmFacet, toolShedFacet,sdexFacet, diamondAddress, poolid, blocksAhead, alice, positionid)
    
    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksAhead+1, poolid)
    const accSdexPerShare1 = BN(state2.pool.tokenData[0].accSdexPerShare)
    const accSdexPerShare2 =accSdexPerShare1.add(sdexReward.mul(unity).div(BN(stakeAmount)))
    const perPool = accSdexPerShare2;


    // Pool
    assert.equal(state3.pool.tokenData[0].token, diamondAddress)
    assert.equal(state3.pool.tokenData[0].supply, 0)
    assert.equal(state3.pool.tokenData[0].accSdexPerShare, accSdexPerShare2.toString())
    assert.equal(state3.pool.allocPoint, 1000)
    assert.equal(state3.pool.lastRewardBlock, state3.blockNumber)

    // User
    assert.equal(state3[alice].userInfo.tokenData[0].amount, 0)
    //assert.equal(state3[alice].userInfo.tokenData[0].rewardDebt, 0)
    assert.equal(state3[alice].userInfo.positions[positionid].endBlock - state3[alice].userInfo.positions[positionid].startBlock, blocksToStake)
    assert.equal(state3[alice].userInfo.positions[positionid].amounts[0], 0)
    assert.equal(state3[alice].userInfo.positions[positionid].nftReward, ADDRESSZERO)
    assert.equal(state3[alice].userInfo.positions[positionid].nftid, 0)
    
    // Tokens
    
    const aliceDiffSdex = BN(state1[alice].sdex).add(sdexReward)
    assert.equal(aliceDiffSdex.toString(), state3[alice].sdex)

    //Token Globals
    let sdexRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    
    assert.equal(sdexRewardData.penalties, 0) 

    const aliceRPRSdex1 = await reducedPenaltyReward.methods.balanceOf(alice, 1).call()
    const aliceRPRSdex2 = await reducedPenaltyReward.methods.balanceOf(alice, 2).call()
    //Reduced Penalty Rewards
    assert.equal(aliceRPRSdex1, 1)
    assert.equal(aliceRPRSdex2, 1)
    const reductionAmountSdex1 = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    const reductionAmountSdex2 = await reducedPenaltyFacet.methods.rPReductionAmount(2).call()
    const rAS1BN = BN(reductionAmountSdex1.amount)
    const rAS2BN = BN(reductionAmountSdex2.amount)
    //assert.equal(rAS1BN.add(rAS2BN).toString(), sdexNFTReward.toString())
  })

  it("can deposit using reduced penalty reward", async () => {
    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let aliceRPid = 1
    let aliceRPAmount = await reducedPenaltyReward.methods.balanceOf(alice, aliceRPid).call()
    let reductionAmount = await reducedPenaltyFacet.methods.rPReductionAmount(aliceRPid).call()
    assert.equal(diamondAddress, reductionAmount.token)

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], blocksToStake,
      reducedPenaltyReward._address, aliceRPid).send({from:alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    const blocksAhead = blocksToStake / 2
    await advanceBlocks(blocksAhead) // 1 block, 1/2 hour

    
    const positionid = state2[alice].userInfo.positions.length - 1
    const position = state2[alice].userInfo.positions[positionid]
    assert.equal(position.endBlock - position.startBlock, blocksToStake)
    assert.equal(position.amounts[0], stakeAmount)
    assert.equal(position.nftReward, reducedPenaltyReward._address)
    assert.equal(position.nftid, aliceRPid)


    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    
    let aliceRPRSdex = await reducedPenaltyReward.methods.balanceOf(alice, 3).call()

    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksAhead+1, poolid)
    const accSdexPerShare1 = BN(state2.pool.tokenData[0].accSdexPerShare)
    const accSdexPerShare2 =accSdexPerShare1.add(sdexReward.mul(unity).div(BN(stakeAmount)))
    const perPool = accSdexPerShare2;
    // Pool
    assert.equal(state3.pool.tokenData[0].token, diamondAddress)
    assert.equal(state3.pool.tokenData[0].supply, 0)
    assert.equal(state3.pool.tokenData[0].accSdexPerShare, perPool.toString())
    assert.equal(state3.pool.allocPoint, 1000)
    assert.equal(state3.pool.lastRewardBlock, state3.blockNumber)

    // User
    assert.equal(state3[alice].userInfo.tokenData[0].amount, 0)
    //assert.equal(state3[alice].userInfo.tokenData[0].rewardDebt, 0)
    //assert.equal(state3[alice].userInfo.tokenData[1].rewardDebt, 0)
    assert.equal(state3[alice].userInfo.positions[positionid].endBlock - state3[alice].userInfo.positions[positionid].startBlock, blocksToStake)
    assert.equal(state3[alice].userInfo.positions[positionid].amounts[0], 0)
    assert.equal(state3[alice].userInfo.positions[positionid].nftReward, reducedPenaltyReward._address)
    assert.equal(state3[alice].userInfo.positions[positionid].nftid, 1)


    // Tokens
    const {refund, penalty} = calcPenalty(blocksAhead+1, blocksToStake, stakeAmount)


    //Token Globals
    let sdexRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    
    assert.equal(sdexRewardData.penalties, 0) 


    //Reduced Penalty Rewards
    const reductionSdexmountSdex = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    assert.equal(reductionSdexmountSdex.amount, 0)
  })
})
