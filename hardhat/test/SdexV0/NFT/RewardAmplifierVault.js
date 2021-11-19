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
const RewardAmplifierRewardFacet = artifacts.require('RewardAmplifierRewardFacet')
const IncreasedBlockRewardFacet = artifacts.require('IncreasedBlockRewardFacet')

const RewardAmplifierReward = artifacts.require('RewardAmplifierReward')
const IncreasedBlockReward = artifacts.require('IncreasedBlockReward')
const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')

function logState(state, tag, alice, bob, diamondAddress) {
  console.log(`=====================${tag}=====================`)
  console.log('block   ', state.blockNumber)
  console.log('--------')
  console.log('accounts')
  console.log('--------')
  console.log('alice   ', state[alice].sdex)
  console.log('bob     ', state[bob].sdex)
  console.log('diamond ', state[diamondAddress].sdex)
  console.log('--------')
  console.log('state   ')
  console.log('--------')
  console.log('vSdex   ', state.vault.vSdex)
  console.log('pool    ', state.pool.tokenData[0].supply)
  console.log('poolPen ', state.rewardGlobals[diamondAddress].penalties)
  console.log('poolRew ', state.rewardGlobals[diamondAddress].rewarded)
  console.log('accPen  ', state.accSdexPenaltyPool)
  console.log('accRew  ', state.accSdexRewardPool)
  console.log('--------')
  console.log('balance ', BN(state[diamondAddress].sdex).sub(
    BN(state.vault.vSdex).add(
      BN(state.pool.tokenData[0].supply)).add(
        BN(state.rewardGlobals[diamondAddress].penalties)).add(
          BN(state.rewardGlobals[diamondAddress].rewarded)).add(
            BN(state.accSdexPenaltyPool)).add(
              BN(state.accSdexRewardPool))).toString(), 1
  )
}
contract("SdexVaultFacet", (accounts) => {
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
  let increasedBlockRewardFacet;
  let increasedBlockReward;
  let rewardAmplifierRewardFacet;
  let rewardAmplifierReward;
  let tokenA;
  let tokenB;
  let rPRAddress;
  let iBRAddress;
  let rARAddress
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
    increasedBlockRewardFacet = new web3.eth.Contract(IncreasedBlockRewardFacet.abi, diamondAddress) 
    rewardAmplifierRewardFacet = new web3.eth.Contract(RewardAmplifierRewardFacet.abi, diamondAddress)

    rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()
    iBRAddress = await increasedBlockRewardFacet.methods.iBRAddress().call()
    rARAddress = await rewardAmplifierRewardFacet.methods.rARAddress().call()
    reducedPenaltyReward = new web3.eth.Contract(ReducedPenaltyReward.abi, rPRAddress)
    increasedBlockReward = new web3.eth.Contract(IncreasedBlockReward.abi, iBRAddress)
    rewardAmplifierReward = new web3.eth.Contract(RewardAmplifierReward.abi, rARAddress)

    const amount = web3.utils.toWei('1000', 'ether')

    await sdexFacet.methods.executiveMint(alice, amount).send({ from: owner })
    await sdexFacet.methods.executiveMint(bob, amount).send({ from: owner })
  })

  it("increased Block Reward to sdex", async () => {
    await rewardFacet.methods.addReward(diamondAddress, rARAddress).send({from:owner})
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
    assert.equal(validRewardsSdex[0], rARAddress)
  })

  it("Bob 'funds' penalty pool, alice gets blockReward NFT", async () => {
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:bob})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)


    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, ADDRESSZERO, 0).send({from:alice})

    await advanceBlocks(blocksToStake - 2)
    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, ADDRESSZERO, 0).send({from:bob})

    await sdexVaultFacet.methods.withdrawVault(0).send({from: bob})

    await sdexVaultFacet.methods.withdrawVault(0).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    logState(state3, 'state3::alice::withdraw', alice,bob, diamondAddress)

    let nft1 = await rewardAmplifierReward.methods.balanceOf(alice , 1).call()
    let rewardAmount1 = await rewardAmplifierRewardFacet.methods.rARAmount(1).call()
    assert.equal(nft1, 1)
    assert.equal(rewardAmount1.token, diamondAddress)
    assert.equal(rewardAmount1.amount, state3.rewardGlobals[diamondAddress].rewarded)
    assert.equal(rewardAmount1.rewardPool, 0) // ENUM for token reward pool
    let nft2 = await rewardAmplifierReward.methods.balanceOf(alice , 2).call()
    let rewardAmount2 = await rewardAmplifierRewardFacet.methods.rARAmount(2).call()
    assert.equal(nft2, 1)
    assert.equal(rewardAmount2.token, diamondAddress)
    assert.equal(rewardAmount2.amount, state3.accSdexRewardPool)
    assert.equal(rewardAmount2.rewardPool, 1) // ENBUm for accumulated Sdex Penalty Pool
  })

  it('calculates correctly over 1 interval', async () => {
    const nftid = 1
    const positionid = 1
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1_1 = await rewardAmplifierRewardFacet.methods.rARAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, rARAddress, nftid).send({from:alice})
    
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    await advanceBlocks(blocksToStake - 1)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    //const {refund, penalty} = calcPenalty(2, blocksToStake, stakeAmount) 
    let rewardAmount1_2 = await rewardAmplifierRewardFacet.methods.rARAmount(nftid).call()
    let rewardAmount3_2 = await rewardAmplifierRewardFacet.methods.rARAmount(3).call()
    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmount)).toString(), state2[alice].sdex)
    
    const harvestReward =  BN(state3[alice].sdex).sub(BN(state2[alice].sdex))
    console.log('harvest Reward: ', harvestReward.toString())

    const accruedSdex = BN(rewardPerBlock.mul(BN(2))).sub(harvestReward).sub(BN(state3.vault.vTreasury))

    //const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(2, blocksToStake, accruedSdex)

    assert.equal(rewardAmount1_2.amount, 0)
    assert.equal(rewardAmount3_2.amount, rewardAmount1_1.amount)
    assert.equal(state4.rewardGlobals[diamondAddress].rewarded, state1.rewardGlobals[diamondAddress].rewarded)
  })

  it('calculates correctly over 3 interval, bob reseeds', async () => {

    const nftid = 3
    const positionid = 2

    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:bob})


    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1_1 = await rewardAmplifierRewardFacet.methods.rARAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, rARAddress, nftid).send({from:alice})
    
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, ADDRESSZERO, 0).send({from:bob})

    await sdexVaultFacet.methods.withdrawVault(1).send({from: bob})

    await advanceBlocks(blocksToStake - 3)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    //const {refund, penalty} = calcPenalty(2, blocksToStake, stakeAmount) 
    let rewardAmount1_2 = await rewardAmplifierRewardFacet.methods.rARAmount(nftid).call()
    let rewardAmount3_2 = await rewardAmplifierRewardFacet.methods.rARAmount(5).call()
    
    assert.equal(rewardAmount3_2.amount, BN(rewardAmount1_1.amount).add(BN(state3.rewardGlobals[diamondAddress].penalties)).toString())
    assert.equal(state4.rewardGlobals[diamondAddress].penalties, 0)
    assert.equal(state4.rewardGlobals[diamondAddress].rewarded, rewardAmount3_2.amount)
    assert.equal(state4.rewardGlobals[diamondAddress].paidOut, 0)
  })
  it('calculates correctly over 1 interval (Acc Pool)', async () => {
    const nftid = 2
    const positionid = 3
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1_1 = await rewardAmplifierRewardFacet.methods.rARAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, rARAddress, nftid).send({from:alice})
    
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    await advanceBlocks(blocksToStake - 1)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    //const {refund, penalty} = calcPenalty(2, blocksToStake, stakeAmount) 
    let rewardAmount1_2 = await rewardAmplifierRewardFacet.methods.rARAmount(nftid).call()
    let rewardAmount3_2 = await rewardAmplifierRewardFacet.methods.rARAmount(8).call()
    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmount)).toString(), state2[alice].sdex)
    
    const harvestReward =  BN(state3[alice].sdex).sub(BN(state2[alice].sdex))
    console.log('harvest Reward: ', harvestReward.toString())
    console.log(rewardAmount1_1, rewardAmount1_2, rewardAmount3_2)
    console.log('diff', rewardAmount3_2.amount - rewardAmount1_1.amount)

    const accruedSdex = BN(rewardPerBlock.mul(BN(2))).sub(harvestReward).sub(BN(state3.vault.vTreasury))

    //const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(2, blocksToStake, accruedSdex)
    console.log(state1.accSdexPenaltyPool, state4.accSdexPenaltyPool)
    //assert.equal(rewardAmount1_2.amount, 0)
    //assert.equal(state4.rewardGlobals[diamondAddress].rewarded, state1.rewardGlobals[diamondAddress].rewarded)
  })

})
