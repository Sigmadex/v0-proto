const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../../scripts/deploy.js')
const { deploy } = require('../../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceChain, advanceTime, advanceBlocks } = require('../../utilities.js')
const { fetchState, BN, calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount } = require('../helpers.js')

const MockERC20 = artifacts.require('MockERC20')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyRewardFacet = artifacts.require('ReducedPenaltyRewardFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')

contract("SdexVaultSingle", (accounts) => {
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
  let tokenA;
  let tokenB;
  let poolid = 0
  const blocksToStake = 10
  let diamondAddress
  let stakeAmount = web3.utils.toWei('20', 'ether')
  before(async () => {
    diamondAddress = await deployDiamond()

    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
    toolShedFacet = new web3.eth.Contract(ToolShedFacet.abi, diamondAddress)
    tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)
    sdexVaultFacet = new web3.eth.Contract(SdexVaultFacet.abi, diamondAddress)
    rewardFacet = new web3.eth.Contract(RewardFacet.abi, diamondAddress)
    reducedPenaltyRewardFacet = new web3.eth.Contract(ReducedPenaltyRewardFacet.abi, diamondAddress)

    const rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()
    reducedPenaltyReward = new web3.eth.Contract(ReducedPenaltyReward.abi, rPRAddress)
    

    const amount = web3.utils.toWei('1000', 'ether')

    await sdexFacet.methods.executiveMint(alice, amount).send({ from: owner })
    await sdexFacet.methods.executiveMint(bob, amount).send({ from: owner })
  })

  it("adds reduced Penalty to sdex", async () => {
    const rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()

    await rewardFacet.methods.addReward(diamondAddress, rPRAddress).send({from:owner})
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
  })

  it("user can stake to vault", async () => {
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, ADDRESSZERO, 0).send({from:alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    console.log('===========deposit==========')
    console.log('alice   ', state2[alice].sdex)
    console.log('diamond ', state2[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state2.vault.vSdex)
    console.log('pool    ', state2.pool.tokenData[0].supply)
    console.log('poolPen ', state2.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state2.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state2.accSdexPenaltyPool)
    console.log('accRew  ', state2.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')

    assert.equal(
      BN(state1[alice].sdex).sub(BN(state2[alice].sdex)).toString(), stakeAmount)
    assert.equal(
      BN(state1[diamondAddress].sdex).add(BN(stakeAmount)).toString(), state2[diamondAddress].sdex)
    assert.equal(state1.vault.vSdex, 0)    
    assert.equal(state2.vault.vSdex, 0)    
    // alice  VaultUserInfo
    assert.equal(state2[alice].vUserInfo.shares, stakeAmount)
    assert.equal(state2[alice].vUserInfo.sdexAtLastUserAction, stakeAmount)
    assert.equal(state2[alice].vUserInfo.positions[0].endBlock - state2[alice].vUserInfo.positions[0].startBlock, blocksToStake);
    assert.equal(state2[alice].vUserInfo.positions[0].amount, stakeAmount)
    assert.equal(state2[alice].vUserInfo.positions[0].shares, stakeAmount)
    assert.equal(state2[alice].vUserInfo.positions[0].nftReward, ADDRESSZERO)
    assert.equal(state2[alice].vUserInfo.positions[0].nftid, 0)

    // Vault UserInfo
    assert.equal(state2[diamondAddress].userInfo.tokenData[0].amount, stakeAmount)
    assert.equal(state2[diamondAddress].userInfo.tokenData[0].totalRewardDebt, 0)
    assert.equal(state2[diamondAddress].userInfo.lastRewardBlock, 0)

    // Vault Shares
    //assert.equal(vSharesDiamond, stakeAmount);

    //Pool
    assert.equal(state2.pool.tokenData[0].token, diamondAddress)
    assert.equal(state2.pool.tokenData[0].supply, stakeAmount)
    assert.equal(state2.pool.allocPoint, 1000)
    assert.equal(state2.pool.lastRewardBlock, state2.blockNumber)

    //Token Globals
    assert.equal(state2.rewardGlobals[diamondAddress].blockAmountGlobal, blocksToStake*stakeAmount)
    assert.equal(state2.rewardGlobals[diamondAddress].rewarded, 0)
    assert.equal(state2.rewardGlobals[diamondAddress].penalties, 0)
  })

  it("can harvest, autocompounding", async () => {
    /*
    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    const sdexReward = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0) 
    const vPerformanceFee = await sdexVaultFacet.methods.vPerformanceFee().call()
    const vCallFee = await sdexVaultFacet.methods.vCallFee().call()
    const currPerFee = sdexReward.mul(BN(vPerformanceFee)).div(BN(10000))
    const currCallFee = sdexReward.mul(BN(vCallFee)).div(BN(10000))


    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    assert.equal(state2.vault.vTreasury, currPerFee.toString())
    
    assert.equal(sdexReward.add(BN(state1[diamondAddress].sdex)).sub(BN(currCallFee)).toString(), state2[diamondAddress].sdex)
    //assert.equal(state2[diamondAddress].sdex, Number(state2.vault.vTreasury) + Number(state2.vault.vSdex) - Number(currCallFee))
    //
    //
    */
  })

  it("can withdraw position, (penalized)", async () => {

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    const sdexReward = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0) 
    const vPerformanceFee = await sdexVaultFacet.methods.vPerformanceFee().call()
    const vCallFee = await sdexVaultFacet.methods.vCallFee().call()
    const currPerFee = sdexReward.mul(BN(vPerformanceFee)).div(BN(10000))
    const currCallFee = sdexReward.mul(BN(vCallFee)).div(BN(10000))
    const bnStakeAmount = BN(stakeAmount)
    const positionAmount = BN(state1[alice].vUserInfo.positions[0].amount)
    const currentAmount = bnStakeAmount.add(sdexReward).sub(currCallFee).sub(currPerFee)
    const accruedSdex = currentAmount.sub(positionAmount)
    const {refund, penalty} = calcPenalty(1, blocksToStake, positionAmount)
    const {refund: refundAcc, penalty: penaltyAcc} = calcPenalty(1, blocksToStake, accruedSdex) 
    
    await sdexVaultFacet.methods.withdrawVault(0).send({from: alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    console.log('===========withdrawVault==========')
    console.log('alice   ', state2[alice].sdex)
    console.log('diamond ', state2[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state2.vault.vSdex)
    console.log('pool    ', state2.pool.tokenData[0].supply)
    console.log('poolPen ', state2.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state2.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state2.accSdexPenaltyPool)
    console.log('accRew  ', state2.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')
    // Alice Sdex
    const bnAliceSdex1 = BN(state1[alice].sdex)
    const bnAliceSdex2 = BN(state2[alice].sdex)
    assert.equal(BN(state1[alice].sdex).add(refund).toString(), state2[alice].sdex)
    // Diamond Sdex
    assert.equal(BN(state1[diamondAddress].sdex).add(sdexReward).sub(refund).toString(), state2[diamondAddress].sdex)
    // User Info 
    assert.equal(state2[diamondAddress].userInfo.tokenData[0].amount, 0)
    // Pool Info
    const blockNumber = await web3.eth.getBlockNumber()
    assert.equal(state2.pool.tokenData[0].supply, 0)
    assert.equal(state2.pool.lastRewardBlock, blockNumber)
    // Vault User Info
    assert.equal(state1[alice].vUserInfo.shares, stakeAmount)
    assert.equal(state1[alice].vUserInfo.sdexAtLastUserAction, stakeAmount)
    assert.equal(state1[alice].vUserInfo.lastUserActionTime, state1[alice].vUserInfo.lastDepositedTime)

    const position1 = state1[alice].vUserInfo.positions[0]
    assert.equal(position1.endBlock - position1.startBlock, blocksToStake)
    assert.equal(position1.startBlock, blockNumber - 1)
    assert.equal(position1.amount, stakeAmount)
    assert.equal(position1.shares, stakeAmount)
    assert.equal(position1.nftReward, ADDRESSZERO)
    assert.equal(position1.nftid, 0)

    assert.equal(state2[alice].vUserInfo.shares, 0)
    assert.equal(state2[alice].vUserInfo.sdexAtLastUserAction, 0)
    //assert.equal(state2[alice].vUserInfo.lastUserActionTime, state2[alice].vUserInfo.lastDepositedTime)

    const position2 = state2[alice].vUserInfo.positions[0]
    assert.equal(position2.endBlock - position2.startBlock, blocksToStake)
    assert.equal(position2.startBlock, blockNumber - 1)
    assert.equal(position2.amount, 0)
    assert.equal(position2.shares, 0)
    assert.equal(position2.nftReward, ADDRESSZERO)
    assert.equal(position2.nftid, 0)
    // Vault Sdex
    //assert.equal(state2.vault.vSdex, penalty.add(sdexReward).add(BN(1)).toString())
    assert.equal(state2.vault.vSdex, (sdexReward).sub(BN(0)).toString())
    
    // Token Globals
    assert.equal(state2.rewardGlobals[diamondAddress].blockAmountGlobal, 0 )
    assert.equal(state2.rewardGlobals[diamondAddress].rewarded, 0)
    assert.equal(state2.rewardGlobals[diamondAddress].penalties, penalty.toString())

  })

  it("can withdraw after period and receive a reward NFT", async () => {
    let positionid = 1
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, ADDRESSZERO, 0).send({from:alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    console.log('===========depositVault==========')
    console.log('alice   ', state2[alice].sdex)
    console.log('diamond ', state2[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state2.vault.vSdex)
    console.log('pool    ', state2.pool.tokenData[0].supply)
    console.log('poolPen ', state2.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state2.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state2.accSdexPenaltyPool)
    console.log('accRew  ', state2.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')

    const vaultBalance = BN(await sdexVaultFacet.methods.vaultBalance().call())
    const currentAmount = BN(stakeAmount).mul(vaultBalance).div(BN(state2.vault.vTotalShares))
    await advanceBlocks(blocksToStake+1) // 3601 seconds, 0 block
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    console.log('===========withdrawVault==========')
    console.log('alice   ', state3[alice].sdex)
    console.log('diamond ', state3[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state3.vault.vSdex)
    console.log('pool    ', state3.pool.tokenData[0].supply)
    console.log('poolPen ', state3.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state3.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state3.accSdexPenaltyPool)
    console.log('accRew  ', state3.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state3[diamondAddress].sdex).sub(
      BN(state3.vault.vSdex).add(
      BN(state3.pool.tokenData[0].supply)).add(
      BN(state3.rewardGlobals[diamondAddress].penalties)).add(
      BN(state3.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state3.accSdexPenaltyPool)).add(
      BN(state3.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')

    //Alice Sdex
    const sdexReward = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0) 
    const bnStakeAmount = BN(stakeAmount)
    const diff = sdexReward.add(bnStakeAmount)
    
    // Diamond Sdex
    assert.equal(
      BN(state1[diamondAddress].sdex).add(bnStakeAmount).toString(),
      state2[diamondAddress].sdex
    )
    assert.equal(BN(state2[diamondAddress].sdex).add(sdexReward.mul(BN(blocksToStake+2))).sub(currentAmount).toString(), state3[diamondAddress].sdex)


    assert.equal(BN(state1[alice].sdex).sub(bnStakeAmount).toString(), state2[alice].sdex )
    assert.equal(BN(state2[alice].sdex).add(currentAmount).toString(), state3[alice].sdex )
    // Why gaining reward?
    //
    
    // NFT
    assert.equal(await reducedPenaltyReward.methods.balanceOf(alice, 1).call(), 1)
    const reduction = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(1).call()
    assert.equal(reduction.amount, state3.rewardGlobals[diamondAddress].rewarded);
    assert.equal(reduction.amount, state2.rewardGlobals[diamondAddress].penalties);
  })

  it("can deposit with an NFT", async () => {

    let positionid = 2
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    const totalSdex1 = await sdexFacet.methods.totalSupply().call()
    
    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, reducedPenaltyReward._address, 1).send({from:alice})
    
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    console.log('===========depositVault==========')
    console.log('alice   ', state2[alice].sdex)
    console.log('diamond ', state2[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state2.vault.vSdex)
    console.log('pool    ', state2.pool.tokenData[0].supply)
    console.log('poolPen ', state2.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state2.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state2.accSdexPenaltyPool)
    console.log('accRew  ', state2.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')
    const totalSdex2 = await sdexFacet.methods.totalSupply().call()

    const bnStakeAmount = BN(stakeAmount)
    const vaultBalance = BN(await sdexVaultFacet.methods.vaultBalance().call())
    const currentAmount = BN(stakeAmount).mul(vaultBalance).div(BN(state2.vault.vTotalShares))

    const sdexReward = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0) 
    const positionAmount = BN(state2[alice].vUserInfo.positions[positionid].amount)
    const {refund, penalty} = calcPenalty(blocksToStake/2 + 1, blocksToStake, positionAmount)
    const accruedSdex = currentAmount.sub(positionAmount)
    const {refund: refundAcc, penalty: penaltyAcc} = calcPenalty(blocksToStake/2 + 1, blocksToStake, accruedSdex) 

    const reduction2 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(1).call()
    const reduction2BN =  BN(reduction2.amount)

    await advanceBlocks(blocksToStake/2) // 1800 seconds, 0 block
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    console.log('===========withdrawVault==========')
    console.log('alice   ', state3[alice].sdex)
    console.log('diamond ', state3[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state3.vault.vSdex)
    console.log('pool    ', state3.pool.tokenData[0].supply)
    console.log('poolPen ', state3.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state3.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state3.accSdexPenaltyPool)
    console.log('accRew  ', state3.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state3[diamondAddress].sdex).sub(
      BN(state3.vault.vSdex).add(
      BN(state3.pool.tokenData[0].supply)).add(
      BN(state3.rewardGlobals[diamondAddress].penalties)).add(
      BN(state3.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state3.accSdexPenaltyPool)).add(
      BN(state3.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')

    const totalSdex3 = await sdexFacet.methods.totalSupply().call()

    const reduction3 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(1).call()
    const reduction3BN =  BN(reduction3.amount)
    //Alice Sdex
    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmount)).toString(), state2[alice].sdex)

    assert.equal(BN(state2[alice].sdex).add(refund).add(penalty).toString(), state3[alice].sdex)
    //Diamond Sdex
    assert.equal(BN(state1[diamondAddress].sdex).add(BN(stakeAmount)).toString(), state2[diamondAddress].sdex)
    const reduction2BNDiff = reduction2BN.sub(penalty)
    assert.equal(BN(state2[diamondAddress].sdex).sub(penalty).sub(refund).add(sdexReward.mul(BN(blocksToStake/2 + 1))).toString(), state3[diamondAddress].sdex)
    //VUser Info
    assert.equal(state3[alice].vUserInfo.shares, 0)
    assert.equal(state3[alice].vUserInfo.positions[positionid].amount, 0)
    assert.equal(state3[alice].vUserInfo.positions[positionid].shares, 0)
    //Pool Info
    assert.equal(state3.pool.tokenData[0].supply, 0)
    assert.equal(state3.pool.lastRewardBlock, state3.blockNumber)
    //UserInfo
    assert.equal(state3[diamondAddress].userInfo.tokenData[0].amount, 0)
    assert.equal(state3[diamondAddress].userInfo.tokenData[0].totalRewardDebt, 0)
    //Token Globals
    assert.equal(state1.rewardGlobals[diamondAddress].penalties, 0)
    assert.equal(state1.rewardGlobals[diamondAddress].blockAmountGlobal, 0)
    assert.equal(state2.rewardGlobals[diamondAddress].blockAmountGlobal, stakeAmount*blocksToStake)
    assert.equal(state2.rewardGlobals[diamondAddress].penalties, 0)
    assert.equal(state3.rewardGlobals[diamondAddress].blockAmountGlobal, 0)



    assert.equal(state2.accSdexRewardPool, state3.accSdexRewardPool)
    assert.equal(state3.rewardGlobals[diamondAddress].penalties, 0)
    //Vault Params
    //NFT
    assert.equal(reduction3.amount, BN(reduction2.amount).sub(penalty).toString())
  })


  it("no NFT, gets reward", async () => {
    let positionid = 3
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, ADDRESSZERO, 0).send({from:alice})
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    console.log('===========depositVault==========')
    console.log('alice   ', state2[alice].sdex)
    console.log('diamond ', state2[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state2.vault.vSdex)
    console.log('pool    ', state2.pool.tokenData[0].supply)
    console.log('poolPen ', state2.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state2.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state2.accSdexPenaltyPool)
    console.log('accRew  ', state2.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')

    await advanceBlocks(blocksToStake) // 1800 seconds, 0 block
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    console.log('===========withdrawVault==========')
    console.log('alice   ', state3[alice].sdex)
    console.log('diamond ', state3[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state3.vault.vSdex)
    console.log('pool    ', state3.pool.tokenData[0].supply)
    console.log('poolPen ', state3.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state3.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state3.accSdexPenaltyPool)
    console.log('accRew  ', state3.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state3[diamondAddress].sdex).sub(
      BN(state3.vault.vSdex).add(
      BN(state3.pool.tokenData[0].supply)).add(
      BN(state3.rewardGlobals[diamondAddress].penalties)).add(
      BN(state3.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state3.accSdexPenaltyPool)).add(
      BN(state3.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')
  })

  it("deposits with an AccNFT", async () => {
    let positionid = 4
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, reducedPenaltyReward._address, 4).send({from:alice})
    
    const reduction = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(4).call()
    console.log(reduction)
    console.log(reduction.amount.toString())

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    console.log('===========depositVault==========')
    console.log('alice   ', state2[alice].sdex)
    console.log('diamond ', state2[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state2.vault.vSdex)
    console.log('pool    ', state2.pool.tokenData[0].supply)
    console.log('poolPen ', state2.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state2.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state2.accSdexPenaltyPool)
    console.log('accRew  ', state2.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')

    await advanceBlocks(blocksToStake/2 ) // 1800 seconds, 0 block
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    console.log('===========withdrawVault==========')
    console.log('alice   ', state3[alice].sdex)
    console.log('diamond ', state3[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state3.vault.vSdex)
    console.log('pool    ', state3.pool.tokenData[0].supply)
    console.log('poolPen ', state3.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state3.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state3.accSdexPenaltyPool)
    console.log('accRew  ', state3.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state3[diamondAddress].sdex).sub(
      BN(state3.vault.vSdex).add(
      BN(state3.pool.tokenData[0].supply)).add(
      BN(state3.rewardGlobals[diamondAddress].penalties)).add(
      BN(state3.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state3.accSdexPenaltyPool)).add(
      BN(state3.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')

    const reduction2 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(4).call()
    console.log(reduction2)

    positionid = 5
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    
    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, reducedPenaltyReward._address, 4).send({from:alice})
    
    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await advanceBlocks(blocksToStake/2 ) // 1800 seconds, 0 block
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state5 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    console.log('===========withdrawVault==========')
    console.log('alice   ', state5[alice].sdex)
    console.log('diamond ', state5[diamondAddress].sdex)
    console.log('--------')
    console.log('vSdex   ', state5.vault.vSdex)
    console.log('pool    ', state5.pool.tokenData[0].supply)
    console.log('poolPen ', state5.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew ', state5.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen  ', state5.accSdexPenaltyPool)
    console.log('accRew  ', state5.accSdexRewardPool)
    console.log('--------')
    console.log('Sdex Accounting', BN(state5[diamondAddress].sdex).sub(
      BN(state5.vault.vSdex).add(
      BN(state5.pool.tokenData[0].supply)).add(
      BN(state5.rewardGlobals[diamondAddress].penalties)).add(
      BN(state5.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state5.accSdexPenaltyPool)).add(
      BN(state5.accSdexRewardPool))).toString(), 1
    )
    console.log('============================')


    const reduction3 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(4).call()
    console.log(reduction3)

  })
})
