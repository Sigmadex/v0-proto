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
contract("IncreasedBlockReward: SdexFarmFacet", (accounts) => {
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
  const stakeTime = 3600
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

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, ADDRESSZERO, 0).send({from:bob})

    await tokenFarmFacet.methods.withdraw(poolid, 0).send({from: bob})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, ADDRESSZERO, 0).send({from:alice})

    await advanceChain(360, 10)

    await tokenFarmFacet.methods.withdraw(poolid, 0).send({from: alice})

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

  it("alice uses nft reward", async () => {
    console.log('=================alice uses nft reward================')
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 301, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    const nftid = 1  
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, iBRAddress, nftid).send({from:alice})

    let actives  = await increasedBlockReward.methods.actives(nftid).call()
    assert.equal(actives, 1)

    await advanceChain(30, 10)

    await tokenFarmFacet.methods.withdraw(poolid, 1).send({from: alice})
    actives  = await increasedBlockReward.methods.actives(nftid).call()
    assert.equal(actives, 0)

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
  
    const {refund, penalty} = calcPenalty(300 + 1, stakeTime, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(1).call()
    console.log(rewardAmount1.amount, rewardAmount2.amount, 'rewardamounts')
    console.log(rewardPerBlock.toString(), 'rewardperblock')
    assert.equal(BN(rewardAmount1.amount).sub(rewardPerBlock).toString(), rewardAmount2.amount)
    assert.equal(
      BN(state2.rewardGlobals[diamondAddress].rewarded).add(rewardPerBlock).toString(),
      state1.rewardGlobals[diamondAddress].rewarded
    )
    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state2.rewardGlobals[diamondAddress].penalties
    )
    assert.equal(BN(state1.accSdexPenaltyPool).add(rewardPerBlock).add(rewardPerBlock).toString(),
      state2.accSdexPenaltyPool
    )
  })
  it('calculates correctly over a larger (1 - 3) interval', async () => {
    const nftid = 1
    const positionid = 2
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 601, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, iBRAddress, nftid).send({from:alice})
    await advanceChain(60, 10)
    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    

    const {refund, penalty} = calcPenalty(601, stakeTime, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    assert.equal(BN(rewardAmount1.amount).sub(rewardPerBlock).toString(), rewardAmount2.amount)
    assert.equal(
      BN(state2.rewardGlobals[diamondAddress].rewarded).add(rewardPerBlock).toString(),
      state1.rewardGlobals[diamondAddress].rewarded
    )
    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state2.rewardGlobals[diamondAddress].penalties
    )
    assert.equal(BN(state1.accSdexPenaltyPool).add(rewardPerBlock).add(rewardPerBlock).toString(),
      state2.accSdexPenaltyPool
    )
    console.log('remaing funds on nftid=1')
    console.log(rewardAmount2)
  })

  it('calculates correctly when overflowing', async () => {
    const nftid = 1
    const positionid = 3
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 701, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, iBRAddress, nftid).send({from:alice})
    await advanceChain(70, 10)
    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    const {refund, penalty} = calcPenalty(701, stakeTime, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    console.log(rewardAmount2)
    assert.equal(0, rewardAmount2.amount)
    assert.equal(0, state2.rewardGlobals[diamondAddress].rewarded)
    assert.equal(
      BN(state2.rewardGlobals[diamondAddress].rewarded).add(BN(rewardAmount1.amount)).toString(),
      state1.rewardGlobals[diamondAddress].rewarded
    )
    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state2.rewardGlobals[diamondAddress].penalties
    )

    console.log('========')
    console.log(state1.accSdexPenaltyPool)
    console.log(rewardPerBlock.toString())
    console.log(state2.accSdexPenaltyPool)
    console.log('========')
    assert.equal(BN(state1.accSdexPenaltyPool).add(rewardPerBlock).add(BN(rewardAmount1.amount)).toString(),
      state2.accSdexPenaltyPool
    )

  })
  it('calculates correctly when from accSdexVault', async () => {
    const nftid = 2
    const positionid = 4
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 301, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, iBRAddress, nftid).send({from:alice})
    await advanceChain(30, 10)
    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    

    const {refund, penalty} = calcPenalty(301, stakeTime, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    console.log(rewardAmount1.amount, rewardAmount2.amount)
    console.log(state2.accSdexRewardPool, state1.accSdexRewardPool, 'rewardpool')
    console.log(BN(state1.accSdexRewardPool).sub(BN(rewardPerBlock)).toString(), state2.accSdexRewardPool)

    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state2.rewardGlobals[diamondAddress].penalties
    )
    assert.equal(BN(state1.accSdexPenaltyPool).add(rewardPerBlock.mul(BN(1))).toString(),
      state2.accSdexPenaltyPool
    )
  })
  it("reload new nfts for alice", async () => {
    const positionid = 5

    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:bob})

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, ADDRESSZERO, 0).send({from:bob})

    await advanceChain(2, 10)

    await tokenFarmFacet.methods.withdraw(poolid, 1).send({from: bob})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, ADDRESSZERO, 0).send({from:alice})

    await advanceBlocks(stakeTime)

    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    logState(state3, 'state3::alice::withdraw', alice,bob, diamondAddress)

    let nft1 = await increasedBlockReward.methods.balanceOf(alice , 3).call()
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(3).call()
    assert.equal(nft1, 1)
    assert.equal(rewardAmount1.token, diamondAddress)
    assert.equal(rewardAmount1.amount, state3.rewardGlobals[diamondAddress].rewarded)
    assert.equal(rewardAmount1.rewardPool, 0) // ENUM for token reward pool
    let nft2 = await increasedBlockReward.methods.balanceOf(alice , 4).call()
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(4).call()
    assert.equal(nft2, 1)
    assert.equal(rewardAmount2.token, diamondAddress)
    assert.equal(rewardAmount2.amount, state3.accSdexRewardPool)
    assert.equal(rewardAmount2.rewardPool, 1) // ENBUm for accumulated Sdex Penalty Pool
  })

  it('calculates correctly from vault when more over', async () => {
    const nftid = 4
    const positionid = 6
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 301, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, iBRAddress, nftid).send({from:alice})
    await advanceChain(30, 10)
    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    

    const {refund, penalty} = calcPenalty(301, stakeTime, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    console.log(rewardAmount1.amount, rewardAmount2.amount)
    console.log(state2.accSdexRewardPool, state1.accSdexRewardPool, 'rewardpool')
    console.log(BN(state1.accSdexRewardPool).sub(BN(rewardPerBlock)).toString(), state2.accSdexRewardPool)

    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state2.rewardGlobals[diamondAddress].penalties
    )
    assert.equal(BN(state1.accSdexPenaltyPool).add(rewardPerBlock).add(rewardPerBlock).toString(),
      state2.accSdexPenaltyPool
    )
  })

  it('calculates correctly from vault when more over', async () => {
    const nftid = 4
    const positionid = 7
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 2401, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, iBRAddress, nftid).send({from:alice})
    await advanceChain(240, 10)
    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    

    const {refund, penalty} = calcPenalty(2401, stakeTime, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    console.log(rewardAmount1.amount, rewardAmount2.amount)
    assert.equal(BN(rewardAmount1.amount).sub(BN(rewardPerBlock)).toString(), rewardAmount2.amount)
  })

  it('calculates correctly from vault when withdraw is greater than endBlock', async () => {
    const nftid = 4
    const positionid = 8
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 1201, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    await tokenFarmFacet.methods.deposit(
      poolid, [stakeAmount], stakeTime, iBRAddress, nftid).send({from:alice})
    await advanceChain(120, 10)
    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})

    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    

    const {refund, penalty} = calcPenalty(1201, stakeTime, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    console.log('this' ,rewardAmount1.amount, rewardAmount2.amount)
    assert.equal(rewardAmount2.amount, 0)
    assert.equal(BN(state1.accSdexRewardPool).sub(BN(rewardAmount1.amount)).toString(), state2.accSdexRewardPool)
  })
})

