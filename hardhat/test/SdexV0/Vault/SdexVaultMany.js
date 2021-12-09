const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../../scripts/deploy.js')
const { deploy } = require('../../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceBlocks } = require('../../utilities.js')
const { calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount, fetchState, BN } = require('../helpers.js')

const MockERC20 = artifacts.require('MockERC20')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyRewardFacet = artifacts.require('ReducedPenaltyRewardFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')

// Testing staking both manual and vault
contract("SdexVaultMany", (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let carol = accounts[3]
  let dan = accounts[4]
  let sdexFacet;
  let toolShedFacet;
  let tokenFarmFacet;
  let sdexVaultFacet;
  let rewardFacet;
  let reducedPenaltyRewardFacet;
  let reducedPenaltyReward;
  const blocksToStake = 10
  let diamondAddress
  let stakeAmountA = web3.utils.toWei('5', 'ether')
  let stakeAmountB = web3.utils.toWei('7', 'ether')
  let stakeAmountC = web3.utils.toWei('11', 'ether')
  let stakeAmountD = web3.utils.toWei('13', 'ether')

  before(async () => {
    diamondAddress = await deployDiamond()

    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
    toolShedFacet = new web3.eth.Contract(ToolShedFacet.abi, diamondAddress)
    tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)
    rewardFacet = new web3.eth.Contract(RewardFacet.abi, diamondAddress)
    reducedPenaltyRewardFacet = new web3.eth.Contract(ReducedPenaltyRewardFacet.abi, diamondAddress)
    sdexVaultFacet = new web3.eth.Contract(SdexVaultFacet.abi, diamondAddress)

    const rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()
    reducedPenaltyReward = new web3.eth.Contract(ReducedPenaltyReward.abi, rPRAddress)

    const amount = web3.utils.toWei('1000', 'ether')

    await sdexFacet.methods.executiveMint(alice, amount).send({ from: owner })
    await sdexFacet.methods.executiveMint(bob, amount).send({ from: owner })
    await sdexFacet.methods.executiveMint(carol, amount).send({ from: owner })
    await sdexFacet.methods.executiveMint(dan, amount).send({ from: owner })

  })
  it("adds reduced penalty reward to tokensA, B, and sdex", async () => {
    const rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()
    await rewardFacet.methods.addReward(diamondAddress, rPRAddress).send({from:owner})
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
    assert.equal(validRewardsSdex[0], rPRAddress)
  })

  it(" 4 users can stake to vault", async () => {
    const sdexPerBlock = await toolShedFacet.methods.sdexPerBlock().call()

    await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountC).send({from:carol})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountD).send({from:dan})

    const state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)
    console.log('initial sdex diamond', state1[diamondAddress].sdex)
    // Alice Stake A
    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, ADDRESSZERO, 0).send({from:alice})

    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)
    // Bob Stake B
    // Alice Accrue sdex Reward
    await sdexVaultFacet.methods.depositVault(
      stakeAmountB, blocksToStake, ADDRESSZERO, 0).send({from:bob})

    const state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)

    //Carol stake C
    //Alice accure sdex proportion 2
    //Alice stakes sdex reward 1
    //Bob accuse sdex reward
    await sdexVaultFacet.methods.depositVault(
      stakeAmountC, blocksToStake, ADDRESSZERO, 0).send({from:carol})

    const state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)

    await sdexVaultFacet.methods.depositVault(
      stakeAmountD, blocksToStake, ADDRESSZERO, 0).send({from:dan})

    const state5 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)



    //Sdex
    assert.equal(state1[alice].sdex, new web3.utils.BN(state5[alice].sdex).add(new web3.utils.BN(stakeAmountA)))
    assert.equal(state1[bob].sdex, new web3.utils.BN(state5[bob].sdex).add(new web3.utils.BN(stakeAmountB)))
    assert.equal(state1[carol].sdex, new web3.utils.BN(state5[carol].sdex).add(new web3.utils.BN(stakeAmountC)))
    assert.equal(state1[dan].sdex, new web3.utils.BN(state5[dan].sdex).add(new web3.utils.BN(stakeAmountD)))

    assert.equal(state2[diamondAddress].sdex,
      new web3.utils.BN(state1[diamondAddress].sdex)
      .add(new web3.utils.BN(stakeAmountA)).toString())

    assert.equal(state3[diamondAddress].sdex,
      new web3.utils.BN(state1[diamondAddress].sdex)
      .add(new web3.utils.BN(stakeAmountA))
      .add(new web3.utils.BN(stakeAmountB))
      .add(new web3.utils.BN(sdexPerBlock)).toString())

    assert.equal(state4[diamondAddress].sdex,
      new web3.utils.BN(state1[diamondAddress].sdex)
      .add(new web3.utils.BN(stakeAmountA))
      .add(new web3.utils.BN(stakeAmountB))
      .add(new web3.utils.BN(stakeAmountC))
      .add(new web3.utils.BN(sdexPerBlock))
      .add(new web3.utils.BN(sdexPerBlock)).toString())

    assert.equal(state5[diamondAddress].sdex,
      new web3.utils.BN(state1[diamondAddress].sdex)
      .add(new web3.utils.BN(stakeAmountA))
      .add(new web3.utils.BN(stakeAmountB))
      .add(new web3.utils.BN(stakeAmountC))
      .add(new web3.utils.BN(stakeAmountD))
      .add(new web3.utils.BN(sdexPerBlock))
      .add(new web3.utils.BN(sdexPerBlock))
      .add(new web3.utils.BN(sdexPerBlock)).toString())
    //Vault

    //UserInfo
    //PoolInfo
    //vUserInfo
    //Reward Globals
  })

  it("users withdraw", async () => {
    const sdexPerBlock = await toolShedFacet.methods.sdexPerBlock().call()

    const state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)
    await advanceBlocks(blocksToStake)
    await sdexVaultFacet.methods.withdrawVault(0).send({from: alice})
    await sdexVaultFacet.methods.withdrawVault(0).send({from: bob})
    await sdexVaultFacet.methods.withdrawVault(0).send({from: carol})
    await sdexVaultFacet.methods.withdrawVault(0).send({from: dan})

    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)

    console.log(state1[alice].sdex)
    console.log(state2[alice].sdex)
    const diffA = (state2[alice].sdex - state1[alice].sdex)
    console.log('=====================')
    console.log(state1[bob].sdex)
    console.log(state2[bob].sdex)
    const diffB = (state2[bob].sdex - state1[bob].sdex)
    console.log('=====================')
    console.log(state1[carol].sdex)
    console.log(state2[carol].sdex)
    const diffC = (state2[carol].sdex - state1[carol].sdex)
    console.log('=====================')
    console.log(state1[dan].sdex)
    console.log(state2[dan].sdex)
    const diffD = (state2[dan].sdex - state1[dan].sdex)
    console.log('=====================')
    const rewardSum=(diffA+diffB+diffC+diffD)
    const totalStaked = Number(stakeAmountA)+ Number(stakeAmountB) + Number(stakeAmountC) + Number(stakeAmountD)
    // 4 blocks deposit 4 blocks withdraw, lags by one holds one
    const blockReward = 8 - 1 - 1 
    assert.equal(Number(totalStaked) + Number(web3.utils.toWei(String(blockReward + blocksToStake)), 'ether'), rewardSum)

    assert.equal(state2[alice].vUserInfo.positions[0].amount, 0)
    assert.equal(state2[bob].vUserInfo.positions[0].amount, 0)
    assert.equal(state2[carol].vUserInfo.positions[0].amount, 0)
    assert.equal(state2[dan].vUserInfo.positions[0].amount, 0)
    
    assert.equal(state2[alice].vUserInfo.positions[0].shares, 0)
    assert.equal(state2[bob].vUserInfo.positions[0].shares, 0)
    assert.equal(state2[carol].vUserInfo.positions[0].shares, 0)
    assert.equal(state2[dan].vUserInfo.positions[0].shares, 0)

    assert.equal(Number(state2[diamondAddress].sdex), sdexPerBlock)
    // one wei rounding error when one vault exists with 100% of alloc points
    assert.equal(state2.vault.vSdex, sdexPerBlock - 1)
    assert.equal(state2.vault.vTotalShares, 0)

    assert.equal(state2.rewardGlobals[diamondAddress].blockAmountGlobal, 0)
    //nothing in reward pool
    assert.equal(state2.rewardGlobals[diamondAddress].rewarded, 0)
    assert.equal(state2.rewardGlobals[diamondAddress].penalties, 0)

    assert.equal(state2.pool.tokenData[0].supply, 0)
  })

  it("4 users stake twice", async () => {

    const sdexPerBlock = await toolShedFacet.methods.sdexPerBlock().call()

    await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountC).send({from:carol})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountD).send({from:dan})

    const blockNumber1 = await web3.eth.getBlockNumber()
    console.log('blocknum1', blockNumber1)
    const state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)
    // Alice Stake A
    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, ADDRESSZERO, 0).send({from:alice})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountA).send({from:alice})
    await sdexVaultFacet.methods.depositVault(
      stakeAmountA, blocksToStake, ADDRESSZERO, 0).send({from:alice})

    console.log('initial sdex diamond', state1[diamondAddress].sdex)
    await sdexVaultFacet.methods.depositVault(
      stakeAmountB, blocksToStake, ADDRESSZERO, 0).send({from:bob})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountB).send({from:bob})
    await sdexVaultFacet.methods.depositVault(
      stakeAmountB, blocksToStake, ADDRESSZERO, 0).send({from:bob})

    await sdexVaultFacet.methods.depositVault(
      stakeAmountC, blocksToStake, ADDRESSZERO, 0).send({from:carol})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountC).send({from:carol})
    await sdexVaultFacet.methods.depositVault(
      stakeAmountC, blocksToStake, ADDRESSZERO, 0).send({from:carol})

    await sdexVaultFacet.methods.depositVault(
      stakeAmountD, blocksToStake, ADDRESSZERO, 0).send({from:dan})
    await sdexFacet.methods.approve(diamondAddress, stakeAmountD).send({from:dan})
    await sdexVaultFacet.methods.depositVault(
      stakeAmountD, blocksToStake, ADDRESSZERO, 0).send({from:dan})

    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)
    assert.equal(state2[alice].vUserInfo.positions[1].amount, stakeAmountA)
    assert.equal(state2[alice].vUserInfo.positions[2].amount, stakeAmountA)
    assert.equal(state2[bob].vUserInfo.positions[1].amount, stakeAmountB)
    assert.equal(state2[bob].vUserInfo.positions[2].amount, stakeAmountB)
    assert.equal(state2[carol].vUserInfo.positions[1].amount, stakeAmountC)
    assert.equal(state2[carol].vUserInfo.positions[2].amount, stakeAmountC)
    assert.equal(state2[dan].vUserInfo.positions[1].amount, stakeAmountD)
    assert.equal(state2[dan].vUserInfo.positions[2].amount, stakeAmountD)

  })

  it("Each withdraws 1 early", async () => {

    const state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)
    await advanceBlocks(blocksToStake / 2)
    await sdexVaultFacet.methods.withdrawVault(1).send({from: alice})
    await sdexVaultFacet.methods.withdrawVault(1).send({from: bob})
    await sdexVaultFacet.methods.withdrawVault(1).send({from: carol})
    await sdexVaultFacet.methods.withdrawVault(1).send({from: dan})

    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)

    await advanceBlocks(blocksToStake/2)
    await sdexVaultFacet.methods.withdrawVault(2).send({from: alice})
    await sdexVaultFacet.methods.withdrawVault(2).send({from: bob})
    await sdexVaultFacet.methods.withdrawVault(2).send({from: carol})
    await sdexVaultFacet.methods.withdrawVault(2).send({from: dan})

    const blockNumber2 = await web3.eth.getBlockNumber()
    console.log('blocknum2', blockNumber2)
    const state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)
      /*
    console.log(state1[alice].sdex, state2[alice].sdex, state3[alice].sdex)
    console.log(state1[bob].sdex, state2[bob].sdex, state3[bob].sdex)
    console.log(state1[carol].sdex, state2[carol].sdex, state3[carol].sdex)
    console.log(state1[dan].sdex, state2[dan].sdex, state3[dan].sdex)
    */
    console.log()
    assert.equal(state1[alice].vUserInfo.shares, BN(state1[alice].vUserInfo.positions[1].shares).add(BN(state1[alice].vUserInfo.positions[2].shares)).toString())
    assert.equal(state2[alice].vUserInfo.shares, BN(state2[alice].vUserInfo.positions[1].shares).add(BN(state2[alice].vUserInfo.positions[2].shares)).toString())
    assert.equal(state3[alice].vUserInfo.shares, BN(state3[alice].vUserInfo.positions[1].shares).add(BN(state3[alice].vUserInfo.positions[2].shares)).toString())
    
    assert.equal(state1[bob].vUserInfo.shares, BN(state1[bob].vUserInfo.positions[1].shares).add(BN(state1[bob].vUserInfo.positions[2].shares)).toString())
    assert.equal(state2[bob].vUserInfo.shares, BN(state2[bob].vUserInfo.positions[1].shares).add(BN(state2[bob].vUserInfo.positions[2].shares)).toString())
    assert.equal(state3[bob].vUserInfo.shares, BN(state3[bob].vUserInfo.positions[1].shares).add(BN(state3[bob].vUserInfo.positions[2].shares)).toString())
    
    assert.equal(state1[carol].vUserInfo.shares, BN(state1[carol].vUserInfo.positions[1].shares).add(BN(state1[carol].vUserInfo.positions[2].shares)).toString())
    assert.equal(state2[carol].vUserInfo.shares, BN(state2[carol].vUserInfo.positions[1].shares).add(BN(state2[carol].vUserInfo.positions[2].shares)).toString())
    assert.equal(state3[carol].vUserInfo.shares, BN(state3[carol].vUserInfo.positions[1].shares).add(BN(state3[carol].vUserInfo.positions[2].shares)).toString())
    
    assert.equal(state1[dan].vUserInfo.shares, BN(state1[dan].vUserInfo.positions[1].shares).add(BN(state1[dan].vUserInfo.positions[2].shares)).toString())
    assert.equal(state2[dan].vUserInfo.shares, BN(state2[dan].vUserInfo.positions[1].shares).add(BN(state2[dan].vUserInfo.positions[2].shares)).toString())
    assert.equal(state3[dan].vUserInfo.shares, BN(state3[dan].vUserInfo.positions[1].shares).add(BN(state3[dan].vUserInfo.positions[2].shares)).toString())

    console.log(state1[diamondAddress].userInfo.tokenData[0].amount, state2[diamondAddress].userInfo.tokenData[0].amount ,state3[diamondAddress].userInfo.tokenData[0].amount)
    console.log(state1.vault.vSdex, state2.vault.vSdex, state3.vault.vSdex)
    console.log(BN(state1.vault.vSdex).add(BN(state1[diamondAddress].userInfo.tokenData[0].amount)).toString())
    console.log(BN(state2.vault.vSdex).add(BN(state2[diamondAddress].userInfo.tokenData[0].amount)).toString())
    console.log(BN(state3.vault.vSdex).add(BN(state3[diamondAddress].userInfo.tokenData[0].amount)).toString())
    console.log(state1[diamondAddress].sdex, state2[diamondAddress].sdex, state3[diamondAddress].sdex)
    //console.log(BN(state1.vault.vSdex).add(BN(state1[diamondAddress].userInfo.tokenData[0].amount)).toString(), BN(state1[diamondAddress].sdex).toString())
    //
    // Persistent 1 wei per block rounding error
    console.log(state1.accSdexPenaltyPool, state2.accSdexPenaltyPool, state3.accSdexPenaltyPool)
    //assert.equal(BN(state1[diamondAddress].sdex).sub(BN(state1.rewardGlobals[0].penalties)).sub(BN(state1.rewardGlobals[0].rewarded)).sub(BN(state1.vault.vSdex).sub(BN(state1[diamondAddress].userInfo.tokenData[0].amount))).sub(BN(state1.accSdexPenaltyPool)).sub(BN(state1.accSdexRewardPool)).sub(BN(13)).toString(), 0)
    //assert.equal(BN(state2[diamondAddress].sdex).sub(BN(state2.rewardGlobals[0].penalties)).sub(BN(state2.rewardGlobals[0].rewarded)).sub(BN(state2.vault.vSdex).sub(BN(state2[diamondAddress].userInfo.tokenData[0].amount))).sub(BN(state1.accSdexPenaltyPool)).sub(BN(17)).toString(), 0)
    console.log(state3[diamondAddress].sdex)
    console.log(state3.rewardGlobals[diamondAddress].penalties)
    console.log(state3.rewardGlobals[diamondAddress].rewarded)
    
    assert.equal(BN(state3[diamondAddress].sdex).sub(BN(state3.rewardGlobals[diamondAddress].penalties)).sub(BN(state3.rewardGlobals[diamondAddress].rewarded)).sub(BN(state3.vault.vSdex).sub(BN(state3[diamondAddress].userInfo.tokenData[0].amount))).sub(BN(state1.accSdexPenaltyPool)).sub(BN(state3.accSdexRewardPool)).sub(BN(20)).toString(), 0)
    //console.log(state1.vault.vTotalShares, state2.vault.vTotalShares, state3.vault.vTotalShares)
    //
    // Reward Stuff
    //
    assert.equal(BN(stakeAmountA).add(BN(stakeAmountB)).add(BN(stakeAmountC)).add(BN(stakeAmountD)).mul(BN(2)).mul(BN(blocksToStake)).toString(), state1.rewardGlobals[diamondAddress].blockAmountGlobal)
    assert.equal(BN(stakeAmountA).add(BN(stakeAmountB)).add(BN(stakeAmountC)).add(BN(stakeAmountD)).mul(BN(blocksToStake)).toString(), state2.rewardGlobals[diamondAddress].blockAmountGlobal)
    assert.equal(0, state3.rewardGlobals[diamondAddress].blockAmountGlobal)

    assert.equal(state1.rewardGlobals[diamondAddress].rewarded, 0)
    assert.equal(state2.rewardGlobals[diamondAddress].rewarded, 0)
    assert.equal(state1.rewardGlobals[diamondAddress].penalties, 0)
    assert.equal(state3.rewardGlobals[diamondAddress].penalties, 0)
    assert.equal(state2.rewardGlobals[diamondAddress].penalties, state3.rewardGlobals[diamondAddress].rewarded)



  })
}) 
