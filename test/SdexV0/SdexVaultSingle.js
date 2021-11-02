
const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../scripts/deploy.js')
const { deploy } = require('../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceChain, advanceTime, advanceBlocks } = require('../utilities.js')
const { calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount } = require('./helpers.js')

const MockERC20 = artifacts.require('MockERC20')

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
  let stakeAmount = web3.utils.toWei('12', 'ether')
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
    assert.equal(vTreasury2, currPerFee.sub(new web3.utils.BN(1)).toString())
    
    assert.equal(sdexReward.add(new web3.utils.BN(diamondSdex1)).sub(new web3.utils.BN(currCallFee)).add(new web3.utils.BN(1)).toString(), diamondSdex2)
    //assert.equal(diamondSdex2, Number(vTreasury2) + Number(vSdex2) - Number(currCallFee))
    //
    //
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
    const vCallFee = await sdexVaultFacet.methods.vCallFee().call()
    const currPerFee = sdexReward.mul(new web3.utils.BN(vPerformanceFee)).div(new web3.utils.BN(10000))
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


    // Alice Sdex
    const bnAliceSdex1 = new web3.utils.BN(aliceSdex1)
    const bnAliceSdex2 = new web3.utils.BN(aliceSdex2)
    assert.equal(new web3.utils.BN(aliceSdex1).add(refund).toString(), aliceSdex2)
    // Diamond Sdex
    assert.equal(new web3.utils.BN(diamondSdex1).add(sdexReward).sub(refund).toString(), diamondSdex2)
    // User Info 
    assert.equal(userInfo2.tokenData[0].amount, 0)
    // Pool Info
    const blockNumber = await web3.eth.getBlockNumber()
    assert.equal(poolInfo2.tokenData[0].supply, 0)
    assert.equal(poolInfo2.lastRewardBlock, blockNumber)
    // Vault User Info
    assert.equal(vUserInfo1.shares, stakeAmount)
    assert.equal(vUserInfo1.sdexAtLastUserAction, stakeAmount)
    assert.equal(vUserInfo1.lastUserActionTime, vUserInfo1.lastDepositedTime)

    const position1 = vUserInfo1.positions[0]
    assert.equal(position1.timeEnd - position1.timeStart, hourInSeconds)
    assert.equal(position1.startBlock, blockNumber - 2)
    assert.equal(position1.amounts[0], stakeAmount)
    assert.equal(position1.nftReward, ADDRESSZERO)
    assert.equal(position1.nftid, 0)

    assert.equal(vUserInfo2.shares, 0)
    assert.equal(vUserInfo2.sdexAtLastUserAction, 0)
    //assert.equal(vUserInfo2.lastUserActionTime, vUserInfo2.lastDepositedTime)

    const position2 = vUserInfo2.positions[0]
    assert.equal(position2.timeEnd - position2.timeStart, hourInSeconds)
    assert.equal(position2.startBlock, blockNumber - 2)
    assert.equal(position2.amounts[0], 0)
    assert.equal(position2.nftReward, ADDRESSZERO)
    assert.equal(position2.nftid, 0)
    // Vault Sdex
    assert.equal(vSdex2, penalty.add(sdexReward).toString())
    //assert.equal(vSdex2, penalty.add(sdexReward).sub(new web3.utils.BN(1)).toString())
    
    // Token Globals
    assert.equal(tokenGlobal2.timeAmountGlobal, 0 )
    assert.equal(tokenGlobal2.rewarded, 0)
    assert.equal(tokenGlobal2.penalties, penalty.add(new web3.utils.BN(1)).toString())

  })

  it("can withdraw after period and receive a reward NFT", async () => {
    let positionid = 1
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    const totalSdex1 = await sdexFacet.methods.totalSupply().call()
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

    const totalSdex2 = await sdexFacet.methods.totalSupply().call()
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

    const vaultBalance = new web3.utils.BN(await sdexVaultFacet.methods.vaultBalance().call())
    const currentAmount = new web3.utils.BN(stakeAmount).mul(vaultBalance).div(new web3.utils.BN(vTotalShares2))
    await advanceTime(3601) // 3601 seconds, 0 block
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    const totalSdex3 = await sdexFacet.methods.totalSupply().call()
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

    //Alice Sdex
    const sdexReward = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0) 
    const bnStakeAmount = new web3.utils.BN(stakeAmount)
    const diff = sdexReward.add(bnStakeAmount)
    
    // Diamond Sdex
    assert.equal(
      new web3.utils.BN(diamondSdex1).add(bnStakeAmount).toString(),
      diamondSdex2
    )
    assert.equal(new web3.utils.BN(diamondSdex2).add(sdexReward).sub(currentAmount).toString(), diamondSdex3)


    assert.equal(new web3.utils.BN(aliceSdex1).sub(bnStakeAmount).toString(), aliceSdex2 )
    assert.equal(new web3.utils.BN(aliceSdex2).add(currentAmount).toString(), aliceSdex3 )
    // Why gaining reward?
    //
    


    
    // NFT
    assert.equal(await reducedPenaltyReward.methods.balanceOf(alice, 1).call(), 1)
    const reduction = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    assert.equal(reduction.amount, tokenGlobal3.rewarded);
    assert.equal(reduction.amount, tokenGlobal2.penalties);
  })

  it("can deposit with an NFT", async () => {

    let positionid = 2
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    const totalSdex1 = await sdexFacet.methods.totalSupply().call()
    const aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex1 = await sdexVaultFacet.methods.vSdex().call()
    const vTotalShares1 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo1 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal1 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, hourInSeconds, reducedPenaltyReward._address, 1).send({from:alice})

    const totalSdex2 = await sdexFacet.methods.totalSupply().call()
    const aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    const diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const vSdex2 = await sdexVaultFacet.methods.vSdex().call()
    const vTotalShares2 = await sdexVaultFacet.methods.vTotalShares().call()
    const vUserInfo2 = await sdexVaultFacet.methods.vUserInfo(alice).call()
    const vSharesDiamond2 = await sdexVaultFacet.methods.vShares(diamondAddress).call()
    const vSharesAlice2 = await sdexVaultFacet.methods.vShares(alice).call()
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(0).call()
    const userInfo2 = await tokenFarmFacet.methods.userInfo(0, diamondAddress).call()
    const tokenGlobal2 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()


    const bnStakeAmount = new web3.utils.BN(stakeAmount)
    const vaultBalance = new web3.utils.BN(await sdexVaultFacet.methods.vaultBalance().call())
    const currentAmount = new web3.utils.BN(stakeAmount).mul(vaultBalance).div(new web3.utils.BN(vTotalShares2))

    const sdexReward = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0) 
    const {refund, penalty} = calcPenalty(1800, hourInSeconds, currentAmount)

    const reduction2 = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    const reduction2BN =  new web3.utils.BN(reduction2.amount)

    await advanceTime(1800) // 1800 seconds, 0 block
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    const blockNumber = await web3.eth.getBlockNumber()

    const totalSdex3 = await sdexFacet.methods.totalSupply().call()
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

    const reduction3 = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    const reduction3BN =  new web3.utils.BN(reduction3.amount)
    //Alice Sdex
    assert.equal(new web3.utils.BN(aliceSdex1).sub(new web3.utils.BN(stakeAmount)).toString(), aliceSdex2)
    assert.equal(new web3.utils.BN(aliceSdex2).add(refund).add(reduction2BN).toString(), aliceSdex3)
    //Diamond Sdex
    assert.equal(new web3.utils.BN(diamondSdex1).add(new web3.utils.BN(stakeAmount)).add(sdexReward).add(sdexReward).toString(), diamondSdex2)
    assert.equal(new web3.utils.BN(diamondSdex2).sub(refund).sub(reduction2BN).add(sdexReward).toString(), diamondSdex3)
    //VUser Info
    assert.equal(vUserInfo3.shares, 0)
    assert.equal(vUserInfo3.positions[positionid].amounts[0], 0)
    //Pool Info
    assert.equal(poolInfo3.tokenData[0].supply, 0)
    assert.equal(poolInfo3.lastRewardBlock, blockNumber)
    //UserInfo
    assert.equal(userInfo3.tokenData[0].amount, 0)
    assert.equal(userInfo3.tokenData[0].rewardDebt, 0)
    //Token Globals
    assert.equal(tokenGlobal1.penalties, 0)
    assert.equal(tokenGlobal1.timeAmountGlobal, 0)
    assert.equal(tokenGlobal2.timeAmountGlobal, stakeAmount*hourInSeconds)
    assert.equal(tokenGlobal2.penalties, 0)
    assert.equal(tokenGlobal3.timeAmountGlobal, 0)
    assert.equal(tokenGlobal3.penalties, penalty.sub(reduction2BN).toString())
    //Vault Params
    //NFT
    assert.equal(reduction3.amount, 0)
  })
})
