
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


function logState(state, tag, alice, diamondAddress) {
  console.log(`=====================begin: ${tag}=====================`)
  console.log('block   ', state.blockNumber)
  console.log('--------')
  console.log('accounts')
  console.log('--------')
  console.log('alice   ', state[alice].sdex)
  console.log('diamond ', state[diamondAddress].sdex)
  console.log('--------')
  console.log('state   ')
  console.log('--------')
  console.log('rwddebt ', BN(state[diamondAddress].userInfo.tokenData[0].totalRewardDebt).div(unity).toString())
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
  console.log(`=====================end: ${tag}=====================`)
}
contract("SdexVaultFacet Many Deposits", (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let users = [alice]
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
  const stakeTime = 3600
  let diamondAddress
  let stakeAmount = web3.utils.toWei('5', 'ether')

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

  it("stakes many times to Vault Separately", async () => {
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0)

    const state0 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, ADDRESSZERO, 0).send({from:alice})
    const state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    let accSdex0 = rewardPerBlock
    let accSdex1;
    let accSdex2;
    logState(state1, 'state1', alice, diamondAddress)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, ADDRESSZERO, 0).send({from:alice})
    
    accSdex0 = accSdex0.add(rewardPerBlock.div(BN(2)))
    accSdex1 = rewardPerBlock.div(BN(2))
    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    logState(state2, 'state2', alice, diamondAddress)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, ADDRESSZERO, 0).send({from:alice})
    const state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    accSdex0 = accSdex0.add(rewardPerBlock.div(BN(3)))
    accSdex1 = accSdex1.add(rewardPerBlock.div(BN(3)))
    accSdex2 = rewardPerBlock.div(BN(3))
    logState(state3, 'state3', alice, diamondAddress)

    await advanceChain(24, 10)
    rewardPer5Block = rewardPerBlock.mul(BN(3))
    accSdex0 = accSdex0.add(rewardPer5Block.div(BN(3)))
    accSdex1 = accSdex1.add(rewardPer5Block.div(BN(3)))
    accSdex2 = accSdex2.add(rewardPer5Block.div(BN(3)))

    //await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:bob})
    //await sdexVaultFacet.methods.depositVault(
    //stakeAmount, stakeTime, ADDRESSZERO, 0).send({from:bob})
    await sdexVaultFacet.methods.harvest().send({from:bob})

    const state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    logState(state4, 'state4', alice, diamondAddress)
    await sdexVaultFacet.methods.withdrawVault(0).send({from: alice})

    const state5 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    logState(state5, 'state5', alice, diamondAddress)
    accSdex0 = accSdex0.add(rewardPerBlock.div(BN(3)))
    accSdex1 = accSdex1.add(rewardPerBlock.div(BN(3)))
    accSdex2 = rewardPerBlock.div(BN(3))
    console.log(state0[alice].sdex)
    console.log(BN(state0[alice].sdex).sub(BN(stakeAmount)).sub(BN(stakeAmount)).sub(BN(stakeAmount)).toString())
    console.log(state3[alice].sdex)
    console.log(BN(state3[alice].sdex).add(BN(stakeAmount)).toString())
    console.log('calc test', accSdex0.toString())
    console.log('rewarded', BN(state5[alice].sdex).sub(BN(state3[alice].sdex).add(BN(stakeAmount))).toString())
    console.log('stakeamt', stakeAmount)

  })
})
