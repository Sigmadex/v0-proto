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
  let tokenA;
  let tokenB;
  const hourInSeconds = 3600
  let diamondAddress
  
  before(async () => {
    diamondAddress = await deployDiamond()

    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
    toolShedFacet = new web3.eth.Contract(ToolShedFacet.abi, diamondAddress)
    tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)
    rewardFacet = new web3.eth.Contract(RewardFacet.abi, diamondAddress)
    reducedPenaltyFacet = new web3.eth.Contract(ReducedPenaltyFacet.abi, diamondAddress)

    const rPRAddress = await reducedPenaltyFacet.methods.rPRAddress().call()
    reducedPenaltyReward = new web3.eth.Contract(ReducedPenaltyReward.abi, rPRAddress)
    

    let erc20TotalSupply = web3.utils.toWei('1000000', 'ether')
    tokenA = await deploy(owner, MockERC20, ['ERC20A', 'ERC20A', erc20TotalSupply])
    tokenB = await deploy(owner, MockERC20, ['ERC20B', 'ERC20B', erc20TotalSupply])
    const amount = web3.utils.toWei('2000', 'ether')
    await tokenA.methods.transfer(alice, amount).send({ from: owner });
    await tokenB.methods.transfer(alice, amount).send({ from: owner });
    await tokenA.methods.transfer(bob, amount).send({ from: owner });
    await tokenB.methods.transfer(bob, amount).send({ from: owner });
  })
  it("adds reduced penalty reward to tokensA, B, and sdex", async () => {
    const rPRAddress = await reducedPenaltyFacet.methods.rPRAddress().call()
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
    let stakeAmount = web3.utils.toWei('20', 'ether')
    let poolid = await tokenFarmFacet.methods.poolLength().call() - 1
    await tokenA.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    await tokenB.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let aliceTokenA1 = await tokenA.methods.balanceOf(alice).call()
    let aliceTokenB1 = await tokenB.methods.balanceOf(alice).call()
    let aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondTokenA1 = await tokenA.methods.balanceOf(diamondAddress).call()
    let diamondTokenB1 = await tokenB.methods.balanceOf(diamondAddress).call()
    let diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()


    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount, stakeAmount], hourInSeconds, ADDRESSZERO, 0).send({from:alice})

    const blockNumber = await web3.eth.getBlockNumber()

    // Pool
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    assert.equal(poolInfo2.tokenData[0].token, tokenA._address)
    assert.equal(poolInfo2.tokenData[0].supply, stakeAmount)
    assert.equal(poolInfo2.tokenData[0].accSdexPerShare, 0)
    assert.equal(poolInfo2.tokenData[1].token, tokenB._address)
    assert.equal(poolInfo2.tokenData[1].supply, stakeAmount)
    assert.equal(poolInfo2.tokenData[1].accSdexPerShare, 0)
    assert.equal(poolInfo2.allocPoint, 2000)
    assert.equal(poolInfo2.lastRewardBlock, blockNumber)
    
    //User
    const userInfo2 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    assert.equal(userInfo2.tokenData[0].amount, stakeAmount)
    assert.equal(userInfo2.tokenData[1].amount, stakeAmount)
    //assert.equal(userInfo2.tokenData[0].rewardDebt, 0)
    //assert.equal(userInfo2.tokenData[1].rewardDebt, 0)
    assert.equal(userInfo2.positions[0].timeEnd - userInfo2.positions[0].timeStart, hourInSeconds)
    assert.equal(userInfo2.positions[0].amounts[0], stakeAmount)
    assert.equal(userInfo2.positions[0].amounts[1], stakeAmount)
    assert.equal(userInfo2.positions[0].nftReward, ADDRESSZERO)
    assert.equal(userInfo2.positions[0].nftid, 0)

    //Tokens
    let aliceTokenA2 = await tokenA.methods.balanceOf(alice).call()
    let aliceTokenB2 = await tokenB.methods.balanceOf(alice).call()
    let aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondTokenA2 = await tokenA.methods.balanceOf(diamondAddress).call()
    let diamondTokenB2 = await tokenB.methods.balanceOf(diamondAddress).call()
    let diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    
    assert.equal(Number(aliceTokenA2), Number(aliceTokenA1) - Number(stakeAmount) )
    assert.equal(Number(aliceTokenB2), Number(aliceTokenB1) - Number(stakeAmount) )
    assert.equal(Number(aliceSdex2), 0)
    assert.equal(Number(diamondTokenA2), Number(diamondTokenA1) + Number(stakeAmount) )
    assert.equal(Number(diamondTokenB2), Number(diamondTokenB1) + Number(stakeAmount) )
    assert.equal(Number(diamondSdex2), 0)

    //Token reward Globals
    let tokenARewardData = await toolShedFacet.methods.tokenRewardData(tokenA._address).call()
    let tokenBRewardData = await toolShedFacet.methods.tokenRewardData(tokenB._address).call()
    assert.equal(tokenARewardData.timeAmountGlobal, Number(stakeAmount) * hourInSeconds)
    assert.equal(tokenBRewardData.timeAmountGlobal, Number(stakeAmount) * hourInSeconds)
    assert.equal(tokenARewardData.rewarded, 0)
    assert.equal(tokenBRewardData.rewarded, 0)
  })

  it("Premature Withdraw is penalized", async () => {
    let stakeAmount = web3.utils.toWei('20', 'ether')
    let poolid = await tokenFarmFacet.methods.poolLength().call() - 1
    const positionid = 0
    const timeAhead = hourInSeconds / 2
    const blocksAhead = 1
    await advanceChain(blocksAhead, timeAhead) // 1 block, 1/2 hour

    let aliceTokenA1 = await tokenA.methods.balanceOf(alice).call()
    let aliceTokenB1 = await tokenB.methods.balanceOf(alice).call()
    let aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondTokenA1 = await tokenA.methods.balanceOf(diamondAddress).call()
    let diamondTokenB1 = await tokenB.methods.balanceOf(diamondAddress).call()
    let diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()

    //+1 because its inclusive with the block used to withdraw
    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksAhead+1, poolid)
    const accSdexPerShare = sdexReward.mul(unity).div(new web3.utils.BN(stakeAmount))
    const perPool = accSdexPerShare.div(new web3.utils.BN(2));
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    //+1 for test compute time, may be 2 on slower computers or local node
    const {refund, penalty} = calcPenalty(1800+1, hourInSeconds, stakeAmount)

    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    const blockNumber = await web3.eth.getBlockNumber()

    // Pool
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    assert.equal(poolInfo2.tokenData[0].token, tokenA._address)
    assert.equal(poolInfo2.tokenData[0].supply, 0)
    assert.equal(poolInfo2.tokenData[0].accSdexPerShare, perPool.toString())
    assert.equal(poolInfo2.tokenData[1].token, tokenB._address)
    assert.equal(poolInfo2.tokenData[1].supply, 0)
    assert.equal(poolInfo2.tokenData[1].accSdexPerShare, perPool.toString())
    assert.equal(poolInfo2.allocPoint, 2000)
    assert.equal(poolInfo2.lastRewardBlock, blockNumber)

    //User
    const userInfo2 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    assert.equal(userInfo2.tokenData[0].amount, 0)
    assert.equal(userInfo2.tokenData[1].amount, 0)
    //assert.equal(userInfo2.tokenData[0].rewardDebt, 0)
    //assert.equal(userInfo2.tokenData[1].rewardDebt, 0)
    assert.equal(userInfo2.positions[0].timeEnd - userInfo2.positions[0].timeStart, hourInSeconds)
    assert.equal(userInfo2.positions[0].amounts[0], 0)
    assert.equal(userInfo2.positions[0].amounts[1], 0)
    assert.equal(userInfo2.positions[0].nftReward, ADDRESSZERO)
    assert.equal(userInfo2.positions[0].nftid, 0)

    //Tokens
    let aliceTokenA2 = await tokenA.methods.balanceOf(alice).call()
    let aliceTokenB2 = await tokenB.methods.balanceOf(alice).call()
    let aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondTokenA2 = await tokenA.methods.balanceOf(diamondAddress).call()
    let diamondTokenB2 = await tokenB.methods.balanceOf(diamondAddress).call()
    let diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const aliceDiffA = new web3.utils.BN(aliceTokenA2).sub(new web3.utils.BN(aliceTokenA1))
    const aliceDiffB = new web3.utils.BN(aliceTokenB2).sub(new web3.utils.BN(aliceTokenB1))

    assert.equal(aliceDiffA.toString(), refund.toString())
    assert.equal(aliceDiffB.toString(), refund.toString())

    const diamondDiffA = new web3.utils.BN(diamondTokenA1).sub(new web3.utils.BN(diamondTokenA2))
    const diamondDiffB = new web3.utils.BN(diamondTokenB1).sub(new web3.utils.BN(diamondTokenB2))
    assert.equal(new web3.utils.BN(diamondTokenA1).sub(refund).toString(), new web3.utils.BN(diamondTokenA2).toString())
    assert.equal(new web3.utils.BN(diamondTokenB1).sub(refund).toString(), new web3.utils.BN(diamondTokenB2).toString())
    assert.equal(diamondSdex2, sdexReward)

    //Token reward Globals
    let tokenARewardData = await toolShedFacet.methods.tokenRewardData(tokenA._address).call()
    let tokenBRewardData = await toolShedFacet.methods.tokenRewardData(tokenB._address).call()
    let sdexRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    assert.equal(tokenARewardData.timeAmountGlobal, 0)
    assert.equal(tokenBRewardData.timeAmountGlobal, 0)
    assert.equal(tokenARewardData.rewarded, 0)
    assert.equal(tokenBRewardData.rewarded, 0)
    assert.equal(tokenARewardData.penalties, penalty)
    assert.equal(tokenBRewardData.penalties, penalty) 
    //assert.equal(sdexRewardData.penalties, sdexReward) 

  })

  it("allows a user to Stake, and is Rewarded", async () => {
    let stakeAmount = web3.utils.toWei('20', 'ether')
    let poolid = await tokenFarmFacet.methods.poolLength().call() - 1
    
    await tokenA.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    await tokenB.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let aliceTokenA1 = await tokenA.methods.balanceOf(alice).call()
    let aliceTokenB1 = await tokenB.methods.balanceOf(alice).call()
    let aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondTokenA1 = await tokenA.methods.balanceOf(diamondAddress).call()
    let diamondTokenB1 = await tokenB.methods.balanceOf(diamondAddress).call()
    let diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount, stakeAmount], hourInSeconds, ADDRESSZERO, 0).send({from:alice})

    let aliceTokenA2 = await tokenA.methods.balanceOf(alice).call()
    let aliceTokenB2 = await tokenB.methods.balanceOf(alice).call()
    let aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondTokenA2 = await tokenA.methods.balanceOf(diamondAddress).call()
    let diamondTokenB2 = await tokenB.methods.balanceOf(diamondAddress).call()
    let diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo2 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    const positionid = userInfo2.positions.length - 1
    const position = userInfo2.positions[positionid]
    assert.equal(position.timeEnd - position.timeStart, hourInSeconds)
    assert.equal(position.amounts[0], stakeAmount)
    assert.equal(position.amounts[1], stakeAmount)
    assert.equal(position.nftReward, ADDRESSZERO)
    assert.equal(position.nftid, 0)

    const blocksAhead = 360
    
    await advanceChain(blocksAhead, 10) // 360 blocks, 10 seconds per block 

    const tokenARewardAmount = 
      await calcNFTRewardAmount(tokenA, toolShedFacet, diamondAddress, hourInSeconds, stakeAmount)
    const tokenBRewardAmount = 
      await calcNFTRewardAmount(tokenB, toolShedFacet, diamondAddress, hourInSeconds, stakeAmount)
    const sdexNFTReward = await calcSdexNFTRewardAmount(tokenFarmFacet, toolShedFacet,sdexFacet, diamondAddress, poolid, blocksAhead, alice, positionid)
    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    const blockNumber = await web3.eth.getBlockNumber()

    let aliceTokenA3 = await tokenA.methods.balanceOf(alice).call()
    let aliceTokenB3 = await tokenB.methods.balanceOf(alice).call()
    let aliceSdex3 = await sdexFacet.methods.balanceOf(alice).call()
    
    let aliceRPRA = await reducedPenaltyReward.methods.balanceOf(alice, 1).call()
    let aliceRPRB = await reducedPenaltyReward.methods.balanceOf(alice, 2).call()
    let aliceRPRSdex = await reducedPenaltyReward.methods.balanceOf(alice, 3).call()
    let diamondTokenA3 = await tokenA.methods.balanceOf(diamondAddress).call()
    let diamondTokenB3 = await tokenB.methods.balanceOf(diamondAddress).call()
    let diamondSdex3 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const poolInfo3 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo3 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()

    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, blocksAhead+1, poolid)
    const accSdexPerShare1 = new web3.utils.BN(poolInfo2.tokenData[0].accSdexPerShare)
    const accSdexPerShare2 =accSdexPerShare1.add(sdexReward.mul(unity).div(new web3.utils.BN(stakeAmount).mul(new web3.utils.BN(2))))
    const perPool = accSdexPerShare2;


    // Pool
    assert.equal(poolInfo3.tokenData[0].token, tokenA._address)
    assert.equal(poolInfo3.tokenData[0].supply, 0)
    assert.equal(poolInfo3.tokenData[0].accSdexPerShare, perPool.toString())
    assert.equal(poolInfo3.tokenData[1].token, tokenB._address)
    assert.equal(poolInfo3.tokenData[1].supply, 0)
    assert.equal(poolInfo3.tokenData[1].accSdexPerShare, perPool.toString())
    assert.equal(poolInfo3.allocPoint, 2000)
    assert.equal(poolInfo3.lastRewardBlock, blockNumber)

    // User
    assert.equal(userInfo3.tokenData[0].amount, 0)
    assert.equal(userInfo3.tokenData[1].amount, 0)
    //assert.equal(userInfo3.tokenData[0].rewardDebt, 0)
    //assert.equal(userInfo3.tokenData[1].rewardDebt, 0)
    assert.equal(userInfo3.positions[positionid].timeEnd - userInfo3.positions[positionid].timeStart, hourInSeconds)
    assert.equal(userInfo3.positions[positionid].amounts[0], 0)
    assert.equal(userInfo3.positions[positionid].amounts[1], 0)
    assert.equal(userInfo3.positions[positionid].nftReward, ADDRESSZERO)
    assert.equal(userInfo3.positions[positionid].nftid, 0)
    
    // Tokens
    
    const aliceDiffA = new web3.utils.BN(aliceTokenA2).add(new web3.utils.BN(stakeAmount))
    const aliceDiffB = new web3.utils.BN(aliceTokenB2).add(new web3.utils.BN(stakeAmount))
    const aliceDiffSdex = new web3.utils.BN(aliceSdex1).add(sdexReward)
    const diamondDiffA = new web3.utils.BN(diamondTokenA2).sub(new web3.utils.BN(stakeAmount))
    const diamondDiffB = new web3.utils.BN(diamondTokenB2).sub(new web3.utils.BN(stakeAmount))
    assert.equal(aliceDiffA.toString(), aliceTokenA3)
    assert.equal(aliceDiffB.toString(), aliceTokenB3)
    assert.equal(aliceDiffSdex.toString(), aliceSdex3)
    assert.equal(diamondDiffA.toString(), diamondTokenA3)
    assert.equal(diamondDiffB.toString(), diamondTokenB3)
    assert.equal(diamondSdex2, diamondSdex3)

    //Token Globals
    let tokenARewardData = await toolShedFacet.methods.tokenRewardData(tokenA._address).call()
    let tokenBRewardData = await toolShedFacet.methods.tokenRewardData(tokenB._address).call()
    let sdexRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    assert.equal(tokenARewardData.timeAmountGlobal, 0)
    assert.equal(tokenBRewardData.timeAmountGlobal, 0)
    assert.equal(tokenARewardData.rewarded, tokenARewardAmount.toString())
    assert.equal(tokenBRewardData.rewarded, tokenBRewardAmount.toString())
    assert.equal(tokenARewardData.penalties, 0)
    assert.equal(tokenBRewardData.penalties, 0)
    
    assert.equal(sdexRewardData.penalties, 0) 


    //Reduced Penalty Rewards
    assert.equal(aliceRPRA, 1)
    assert.equal(aliceRPRB, 1)
    assert.equal(aliceRPRSdex, 1)
    const reductionAmountA = await reducedPenaltyFacet.methods.rPRReductionAmount(1).call()
    const reductionAmountB = await reducedPenaltyFacet.methods.rPRReductionAmount(2).call()
    const reductionAmountSdex = await reducedPenaltyFacet.methods.rPRReductionAmount(3).call()
    assert.equal(reductionAmountA.amount, tokenARewardAmount.toString())
    assert.equal(reductionAmountB.amount, tokenBRewardAmount.toString())
    assert.equal(reductionAmountSdex.amount, sdexNFTReward.toString())



  })




})
