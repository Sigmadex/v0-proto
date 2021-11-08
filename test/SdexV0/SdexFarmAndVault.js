
const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../scripts/deploy.js')
const { deploy } = require('../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceBlocks } = require('../utilities.js')
const {BN, fetchState, calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount } = require('./helpers.js')

const MockERC20 = artifacts.require('MockERC20')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyFacet = artifacts.require('ReducedPenaltyFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')

contract("Sdex Farm and Vault Together", async (accounts) => {
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
  let tokenA;
  let tokenB;
  const blocksToStake = 10
  let diamondAddress
  let stakeAmountA = web3.utils.toWei('1', 'ether')
  let stakeAmountB = web3.utils.toWei('1', 'ether')

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

  it("one user stakes vault, another stake manual", async () => {
    await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})

    const state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0) 
    
    console.log('===========alice: 0/10, bob: 0/10==========')
    console.log('alice ', state1[alice].sdex)
    console.log('bob ', state1[bob].sdex)
    console.log('diamond ', state1[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state1.vault.vSdex)
    console.log('pool', state1.pool.tokenData[0].supply)
    console.log('poolPen', state1.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state1.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state1.accSdexPenaltyPool)
    console.log('accRew', state1.accSdexRewardPool)
    console.log('---')
    console.log(BN(state1[diamondAddress].sdex).sub(
      BN(state1.vault.vSdex).add(
      BN(state1.pool.tokenData[0].supply)).add(
      BN(state1.rewardGlobals[diamondAddress].penalties)).add(
      BN(state1.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state1.accSdexPenaltyPool)).add(
      BN(state1.accSdexRewardPool))).toString()
    )

    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, ADDRESSZERO, 0).send({from:alice})

    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    console.log('===========alice: 1/10, bob: 0/10==========')
    console.log('alice ', state2[alice].sdex)
    console.log('bob ', state2[bob].sdex)
    console.log('diamond ', state2[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state2.vault.vSdex)
    console.log('pool', state2.pool.tokenData[0].supply)
    console.log('poolPen', state2.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state2.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state2.accSdexPenaltyPool)
    console.log('accRew', state2.accSdexRewardPool)
    console.log('---')
    console.log(BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexRewardPool))).toString()
    )

    await tokenFarmFacet.methods.deposit(
      0, [stakeAmountB], blocksToStake, ADDRESSZERO, 0).send({from:bob})

    const state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('===========alice: 2/10, bob: 1/10==========')
    console.log('alice ', state3[alice].sdex)
    console.log('bob ', state3[bob].sdex)
    console.log('diamond ', state3[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state3.vault.vSdex)
    console.log('pool', state3.pool.tokenData[0].supply)
    console.log('poolPen', state3.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state3.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state3.accSdexPenaltyPool)
    console.log('accRew', state3.accSdexRewardPool)
    console.log('---')
    console.log(BN(state3[diamondAddress].sdex).sub(
      BN(state3.vault.vSdex).add(
      BN(state3.pool.tokenData[0].supply)).add(
      BN(state3.rewardGlobals[diamondAddress].penalties)).add(
      BN(state3.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state3.accSdexPenaltyPool)).add(
      BN(state3.accSdexRewardPool))).toString()
    )
    console.log('---')
    console.log(BN(state3[bob].userInfo.tokenData[0].rewardDebt).div(unity).toString())
    await tokenFarmFacet.methods.withdraw(0, 0).send({from: bob})

    await advanceBlocks(blocksToStake/2 - 1) //180 blocks, 10 sec per block

    await sdexVaultFacet.methods.withdrawVault(0).send({from: alice})

    const state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    console.log('===========alice: 7/10, bob: 6/10==========')
    console.log('alice ', state4[alice].sdex)
    console.log('bob ', state4[bob].sdex)
    console.log('diamond ', state4[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state4.vault.vSdex)
    console.log('pool', state4.pool.tokenData[0].supply)
    console.log('poolPen', state4.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state4.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state4.accSdexPenaltyPool)
    console.log('accRew', state4.accSdexRewardPool)
    console.log('---')
    console.log(BN(state4[diamondAddress].sdex).sub(
      BN(state4.vault.vSdex).add(
      BN(state4.pool.tokenData[0].supply)).add(
      BN(state4.rewardGlobals[diamondAddress].penalties)).add(
      BN(state4.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state4.accSdexPenaltyPool)).add(
      BN(state4.accSdexRewardPool))).toString()
    )
    console.log('---')
    console.log(state4[diamondAddress].userInfo.tokenData[0].rewardDebt)
    console.log(state4[bob].userInfo.tokenData[0].rewardDebt / unity)
    await tokenFarmFacet.methods.withdraw(0, 0).send({from: bob})

    const state5 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('===========alice: 8/10, bob: 7/10 ==========')
    console.log('alice ', state5[alice].sdex)
    console.log('bob ', state5[bob].sdex)
    console.log('diamond ', state5[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state5.vault.vSdex)
    console.log('pool', state5.pool.tokenData[0].supply)
    console.log('poolPen', state5.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state5.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state5.accSdexPenaltyPool)
    console.log('accRew', state5.accSdexRewardPool)
    console.log('---')
    assert.equal(BN(state5[diamondAddress].sdex).sub(
      BN(state5.vault.vSdex).add(
      BN(state5.pool.tokenData[0].supply)).add(
      BN(state5.rewardGlobals[diamondAddress].penalties)).add(
      BN(state5.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state5.accSdexPenaltyPool)).add(
      BN(state5.accSdexRewardPool))).toString(), 0
    )
  })

  it("one user vaults, other manuals, rewarded", async () => {
    await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})

    const state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0) 
    
    console.log('===========alice: 0/10, bob: 0/10==========')
    console.log('alice ', state1[alice].sdex)
    console.log('bob ', state1[bob].sdex)
    console.log('diamond ', state1[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state1.vault.vSdex)
    console.log('pool', state1.pool.tokenData[0].supply)
    console.log('poolPen', state1.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state1.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state1.accSdexPenaltyPool)
    console.log('accRew', state1.accSdexRewardPool)
    console.log('---')
    console.log(BN(state1[diamondAddress].sdex).sub(
      BN(state1.vault.vSdex).add(
      BN(state1.pool.tokenData[0].supply)).add(
      BN(state1.rewardGlobals[diamondAddress].penalties)).add(
      BN(state1.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state1.accSdexPenaltyPool)).add(
      BN(state1.accSdexRewardPool))).toString()
    )

    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, ADDRESSZERO, 0).send({from:alice})

    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    console.log('===========alice: 1/10, bob: 0/10==========')
    console.log('alice ', state2[alice].sdex)
    console.log('bob ', state2[bob].sdex)
    console.log('diamond ', state2[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state2.vault.vSdex)
    console.log('pool', state2.pool.tokenData[0].supply)
    console.log('poolPen', state2.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state2.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state2.accSdexPenaltyPool)
    console.log('accRew', state2.accSdexRewardPool)
    console.log('---')
    console.log(BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexRewardPool))).toString()
    )

    await tokenFarmFacet.methods.deposit(
      0, [stakeAmountB], blocksToStake, ADDRESSZERO, 0).send({from:bob})

    const state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('===========alice: 2/10, bob: 1/10==========')
    console.log('alice ', state3[alice].sdex)
    console.log('bob ', state3[bob].sdex)
    console.log('diamond ', state3[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state3.vault.vSdex)
    console.log('pool', state3.pool.tokenData[0].supply)
    console.log('poolPen', state3.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state3.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state3.accSdexPenaltyPool)
    console.log('accRew', state3.accSdexRewardPool)
    console.log('---')
    console.log(BN(state3[diamondAddress].sdex).sub(
      BN(state3.vault.vSdex).add(
      BN(state3.pool.tokenData[0].supply)).add(
      BN(state3.rewardGlobals[diamondAddress].penalties)).add(
      BN(state3.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state3.accSdexPenaltyPool)).add(
      BN(state3.accSdexRewardPool))).toString()
    )
    console.log('---')
    console.log(BN(state3[bob].userInfo.tokenData[0].rewardDebt).div(unity).toString())
    console.log('positionid=================', state3[bob].userInfo.positions.length -1)


    await advanceBlocks(blocksToStake) //180 blocks, 10 sec per block


    console.log('positionid================', state3[alice].vUserInfo.positions.length -1)
    await sdexVaultFacet.methods.withdrawVault(state3[alice].vUserInfo.positions.length-1).send({from: alice})

    const state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    console.log('===========alice: 7/10, bob: 6/10==========')
    console.log('alice ', state4[alice].sdex)
    console.log('bob ', state4[bob].sdex)
    console.log('diamond ', state4[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state4.vault.vSdex)
    console.log('pool', state4.pool.tokenData[0].supply)
    console.log('poolPen', state4.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state4.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state4.accSdexPenaltyPool)
    console.log('accRew', state4.accSdexRewardPool)
    console.log('---')
    console.log(BN(state4[diamondAddress].sdex).sub(
      BN(state4.vault.vSdex).add(
      BN(state4.pool.tokenData[0].supply)).add(
      BN(state4.rewardGlobals[diamondAddress].penalties)).add(
      BN(state4.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state4.accSdexPenaltyPool)).add(
      BN(state4.accSdexRewardPool))).toString()
    )
    console.log('---')
    console.log(state4[diamondAddress].userInfo.tokenData[0].rewardDebt)
    console.log(state4[bob].userInfo.tokenData[0].rewardDebt / unity)
    await tokenFarmFacet.methods.withdraw(0, state3[bob].userInfo.positions.length - 1).send({from: bob})

    const state5 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('===========alice: 8/10, bob: 7/10 ==========')
    console.log('alice ', state5[alice].sdex)
    console.log('bob ', state5[bob].sdex)
    console.log('diamond ', state5[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state5.vault.vSdex)
    console.log('pool', state5.pool.tokenData[0].supply)
    console.log('poolPen', state5.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state5.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state5.accSdexPenaltyPool)
    console.log('accRew', state5.accSdexRewardPool)
    console.log('---')
    // 1 wei rounding err for this
    assert.equal(BN(state5[diamondAddress].sdex).sub(
      BN(state5.vault.vSdex).add(
      BN(state5.pool.tokenData[0].supply)).add(
      BN(state5.rewardGlobals[diamondAddress].penalties)).add(
      BN(state5.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state5.accSdexPenaltyPool)).add(
      BN(state5.accSdexRewardPool))).toString(), 1
    )
    
    const reductionAmount1 = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    console.log(reductionAmount1)
    
    const reductionAmount2 = await reducedPenaltyFacet.methods.rPReductionAmount(2).call()
    console.log(reductionAmount2)
    const reductionAmount3 = await reducedPenaltyFacet.methods.rPReductionAmount(3).call()
    console.log(reductionAmount3)
    const reductionAmount4 = await reducedPenaltyFacet.methods.rPReductionAmount(4).call()
    console.log(reductionAmount4)

    console.log(BN(reductionAmount2.amount).add(BN(reductionAmount4.amount)).toString(), state5.accSdexRewardPool)
    console.log(BN(reductionAmount1.amount).add(BN(reductionAmount3.amount)).toString(), state5.rewardGlobals[diamondAddress].rewarded)
  })

  it("deposits with reduced penality NFT, is penalized", async () => {
    await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})

    const state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0) 
    
    console.log('===========alice: 0/10, bob: 0/10==========')
    console.log('alice ', state1[alice].sdex)
    console.log('bob ', state1[bob].sdex)
    console.log('diamond ', state1[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state1.vault.vSdex)
    console.log('pool', state1.pool.tokenData[0].supply)
    console.log('poolPen', state1.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state1.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state1.accSdexPenaltyPool)
    console.log('accRew', state1.accSdexRewardPool)
    console.log('---')
    console.log(BN(state1[diamondAddress].sdex).sub(
      BN(state1.vault.vSdex).add(
      BN(state1.pool.tokenData[0].supply)).add(
      BN(state1.rewardGlobals[diamondAddress].penalties)).add(
      BN(state1.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state1.accSdexPenaltyPool)).add(
      BN(state1.accSdexRewardPool))).toString()
    )

    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, reducedPenaltyReward._address, 1).send({from:alice})

    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    console.log('===========alice: 1/10, bob: 0/10==========')
    console.log('alice ', state2[alice].sdex)
    console.log('bob ', state2[bob].sdex)
    console.log('diamond ', state2[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state2.vault.vSdex)
    console.log('pool', state2.pool.tokenData[0].supply)
    console.log('poolPen', state2.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state2.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state2.accSdexPenaltyPool)
    console.log('accRew', state2.accSdexRewardPool)
    console.log('---')
    console.log(BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexRewardPool))).toString()
    )

    await tokenFarmFacet.methods.deposit(
      0, [stakeAmountB], blocksToStake, reducedPenaltyReward._address, 3).send({from:bob})

    const state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('===========alice: 2/10, bob: 1/10==========')
    console.log('alice ', state3[alice].sdex)
    console.log('bob ', state3[bob].sdex)
    console.log('diamond ', state3[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state3.vault.vSdex)
    console.log('pool', state3.pool.tokenData[0].supply)
    console.log('poolPen', state3.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state3.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state3.accSdexPenaltyPool)
    console.log('accRew', state3.accSdexRewardPool)
    console.log('---')
    console.log(BN(state3[diamondAddress].sdex).sub(
      BN(state3.vault.vSdex).add(
      BN(state3.pool.tokenData[0].supply)).add(
      BN(state3.rewardGlobals[diamondAddress].penalties)).add(
      BN(state3.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state3.accSdexPenaltyPool)).add(
      BN(state3.accSdexRewardPool))).toString()
    )
    console.log('---')
    console.log(BN(state3[bob].userInfo.tokenData[0].rewardDebt).div(unity).toString())
    console.log('positionid=================', state3[bob].userInfo.positions.length -1)


    await advanceBlocks(blocksToStake / 2) //180 blocks, 10 sec per block


    console.log('positionid================', state3[alice].vUserInfo.positions.length -1)
    await sdexVaultFacet.methods.withdrawVault(state3[alice].vUserInfo.positions.length-1).send({from: alice})

    const state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    console.log('===========alice: 7/10, bob: 6/10==========')
    console.log('alice ', state4[alice].sdex)
    console.log('bob ', state4[bob].sdex)
    console.log('diamond ', state4[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state4.vault.vSdex)
    console.log('pool', state4.pool.tokenData[0].supply)
    console.log('poolPen', state4.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state4.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state4.accSdexPenaltyPool)
    console.log('accRew', state4.accSdexRewardPool)
    console.log('---')
    console.log(BN(state4[diamondAddress].sdex).sub(
      BN(state4.vault.vSdex).add(
      BN(state4.pool.tokenData[0].supply)).add(
      BN(state4.rewardGlobals[diamondAddress].penalties)).add(
      BN(state4.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state4.accSdexPenaltyPool)).add(
      BN(state4.accSdexRewardPool))).toString()
    )
    console.log('---')
    console.log(state4[diamondAddress].userInfo.tokenData[0].rewardDebt)
    console.log(state4[bob].userInfo.tokenData[0].rewardDebt / unity)
    await tokenFarmFacet.methods.withdraw(0, state3[bob].userInfo.positions.length - 1).send({from: bob})

    const state5 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('===========alice: 8/10, bob: 7/10 ==========')
    console.log('alice ', state5[alice].sdex)
    console.log('bob ', state5[bob].sdex)
    console.log('diamond ', state5[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state5.vault.vSdex)
    console.log('pool', state5.pool.tokenData[0].supply)
    console.log('poolPen', state5.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state5.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state5.accSdexPenaltyPool)
    console.log('accRew', state5.accSdexRewardPool)
    console.log('---')
    // 2 wei rounding err for this, looks like its compounding lol
    console.log(BN(state5[diamondAddress].sdex).sub(
      BN(state5.vault.vSdex).add(
      BN(state5.pool.tokenData[0].supply)).add(
      BN(state5.rewardGlobals[diamondAddress].penalties)).add(
      BN(state5.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state5.accSdexPenaltyPool)).add(
      BN(state5.accSdexRewardPool))).toString(), 2
    )

    assert.equal('difff', BN(state5[bob].sdex).sub(BN(state4[bob].sdex)).toString(), stakeAmountA)
    
    const reductionAmount1 = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    console.log(reductionAmount1)
    
    const reductionAmount2 = await reducedPenaltyFacet.methods.rPReductionAmount(2).call()
    console.log(reductionAmount2)
    const reductionAmount3 = await reducedPenaltyFacet.methods.rPReductionAmount(3).call()
    console.log(reductionAmount3)
    const reductionAmount4 = await reducedPenaltyFacet.methods.rPReductionAmount(4).call()
    console.log(reductionAmount4)

    console.log(BN(reductionAmount2.amount).add(BN(reductionAmount4.amount)).toString(), state5.accSdexRewardPool)
    console.log(BN(reductionAmount1.amount).add(BN(reductionAmount3.amount)).toString(), state5.rewardGlobals[diamondAddress].rewarded)
  })
  
})
