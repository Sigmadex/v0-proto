const { deployDiamond } = require('../../scripts/deploy.js')
const { deploy } = require('../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceBlocks } = require('../utilities.js')
const { calcNFTRewardAmount, calcSdexReward, unity, calcPenalty, calcSdexNFTRewardAmount } = require('./helpers.js')

const MockERC20 = artifacts.require('MockERC20')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyFacet = artifacts.require('ReducedPenaltyFacet')
const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')


async function tokenBalances(sdexFacet, tokens, users) {
  return await Promise.all(
    users.map(async (user) => {
      const data = await Promise.all(
        tokens.map(async(token) => {
          const amount = await token.contract.methods.balanceOf(user.address).call()
          const name = token.name
          return { [token.name]: amount}
        })
      )
      return { [user.name]: data }
    })
  )
}

async function userInfo(tokenFarmFacet, users, pools) {
  return await Promise.all(
    users.map(async (user) => {
        const data = await Promise.all(
         pools.map(async (pool) => {
          const userInfo = await tokenFarmFacet.methods.userInfo(pool, user.address).call()
          return await {
            [pool]: userInfo
          }
         })
        )
      return { [user.name]: data }
    })
  )
}
async function poolInfo(tokenFarmFacet, pools) {
  return await Promise.all(
    pools.map(async (pool) => {
      return await tokenFarmFacet.methods.poolInfo(pool).call()
    })
  )
}
async function tokenRewardGlobals(toolShedFacet, tokens ) {
  return await Promise.all(
    tokens.map(async (token) => {
      const rewardData = await toolShedFacet.methods.tokenRewardData(token.contract._address).call()
      return { [token.name]: rewardData }
    })
  )
}

contract("TokenFarmFacet", (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let joe = accounts[3]
  let carol = accounts[4]
  let users;
  let pools;
  let sdexFacet;
  let toolShedFacet;
  let tokenFarmFacet;
  let rewardFacet;
  let reducedPenaltyFacet;
  let reducedPenaltyReward;
  let tokenA;
  let tokenB;
  let tokenC;
  let tokenD;
  let tokens;
  const blocksToStake = 10
  let diamondAddress
  let pool1Added;
  
  before(async () => {
    diamondAddress = await deployDiamond()

    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
    toolShedFacet = new web3.eth.Contract(ToolShedFacet.abi, diamondAddress)
    tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)
    rewardFacet = new web3.eth.Contract(RewardFacet.abi, diamondAddress)
    reducedPenaltyFacet = new web3.eth.Contract(ReducedPenaltyFacet.abi, diamondAddress)

    const rPRAddress = await reducedPenaltyFacet.methods.rPAddress().call()
    reducedPenaltyReward = new web3.eth.Contract(ReducedPenaltyReward.abi, rPRAddress)
    

    let erc20TotalSupply = web3.utils.toWei('1000000', 'ether')
    tokenA = await deploy(owner, MockERC20, ['ERC20A', 'ERC20A', erc20TotalSupply])
    tokenB = await deploy(owner, MockERC20, ['ERC20B', 'ERC20B', erc20TotalSupply])
    tokenC = await deploy(owner, MockERC20, ['ERC20C', 'ERC20C', erc20TotalSupply])
    tokenD = await deploy(owner, MockERC20, ['ERC20D', 'ERC20D', erc20TotalSupply])
    tokens = [
      {name: 'tokenA',contract: tokenA},
      {name: 'tokenB',contract: tokenB},
      {name: 'tokenC',contract: tokenC},
      {name: 'tokenD',contract: tokenD},
      {name: 'sdex', contract: sdexFacet}
    ]
    const amount = web3.utils.toWei('2000', 'ether')
    await tokenA.methods.transfer(alice, amount).send({ from: owner });
    await tokenB.methods.transfer(alice, amount).send({ from: owner });
    
    await tokenA.methods.transfer(bob, amount).send({ from: owner });
    await tokenB.methods.transfer(bob, amount).send({ from: owner });
    await tokenC.methods.transfer(bob, amount).send({ from: owner });
    
    await tokenA.methods.transfer(joe, amount).send({ from: owner });
    await tokenB.methods.transfer(joe, amount).send({ from: owner });
    await tokenD.methods.transfer(joe, amount).send({ from: owner });

    await tokenA.methods.transfer(carol, amount).send({ from: owner });
    await tokenB.methods.transfer(carol, amount).send({ from: owner });
    await tokenC.methods.transfer(carol, amount).send({ from: owner });
    await tokenD.methods.transfer(carol, amount).send({ from: owner });
    users = [
      {name: 'alice', address: alice},
      {name: 'bob', address: bob},
      {name: 'joe', address: joe},
      {name: 'carol', address: carol}
    ]
    
  })

  it("adds reduced penalty reward to tokensA, B, C, and sdex (omits D)", async () => {
    const rPRAddress = await reducedPenaltyFacet.methods.rPAddress().call()
    await rewardFacet.methods.addReward(tokenA._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenB._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(tokenC._address, rPRAddress).send({from:owner})
    await rewardFacet.methods.addReward(diamondAddress, rPRAddress).send({from:owner})
    const validRewardsA = await rewardFacet.methods.getValidRewardsForToken(tokenA._address).call()
    const validRewardsB = await rewardFacet.methods.getValidRewardsForToken(tokenB._address).call()
    const validRewardsC = await rewardFacet.methods.getValidRewardsForToken(tokenC._address).call()
    const validRewardsD = await rewardFacet.methods.getValidRewardsForToken(tokenD._address).call()
    const validRewardsSdex = await rewardFacet.methods.getValidRewardsForToken(diamondAddress).call()
    assert.equal(validRewardsA[0], rPRAddress)
    assert.equal(validRewardsB[0], rPRAddress)
    assert.equal(validRewardsC[0], rPRAddress)
    assert.equal(validRewardsD.length, 0)
    assert.equal(validRewardsSdex[0], rPRAddress)
  })

  it("adds pools", async () => {
    let poolLength1 = await tokenFarmFacet.methods.poolLength().call()
    assert.equal(poolLength1, 1)
    let totalAllocPoints1 = await toolShedFacet.methods.totalAllocPoint().call()
    assert.equal(totalAllocPoints1, 1000)

    let farmAAlloc = 1000
    let farmBAlloc = 2000
    let farmCAlloc = 3000
    let farmDAlloc = 4000
    let farmEAlloc = 500
    let farmFAlloc = 500
    
    await tokenFarmFacet.methods.add(
      [tokenA._address, tokenB._address],
      farmAAlloc,
      true
    ).send(
      {from:owner}
    )
    pool1Added = await web3.eth.getBlockNumber()
    await tokenFarmFacet.methods.add(
      [tokenA._address, tokenC._address],
      farmBAlloc,
      true
    ).send(
      {from:owner}
    )
    await tokenFarmFacet.methods.add(
      [tokenA._address, tokenD._address],
      farmCAlloc,
      true
    ).send(
      {from:owner}
    )
    await tokenFarmFacet.methods.add(
      [tokenA._address],
      farmDAlloc,
      true
    ).send(
      {from:owner}
    )
    await tokenFarmFacet.methods.add(
      [tokenB._address, tokenC._address],
      farmEAlloc,
      true
    ).send(
      {from:owner}
    )
    await tokenFarmFacet.methods.add(
      [tokenC._address, tokenD._address],
      farmFAlloc,
      true
    ).send(
      {from:owner}
    )
    
    let poolLength2 = await tokenFarmFacet.methods.poolLength().call()
    assert.equal(poolLength2, 7)
    pools = [1,2,3,4,5,6]
    let totalAllocPoints2 = await toolShedFacet.methods.totalAllocPoint().call()
    assert.equal(totalAllocPoints2, 12000)
  })

  it("allows users to stake in Pool 1", async () => {
    const stakes = [...Array(users.length).keys()].map((i) => {
      const a = web3.utils.toWei((Math.floor((Math.random() * 20) + 1)).toString(), 'ether');
      const b = web3.utils.toWei((Math.floor((Math.random() * 20) + 1)).toString(), 'ether');
      const blocksAhead = Math.floor((Math.random() * 20)+10)
      return { a,b, blocksAhead }
    })

    // Stake Pool 1
    const deposits = await Promise.all(
    users.map(async(user, i) => {
      const stake = stakes[i]
      await tokenA.methods.approve(diamondAddress, stake.a).send({from:user.address})
      await tokenB.methods.approve(diamondAddress, stake.b).send({from:user.address})
      return deposit = await tokenFarmFacet.methods.deposit(
        1, [stake.a, stake.b], stake.blocksAhead, ADDRESSZERO, 0).send({from:user.address})
    })
    )
    const globalTokenRewardData2 = await tokenRewardGlobals(toolShedFacet, tokens)
    const poolInfo2 = await poolInfo(tokenFarmFacet, [1])




    //PoolInfo
    const poolSupplyA = stakes.reduce((prev,curr,i) => {
      if (i == 1) prev = new web3.utils.BN(prev.a)
      return prev.add(new web3.utils.BN(curr.a))
    })
    const poolSupplyB = stakes.reduce((prev,curr,i) => {
      if (i == 1) prev = new web3.utils.BN(prev.b)
      return prev.add(new web3.utils.BN(curr.b))
    })

    assert.equal(poolSupplyA.toString(), poolInfo2[0].tokenData[0].supply)
    assert.equal(poolSupplyB.toString(), poolInfo2[0].tokenData[1].supply)
    const blockAmountGlobalA = stakes.reduce((prev,curr,i) => {
      if (i == 1) prev = new web3.utils.BN(prev.a).mul(new web3.utils.BN(prev.blocksAhead))
      const nextTAG = new web3.utils.BN(curr.a).mul(new web3.utils.BN(curr.blocksAhead))
      return prev.add(nextTAG)
    })
    const blockAmountGlobalB = stakes.reduce((prev,curr,i) => {
      if (i == 1) prev = new web3.utils.BN(prev.b).mul(new web3.utils.BN(prev.blocksAhead))
      const nextTAG = new web3.utils.BN(curr.b).mul(new web3.utils.BN(curr.blocksAhead))
      return prev.add(nextTAG)
    })
    assert.equal(globalTokenRewardData2[0].tokenA.blockAmountGlobal, blockAmountGlobalA.toString())
    assert.equal(globalTokenRewardData2[1].tokenB.blockAmountGlobal, blockAmountGlobalB.toString())
  })
  it("Alice withdraws", async () => {
    const poolid = 1;
    const positionid = 0;
    let aliceTokenA1 = await tokenA.methods.balanceOf(alice).call()
    let aliceTokenB1 = await tokenB.methods.balanceOf(alice).call()
    let aliceSdex1 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondTokenA1 = await tokenA.methods.balanceOf(diamondAddress).call()
    let diamondTokenB1 = await tokenB.methods.balanceOf(diamondAddress).call()
    let diamondSdex1 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const userInfo1 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()
    const poolInfo1 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const position1 = userInfo1.positions[positionid]
    const stakeTime = position1.endBlock - position1.startBlock
    const {refund: refundA , penalty: penaltyA} = await calcPenalty(4, stakeTime, position1.amounts[0])
    const {refund: refundB, penalty: penaltyB} = await calcPenalty(4, stakeTime, position1.amounts[1])

    let tokenARewardData1 = await toolShedFacet.methods.tokenRewardData(tokenA._address).call()
    let tokenBRewardData1 = await toolShedFacet.methods.tokenRewardData(tokenB._address).call()
    let sdexRewardData1 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    await tokenFarmFacet.methods.withdraw(poolid, positionid).send({from: alice})
    const poolInfo2 = await tokenFarmFacet.methods.poolInfo(poolid).call()
    const userInfo2 = await tokenFarmFacet.methods.userInfo(poolid, alice).call()
    const position2 = userInfo2.positions[positionid]

    const supplyA1 = new web3.utils.BN(poolInfo1.tokenData[0].supply)
    const supplyA2 = new web3.utils.BN(poolInfo2.tokenData[0].supply)
    const supplyB1 = new web3.utils.BN(poolInfo1.tokenData[1].supply)
    const supplyB2 = new web3.utils.BN(poolInfo2.tokenData[1].supply)
    
    assert.equal(supplyA1.sub(supplyA2).toString(), position1.amounts[0])
    assert.equal(supplyB1.sub(supplyB2).toString(), position1.amounts[1])
    assert.equal(position2.amounts[0], 0)
    assert.equal(position2.amounts[1], 0)

    // Tokens
    let aliceTokenA2 = await tokenA.methods.balanceOf(alice).call()
    let aliceTokenB2 = await tokenB.methods.balanceOf(alice).call()
    let aliceSdex2 = await sdexFacet.methods.balanceOf(alice).call()
    let diamondTokenA2 = await tokenA.methods.balanceOf(diamondAddress).call()
    let diamondTokenB2 = await tokenB.methods.balanceOf(diamondAddress).call()
    let diamondSdex2 = await sdexFacet.methods.balanceOf(diamondAddress).call()
    const sdexReward = await calcSdexReward(toolShedFacet,tokenFarmFacet, 1, poolid)

    assert.equal(sdexReward.toString(), new web3.utils.BN(diamondSdex2).sub(new web3.utils.BN(diamondSdex1)).toString())

    assert.equal(refundA.toString(), new web3.utils.BN(aliceTokenA2).sub(new web3.utils.BN(aliceTokenA1)).toString())
    assert.equal(refundB.toString(), new web3.utils.BN(aliceTokenB2).sub(new web3.utils.BN(aliceTokenB1)).toString())

    // Token Amount Globals
    let tokenARewardData2 = await toolShedFacet.methods.tokenRewardData(tokenA._address).call()
    let tokenBRewardData2 = await toolShedFacet.methods.tokenRewardData(tokenB._address).call()
    let sdexRewardData2 = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
    const timeAmountA = new web3.utils.BN(position1.amounts[0]).mul(new web3.utils.BN(stakeTime))
    const timeAmountB = new web3.utils.BN(position1.amounts[1]).mul(new web3.utils.BN(stakeTime))
    const tard1AmountA =new web3.utils.BN(tokenARewardData1.blockAmountGlobal)
    const tard2AmountA =new web3.utils.BN(tokenARewardData2.blockAmountGlobal)
    assert.equal(tard1AmountA.sub(tard2AmountA).toString(), timeAmountA.toString())
    const tard1AmountB =new web3.utils.BN(tokenBRewardData1.blockAmountGlobal)
    const tard2AmountB =new web3.utils.BN(tokenBRewardData2.blockAmountGlobal)
    assert.equal(tard1AmountB.sub(tard2AmountB).toString(), timeAmountB.toString())
    assert.equal(tokenARewardData2.penalties, penaltyA.toString())
    assert.equal(tokenBRewardData2.penalties, penaltyB.toString())
  })
})
