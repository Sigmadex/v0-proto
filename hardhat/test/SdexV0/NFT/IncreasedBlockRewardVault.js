
const fromExponential = require('from-exponential')
const { deployDiamond } = require('../../../scripts/deploy.js')
const { deploy } = require('../../../scripts/libraries/diamond.js')
const { ADDRESSZERO, advanceChain } = require('../../utilities.js')
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


    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, ADDRESSZERO, 0).send({from:alice})

    await advanceChain(30, 10)
    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, ADDRESSZERO, 0).send({from:bob})

    await sdexVaultFacet.methods.withdrawVault(0).send({from: bob})

    await advanceChain(330, 10)
    await sdexVaultFacet.methods.withdrawVault(0).send({from: alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    //logState(state3, 'state3::alice::withdraw', alice,bob, diamondAddress)

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
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 62, 0)
    
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, iBRAddress, nftid).send({from:alice})

    let actives = await increasedBlockReward.methods.actives(nftid).call()
    assert.equal(actives, 1)
    
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    //logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    await advanceChain(60, 1)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    //logState(state3, 'state3::bob::harvest', alice,bob, diamondAddress)

    const vaultBalance = await sdexVaultFacet.methods.vaultBalance().call()

    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})
    actives = await increasedBlockReward.methods.actives(nftid).call()
    assert.equal(actives, 0)

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    //logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    const {refund, penalty} = calcPenalty(62, stakeTime, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    
    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmount)).toString(), state2[alice].sdex)
    
    const harvestReward =  BN(state3[alice].sdex).sub(BN(state2[alice].sdex))

    assert.equal(BN(state4[alice].sdex).sub(BN(state3[alice].sdex)).toString(), refund.toString())
    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state4.rewardGlobals[diamondAddress].penalties
    )
    console.log('rewardPerBlock:', rewardPerBlock.toString())

    // current amount
    //position.shares * vaultBalance / vTotalSharesa
    const shares = state3[alice].vUserInfo.positions[positionid].shares
    const amount = state3[alice].vUserInfo.positions[positionid].amount
    console.log('vaultBalance', vaultBalance)
    const vTotalShares = state3.vault.vTotalShares
    const currentAmount = BN(shares).mul(BN(vaultBalance)).div(BN(vTotalShares))
    console.log(currentAmount.toString(), '<-')
    const accruedSdex = currentAmount.sub(BN(amount)) 
    const bonus = BN(rewardAmount1.amount)

    




    //const accruedSdex = BN(rewardPerBlock).sub(harvestReward).sub(BN(state3.vault.vTreasury))
    const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(62, stakeTime, accruedSdex.add(bonus))
    console.log('test:accSdexRefund:', accSdexRefund.toString())
    console.log('test:accSdexPenalty:', accSdexPenalty.toString())
    console.log('===============')
    console.log(state1.accSdexPenaltyPool)
    console.log(state4.accSdexPenaltyPool)
    console.log('===============')
    console.log(BN(state1.accSdexPenaltyPool).add(accSdexPenalty).add(accSdexRefund).toString())
    assert.equal(BN(state1.accSdexPenaltyPool).add(accSdexPenalty).add(accSdexRefund).toString(),
    BN(state4.accSdexPenaltyPool).toString()
    )
  })



  it('calculates correctly over a larger interval', async () => {
    const timeAhead = 360
    const nftid = 1
    const positionid = 2
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 60, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, iBRAddress, nftid).send({from:alice})
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    await advanceChain(timeAhead, 1)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state3, 'state3::bob::harvest', alice,bob, diamondAddress)

    const vaultBalance = await sdexVaultFacet.methods.vaultBalance().call()
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    const {refund, penalty} = calcPenalty(timeAhead + 2, stakeTime, stakeAmount) 
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

    const shares = state3[alice].vUserInfo.positions[positionid].shares
    const amount = state3[alice].vUserInfo.positions[positionid].amount
    console.log('vaultBalance', vaultBalance)
    const vTotalShares = state3.vault.vTotalShares
    const currentAmount = BN(shares).mul(BN(vaultBalance)).div(BN(vTotalShares))
    console.log(currentAmount.toString(), '<-')
    const accruedSdex = currentAmount.sub(BN(amount)) 
    const bonus = BN(rewardAmount1.amount)
    
    //const accruedSdex = BN(rewardPerBlock.mul(BN(timeAhead))).sub(harvestReward).sub(BN(performanceFee))
    //const bonus = accruedSdex.div(BN(timeAhead)).mul((BN(timeAhead)))
    const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(timeAhead +2, stakeTime, accruedSdex.add(bonus))

    assert.equal(BN(state1.accSdexPenaltyPool).add(accSdexPenalty).add(accSdexRefund).toString(),
    BN(state4.accSdexPenaltyPool).toString()
    )
  })

  it('calculates correctly over 5 interval', async () => {
    const timeAhead = 1200
    const nftid = 1
    const positionid = 3
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 60, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, iBRAddress, nftid).send({from:alice})
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    await advanceChain(120, 10)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state3, 'state3::bob::harvest', alice,bob, diamondAddress)

    const vaultBalance = await sdexVaultFacet.methods.vaultBalance().call()
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    const {refund, penalty} = calcPenalty(timeAhead + 2, stakeTime, stakeAmount) 
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
    

    const shares = state3[alice].vUserInfo.positions[positionid].shares
    const amount = state3[alice].vUserInfo.positions[positionid].amount
    console.log('vaultBalance', vaultBalance)
    const vTotalShares = state3.vault.vTotalShares
    const currentAmount = BN(shares).mul(BN(vaultBalance)).div(BN(vTotalShares))
    console.log(currentAmount.toString(), '<-')
    const accruedSdex = currentAmount.sub(BN(amount)) 
    const bonus = BN(rewardAmount1.amount)


    //const accruedSdex = BN(rewardPerBlock.mul(BN(timeAhead))).sub(harvestReward).sub(BN(performanceFee))
    //const bonus = accruedSdex.div(BN(timeAhead)).mul((BN(timeAhead)))
    const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(timeAhead + 1, stakeTime, accruedSdex.add(bonus))

    assert.equal(BN(state1.accSdexPenaltyPool).add(accSdexPenalty).add(accSdexRefund).toString(),
    BN(state4.accSdexPenaltyPool).toString()
    )
  })

  it('calculates correctly over 6 interval', async () => {
    const timeAhead = 2400
    const nftid = 1
    const positionid = 4
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 60, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, iBRAddress, nftid).send({from:alice})
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    await advanceChain(240, 10)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state3, 'state3::bob::harvest', alice,bob, diamondAddress)

    const vaultBalance = await sdexVaultFacet.methods.vaultBalance().call()
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    const {refund, penalty} = calcPenalty(timeAhead + 2, stakeTime, stakeAmount) 
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
    //const accruedSdex = BN(rewardPerBlock.mul(BN(timeAhead))).sub(harvestReward).sub(BN(performanceFee))
    //const bonus = accruedSdex.div(BN(timeAhead)).mul((BN(timeAhead)))
   
    const shares = state3[alice].vUserInfo.positions[positionid].shares
    const amount = state3[alice].vUserInfo.positions[positionid].amount
    console.log('vaultBalance', vaultBalance)
    const vTotalShares = state3.vault.vTotalShares
    const currentAmount = BN(shares).mul(BN(vaultBalance)).div(BN(vTotalShares))
    console.log(currentAmount.toString(), '<-')
    const accruedSdex = currentAmount.sub(BN(amount)) 
    const bonus = BN(rewardAmount1.amount)

    
    const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(timeAhead + 2, stakeTime, accruedSdex.add(bonus))

    assert.equal(BN(state1.accSdexPenaltyPool).add(accSdexPenalty).add(accSdexRefund).toString(),
    BN(state4.accSdexPenaltyPool).toString()
    )
  })

  it('calculates correctly when remaining bonus is used interval', async () => {
    const timeAhead = 1200
    const nftid = 1
    const positionid = 5
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 60, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, iBRAddress, nftid).send({from:alice})
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    await advanceChain(120, 10)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state3, 'state3::bob::harvest', alice,bob, diamondAddress)

    const vaultBalance = await sdexVaultFacet.methods.vaultBalance().call()
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    const {refund, penalty} = calcPenalty(timeAhead + 2, stakeTime, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmount)).toString(), state2[alice].sdex)
    
    const harvestReward =  BN(state3[alice].sdex).sub(BN(state2[alice].sdex))

    assert.equal(BN(state4[alice].sdex).sub(BN(state3[alice].sdex)).toString(), refund.toString())
    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state4.rewardGlobals[diamondAddress].penalties
    )
    const performanceFee = BN(state3.vault.vTreasury).sub(BN(state2.vault.vTreasury))

    const shares = state3[alice].vUserInfo.positions[positionid].shares
    const amount = state3[alice].vUserInfo.positions[positionid].amount
    console.log('vaultBalance', vaultBalance)
    const vTotalShares = state3.vault.vTotalShares
    const currentAmount = BN(shares).mul(BN(vaultBalance)).div(BN(vTotalShares))
    console.log(currentAmount.toString(), '<-')
    const accruedSdex = currentAmount.sub(BN(amount)) 
    const bonus = BN(rewardAmount1.amount)
   // const accruedSdex = BN(rewardPerBlock.mul(BN(timeAhead))).sub(harvestReward).sub(BN(performanceFee))
    //let bonus = accruedSdex.div(BN(timeAhead)).mul((BN(timeAhead)))
    //bonus = (BN(rewardAmount1.amount).toString() >= bonus.toString()) ? bonus : BN(rewardAmount1.amount)
    const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(timeAhead + 2, stakeTime, accruedSdex.add(bonus))

    assert.equal(BN(state1.accSdexPenaltyPool).add(accSdexPenalty).add(accSdexRefund).toString(),
    BN(state4.accSdexPenaltyPool).toString()
    )
    assert.equal(state4.rewardGlobals[diamondAddress].rewarded, 0)
    assert.equal(rewardAmount2.amount, 0)
  })

  it('calculates correctly from accSdexPool (1)', async () => {
    const timeAhead = 360
    const nftid = 2
    const positionid = 6
    const rewardPerBlock  = await calcSdexReward(toolShedFacet, tokenFarmFacet, 60, 0)
    await sdexFacet.methods.approve(diamondAddress, stakeAmount).send({from:alice})
    
    let rewardAmount1 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()

    let state1 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)

    await sdexVaultFacet.methods.depositVault(
      stakeAmount, stakeTime, iBRAddress, nftid).send({from:alice})
    let state2 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    //logState(state2, 'state2::alice::deposit', alice,bob, diamondAddress)

    //await advanceBlocks(timeAhead - 2)
    await advanceChain(36, 10)
    await sdexVaultFacet.methods.harvest().send({from:alice})

    let state3 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    logState(state3, 'state3::bob::harvest', alice,bob, diamondAddress)

    const vaultBalance = await sdexVaultFacet.methods.vaultBalance().call()
    await sdexVaultFacet.methods.withdrawVault(positionid).send({from: alice})

    let state4 = await fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, poolid)
    
    logState(state4, 'state4::alice::withdraw', alice,bob, diamondAddress)

    const {refund, penalty} = calcPenalty(timeAhead + 2, stakeTime, stakeAmount) 
    let rewardAmount2 = await increasedBlockRewardFacet.methods.iBRAmount(nftid).call()
    assert.equal(BN(state1[alice].sdex).sub(BN(stakeAmount)).toString(), state2[alice].sdex)
    
    const harvestReward =  BN(state3[alice].sdex).sub(BN(state2[alice].sdex))

    assert.equal(BN(state4[alice].sdex).sub(BN(state3[alice].sdex)).toString(), refund.toString())
    assert.equal(
      BN(state1.rewardGlobals[diamondAddress].penalties).add(penalty).toString(),
      state4.rewardGlobals[diamondAddress].penalties
    )
    const performanceFee = BN(state3.vault.vTreasury).sub(BN(state2.vault.vTreasury))
    //const accruedSdex = BN(rewardPerBlock.mul(BN(timeAhead))).sub(harvestReward).sub(BN(performanceFee))
    //let bonus = accruedSdex.div(BN(timeAhead)).mul((BN(timeAhead)))
    //
    //bonus = (BN(rewardAmount1.amount).toString() >= bonus.toString()) ? bonus : BN(rewardAmount1.amount)
    
    const shares = state3[alice].vUserInfo.positions[positionid].shares
    const amount = state3[alice].vUserInfo.positions[positionid].amount
    console.log('vaultBalance', vaultBalance)
    const vTotalShares = state3.vault.vTotalShares
    const currentAmount = BN(shares).mul(BN(vaultBalance)).div(BN(vTotalShares))
    console.log(currentAmount.toString(), '<-')
    const accruedSdex = currentAmount.sub(BN(amount)) 
    const bonus = BN(rewardAmount1.amount)

    const {refund:accSdexRefund, penalty:accSdexPenalty} = calcPenalty(timeAhead, stakeTime, accruedSdex.add(bonus))

    assert.equal(BN(state1.accSdexPenaltyPool).add(accSdexPenalty).add(accSdexRefund).toString(),
    BN(state4.accSdexPenaltyPool).toString()
    )
    assert.equal(state4.accSdexRewardPool, BN(state1.accSdexRewardPool).sub(bonus).toString())
    assert.equal(state4.rewardGlobals[diamondAddress].rewarded, 0)
    assert.equal(rewardAmount2.amount, BN(rewardAmount1.amount).sub(bonus).toString())
  })

})
