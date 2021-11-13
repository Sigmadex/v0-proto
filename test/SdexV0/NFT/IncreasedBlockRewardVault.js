
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
const IncreasedBlockRewardFacet = artifacts.require('IncreasedBlockRewardFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')
const IncreasedBlockReward = artifacts.require('IncreasedBlockReward')

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
  let tokenA;
  let tokenB;
  let rPRAddress;
  let iBRAddress;
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

    rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()
    iBRAddress = await increasedBlockRewardFacet.methods.iBRAddress().call()

    reducedPenaltyReward = new web3.eth.Contract(ReducedPenaltyReward.abi, rPRAddress)
    increasedBlockReward = new web3.eth.Contract(IncreasedBlockReward.abi, iBRAddress)

    const amount = web3.utils.toWei('1000', 'ether')

    await sdexFacet.methods.executiveMint(alice, amount).send({ from: owner })
    await sdexFacet.methods.executiveMint(bob, amount).send({ from: owner })
  })

  it("increased Block Reward to sdex", async () => {
    await rewardFacet.methods.addReward(diamondAddress, iBRAddress).send({from:owner})
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
    assert.equal(validRewardsSdex[0], iBRAddress)
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

    let nft1 = await increasedBlockReward.methods.balanceOf(alice , 1).call()
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(1).call()
    assert.equal(nft1, 1)
    assert.equal(rewardAmount1.token, diamondAddress)
    assert.equal(rewardAmount1.amount, state3.rewardGlobals[diamondAddress].rewarded)
    assert.equal(rewardAmount1.rewardPool, 0) // ENUM for token reward pool
    let nft2 = await increasedBlockReward.methods.balanceOf(alice , 2).call()
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(2).call()
    assert.equal(nft2, 1)
    assert.equal(rewardAmount2.token, diamondAddress)
    assert.equal(rewardAmount2.amount, state3.accSdexRewardPool)
    assert.equal(rewardAmount2.rewardPool, 1) // ENBUm for accumulated Sdex Penalty Pool
  })

  it('calculates correctly over 1 interval', async () => {
    /**
     * alice deposits
     * bob harvests
     * alice withdraws
     */
    const nftid = 1
    const positionid = 1
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, iBRAddress, nftid).send({from:alice})
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    //await advanceBlocks(1)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state3, 'state3::bob::harvest', alice,bob, diamondAddress)

    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    const {refund, penalty} = calcPenalty(2, blocksToStake, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    
    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmount)).toString(), state2[alice].sdex)
    
    const harvestReward =  BN(state3[alice].sdex).sub(BN(state2[alice].sdex))

    assert.equal(BN(state4[alice].sdex).sub(BN(state3[alice].sdex)).toString(), refund.toString())
    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state4.rewardGlobals[diamondAddress].penalties
    )

    const accruedSdex = BN(rewardPerBlock.mul(BN(2))).sub(harvestReward).sub(BN(state3.vault.vTreasury))
    const bonus = accruedSdex.div(BN(2)).mul((BN(2)))
    const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(2, blocksToStake, accruedSdex.add(bonus))

    assert.equal(BN(state1.accSdexPenaltyPool).add(accSdexPenalty).add(accSdexRefund).toString(),
    BN(state4.accSdexPenaltyPool).add(BN(4))
    )
  })




  it('calculates correctly over 3 interval', async () => {
    const blocksAhead = 3
    /**
     * alice deposits
     * bob harvests
     * alice withdraws
     */
    const nftid = 1
    const positionid = 2
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, iBRAddress, nftid).send({from:alice})
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    await advanceBlocks(blocksAhead - 2)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state3, 'state3::bob::harvest', alice,bob, diamondAddress)

    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    const {refund, penalty} = calcPenalty(blocksAhead, blocksToStake, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    console.log(rewardAmount2, 'rewardamount')
    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmount)).toString(), state2[alice].sdex)
    
    const harvestReward =  BN(state3[alice].sdex).sub(BN(state2[alice].sdex))

    assert.equal(BN(state4[alice].sdex).sub(BN(state3[alice].sdex)).toString(), refund.toString())
    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state4.rewardGlobals[diamondAddress].penalties
    )
    const performanceFee = BN(state3.vault.vTreasury).sub(BN(state2.vault.vTreasury))
    const accruedSdex = BN(rewardPerBlock.mul(BN(blocksAhead))).sub(harvestReward).sub(BN(performanceFee))
    const bonus = accruedSdex.div(BN(blocksAhead)).mul((BN(blocksAhead)))
    const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(blocksAhead, blocksToStake, accruedSdex.add(bonus))

    assert.equal(BN(state1.accSdexPenaltyPool).add(accSdexPenalty).add(accSdexRefund).toString(),
    BN(state4.accSdexPenaltyPool).add(BN(2)).toString()
    )
  })
  it('calculates correctly over 5 interval', async () => {
    const blocksAhead = 5
    /**
     * alice deposits
     * bob harvests
     * alice withdraws
     */
    const nftid = 1
    const positionid = 3
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, blocksToStake, iBRAddress, nftid).send({from:alice})
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    await advanceBlocks(blocksAhead - 2)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state3, 'state3::bob::harvest', alice,bob, diamondAddress)

    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    const {refund, penalty} = calcPenalty(blocksAhead, blocksToStake, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    console.log(rewardAmount2, 'rewardamount')
    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmount)).toString(), state2[alice].sdex)
    
    const harvestReward =  BN(state3[alice].sdex).sub(BN(state2[alice].sdex))

    assert.equal(BN(state4[alice].sdex).sub(BN(state3[alice].sdex)).toString(), refund.toString())
    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state4.rewardGlobals[diamondAddress].penalties
    )
    const performanceFee = BN(state3.vault.vTreasury).sub(BN(state2.vault.vTreasury))
    const accruedSdex = BN(rewardPerBlock.mul(BN(blocksAhead))).sub(harvestReward).sub(BN(performanceFee))
    const bonus = accruedSdex.div(BN(blocksAhead)).mul((BN(blocksAhead)))
    const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(blocksAhead, blocksToStake, accruedSdex.add(bonus))

    assert.equal(BN(state1.accSdexPenaltyPool).add(accSdexPenalty).add(accSdexRefund).toString(),
    BN(state4.accSdexPenaltyPool).add(BN(2)).toString()
    )
  })
})
