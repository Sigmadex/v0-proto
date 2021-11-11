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
  })

})

