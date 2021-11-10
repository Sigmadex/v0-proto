
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
  let stakeAmountA = web3.utils.toWei('3', 'ether')
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

    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0)

    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)


    console.log('===========alice: 1/10, bob: 0/10==========')
    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmountA)).toString(), state2[alice].sdex)
    console.log('bob ', state2[bob].sdex)
    assert.equal(state2[diamondAddress].sdex, BN(state1[diamondAddress].sdex).add(BN(stakeAmountA)).toString())
    console.log('---')

    assert.equal(0, state2.vault.vSdex)
    assert.equal(stakeAmountA, state2.pool.tokenData[0].supply)
    assert.equal(state2.rewardGlobals[diamondAddress].penalties, 0)
    assert.equal(state2.rewardGlobals[diamondAddress].rewarded, 0)
    assert.equal(state2.accSdexPenaltyPool, 0)
    assert.equal(state2.accSdexRewardPool, 0)
    console.log('---')
    assert.equal(BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexRewardPool))).toString(), 0
    )

    await tokenFarmFacet.methods.deposit(
      0, [stakeAmountB], blocksToStake, ADDRESSZERO, 0).send({from:bob})

    const state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('===========alice: 2/10, bob: 1/10==========')
    console.log(state2[alice].sdex, state3[alice].sdex)
    assert.equal(state3[bob].sdex, BN(state2[bob].sdex).sub(BN(stakeAmountB)).toString())
    assert.equal(state3[diamondAddress].sdex, BN(state2[diamondAddress].sdex).add(BN(stakeAmountB).add(rewardPerBlock)).toString())
    console.log('---')
    assert.equal(0, state3.vault.vSdex)
    assert.equal(BN(stakeAmountA).add(BN(stakeAmountB)).toString(), state3.pool.tokenData[0].supply)
    assert.equal(0, state3.rewardGlobals[diamondAddress].penalties)
    assert.equal(0, state3.rewardGlobals[diamondAddress].rewarded)
    assert.equal(0, state3.accSdexPenaltyPool)
    assert.equal(0, state3.accSdexRewardPool)
    console.log('---')
    assert.equal(BN(state3[diamondAddress].sdex).sub(
      BN(state3.vault.vSdex).add(
      BN(state3.pool.tokenData[0].supply)).add(
      BN(state3.rewardGlobals[diamondAddress].penalties)).add(
      BN(state3.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state3.accSdexPenaltyPool)).add(
      BN(state3.accSdexRewardPool))).toString(), rewardPerBlock.toString()
    )
    
    await tokenFarmFacet.methods.withdraw(0, 0).send({from: bob})

    const state35 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    const proportionBlockReward = BN(stakeAmountB).mul(unity).div(BN(stakeAmountB).add(BN(stakeAmountA)))
    const blockReward = proportionBlockReward.mul(rewardPerBlock).div(unity)


    const {refund:bobRefund1, penalty:bobPenalty1} = calcPenalty(1, blocksToStake, stakeAmountB) 
    console.log('bobrefun1', bobRefund1.toString())
    console.log('bobpenalty1', bobPenalty1.toString())
    console.log('blockrewardtest', blockReward.toString())
    console.log('========35-start=============')
    console.log('alice ', state35[alice].sdex)
    assert.equal(BN(state3[bob].sdex).add(bobRefund1).toString(), state35[bob].sdex)
    assert.equal(BN(state3[diamondAddress].sdex).add(rewardPerBlock).sub(bobRefund1).toString(), state35[diamondAddress].sdex)
    console.log('---')
    assert.equal(0, state35.vault.vSdex)
    assert.equal(stakeAmountA, state35.pool.tokenData[0].supply)
    assert.equal(bobPenalty1.toString(), state35.rewardGlobals[diamondAddress].penalties)
    assert.equal(0, state35.rewardGlobals[diamondAddress].rewarded)
    assert.equal(blockReward.toString(), state35.accSdexPenaltyPool)
    assert.equal(0, state35.accSdexRewardPool)
    console.log('---')
    assert.equal(BN(state35[diamondAddress].sdex).sub(
      BN(state35.vault.vSdex).add(
      BN(state35.pool.tokenData[0].supply)).add(
      BN(state35.rewardGlobals[diamondAddress].penalties)).add(
      BN(state35.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state35.accSdexPenaltyPool)).add(
        BN(state35.accSdexRewardPool))).toString(), BN(rewardPerBlock).add(BN(rewardPerBlock).sub(blockReward)).toString()
    )
    console.log('========35-end=============')

    await advanceBlocks(blocksToStake/2 - 1) //180 blocks, 10 sec per block
    await sdexVaultFacet.methods.withdrawVault(0).send({from: alice})

    const blockRewards4  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 5 , 0)

    const proportionBlockReward4 = BN(stakeAmountA).mul(unity).div(BN(0).add(BN(stakeAmountA)))

    //const blockReward4 = proportionBlockReward.mul(blockRewards4).div(unity)
    
    const {refund, penalty} = calcPenalty(blocksToStake/2 + 2, blocksToStake, stakeAmountA) 
    console.log(refund.toString(), penalty.toString())
    console.log('^---refund, ^----penalty')


    const state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    console.log('===========alice: 7/10, bob: 6/10==========')
    assert.equal( state4[alice].sdex, BN(state35[alice].sdex).add(refund).toString())
    assert.equal(state4[diamondAddress].sdex, BN(state35[diamondAddress].sdex).add(BN(blockRewards4)).sub(refund).toString())
    console.log('---')
    console.log('vSdex', state4.vault.vSdex)
    assert.equal(0, state4.pool.tokenData[0].supply)
    console.log('poolRew', state4.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state4.accSdexPenaltyPool)
    console.log(0, state4.accSdexRewardPool)
    console.log('---')
    console.log('accnt ', BN(state4[diamondAddress].sdex).sub(
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
      BN(state5.accSdexRewardPool))).toString(), 1
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
    
    await advanceBlocks(blocksToStake) //180 blocks, 10 sec per block


    await sdexVaultFacet.methods.withdrawVault(state3[alice].vUserInfo.positions.length-1).send({from: alice})

    const state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    console.log('====:)=======alice: 7/10, bob: 6/10======:)====')
    console.log('alice    ', state4[alice].sdex)
    console.log('bob      ', state4[bob].sdex)
    console.log('diamond  ', state4[diamondAddress].sdex)
    console.log('---------')
    console.log('vSdex    ', state4.vault.vSdex)
    console.log('pool     ', state4.pool.tokenData[0].supply)
    console.log('poolPen  ', state4.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew  ', state4.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen   ', state4.accSdexPenaltyPool)
    console.log('accRew   ', state4.accSdexRewardPool)
    console.log('---------')
    console.log('accnt    ', BN(state4[diamondAddress].sdex).sub(
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
      BN(state5.accSdexRewardPool))).toString(), 2
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
    console.log('poolPay', state1.rewardGlobals[diamondAddress].paidOut)
    console.log('accPen', state1.accSdexPenaltyPool)
    console.log('accRew', state1.accSdexRewardPool)
    console.log('accPay', state1.accSdexPaidOut)
    console.log('---')
    console.log('Sdex Accounting', BN(state1[diamondAddress].sdex).sub(
      BN(state1.vault.vSdex).add(
      BN(state1.pool.tokenData[0].supply)).add(
      BN(state1.rewardGlobals[diamondAddress].penalties)).add(
      BN(state1.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state1.rewardGlobals[diamondAddress].paidOut)).add(
      BN(state1.accSdexPenaltyPool)).add(
      BN(state1.accSdexPaidOut)).add(
      BN(state1.accSdexRewardPool))).toString(), 1
    )
    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, reducedPenaltyReward._address, 1).send({from:alice})

    const state2ReductionAmount1 = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
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
    console.log('Sdex Accounting', BN(state2[diamondAddress].sdex).sub(
      BN(state2.vault.vSdex).add(
      BN(state2.pool.tokenData[0].supply)).add(
      BN(state2.rewardGlobals[diamondAddress].penalties)).add(
      BN(state2.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state2.rewardGlobals[diamondAddress].paidOut)).add(
      BN(state2.accSdexPenaltyPool)).add(
      BN(state2.accSdexPaidOut)).add(
      BN(state2.accSdexRewardPool))).toString(), 2
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
    console.log('Sdex Accounting', BN(state3[diamondAddress].sdex).sub(
      BN(state3.vault.vSdex).add(
      BN(state3.pool.tokenData[0].supply)).add(
      BN(state3.rewardGlobals[diamondAddress].penalties)).add(
      BN(state3.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state3.accSdexPenaltyPool)).add(
      BN(state3.accSdexRewardPool))).toString(), 2
    )
    console.log('---')
    console.log(BN(state3[bob].userInfo.tokenData[0].rewardDebt).div(unity).toString())
    console.log('positionid=================', state3[bob].userInfo.positions.length -1)


    await advanceBlocks(blocksToStake / 2) //180 blocks, 10 sec per block

    await sdexVaultFacet.methods.withdrawVault(state3[alice].vUserInfo.positions.length-1).send({from: alice})

    const state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    console.log('===========alice: 7/10, bob: 6/10==========')
    console.log('alice ', state4[alice].sdex)
    console.log('bob ', state4[bob].sdex)
    console.log('diamond', state4[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex  ', state4.vault.vSdex)
    console.log('pool   ', state4.pool.tokenData[0].supply)
    console.log('poolPen', state4.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state4.rewardGlobals[diamondAddress].rewarded)
    console.log('poolPay', state4.rewardGlobals[diamondAddress].paidOut)
    console.log('accPen ', state4.accSdexPenaltyPool)
    console.log('accRew ', state4.accSdexRewardPool)
    console.log('accPay ', state4.accSdexPaidOut)
    console.log('---')
    console.log('sdexact', BN(state4[diamondAddress].sdex).sub(
      BN(state4.vault.vSdex).add(
      BN(state4.pool.tokenData[0].supply)).add(
      BN(state4.rewardGlobals[diamondAddress].penalties)).add(
      BN(state4.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state4.accSdexPenaltyPool)).add(
      BN(state4.accSdexRewardPool))).toString(), 2
    )
    console.log('---')
    
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
    console.log('Sdex Accounting', BN(state5[diamondAddress].sdex).sub(
      BN(state5.vault.vSdex).add(
      BN(state5.pool.tokenData[0].supply)).add(
      BN(state5.rewardGlobals[diamondAddress].penalties)).add(
      BN(state5.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state5.accSdexPenaltyPool)).add(
      BN(state5.accSdexRewardPool))).toString(), 2
    )
    assert.equal(BN(state5[bob].sdex).sub(BN(state4[bob].sdex)).toString(), stakeAmountB)
    assert.equal(BN(state4[alice].sdex).sub(BN(state3[alice].sdex)).toString(), stakeAmountA)

    let reductionAmount1 = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    let reductionAmount2 = await reducedPenaltyFacet.methods.rPReductionAmount(2).call()
    let reductionAmount3 = await reducedPenaltyFacet.methods.rPReductionAmount(3).call()
    let reductionAmount4 = await reducedPenaltyFacet.methods.rPReductionAmount(4).call()


    assert.equal(BN(reductionAmount2.amount).add(BN(reductionAmount4.amount)).toString(), state5.accSdexRewardPool)
    assert.equal(BN(reductionAmount1.amount).add(BN(reductionAmount3.amount)).toString(), state5.rewardGlobals[diamondAddress].rewarded)


    await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})


    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, reducedPenaltyReward._address, 2).send({from:alice})

    const state6 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('alice ', state6[alice].sdex)
    console.log('bob ', state6[bob].sdex)
    console.log('diamond ', state6[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state6.vault.vSdex)
    console.log('pool', state6.pool.tokenData[0].supply)
    console.log('poolPen', state6.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state6.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state6.accSdexPenaltyPool)
    console.log('accRew', state6.accSdexRewardPool)
    console.log('---')
    // 2 wei rounding err for this, looks like its compounding lol
    console.log('Sdex Accounting', BN(state6[diamondAddress].sdex).sub(
      BN(state6.vault.vSdex).add(
      BN(state6.pool.tokenData[0].supply)).add(
      BN(state6.rewardGlobals[diamondAddress].penalties)).add(
      BN(state6.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state6.accSdexPenaltyPool)).add(
      BN(state6.accSdexRewardPool))).toString(), 2
    )

    await tokenFarmFacet.methods.deposit(
      0, [stakeAmountB], blocksToStake, reducedPenaltyReward._address, 4).send({from:bob})

    const state7 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('alice ', state7[alice].sdex)
    console.log('bob ', state7[bob].sdex)
    console.log('diamond ', state7[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state7.vault.vSdex)
    console.log('pool', state7.pool.tokenData[0].supply)
    console.log('poolPen', state7.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state7.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state7.accSdexPenaltyPool)
    console.log('accRew', state7.accSdexRewardPool)
    console.log('---')
    // 2 wei rounding err for this, looks like its compounding lol
    console.log('Sdex Accounting', BN(state7[diamondAddress].sdex).sub(
      BN(state7.vault.vSdex).add(
      BN(state7.pool.tokenData[0].supply)).add(
      BN(state7.rewardGlobals[diamondAddress].penalties)).add(
      BN(state7.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state7.accSdexPenaltyPool)).add(
      BN(state7.accSdexRewardPool))).toString(), 2
    )
    

    await sdexVaultFacet.methods.withdrawVault(state7[alice].vUserInfo.positions.length-1).send({from: alice})
 

    const state8 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('alice ', state8[alice].sdex)
    console.log('bob ', state8[bob].sdex)
    console.log('diamond ', state8[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state8.vault.vSdex)
    console.log('pool', state8.pool.tokenData[0].supply)
    console.log('poolPen', state8.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state8.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state8.accSdexPenaltyPool)
    console.log('accRew', state8.accSdexRewardPool)
    console.log('---')
    // 2 wei rounding err for this, looks like its compounding lol
    console.log('Sdex Accounting', BN(state8[diamondAddress].sdex).sub(
      BN(state8.vault.vSdex).add(
      BN(state8.pool.tokenData[0].supply)).add(
      BN(state8.rewardGlobals[diamondAddress].penalties)).add(
      BN(state8.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state8.accSdexPenaltyPool)).add(
      BN(state8.accSdexRewardPool))).toString(), 2
    )
    await tokenFarmFacet.methods.withdraw(0, state8[bob].userInfo.positions.length - 1).send({from: bob})

    const state9 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    console.log('alice', alice)
    console.log('alice ', state9[alice].sdex)
    console.log('bob', bob)
    console.log('bob ', state9[bob].sdex)
    console.log('diamond ', state9[diamondAddress].sdex)
    console.log('---')
    console.log('vSdex', state9.vault.vSdex)
    console.log('pool', state9.pool.tokenData[0].supply)
    console.log('poolPen', state9.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew', state9.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen', state9.accSdexPenaltyPool)
    console.log('accRew', state9.accSdexRewardPool)
    console.log('---')
    // 2 wei rounding err for this, looks like its compounding lol
    console.log('Sdex Accounting:', BN(state9[diamondAddress].sdex).sub(
      BN(state9.vault.vSdex).add(
      BN(state9.pool.tokenData[0].supply)).add(
      BN(state9.rewardGlobals[diamondAddress].penalties)).add(
      BN(state9.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state9.accSdexPenaltyPool)).add(
      BN(state9.accSdexRewardPool))).toString(), 2
    )
    reductionAmount1 = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    reductionAmount2 = await reducedPenaltyFacet.methods.rPReductionAmount(2).call()
    reductionAmount3 = await reducedPenaltyFacet.methods.rPReductionAmount(3).call()
    reductionAmount4 = await reducedPenaltyFacet.methods.rPReductionAmount(4).call()
    console.log(reductionAmount1, reductionAmount2, reductionAmount3, reductionAmount4)

    assert.equal(BN(reductionAmount2.amount).add(BN(reductionAmount4.amount)).toString(), state9.accSdexRewardPool)
    assert.equal(BN(reductionAmount1.amount).add(BN(reductionAmount3.amount)).toString(), state9.rewardGlobals[diamondAddress].rewarded)


    await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})



    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, reducedPenaltyReward._address, 1).send({from:alice})
    await tokenFarmFacet.methods.deposit(
      0, [stakeAmountB], blocksToStake, reducedPenaltyReward._address, 3).send({from:bob})

    const state10 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    
    await advanceBlocks(blocksToStake / 3) //180 blocks, 10 sec per block

    await tokenFarmFacet.methods.withdraw(0, state10[bob].userInfo.positions.length - 1).send({from: bob})

    await sdexVaultFacet.methods.withdrawVault(state10[alice].vUserInfo.positions.length-1).send({from: alice})

    reductionAmount1 = await reducedPenaltyFacet.methods.rPReductionAmount(1).call()
    reductionAmount2 = await reducedPenaltyFacet.methods.rPReductionAmount(2).call()
    reductionAmount3 = await reducedPenaltyFacet.methods.rPReductionAmount(3).call()
    reductionAmount4 = await reducedPenaltyFacet.methods.rPReductionAmount(4).call()

    const state11 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('====:)=======fin======:)====')
    console.log('alice    ', state11[alice].sdex)
    console.log('bob      ', state11[bob].sdex)
    console.log('diamond  ', state11[diamondAddress].sdex)
    console.log('---------')
    console.log('vSdex    ', state11.vault.vSdex)
    console.log('pool     ', state11.pool.tokenData[0].supply)
    console.log('poolPen  ', state11.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew  ', state11.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen   ', state11.accSdexPenaltyPool)
    console.log('accRew   ', state11.accSdexRewardPool)
    console.log('---------')
    console.log('accnt    ', BN(state11[diamondAddress].sdex).sub(
      BN(state11.vault.vSdex).add(
      BN(state11.pool.tokenData[0].supply)).add(
      BN(state11.rewardGlobals[diamondAddress].penalties)).add(
      BN(state11.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state11.accSdexPenaltyPool)).add(
      BN(state11.accSdexRewardPool))).toString()
    )


    assert.equal(BN(reductionAmount2.amount).add(BN(reductionAmount4.amount)).toString(), state11.accSdexRewardPool)
    assert.equal(BN(reductionAmount1.amount).add(BN(reductionAmount3.amount)).toString(), state11.rewardGlobals[diamondAddress].rewarded)

    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})

    await tokenFarmFacet.methods.deposit(
      0, [stakeAmountB], blocksToStake, ADDRESSZERO, 0).send({from:bob})

    const state12 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('====:)=======fin======:)====')
    console.log('alice    ', state12[alice].sdex)
    console.log('bob      ', state12[bob].sdex)
    console.log('diamond  ', state12[diamondAddress].sdex)
    console.log('---------')
    console.log('vSdex    ', state12.vault.vSdex)
    console.log('pool     ', state12.pool.tokenData[0].supply)
    console.log('poolPen  ', state12.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew  ', state12.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen   ', state12.accSdexPenaltyPool)
    console.log('accRew   ', state12.accSdexRewardPool)
    console.log('---------')
    console.log('accnt    ', BN(state12[diamondAddress].sdex).sub(
      BN(state12.vault.vSdex).add(
      BN(state12.pool.tokenData[0].supply)).add(
      BN(state12.rewardGlobals[diamondAddress].penalties)).add(
      BN(state12.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state12.accSdexPenaltyPool)).add(
      BN(state12.accSdexRewardPool))).toString()
    )

    await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})

    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, ADDRESSZERO, 0).send({from:alice})

    const state13 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('====:)=======fin======:)====')
    console.log('alice    ', state13[alice].sdex)
    console.log('bob      ', state13[bob].sdex)
    console.log('diamond  ', state13[diamondAddress].sdex)
    console.log('---------')
    console.log('vSdex    ', state13.vault.vSdex)
    console.log('pool     ', state13.pool.tokenData[0].supply)
    console.log('poolPen  ', state13.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew  ', state13.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen   ', state13.accSdexPenaltyPool)
    console.log('accRew   ', state13.accSdexRewardPool)
    console.log('---------')
    console.log('accnt    ', BN(state13[diamondAddress].sdex).sub(
      BN(state13.vault.vSdex).add(
      BN(state13.pool.tokenData[0].supply)).add(
      BN(state13.rewardGlobals[diamondAddress].penalties)).add(
      BN(state13.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state13.accSdexPenaltyPool)).add(
      BN(state13.accSdexRewardPool))).toString()
    )


    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})

    await tokenFarmFacet.methods.deposit(
      0, [stakeAmountB], blocksToStake, ADDRESSZERO, 0).send({from:bob})

    const state14 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('====:)=======fin======:)====')
    console.log('alice    ', state14[alice].sdex)
    console.log('bob      ', state14[bob].sdex)
    console.log('diamond  ', state14[diamondAddress].sdex)
    console.log('---------')
    console.log('vSdex    ', state14.vault.vSdex)
    console.log('pool     ', state14.pool.tokenData[0].supply)
    console.log('poolPen  ', state14.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew  ', state14.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen   ', state14.accSdexPenaltyPool)
    console.log('accRew   ', state14.accSdexRewardPool)
    console.log('---------')
    console.log('accnt    ', BN(state14[diamondAddress].sdex).sub(
      BN(state14.vault.vSdex).add(
      BN(state14.pool.tokenData[0].supply)).add(
      BN(state14.rewardGlobals[diamondAddress].penalties)).add(
      BN(state14.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state14.accSdexPenaltyPool)).add(
      BN(state14.accSdexRewardPool))).toString()
    )


    await advanceBlocks(blocksToStake) //180 blocks, 10 sec per block

    await tokenFarmFacet.methods.withdraw(0, state14[bob].userInfo.positions.length - 1).send({from: bob})

    const state15 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    console.log('====:)=======fin======:)====')
    console.log('alice    ', state15[alice].sdex)
    console.log('bob      ', state15[bob].sdex)
    console.log('diamond  ', state15[diamondAddress].sdex)
    console.log('---------')
    console.log('vSdex    ', state15.vault.vSdex)
    console.log('pool     ', state15.pool.tokenData[0].supply)
    console.log('poolPen  ', state15.rewardGlobals[diamondAddress].penalties)
    console.log('poolRew  ', state15.rewardGlobals[diamondAddress].rewarded)
    console.log('accPen   ', state15.accSdexPenaltyPool)
    console.log('accRew   ', state15.accSdexRewardPool)
    console.log('---------')
    console.log('accnt    ', BN(state15[diamondAddress].sdex).sub(
      BN(state15.vault.vSdex).add(
      BN(state15.pool.tokenData[0].supply)).add(
      BN(state15.rewardGlobals[diamondAddress].penalties)).add(
      BN(state15.rewardGlobals[diamondAddress].rewarded)).add(
      BN(state15.accSdexPenaltyPool)).add(
      BN(state15.accSdexRewardPool))).toString()
    )
  })
})
