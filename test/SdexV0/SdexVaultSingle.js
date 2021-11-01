
const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../scripts/deploy.js')
const { deploy } = require('../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceChain, advanceTime } = require('../utilities.js')
const { calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount } = require('./helpers.js')

const MockERC20 = artifacts.require('MockBEP20')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyFacet = artifacts.require('ReducedPenaltyFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')

contract("SdexVaultFacet", (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let sdexFacet;
  let toolShedFacet;
  let tokenFarmFacet;
  let sdexVaultFacet;
  let rewardFacet;
  let reducedPenaltyFacet;
  let reducedPenaltyReward;
  let tokenA;
  let tokenB;
  const hourInSeconds = 3600
  let diamondAddress
  let stakeAmount = web3.utils.toWei('1', 'ether')
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

  it("adds reduced Penalty to sdex", async () => {
    const rPRAddress = await reducedPenaltyFacet.methods.rPAddress().call()

    await rewardFacet.methods.addReward(diamondAddress, rPRAddress).send({from:owner})
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
  })

  it("user can stake to vault", async () => {
    
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    const aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex1 = await sdexVaultFacet.methods.vSdex().call()
    const vTotalShares1 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo1 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal1 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, hourInSeconds, ADDRESSZERO, 0).send({from:alice})

    const aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex2 = await sdexVaultFacet.methods.vSdex().call()
    const vTotalShares2 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo2 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const vSharesDiamond = await sdexVaultFacet.methods.vShares(diamondAddress).call()
    const vSharesAlice = await sdexVaultFacet.methods.vShares(alice).call()
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo2 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal2 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()

    const blockNumber = await web3.eth.getBlockNumber()

    assert.equal(
      new web3.utils.BN(aliceSdex1).sub(new web3.utils.BN(aliceSdex2)).toString(), stakeAmount)
    assert.equal(
      new web3.utils.BN(diamondSdex1).add(new web3.utils.BN(stakeAmount)).toString(), diamondSdex2)
    assert.equal(vSdex1, 0)    
    assert.equal(vSdex2, 0)    
    // alice  VaultUserInfo
    assert.equal(vUserInfo2.shares, stakeAmount)
    assert.equal(vUserInfo2.sdexAtLastUserAction, stakeAmount)
    assert.equal(vUserInfo2.positions[0].timeEnd - vUserInfo2.positions[0].timeStart, hourInSeconds);
    assert.equal(vUserInfo2.positions[0].amounts[0], stakeAmount)
    assert.equal(vUserInfo2.positions[0].nftReward, ADDRESSZERO)
    assert.equal(vUserInfo2.positions[0].nftid, 0)

    // Vault UserInfo
    assert.equal(userInfo2.tokenData[0].amount, stakeAmount)
    assert.equal(userInfo2.tokenData[0].rewardDebt, 0)
    assert.equal(userInfo2.lastRewardBlock, 0)

    // Vault Shares
    assert.equal(vSharesDiamond, stakeAmount);
    assert.equal(vSharesAlice, 0);

    //Pool
    assert.equal(poolInfo2.tokenData[0].token, diamondAddress)
    assert.equal(poolInfo2.tokenData[0].supply, stakeAmount)
    assert.equal(poolInfo2.allocPoint, 1000)
    assert.equal(poolInfo2.lastRewardBlock, blockNumber)

    //Token Globals
    assert.equal(tokenGlobal2.timeAmountGlobal, hourInSeconds*stakeAmount)
    assert.equal(tokenGlobal2.rewarded, 0)
    assert.equal(tokenGlobal2.penalties, 0)
  })

  it("can harvest, autocompounding", async () => {
    
    const sdexReward = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0) 
    const vPerformanceFee = await sdexVaultFacet.methods.vPerformanceFee().call()
    const vCallFee = await sdexVaultFacet.methods.vCallFee().call()
    const currPerFee = sdexReward.mul(new web3.utils.BN(vPerformanceFee)).div(new web3.utils.BN(10000))
    const currCallFee = sdexReward.mul(new web3.utils.BN(vCallFee)).div(new web3.utils.BN(10000))

    const aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex1 = await sdexVaultFacet.methods.vSdex().call()
    const vTreasury1 = await sdexVaultFacet.methods.vTreasury().call()
    const vTotalShares1 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo1 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal1 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()

    await sdexVaultFacet.methods.harvest().send({from:alice})

    const aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex2 = await sdexVaultFacet.methods.vSdex().call()
    const vTreasury2 = await sdexVaultFacet.methods.vTreasury().call()
    const vTotalShares2 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo2 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const vSharesDiamond = await sdexVaultFacet.methods.vShares(diamondAddress).call()
    const vSharesAlice = await sdexVaultFacet.methods.vShares(alice).call()
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo2 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal2 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    assert.equal(vTreasury2, currPerFee.toString())
    
    assert.equal(sdexReward.add(new web3.utils.BN(diamondSdex1)).sub(new web3.utils.BN(currCallFee)).toString(), diamondSdex2)
    //assert.equal(diamondSdex2, Number(vTreasury2) + Number(vSdex2) - Number(currCallFee))
  })

  it("can withdraw position, (penalized)", async () => {
    const aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex1 = await sdexVaultFacet.methods.vSdex().call()
    const vTreasury1 = await sdexVaultFacet.methods.vTreasury().call()
    const vTotalShares1 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo1 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal1 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    

    const sdexReward = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0) 
    const vPerformanceFee = await sdexVaultFacet.methods.vPerformanceFee().call()
    const currPerFee = sdexReward.mul(new web3.utils.BN(vPerformanceFee)).div(new web3.utils.BN(10000))
    const vCallFee = await sdexVaultFacet.methods.vCallFee().call()
    const currCallFee = sdexReward.mul(new web3.utils.BN(vCallFee)).div(new web3.utils.BN(10000))
    const bnStakeAmount = new web3.utils.BN(stakeAmount)
    const {refund, penalty} = calcPenalty(2, hourInSeconds, bnStakeAmount.add(sdexReward).sub(currCallFee).sub(currPerFee))
    
    await sdexVaultFacet.methods.withdrawVault(0).send({from: alice})

    const aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex2 = await sdexVaultFacet.methods.vSdex().call()
    const vTreasury2 = await sdexVaultFacet.methods.vTreasury().call()
    const vTotalShares2 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo2 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const vSharesDiamond = await sdexVaultFacet.methods.vShares(diamondAddress).call()
    const vSharesAlice = await sdexVaultFacet.methods.vShares(alice).call()
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo2 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal2 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()

    const bnAliceSdex1 = new web3.utils.BN(aliceSdex1)
    const bnAliceSdex2 = new web3.utils.BN(aliceSdex2)
    assert.equal(new web3.utils.BN(aliceSdex1).add(refund).toString(), aliceSdex2)

    assert.equal(new web3.utils.BN(diamondSdex1).add(sdexReward).sub(refund).toString(), diamondSdex2)
    assert.equal(userInfo2.tokenData[0].amount, 0)
    assert.equal(poolInfo2.tokenData[0].supply, 0)
    const blockNumber = await web3.eth.getBlockNumber()
    assert.equal(poolInfo2.lastRewardBlock, blockNumber)

  })

  it("can withdraw after period and receive a reward NFT", async () => {
    let positionid = 1
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    const aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex1 = await sdexVaultFacet.methods.vSdex().call()
    const vTotalShares1 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo1 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal1 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, hourInSeconds, ADDRESSZERO, 0).send({from:alice})

    const aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex2 = await sdexVaultFacet.methods.vSdex().call()
    const vTotalShares2 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo2 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const vSharesDiamond = await sdexVaultFacet.methods.vShares(diamondAddress).call()
    const vSharesAlice = await sdexVaultFacet.methods.vShares(alice).call()
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo2 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal2 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()

    const blocksAhead = 0
    
    await advanceTime(3601) // 360 blocks, 10 seconds per block 

    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    const aliceSdex3 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex3 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex3 = await sdexVaultFacet.methods.vSdex().call()
    const vTotalShares3 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo3 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const vSharesDiamond3 = await sdexVaultFacet.methods.vShares(diamondAddress).call()
    const vSharesAlice3 = await sdexVaultFacet.methods.vShares(alice).call()
    const poolInfo3 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo3 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal3 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    console.log(aliceSdex1) 
    console.log(aliceSdex2)
    console.log(aliceSdex3)


    const sdexReward = await calcSdexReward(toolShedFacet, tokenFarmFacet, blocksAhead+1, 0) 
    const vPerformanceFee = await sdexVaultFacet.methods.vPerformanceFee().call()
    const currPerFee = sdexReward.mul(new web3.utils.BN(vPerformanceFee)).div(new web3.utils.BN(10000))
    const vCallFee = await sdexVaultFacet.methods.vCallFee().call()
    const currCallFee = sdexReward.mul(new web3.utils.BN(vCallFee)).div(new web3.utils.BN(10000))
    const bnStakeAmount = new web3.utils.BN(stakeAmount)
    const diff = sdexReward.add(bnStakeAmount)
    console.log('calc', diff.toString())
    assert.equal(new web3.utils.BN(aliceSdex2).add(diff).sub(new web3.utils.BN(aliceSdex3)).toString(), 1)

    
  })
})
