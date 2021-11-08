const fromExponential = require('from-exponential')

const unity = new web3.utils.BN(fromExponential(1e27))

async function calcSdexReward(toolShedFacet, tokenFarmFacet, blocksAhead, poolid) {
  const sdexPerBlock = await toolShedFacet.methods.sdexPerBlock().call()
  const totalAllocPoints = await toolShedFacet.methods.totalAllocPoint().call()
  const poolAllocPoints = (await tokenFarmFacet.methods.poolInfo(poolid).call()).allocPoint
  // only one block ahead, advance time doesn't jump block like one would think
  let numer = (blocksAhead)*sdexPerBlock*poolAllocPoints
  const numerator = BN(fromExponential(numer))
  const denominator = BN(totalAllocPoints)
  const sdexReward = numerator.div(denominator)
  return sdexReward
}
function calcPenalty(elapsedTime, blocksToStake, stakeAmount) {
  stakeAmount = BN(stakeAmount)
  const proportion = unity.mul(BN(elapsedTime)).div(BN(blocksToStake))
  const refund = (BN(stakeAmount)).mul(proportion).div(unity)
  const penalty = (BN(stakeAmount)).sub(refund)
  return {refund, penalty}
}

async function calcNFTRewardAmount(token, toolShed, diamondAddress,  blocksToStake, stakeAmount) {
  const rewardData = await toolShed.methods.tokenRewardData(token._address).call()
  const penalties = BN(rewardData.penalties);
  const gtaToken =  BN(rewardData.blockAmountGlobal)
  const ltaToken = BN(blocksToStake).mul(BN(stakeAmount))
  console.log(ltaToken.toString())
  return ltaToken.mul(penalties).div(gtaToken)
}

async function calcSdexNFTRewardAmount(tokenFarmFacet, toolShedFacet,sdexFacet, diamondAddress, poolid, blocksAhead, user, positionid) {
  const poolInfo = (await tokenFarmFacet.methods.poolInfo(poolid).call())
  const userInfo = await tokenFarmFacet.methods.userInfo(poolid, user ).call()
  const position = userInfo.positions[positionid]

  const poolAllocPoints = BN(poolInfo.allocPoint)
  const totalAllocPoints = BN(await toolShedFacet.methods.totalAllocPoint().call())
  const sdexPerBlock = BN(await toolShedFacet.methods.sdexPerBlock().call())


  //Update Pool""
  const sdexReward = BN(blocksAhead+1).mul(sdexPerBlock).mul(poolAllocPoints).div(totalAllocPoints)
  let tAShares = [];
  for (let i=0; i < poolInfo.tokenData.length; i++) {
    const accZeroInit = BN(poolInfo.tokenData[i].accSdexPerShare)
    const additionNumer = sdexReward.mul(unity)
    const supply = BN(poolInfo.tokenData[i].supply)
    const length = BN(poolInfo.tokenData.length)
    const additionDenominator = supply.mul(length)
    const newAddition = additionNumer.div(additionDenominator)
    const accSdex0 = accZeroInit.add(newAddition);
    const amount = BN(position.amounts[i])
    const rewardDebt = BN(userInfo.tokenData[i].rewardDebt)
    const timeAmountShares = amount.mul(accSdex0).sub(rewardDebt)
    tAShares.push(timeAmountShares)
  }

  const totalAmountShares = tAShares.reduce((a,b) => a.add(b))

  const tokenRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
  const diamondSdex  = await sdexFacet.methods.balanceOf(diamondAddress).call()
  const sdexBalance = BN(diamondSdex).sub(BN(tokenRewardData.penalties))

  const proportion = BN(totalAmountShares).div(sdexReward)
  const reward = sdexBalance.mul(proportion).div(unity)
  return reward
}


async function fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, pool, tokens) {
  const returnObj = {}
  for (const user of users) {
    returnObj[user] = { 
      'sdex':  await sdexFacet.methods.balanceOf(user).call(),
      'userInfo': await tokenFarmFacet.methods.userInfo(pool, user).call(),
      'vUserInfo': await sdexVaultFacet.methods.vUserInfo(user).call(),
      'vShares': await sdexVaultFacet.methods.vShares(user).call()
    }

    if (tokens) {
      for (const token of tokens) {
        returnObj[user][token._address] = await token.methods.balanceOf(user).call()
      }
    }
  }
  const diamondSdex = await sdexFacet.methods.balanceOf(diamondAddress).call()

  const vSdex = await sdexVaultFacet.methods.vSdex().call()
  const vSharesDiamond = await sdexVaultFacet.methods.vShares(diamondAddress).call()
  const vTotalShares = await sdexVaultFacet.methods.vTotalShares().call()

  const poolInfo = await tokenFarmFacet.methods.poolInfo(pool).call()
  const userInfo = await tokenFarmFacet.methods.userInfo(pool, diamondAddress).call()

  const tokenGlobals = {}
  const tokenGlobalSdex = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
  tokenGlobals[diamondAddress] = tokenGlobalSdex
  if (tokens) {
    for (const token of tokens) {
      const rewardData = await toolShedFacet.methods.tokenRewardData(token._address).call()
      tokenGlobals[token._address] = rewardData
    }
  }

  returnObj[diamondAddress] = {
    'sdex': diamondSdex,
    'userInfo': userInfo,
    'vShares': vSharesDiamond
  }
  if (tokens) {
    for (const token of tokens) {
      returnObj[diamondAddress][token._address] = await token.methods.balanceOf(diamondAddress).call()
    }
  }
  returnObj['vault'] = {
    'vSdex': vSdex,
    'vTotalShares': vTotalShares,
    'vTreasury': await sdexVaultFacet.methods.vTreasury().call()
  }
  returnObj['pool'] = poolInfo
  returnObj['rewardGlobals'] = tokenGlobals
  returnObj['accSdexPenaltyPool'] = await toolShedFacet.methods.accSdexPenaltyPool().call()
  returnObj['accSdexRewardPool'] = await toolShedFacet.methods.accSdexRewardPool().call()
  returnObj['accSdexPaidOut'] = await toolShedFacet.methods.accSdexPaidOut().call()
  returnObj['blockNumber'] = await web3.eth.getBlockNumber()
  return returnObj

}

function BN(number) {
  return new web3.utils.BN(number)
}
exports.calcSdexReward = calcSdexReward
exports.unity = unity
exports.calcPenalty = calcPenalty
exports.calcNFTRewardAmount = calcNFTRewardAmount
exports.calcSdexNFTRewardAmount = calcSdexNFTRewardAmount
exports.fetchState = fetchState
exports.BN = BN
