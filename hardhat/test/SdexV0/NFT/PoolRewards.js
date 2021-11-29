const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../../scripts/deploy.js')
const { deploy } = require('../../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceBlocks } = require('../../utilities.js')
const { BN, fetchState, calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount } = require('../helpers.js')

const MockERC20 = artifacts.require('MockERC20')
const MockERC1155 = artifacts.require('MockERC1155')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyRewardFacet = artifacts.require('ReducedPenaltyRewardFacet')
const RewardAmplifierRewardFacet = artifacts.require('RewardAmplifierRewardFacet')
const IncreasedBlockRewardFacet = artifacts.require('IncreasedBlockRewardFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')
const RewardAmplifierReward = artifacts.require('RewardAmplifierReward')
const IncreasedBlockReward = artifacts.require('IncreasedBlockReward')

contract("poolRewards", (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let hacker = accounts[3]
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
  let rPRAddress;
  let iBRAddress;
  let rARAddress;

  let fakeReward;
  let tokenA;
  let tokenB;
  let tokens;

  const blocksToStake = 10
  let diamondAddress
  let stakeAmount = web3.utils.toWei('20', 'ether')
  let poolid = 1

  before(async () => {
    diamondAddress = await deployDiamond()

    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
    toolShedFacet = new web3.eth.Contract(ToolShedFacet.abi, diamondAddress)
    tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)
    sdexVaultFacet = new web3.eth.Contract(SdexVaultFacet.abi, diamondAddress)
    rewardFacet = new web3.eth.Contract(RewardFacet.abi, diamondAddress)
    reducedPenaltyRewardFacet = new web3.eth.Contract(ReducedPenaltyRewardFacet.abi, diamondAddress)
    rewardAmplifierRewardFacet = new web3.eth.Contract(RewardAmplifierRewardFacet.abi, diamondAddress)
    increasedBlockRewardFacet = new web3.eth.Contract(IncreasedBlockRewardFacet.abi, diamondAddress)

    rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()
    reducedPenaltyReward = new web3.eth.Contract(ReducedPenaltyReward.abi, rPRAddress)
    rARAddress = await rewardAmplifierRewardFacet.methods.rARAddress().call()
    rewardAmplifierReward = new web3.eth.Contract(RewardAmplifierReward.abi, rPRAddress)
    iBRAddress = await increasedBlockRewardFacet.methods.iBRAddress().call()
    increasedBlockReward = new web3.eth.Contract(IncreasedBlockReward.abi, iBRAddress)

    fakeReward = await deploy(hacker, MockERC1155)

    let erc20TotalSupply = web3.utils.toWei('1000000', 'ether')
    tokenA = await deploy(owner, MockERC20, ['ERC20A', 'ERC20A', erc20TotalSupply])
    tokenB = await deploy(owner, MockERC20, ['ERC20B', 'ERC20B', erc20TotalSupply])
    tokens = [tokenA, tokenB]
    const amount = web3.utils.toWei('2000', 'ether')
    await tokenA.methods.transfer(hacker, amount).send({ from: owner });
    await tokenB.methods.transfer(hacker, amount).send({ from: owner });
  })
  it("adds reduced penalty reward to tokensA, B, and sdex", async () => {
    const rPRAddress = await reducedPenaltyRewardFacet.methods.rPRAddress().call()
    await rewardFacet.methods.addReward(tokenA._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenB._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(diamondAddress, rPRAddress).send({from:owner})
    const validRewardsA = await rewardFacet.methods.getValidRewardsForToken(tokenA._address).call()
    const validRewardsB = await rewardFacet.methods.getValidRewardsForToken(tokenB._address).call()
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
    assert.equal(validRewardsA[0], rPRAddress)
    assert.equal(validRewardsB[0], rPRAddress)
    assert.equal(validRewardsSdex[0], rPRAddress)
  })
  it("adds pool", async () => {
    let poolLength1 = await tokenFarmFacet.methods.poolLength().call()
    assert.equal(poolLength1, 1)
    let totalAllocPoints1 = await toolShedFacet.methods.totalAllocPoint().call()
    assert.equal(totalAllocPoints1, 1000)

    let newPoolAllocPoints = '2000'
    await tokenFarmFacet.methods.add(
      [tokenA._address, tokenB._address],
      newPoolAllocPoints,
      [rPRAddress],
      true
    ).send(
      {from:owner}
    )

    let poolLength2 = await tokenFarmFacet.methods.poolLength().call()
    assert.equal(poolLength2, 2)
    let totalAllocPoints2 = await toolShedFacet.methods.totalAllocPoint().call()
    assert.equal(totalAllocPoints2, 1000 + Number(newPoolAllocPoints))

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
        newPoolAllocPoints,
        [rPRAddress],
        true
      ).send(
        {from:alice}
      )
      assert.fail('add pool should only be owner')
    } catch (e) {
      assert.include(e.message, 'LibDiamond: Must be contract owner')
    }
  })

  it("hacker adds his counterfeit NFT, but fails", async () => {
    await tokenA.methods.approve(diamondAddress, stakeAmount).send({from:hacker})
    await tokenB.methods.approve(diamondAddress, stakeAmount).send({from:hacker})

    try {
      await tokenFarmFacet.methods.deposit(
        poolid, [stakeAmount, stakeAmount], blocksToStake, fakeReward._address, 0).send({from:hacker})
      assert.fail('hacker shouldnt be able to use his own minted NFT in pool');
    } catch (e) {
      assert.include(e.message, 'chosen NFT is not part of the list')
    }
  })

  it("owner adds rAR to pool 1", async () => {
    const rPRisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rPRAddress).call()
    const rARisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rARAddress).call()
    const iBRisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, iBRAddress).call()
    assert.equal(rPRisValid, true)
    assert.equal(rARisValid, false)
    assert.equal(iBRisValid, false)

    await tokenFarmFacet.methods.changeValidNFTsForPool(poolid, [rARAddress], [true]).send({from: owner})
    
    const rPRisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rPRAddress).call()
    const rARisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rARAddress).call()
    const iBRisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, iBRAddress).call()
    assert.equal(rPRisValid2, true)
    assert.equal(rARisValid2, true)
    assert.equal(iBRisValid2, false)
  })
  it("owner disables all nft rewards to pool 1", async () => {
    const rPRisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rPRAddress).call()
    const rARisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rARAddress).call()
    const iBRisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, iBRAddress).call()
    assert.equal(rPRisValid, true)
    assert.equal(rARisValid, true)
    assert.equal(iBRisValid, false)

    await tokenFarmFacet.methods.changeValidNFTsForPool(poolid, [rARAddress, rPRAddress], [false, false]).send({from: owner})
    
    const rPRisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rPRAddress).call()
    const rARisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rARAddress).call()
    const iBRisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, iBRAddress).call()
    assert.equal(rPRisValid2, false)
    assert.equal(rARisValid2, false)
    assert.equal(iBRisValid2, false)
  })
  it("owner approves all nft rewards to pool 1", async () => {
    const rPRisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rPRAddress).call()
    const rARisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rARAddress).call()
    const iBRisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, iBRAddress).call()
    assert.equal(rPRisValid, false)
    assert.equal(rARisValid, false)
    assert.equal(iBRisValid, false)

    await tokenFarmFacet.methods.changeValidNFTsForPool(poolid, [rARAddress, rPRAddress, iBRAddress],
      [true, true, true]).send({from: owner})
    
    const rPRisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rPRAddress).call()
    const rARisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rARAddress).call()
    const iBRisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, iBRAddress).call()
    assert.equal(rPRisValid2, true)
    assert.equal(rARisValid2, true)
    assert.equal(iBRisValid2, true)
  })

  it("owner disables the rAR to pool 1", async () => {
    const rPRisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rPRAddress).call()
    const rARisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rARAddress).call()
    const iBRisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, iBRAddress).call()
    assert.equal(rPRisValid, true)
    assert.equal(rARisValid, true)
    assert.equal(iBRisValid, true)

    await tokenFarmFacet.methods.changeValidNFTsForPool(poolid, [rARAddress, rPRAddress, iBRAddress],
      [false, true, true]).send({from: owner})
    
    const rPRisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rPRAddress).call()
    const rARisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rARAddress).call()
    const iBRisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, iBRAddress).call()
    assert.equal(rPRisValid2, true)
    assert.equal(rARisValid2, false)
    assert.equal(iBRisValid2, true)
  })
  it("owner reenables the rAR to pool 1", async () => {
    const rPRisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rPRAddress).call()
    const rARisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rARAddress).call()
    const iBRisValid = await tokenFarmFacet.methods.isValidNFTForPool(poolid, iBRAddress).call()
    assert.equal(rPRisValid, true)
    assert.equal(rARisValid, false)
    assert.equal(iBRisValid, true)

    await tokenFarmFacet.methods.changeValidNFTsForPool(poolid, [rARAddress],
      [true]).send({from: owner})
    
    const rPRisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rPRAddress).call()
    const rARisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, rARAddress).call()
    const iBRisValid2 = await tokenFarmFacet.methods.isValidNFTForPool(poolid, iBRAddress).call()
    assert.equal(rPRisValid2, true)
    assert.equal(rARisValid2, true)
    assert.equal(iBRisValid2, true)
  })

  it("hacker tries to approve his NFT, but fails", async () => {
    try {
      await tokenFarmFacet.methods.changeValidNFTsForPool(poolid, [fakeReward._address], [true]).send({from: hacker})
      assert.fail('hacker shouldnt be able to add his NFT to the list of valid NFT rewards');
    } catch (e) {
      assert.include(e.message, 'LibDiamond: Must be contract owner')
    }
  })
})
