
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
const ReducedPenaltyRewardFacet = artifacts.require('ReducedPenaltyRewardFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')


function logState(state, tag, alice, bob, carol, diamondAddress) {
  console.log(`=====================${tag}=====================`)
  console.log('block   ', state.blockNumber)
  console.log('--------')
  console.log('accounts')
  console.log('--------')
  console.log('alice   ', state[alice].sdex)
  console.log('bob     ', state[bob].sdex)
  console.log('carol   ', state[carol].sdex)
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


contract("Sdex Farm and Vault Together", async (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let carol = accounts[3]
  let users = [alice, bob, carol]
  let sdexFacet;
  let toolShedFacet;
  let tokenFarmFacet;
  let sdexVaultFacet;
  let rewardFacet;
  let reducedPenaltyRewardFacet;
  let reducedPenaltyReward;
  let tokenA;
  let tokenB;
  const blocksToStake = 10
  let diamondAddress
  let stakeAmountA = web3.utils.toWei('3', 'ether')
  let stakeAmountB = web3.utils.toWei('5', 'ether')
  let stakeAmountC = web3.utils.toWei('7', 'ether')
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
    await sdexFacet.methods.executiveMint(carol, amount).send({ from: owner })
  })

  it("adds reduced Penalty to sdex", async () => {
    const rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()

    await rewardFacet.methods.addReward(diamondAddress, rPRAddress).send({from:owner})
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
  })

  /*
   * Alice: Vault 3 | 
   * Bob: Farm 5
   * Carol: Vault
   */
  it("one user stakes vault, another stake manual", async () => {
    let blockRewardsAlice, blockRewardsBob, blockRewardsCarol;
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1, 0)

    await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountC).send({from:carol})

    const state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0) 
    logState(state1, 'state1: init', alice, bob, carol, diamondAddress)

    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, ADDRESSZERO, 0).send({from:alice})

    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    logState(state2, 'state2: alice vault deposit', alice, bob, carol, diamondAddress)
    
    blockRewardsAlice = rewardPerBlock
    console.log('blockRewardsAlice2', blockRewardsAlice.toString())

    await sdexVaultFacet.methods.depositVault(
      stakeAmountC, blocksToStake, ADDRESSZERO, 0).send({from:carol})

    const state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    logState(state3, 'state3: carol vault deposit', alice, bob, carol, diamondAddress)
    
    const propBR3A = BN(stakeAmountA).mul(unity).div(BN(stakeAmountA).add(BN(stakeAmountC)))
    const blockReward3A = propBR3A.mul(rewardPerBlock).div(unity)
    blockRewardsAlice = blockRewardsAlice.add(blockReward3A)
    console.log('blockRewardsAlice3', blockRewardsAlice.toString())

    const propBR3C = BN(stakeAmountC).mul(unity).div(BN(stakeAmountA).add(BN(stakeAmountC)))
    const blockReward3C = propBR3C.mul(rewardPerBlock).div(unity)
    blockRewardsCarol = blockReward3C
    console.log('blockRewardsCarol3', blockRewardsCarol.toString())

    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmountA)).toString(), state3[alice].sdex)
    console.log('bob ', state3[bob].sdex)
    assert.equal(state3[diamondAddress].sdex, BN(state1[diamondAddress].sdex).add(BN(stakeAmountA)).add(BN(stakeAmountC)).add(rewardPerBlock).toString())
    console.log('---')

    console.log(0, state3.vault.vSdex)
    assert.equal(BN(stakeAmountA).add(BN(stakeAmountC)), state3.pool.tokenData[0].supply)
    assert.equal(state3.rewardGlobals[diamondAddress].penalties, 0)
    assert.equal(state3.rewardGlobals[diamondAddress].rewarded, 0)
    assert.equal(state3.accSdexPenaltyPool, 0)
    assert.equal(state3.accSdexRewardPool, 0)
    console.log('---')
    assert.equal(BN(state3[diamondAddress].sdex).sub(
      BN(state3.vault.vSdex).add(
        BN(state3.pool.tokenData[0].supply)).add(
          BN(state3.rewardGlobals[diamondAddress].penalties)).add(
            BN(state3.rewardGlobals[diamondAddress].rewarded)).add(
              BN(state3.accSdexPenaltyPool)).add(
                BN(state3.accSdexRewardPool))).toString(), 1
    )

    await tokenFarmFacet.methods.deposit(
      0, [stakeAmountB], blocksToStake, ADDRESSZERO, 0).send({from:bob})

    const state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    logState(state4, ' state4: bob farm deposit', alice, bob, carol, diamondAddress)

    const propBR4A = BN(stakeAmountA).mul(unity).div(BN(stakeAmountA).add(BN(stakeAmountB)).add(BN(stakeAmountC)))
    const blockReward4A = propBR4A.mul(rewardPerBlock).div(unity)
    blockRewardsAlice = blockRewardsAlice.add(blockReward4A)
    console.log('blockRewardsAlice4', blockRewardsAlice.toString())
    const propBR4B = BN(stakeAmountB).mul(unity).div(BN(stakeAmountA).add(BN(stakeAmountB)).add(BN(stakeAmountC)))
    const blockReward4B = propBR4B.mul(rewardPerBlock).div(unity)
    blockRewardsBob = blockReward4B
    console.log('blockRewardsBob4', blockRewardsBob.toString())

    const propBR4C = BN(stakeAmountC).mul(unity).div(BN(stakeAmountA).add(BN(stakeAmountB)).add(BN(stakeAmountC)))
    const blockReward4C = propBR4C.mul(rewardPerBlock).div(unity)
    blockRewardsCarol = blockRewardsCarol.add(blockReward4C)
    console.log('blockRewardsCarol4', blockRewardsCarol.toString())

    console.log(state3[alice].sdex, state4[alice].sdex)
    assert.equal(state4[bob].sdex, BN(state3[bob].sdex).sub(BN(stakeAmountB)).toString())
    assert.equal(state4[diamondAddress].sdex, BN(state3[diamondAddress].sdex).add(BN(stakeAmountB).add(rewardPerBlock)).toString())
    console.log('---')
    console.log(0, state4.vault.vSdex)
    assert.equal(BN(stakeAmountA).add(BN(stakeAmountB)).add(BN(stakeAmountC)).toString(), state4.pool.tokenData[0].supply)
    assert.equal(0, state4.rewardGlobals[diamondAddress].penalties)
    assert.equal(0, state4.rewardGlobals[diamondAddress].rewarded)
    assert.equal(0, state4.accSdexPenaltyPool)
    assert.equal(0, state4.accSdexRewardPool)
    console.log('---')
    assert.equal(BN(state4[diamondAddress].sdex).sub(
      BN(state4.vault.vSdex).add(
        BN(state4.pool.tokenData[0].supply)).add(
          BN(state4.rewardGlobals[diamondAddress].penalties)).add(
            BN(state4.rewardGlobals[diamondAddress].rewarded)).add(
              BN(state4.accSdexPenaltyPool)).add(
                BN(state4.accSdexRewardPool))).toString(), rewardPerBlock.add(BN(1)).toString()
    )

  console.log(`=====================${'end state4'}=====================`)
    await tokenFarmFacet.methods.withdraw(0, 0).send({from: bob})
    
    const state5 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)

    logState(state5, 'state5: bob farm withdraw', alice, bob, carol, diamondAddress)

    const propBR5A = BN(stakeAmountA).mul(unity).div(BN(stakeAmountA).add(BN(stakeAmountB)).add(BN(stakeAmountC)))
    const blockReward5A = propBR5A.mul(rewardPerBlock).div(unity)
    blockRewardsAlice = blockRewardsAlice.add(blockReward5A)
    console.log('blockRewardsAlice5', blockRewardsAlice.toString())

    const propBR5B = BN(stakeAmountB).mul(unity).div(BN(stakeAmountA).add(BN(stakeAmountB)).add(BN(stakeAmountC)))
    const blockReward5B = propBR5B.mul(rewardPerBlock).div(unity)
    blockRewardsBob = blockReward5B
    console.log('blockRewardsBob5', blockRewardsBob.toString())
    const propBR5C = BN(stakeAmountC).mul(unity).div(BN(stakeAmountA).add(BN(stakeAmountB)).add(BN(stakeAmountC)))
    const blockReward5C = propBR5C.mul(rewardPerBlock).div(unity)
    blockRewardsCarol = blockRewardsCarol.add(blockReward5C)
    console.log('blockRewardsCarol5', blockRewardsCarol.toString())

    const {refund:bobRefund1, penalty:bobPenalty1} = calcPenalty(1, blocksToStake, stakeAmountB) 

    assert.equal(BN(state4[bob].sdex).add(bobRefund1).toString(), state5[bob].sdex)
    assert.equal(BN(state4[diamondAddress].sdex).add(rewardPerBlock).sub(bobRefund1).toString(), state5[diamondAddress].sdex)
    assert.equal(BN(stakeAmountA).add(BN(stakeAmountC)), state5.pool.tokenData[0].supply)
    assert.equal(bobPenalty1.toString(), state5.rewardGlobals[diamondAddress].penalties)
    assert.equal(0, state5.rewardGlobals[diamondAddress].rewarded)
    assert.equal(blockReward5B.toString(), state5.accSdexPenaltyPool)
    assert.equal(0, state5.accSdexRewardPool)
    assert.equal(BN(state5[diamondAddress].sdex).sub(
      BN(state5.vault.vSdex).add(
        BN(state5.pool.tokenData[0].supply)).add(
          BN(state5.rewardGlobals[diamondAddress].penalties)).add(
            BN(state5.rewardGlobals[diamondAddress].rewarded)).add(
              BN(state5.accSdexPenaltyPool)).add(
                BN(state5.accSdexRewardPool))).toString(), BN(rewardPerBlock).add(BN(rewardPerBlock).sub(blockReward5B)).add(BN(1)).toString()
    )

  console.log(`=====================${'end state5'}=====================`)
    await advanceBlocks(blocksToStake/2 - 1) //180 blocks, 10 sec per block
    await sdexVaultFacet.methods.withdrawVault(0).send({from: alice})

    const state6 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    logState(state6, 'state6: alice vault withdraw', alice, bob, carol, diamondAddress)

    const propBR6A = BN(stakeAmountA).mul(unity).div(BN(stakeAmountA).add(BN(stakeAmountC)))
    const blockReward6A = propBR6A.mul(rewardPerBlock.mul(BN(5))).div(unity)
    blockRewardsAlice = blockRewardsAlice.add(blockReward6A)
    console.log('blockRewardsAlice6', blockRewardsAlice.toString())

    const propBR6C = BN(stakeAmountC).mul(unity).div(BN(stakeAmountA).add(BN(stakeAmountC)))
    const blockReward6C = propBR6C.mul(rewardPerBlock.mul(BN(5))).div(unity)
    blockRewardsCarol = blockRewardsCarol.add(blockReward6C)
    console.log('blockRewardsCarol6', blockRewardsCarol.toString())

    const blockRewards6  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 5, 0)

    const proportionBlockReward6 = BN(stakeAmountA).mul(unity).div(BN(0).add(BN(stakeAmountA)).add(BN(stakeAmountC)))

    //const blockReward4 = proportionBlockReward.mul(blockRewards4).div(unity)

    const {refund, penalty} = calcPenalty(blocksToStake/2 + 3, blocksToStake, stakeAmountA) 
    console.log(refund.toString(), penalty.toString())
    console.log('^---refund, ^----penalty')


    assert.equal( state6[alice].sdex, BN(state5[alice].sdex).add(refund).toString())
    assert.equal(state6[diamondAddress].sdex, BN(state5[diamondAddress].sdex).add(BN(blockRewards6)).sub(refund).toString())
    assert.equal(0, state6.rewardGlobals[diamondAddress].rewarded)

    assert.equal(
      BN(state5.rewardGlobals[diamondAddress].penalties).add(penalty),
      state6.rewardGlobals[diamondAddress].penalties
    )
    assert.equal(0, state6.rewardGlobals[diamondAddress].rewarded)
    console.log('state5 accSdexPenaltyPool', state5.accSdexPenaltyPool)
    console.log('blockrewardsAlice        ', blockRewardsAlice.toString());
    console.log('state6 accSdexPenaltyPool', state6.accSdexPenaltyPool)
      /*
    assert.equal(
      BN(state5.accSdexPenaltyPool).add(blockReward4).sub(BN(1)).toString(),
      state6.accSdexPenaltyPool
    )
    */
    assert.equal(0, state6.accSdexRewardPool)

    console.log('accnt ', BN(state6[diamondAddress].sdex).sub(
      BN(state6.vault.vSdex).add(
        BN(state6.pool.tokenData[0].supply)).add(
          BN(state6.rewardGlobals[diamondAddress].penalties)).add(
            BN(state6.rewardGlobals[diamondAddress].rewarded)).add(
              BN(state6.accSdexPenaltyPool)).add(
                BN(state6.accSdexRewardPool))).toString()
    )
    
    console.log(`=====================${'end state5'}=====================`)
    await sdexVaultFacet.methods.withdrawVault(0).send({from: carol})
    const state7 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, 0)
    logState(state7, 'state7: carol farm withdraw', alice, bob, carol, diamondAddress)

    const {refund:refundCarol7, penalty:penaltyCarol7} = calcPenalty(blocksToStake/2 + 3, blocksToStake, stakeAmountC) 

    const propBR7C = BN(stakeAmountC).mul(unity).div((BN(stakeAmountC)))
    const blockReward7C = propBR7C.mul(rewardPerBlock).div(unity)
    blockRewardsCarol = blockRewardsCarol.add(blockReward7C)
    console.log('blockRewardsCarol7', blockRewardsCarol.toString())

    assert.equal(state7[carol].sdex, BN(state6[carol].sdex).add(refundCarol7).toString())
    //assert.equal(state7.accSdexPenaltyPool, BN(state6.accSdexPenaltyPool).add(blockRewardsCarol).toString())

  })

  it("one user vaults, other manuals, rewarded", async () => {
    /*
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

    const reductionAmount1 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(1).call()
    console.log(reductionAmount1)

    const reductionAmount2 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(2).call()
    console.log(reductionAmount2)
    const reductionAmount3 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(3).call()
    console.log(reductionAmount3)
    const reductionAmount4 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(4).call()
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

    const state2ReductionAmount1 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(1).call()
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

    let reductionAmount1 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(1).call()
    let reductionAmount2 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(2).call()
    let reductionAmount3 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(3).call()
    let reductionAmount4 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(4).call()


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
    reductionAmount1 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(1).call()
    reductionAmount2 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(2).call()
    reductionAmount3 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(3).call()
    reductionAmount4 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(4).call()
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

    reductionAmount1 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(1).call()
    reductionAmount2 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(2).call()
    reductionAmount3 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(3).call()
    reductionAmount4 = await reducedPenaltyRewardFacet.methods.rPRReductionAmount(4).call()

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
    */
})
})
