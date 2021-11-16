const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../scripts/deploy.js')
const { deploy } = require('../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceBlocks } = require('../utilities.js')
const { BN, fetchState, calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount } = require('./helpers.js')

const MockERC20 = artifacts.require('MockERC20')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyRewardFacet = artifacts.require('ReducedPenaltyRewardFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')

// Testing the interplay between manual Sdex Farm, Auto Sdex Vault, and a Normal Farm
contract("MultiFarm", (accounts) => {
  
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let carol = accounts[3]
  let users = [alice, bob, carol]
  let sdexFacet;
  let toolShedFacet;
  let tokenFarmFacet;
  let rewardFacet;
  let reducedPenaltyRewardFacet;
  let reducedPenaltyReward;
  let tokenA;
  let tokenB;
  let tokenC;
  let tokens;
  let blocksToStake = 10
  let diamondAddress
  let ABAllocPoints = 2000
  let ACAllocPoints = 2000
  let ASAllocPoints = 3000
  let stakeAmount = web3.utils.toWei('10', 'ether')
  let poolS = 0
  let poolAB = 1
  let poolAC = 2
  let poolAS = 3
  let sdexPerBlock
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
    
    sdexPerBlock = await toolShedFacet.methods.sdexPerBlock().call()

    let erc20TotalSupply = web3.utils.toWei('1000000', 'ether')
    tokenA = await deploy(owner, MockERC20, ['ERC20A', 'ERC20A', erc20TotalSupply])
    tokenB = await deploy(owner, MockERC20, ['ERC20B', 'ERC20B', erc20TotalSupply])
    tokenC = await deploy(owner, MockERC20, ['ERC20C', 'ERC20C', erc20TotalSupply])
    tokens = [tokenA, tokenB, tokenC]
    const amount = web3.utils.toWei('2000', 'ether')
    await tokenA.methods.transfer(alice, amount).send({ from: owner });
    await tokenB.methods.transfer(alice, amount).send({ from: owner });
    await tokenC.methods.transfer(alice, amount).send({ from: owner });
    await tokenA.methods.transfer(bob, amount).send({ from: owner });
    await tokenB.methods.transfer(bob, amount).send({ from: owner });
    await tokenC.methods.transfer(bob, amount).send({ from: owner });
    await tokenA.methods.transfer(carol, amount).send({ from: owner });
    await tokenB.methods.transfer(carol, amount).send({ from: owner });
    await tokenC.methods.transfer(carol, amount).send({ from: owner });
  })

  it("adds reduced penalty reward to tokensA, B, and sdex", async () => {
    const rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()
    await rewardFacet.methods.addReward(tokenA._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenB._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenC._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(diamondAddress, rPRAddress).send({from:owner})
    const validRewardsA = await rewardFacet.methods.getValidRewardsForToken(tokenA._address).call()
    const validRewardsB = await rewardFacet.methods.getValidRewardsForToken(tokenB._address).call()
    const validRewardsC = await rewardFacet.methods.getValidRewardsForToken(tokenC._address).call()
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
    assert.equal(validRewardsA[0], rPRAddress)
    assert.equal(validRewardsB[0], rPRAddress)
    assert.equal(validRewardsC[0], rPRAddress)
    assert.equal(validRewardsSdex[0], rPRAddress)
  })

  it("adds pools", async () => {
    let poolLength1 = await tokenFarmFacet.methods.poolLength().call()
    assert.equal(poolLength1, 1)

    let totalAllocPoints1 = await toolShedFacet.methods.totalAllocPoint().call()
    assert.equal(totalAllocPoints1, 1000)

    await tokenFarmFacet.methods.add([tokenA._address, tokenB._address],
      ABAllocPoints, true).send({from:owner})

    let poolLength2 = await tokenFarmFacet.methods.poolLength().call()
    assert.equal(poolLength2, 2)
    
    let totalAllocPoints2 = await toolShedFacet.methods.totalAllocPoint().call()
    assert.equal(totalAllocPoints2, BN(totalAllocPoints1).add(BN(ABAllocPoints)).toString())

    const blockNumber = await web3.eth.getBlockNumber()
    const poolInfo = await tokenFarmFacet.methods.poolInfo(poolLength2-1).call()
    assert.equal(poolInfo.tokenData[0].token, tokenA._address)
    assert.equal(poolInfo.tokenData[0].supply, 0)
    assert.equal(poolInfo.tokenData[0].accSdexPerShare, 0)
    assert.equal(poolInfo.tokenData[1].token, tokenB._address)
    assert.equal(poolInfo.tokenData[1].supply, 0)
    assert.equal(poolInfo.tokenData[1].accSdexPerShare, 0)
    assert.equal(poolInfo.allocPoint, 2000)
    assert.equal(poolInfo.lastRewardBlock, blockNumber)
    try {
      await tokenFarmFacet.methods.add(
        [tokenA._address, tokenB._address],
        ABAllocPoints,
        true
      ).send(
        {from:alice}
      )
      assert.fail('add pool should only be owner')
    } catch (e) {
      assert.include(e.message, 'LibDiamond: Must be contract owner')
    }
    
    await tokenFarmFacet.methods.add([tokenA._address, tokenC._address],
      ACAllocPoints, true).send({from:owner})

    let poolLength3 = await tokenFarmFacet.methods.poolLength().call()
    assert.equal(poolLength3, 3)
    
    let totalAllocPoints3 = await toolShedFacet.methods.totalAllocPoint().call()
    assert.equal(totalAllocPoints3, BN(totalAllocPoints2).add(BN(ACAllocPoints)).toString())

    await tokenFarmFacet.methods.add([tokenA._address, diamondAddress],
      ASAllocPoints, true).send({from:owner})

    let poolLength4 = await tokenFarmFacet.methods.poolLength().call()
    assert.equal(poolLength4, 4)
    
    let totalAllocPoints4 = await toolShedFacet.methods.totalAllocPoint().call()
    assert.equal(totalAllocPoints4, BN(totalAllocPoints3).add(BN(ASAllocPoints)).toString())
  })

  it("Alice deposits into pools with A", async () => {

    let stateI_AB = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolAB, tokens)
    for (let i = 0; i < 9; i++) {
      await tokenA.methods.approve(diamondAddress, stakeAmount).send({from:alice})
      await tokenB.methods.approve(diamondAddress, stakeAmount).send({from:alice})

      //logState(state1, 'state1', alice, alice, diamondAddress, tokenA._address, tokenB._address)

      await tokenFarmFacet.methods.deposit(
        poolAB, [stakeAmount, stakeAmount], blocksToStake, ADDRESSZERO, 0).send({from:alice})

    }
      await advanceBlocks(1)
    for (let i = 0; i < 9; i++) {
      await tokenFarmFacet.methods.withdraw(poolAB, i).send({from: alice})
    }

    let stateF_AB = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolAB, tokens)
    const blocks = stateF_AB.blockNumber - stateI_AB.blockNumber
    const firstDep = blocks - 3
    
    const totalAlloc = await toolShedFacet.methods.totalAllocPoint().call()
    const poolProportion = BN(stateI_AB.pool.allocPoint).mul(unity).div(BN(totalAlloc))
    const rewardsForPool = BN(sdexPerBlock).mul(BN(firstDep)).mul(poolProportion).div(unity)
    assert.equal(stateF_AB[diamondAddress].sdex, 5) // rounding err
    assert.equal(stateF_AB[alice].sdex, BN(rewardsForPool).sub(BN(stateF_AB[diamondAddress].sdex)).toString())

  })
})
