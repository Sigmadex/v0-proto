const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../scripts/deploy.js')
const { deploy } = require('../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceChain, advanceTime } = require('../utilities.js')
const { calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount, fetchState } = require('./helpers.js')

const MockERC20 = artifacts.require('MockERC20')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyFacet = artifacts.require('ReducedPenaltyFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')

// Testing staking both manual and vault
contract("TokenFarmFacet", (accounts) => {
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
  let reducedPenaltyFacet;
  let reducedPenaltyReward;
  const hourInSeconds = 3600
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
    reducedPenaltyFacet = new web3.eth.Contract(ReducedPenaltyFacet.abi, diamondAddress)
    sdexVaultFacet = new web3.eth.Contract(SdexVaultFacet.abi, diamondAddress)

    const rPRAddress = await reducedPenaltyFacet.methods.rPAddress().call()
    reducedPenaltyReward = new web3.eth.Contract(ReducedPenaltyReward.abi, rPRAddress)

    const amount = web3.utils.toWei('1000', 'ether')

    await sdexFacet.methods.executiveMint(alice, amount).send({ from: owner })
    await sdexFacet.methods.executiveMint(bob, amount).send({ from: owner })
    await sdexFacet.methods.executiveMint(carol, amount).send({ from: owner })
    await sdexFacet.methods.executiveMint(dan, amount).send({ from: owner })

  })
  it("adds reduced penalty reward to tokensA, B, and sdex", async () => {
    const rPRAddress = await reducedPenaltyFacet.methods.rPAddress().call()
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
      stakeAmountA, hourInSeconds, ADDRESSZERO, 0).send({from:alice})

    const state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)
    // Bob Stake B
    // Alice Accrue sdex Reward
    await sdexVaultFacet.methods.depositVault(
      stakeAmountB, hourInSeconds, ADDRESSZERO, 0).send({from:bob})

    const state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)

    //Carol stake C
    //Alice accure sdex proportion 2
    //Alice stakes sdex reward 1
    //Bob accuse sdex reward
    await sdexVaultFacet.methods.depositVault(
      stakeAmountC, hourInSeconds, ADDRESSZERO, 0).send({from:carol})

    const state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)

    await sdexVaultFacet.methods.depositVault(
      stakeAmountD, hourInSeconds, ADDRESSZERO, 0).send({from:dan})

    const state5 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)



    const blockNumber = await web3.eth.getBlockNumber()
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
    /*
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
    */
  })

  it("users withdraw", async () => {
    const sdexPerBlock = await toolShedFacet.methods.sdexPerBlock().call()

    const state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, [alice, bob, carol, dan], 0)
    await advanceTime(3601)
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
    assert.equal(Number(totalStaked) + Number(web3.utils.toWei(String(blockReward)), 'ether'), rewardSum)

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

    assert.equal(state2.rewardGlobals[0].timeAmountGlobal, 0)
    //nothing in reward pool
    assert.equal(state2.rewardGlobals[0].rewarded, 0)
    assert.equal(state2.rewardGlobals[0].penalties, 0)

    assert.equal(state2.pool.tokenData[0].supply, 0)
    
  })


}) 
