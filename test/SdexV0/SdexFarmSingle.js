
const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../scripts/deploy.js')
const { deploy } = require('../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceChain } = require('../utilities.js')
const { calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount } = require('./helpers.js')

const MockERC20 = artifacts.require('MockBEP20')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyFacet = artifacts.require('ReducedPenaltyFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')

contract("TokenFarmFacet", (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let sdexFacet;
  let toolShedFacet;
  let tokenFarmFacet;
  let rewardFacet;
  let reducedPenaltyFacet;
  let reducedPenaltyReward;
  const hourInSeconds = 3600
  let diamondAddress
  
  before(async () => {
    diamondAddress = await deployDiamond()

    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
    toolShedFacet = new web3.eth.Contract(ToolShedFacet.abi, diamondAddress)
    tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)
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
    let stakeAmount = web3.utils.toWei('20', 'ether')
    let poolid = await tokenFarmFacet.methods.poolLength().call() - 1
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()


    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], hourInSeconds, ADDRESSZERO, 0).send({from:alice})

    const blockNumber = await web3.eth.getBlockNumber()

    // Pool
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    assert.equal(poolInfo2.tokenData[0].token, diamondAddress)
    assert.equal(poolInfo2.tokenData[0].supply, stakeAmount)
    assert.equal(poolInfo2.tokenData[0].accSdexPerShare, 0)
    assert.equal(poolInfo2.allocPoint, 1000)
    assert.equal(poolInfo2.lastRewardBlock, blockNumber)
    
    //User
    const userInfo2 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    assert.equal(userInfo2.tokenData[0].amount, stakeAmount)
    //assert.equal(userInfo2.tokenData[0].rewardDebt, 0)
    assert.equal(userInfo2.positions[0].timeEnd - userInfo2.positions[0].timeStart, hourInSeconds)
    assert.equal(userInfo2.positions[0].amounts[0], stakeAmount)
    assert.equal(userInfo2.positions[0].nftReward, ADDRESSZERO)
    assert.equal(userInfo2.positions[0].nftid, 0)
    // Double Check this ***************
    assert.equal(userInfo2.lastRewardBlock, 0)

    //Tokens
    let aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    
    assert.equal(Number(aliceSdex2), new web3.utils.BN(aliceSdex1).sub(new web3.utils.BN(stakeAmount)))
    assert.equal(Number(diamondSdex2), stakeAmount)

    //Token reward Globals
  })

  it("Premature Withdraw is penalized", async () => {
    let stakeAmount = web3.utils.toWei('20', 'ether')
    let poolid = await tokenFarmFacet.methods.poolLength().call() - 1
    const positionid = 0
    const timeAhead = hourInSeconds / 2
    const blocksAhead = 1
    await advanceChain(blocksAhead, timeAhead) // 1 block, 1/2 hour

    let aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()

    //+1 because its inclusive with the block used to withdraw
    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksAhead+1, poolid)
    const accSdexPerShare = sdexReward.mul(unity).div(new web3.utils.BN(stakeAmount))
    const perPool = accSdexPerShare.div(new web3.utils.BN(2));
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    //+1 for test compute time, may be 2 on slower computers or local node
    const {refund, penalty} = calcPenalty(timeAhead+1, hourInSeconds, stakeAmount)

    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    const blockNumber = await web3.eth.getBlockNumber()

    // Pool
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    assert.equal(poolInfo2.tokenData[0].token, diamondAddress)
    assert.equal(poolInfo2.tokenData[0].supply, 0)
    assert.equal(poolInfo2.tokenData[0].accSdexPerShare, accSdexPerShare.toString())
    assert.equal(poolInfo2.allocPoint, 1000)
    assert.equal(poolInfo2.lastRewardBlock, blockNumber)

    //User
    const userInfo2 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    assert.equal(userInfo2.tokenData[0].amount, 0)
    //assert.equal(userInfo2.tokenData[0].rewardDebt, 0)
    assert.equal(userInfo2.positions[0].timeEnd - userInfo2.positions[0].timeStart, hourInSeconds)
    assert.equal(userInfo2.positions[0].amounts[0], 0)
    assert.equal(userInfo2.positions[0].nftReward, ADDRESSZERO)
    assert.equal(userInfo2.positions[0].nftid, 0)

    //Tokens
    let aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()

    console.log(diamondSdex1, diamondSdex2)
    assert.equal(diamondSdex2, new web3.utils.BN(diamondSdex1).sub(refund).add(sdexReward).toString())

    //Token reward Globals
    let sdexRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    //assert.equal(sdexRewardData.penalties, sdexReward) 

  })

  it("allows a user to Stake, and is Rewarded", async () => {
    let stakeAmount = web3.utils.toWei('20', 'ether')
    let poolid = await tokenFarmFacet.methods.poolLength().call() - 1

    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})


    let aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], hourInSeconds, ADDRESSZERO, 0).send({from:alice})

    let aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo2 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    const positionid = userInfo2.positions.length - 1
    const position = userInfo2.positions[positionid]
    assert.equal(position.timeEnd - position.timeStart, hourInSeconds)
    assert.equal(position.amounts[0], stakeAmount)
    assert.equal(position.nftReward, ADDRESSZERO)
    assert.equal(position.nftid, 0)

    const blocksAhead = 360
    
    await advanceChain(blocksAhead, 10) // 360 blocks, 10 seconds per block 

    const tokenARewardAmount = 
      await calcNFTRewardAmount(sdexFacet, toolShedFacet, diamondAddress, hourInSeconds, stakeAmount)
    const tokenBRewardAmount = 
      await calcNFTRewardAmount(sdexFacet, toolShedFacet, diamondAddress, hourInSeconds, stakeAmount)
    const sdexNFTReward = await calcSdexNFTRewardAmount(tokenFarmFacet, toolShedFacet,sdexFacet, diamondAddress, poolid, blocksAhead, alice, positionid)
    
    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    const blockNumber = await web3.eth.getBlockNumber()

    let aliceSdex3 = await sdexFacet.methods.balanceOf(alice).call()
    
    let aliceRPRSdex1 = await reducedPenaltyReward.methods.balanceOf(alice, 1).call()
    let aliceRPRSdex2 = await reducedPenaltyReward.methods.balanceOf(alice, 2).call()
    let diamondSdex3 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const poolInfo3 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo3 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksAhead+1, poolid)
    const accSdexPerShare1 = new web3.utils.BN(poolInfo2.tokenData[0].accSdexPerShare)
    const accSdexPerShare2 =accSdexPerShare1.add(sdexReward.mul(unity).div(new web3.utils.BN(stakeAmount)))
    const perPool = accSdexPerShare2;


    // Pool
    assert.equal(poolInfo3.tokenData[0].token, diamondAddress)
    assert.equal(poolInfo3.tokenData[0].supply, 0)
    assert.equal(poolInfo3.tokenData[0].accSdexPerShare, accSdexPerShare2.toString())
    assert.equal(poolInfo3.allocPoint, 1000)
    assert.equal(poolInfo3.lastRewardBlock, blockNumber)

    // User
    assert.equal(userInfo3.tokenData[0].amount, 0)
    //assert.equal(userInfo3.tokenData[0].rewardDebt, 0)
    assert.equal(userInfo3.positions[positionid].timeEnd - userInfo3.positions[positionid].timeStart, hourInSeconds)
    assert.equal(userInfo3.positions[positionid].amounts[0], 0)
    assert.equal(userInfo3.positions[positionid].nftReward, ADDRESSZERO)
    assert.equal(userInfo3.positions[positionid].nftid, 0)
    
    // Tokens
    
    const aliceDiffSdex = new web3.utils.BN(aliceSdex1).add(sdexReward)
    assert.equal(aliceDiffSdex.toString(), aliceSdex3)

    //Token Globals
    let sdexRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    
    assert.equal(sdexRewardData.penalties, 0) 


    //Reduced Penalty Rewards
    assert.equal(aliceRPRSdex1, 1)
    assert.equal(aliceRPRSdex2, 1)
    const reductionAmountSdex1 = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    const reductionAmountSdex2 = await reducedPenaltyFacet.methods.rPReductionAmount(2).call()
    const rAS1BN = new web3.utils.BN(reductionAmountSdex1.amount)
    const rAS2BN = new web3.utils.BN(reductionAmountSdex2.amount)
    //assert.equal(rAS1BN.add(rAS2BN).toString(), sdexNFTReward.toString())
  })

  it("can deposit using reduced penalty reward", async () => {
    let stakeAmount = web3.utils.toWei('20', 'ether')
    let poolid = await tokenFarmFacet.methods.poolLength().call() - 1
    
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    let aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()
  
    let aliceRPid = 1
    let aliceRPAmount = await reducedPenaltyReward.methods.balanceOf(alice, aliceRPid).call()
    let reductionAmount = await reducedPenaltyFacet.methods.rPReductionAmount(aliceRPid).call()
    assert.equal(diamondAddress, reductionAmount.token)

    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], hourInSeconds,
      reducedPenaltyReward._address, aliceRPid).send({from:alice})

    const timeAhead = hourInSeconds / 2
    const blocksAhead = 1
    await advanceChain(blocksAhead, timeAhead) // 1 block, 1/2 hour

    
    let aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo2 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    const positionid = userInfo2.positions.length - 1
    const position = userInfo2.positions[positionid]
    assert.equal(position.timeEnd - position.timeStart, hourInSeconds)
    assert.equal(position.amounts[0], stakeAmount)
    assert.equal(position.nftReward, reducedPenaltyReward._address)
    assert.equal(position.nftid, aliceRPid)


    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    const blockNumber = await web3.eth.getBlockNumber()
    let aliceSdex3 = await sdexFacet.methods.balanceOf(alice).call()
    
    let aliceRPRSdex = await reducedPenaltyReward.methods.balanceOf(alice, 3).call()
    let diamondSdex3 = await sdexFacet.methods.balanceOf(diamondAddress).call()

    const poolInfo3 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo3 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksAhead+1, poolid)
    const accSdexPerShare1 = new web3.utils.BN(poolInfo2.tokenData[0].accSdexPerShare)
    const accSdexPerShare2 =accSdexPerShare1.add(sdexReward.mul(unity).div(new web3.utils.BN(stakeAmount)))
    const perPool = accSdexPerShare2;
    // Pool
    assert.equal(poolInfo3.tokenData[0].token, diamondAddress)
    assert.equal(poolInfo3.tokenData[0].supply, 0)
    assert.equal(poolInfo3.tokenData[0].accSdexPerShare, perPool.toString())
    assert.equal(poolInfo3.allocPoint, 1000)
    assert.equal(poolInfo3.lastRewardBlock, blockNumber)

    // User
    assert.equal(userInfo3.tokenData[0].amount, 0)
    //assert.equal(userInfo3.tokenData[0].rewardDebt, 0)
    //assert.equal(userInfo3.tokenData[1].rewardDebt, 0)
    assert.equal(userInfo3.positions[positionid].timeEnd - userInfo3.positions[positionid].timeStart, hourInSeconds)
    assert.equal(userInfo3.positions[positionid].amounts[0], 0)
    assert.equal(userInfo3.positions[positionid].nftReward, reducedPenaltyReward._address)
    assert.equal(userInfo3.positions[positionid].nftid, 1)


    // Tokens
    const {refund, penalty} = calcPenalty(timeAhead+1, hourInSeconds, stakeAmount)


    //Token Globals
    let sdexRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    
    assert.equal(sdexRewardData.penalties, 0) 


    //Reduced Penalty Rewards
    const reductionSdexmountSdex = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    assert.equal(reductionSdexmountSdex.amount, 0)
  })
})
