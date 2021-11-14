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
const RewardAmplifierRewardFacet = artifacts.require('RewardAmplifierRewardFacet')
const IncreasedBlockRewardFacet = artifacts.require('IncreasedBlockRewardFacet')

const RewardAmplifierReward = artifacts.require('RewardAmplifierReward')
const IncreasedBlockReward = artifacts.require('IncreasedBlockReward')

function logState(state, tag, alice, bob, diamondAddress, tokenA, tokenB) {
  console.log(`=====================${tag}=====================`)
  console.log('block   ', state.blockNumber)
  console.log('--------')
  console.log('accounts::Sdex')
  console.log('--------')
  console.log('alice   ', state[alice].sdex)
  console.log('bob     ', state[bob].sdex)
  console.log('diamond ', state[diamondAddress].sdex)
  console.log('accounts::tokenA')
  console.log('--------')
  console.log('alice   ', state[alice][tokenA])
  console.log('bob     ', state[bob][tokenA])
  console.log('diamond ', state[diamondAddress][tokenA])
  console.log('accounts::tokenB')
  console.log('--------')
  console.log('alice   ', state[alice][tokenB])
  console.log('bob     ', state[bob][tokenB])
  console.log('diamond ', state[diamondAddress][tokenB])
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
  console.log('SDEX accounting balance ', BN(state[diamondAddress].sdex).sub(
    BN(state.vault.vSdex).add(
      BN(state.pool.tokenData[0].supply)).add(
        BN(state.rewardGlobals[diamondAddress].penalties)).add(
          BN(state.rewardGlobals[diamondAddress].rewarded)).add(
            BN(state.accSdexPenaltyPool)).add(
              BN(state.accSdexRewardPool))).toString(), 1
  )
}

contract("RewardAmplifier", (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let users = [alice, bob]
  let sdexFacet;
  let toolShedFacet;
  let tokenFarmFacet;
  let sdexVaultFacet;
  let rewardFacet;
  let rewardAmplifierRewardFacet;
  let rewardAmplifierReward;
  let increasedBlockRewardFacet;
  let increasedBlockReward;
  let tokenA;
  let tokenB;
  let rARAddress;
  let iBRAddress;
  let poolid = 1
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
    rewardAmplifierRewardFacet = new web3.eth.Contract(RewardAmplifierRewardFacet.abi, diamondAddress)
    increasedBlockRewardFacet = new web3.eth.Contract(IncreasedBlockRewardFacet.abi, diamondAddress)

    rARAddress = await rewardAmplifierRewardFacet.methods.rARAddress().call()
    iBRAddress = await increasedBlockRewardFacet.methods.iBRAddress().call()

    rewardAmplifierReward = new web3.eth.Contract(RewardAmplifierReward.abi, rARAddress)
    increasedBlockReward = new web3.eth.Contract(IncreasedBlockReward.abi, iBRAddress)

    const sdexAmount = web3.utils.toWei('1000', 'ether')

    await sdexFacet.methods.executiveMint(alice,sdexAmount).send({ from: owner })
    await sdexFacet.methods.executiveMint(bob, sdexAmount).send({ from: owner })

    let erc20TotalSupply = web3.utils.toWei('1000000', 'ether')
    tokenA = await deploy(owner, MockERC20, ['ERC20A', 'ERC20A', erc20TotalSupply])
    tokenB = await deploy(owner, MockERC20, ['ERC20B', 'ERC20B', erc20TotalSupply])
    tokens = [tokenA, tokenB]
    const amount = web3.utils.toWei('2000', 'ether')
    await tokenA.methods.transfer(alice, amount).send({ from: owner });
    await tokenB.methods.transfer(alice, amount).send({ from: owner });
    await tokenA.methods.transfer(bob, amount).send({ from: owner });
    await tokenB.methods.transfer(bob, amount).send({ from: owner });
  })

  it("increased Block Reward to sdex", async () => {

    await rewardFacet.methods.addReward(tokenA._address, rARAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenB._address, rARAddress).send({from:owner})
    await rewardFacet.methods.addReward(diamondAddress, rARAddress).send({from:owner})
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
    assert.equal(validRewardsSdex[0], rARAddress)
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
        true
      ).send(
        {from:alice}
      )
      assert.fail('add pool should only be owner')
    } catch (e) {
      assert.include(e.message, 'LibDiamond: Must be contract owner')
    }
  })

  it("bob fills penalty pool", async () => {
    await tokenA.methods.approve(diamondAddress, stakeAmount).send({from:bob})
    await tokenB.methods.approve(diamondAddress, stakeAmount).send({from:bob})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)
    logState(state1, 'state1', alice, bob, diamondAddress, tokenA._address, tokenB._address)

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount, stakeAmount], blocksToStake, ADDRESSZERO, 0).send({from:bob})

    await tokenFarmFacet.methods.withdraw(poolid, 0).send({from: bob})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)

    await tokenA.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    await tokenB.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount, stakeAmount], blocksToStake, ADDRESSZERO, 0).send({from:alice})

    await advanceBlocks(blocksToStake)

    await tokenFarmFacet.methods.withdraw(poolid, 0).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)

    logState(state3, 'state3::alice::withdraw', alice,bob, diamondAddress, tokenA._address, tokenB._address)
    
    let nft1 = await rewardAmplifierReward.methods.balanceOf(alice , 1).call()
    let rewardAmount1 = await rewardAmplifierRewardFacet.methods.rARAmount(1).call()
    assert.equal(nft1, 1)
    assert.equal(rewardAmount1.token, tokenA._address)
    assert.equal(rewardAmount1.amount , state2.rewardGlobals[tokenA._address].penalties)
    
    let nft2 = await rewardAmplifierReward.methods.balanceOf(alice , 2).call()
    let rewardAmount2 = await rewardAmplifierRewardFacet.methods.rARAmount(2).call()
    assert.equal(nft2, 1)
    assert.equal(rewardAmount2.token, tokenB._address)
    assert.equal(rewardAmount2.amount , state2.rewardGlobals[tokenB._address].penalties)
    
    let nft3 = await rewardAmplifierReward.methods.balanceOf(alice , 3).call()
    let rewardAmount3 = await rewardAmplifierRewardFacet.methods.rARAmount(3).call()
    assert.equal(nft3, 1)
    assert.equal(rewardAmount3.token, diamondAddress)
    assert.equal(rewardAmount3.amount, state2.accSdexPenaltyPool)
    
    /*
    assert.equal(rewardAmount1.rewardPool, 0) // ENUM for token reward pool
    let nft2 = await increasedBlockReward.methods.balanceOf(alice , 2).call()
    let rewardAmount2 = await rewardAmplifierRewardFacet.methods.rARAmount(2).call()
    assert.equal(nft2, 1)
    assert.equal(rewardAmount2.token, diamondAddress)
    assert.equal(rewardAmount2.amount, state3.accSdexRewardPool)
    assert.equal(rewardAmount2.rewardPool, 1) // ENBUm for accumulated Sdex Penalty Pool
    */
  })

  it("amplifies a newly created reward", async () => {
    let positionid = 1
    let nftid = 1

    await tokenA.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    await tokenB.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid, tokens)
    logState(state1, 'state1', alice, alice, diamondAddress, tokenA._address, tokenB._address)

    let nft1 = await rewardAmplifierReward.methods.balanceOf(alice , nftid).call()
    let rewardAmount1 = await rewardAmplifierRewardFacet.methods.rARAmount(nftid).call()

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount, stakeAmount], blocksToStake, rARAddress, nftid).send({from:alice})

    await advanceBlocks(blocksToStake)

    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let nft1A = await rewardAmplifierReward.methods.balanceOf(alice , 4).call()
    let rewardAmount1A = await rewardAmplifierRewardFacet.methods.rARAmount(4).call()
    console.log(rewardAmount1, rewardAmount1A)

  })

})
