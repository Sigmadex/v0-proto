const fromExponential = require('from-exponential')

const unity = new web3.utils.BN(fromExponential(1e27))

async function calcSdexReward(toolShedFacet, tokenFarmFacet, blocksAhead, poolid) {
  const sdexPerBlock = await toolShedFacet.methods.sdexPerBlock().call()
  const totalAllocPoints = await toolShedFacet.methods.totalAllocPoint().call()
  const poolAllocPoints = (await tokenFarmFacet.methods.poolInfo(poolid).call()).allocPoint
  // only one block ahead, advance time doesn't jump block like one would think
  let numer = (blocksAhead)*sdexPerBlock*poolAllocPoints
  const numerator = new web3.utils.BN(fromExponential(numer))
  const denominator = new web3.utils.BN(totalAllocPoints)
  const sdexReward = numerator.div(denominator)
  return sdexReward
}
function calcPenalty(elapsedTime, stakeTime, stakeAmount) {
  stakeAmount = new web3.utils.BN(stakeAmount)
  const proportion = unity.mul(new web3.utils.BN(elapsedTime)).div(new web3.utils.BN(stakeTime))
  const refund = (new web3.utils.BN(stakeAmount)).mul(proportion).div(unity)
  const penalty = (new web3.utils.BN(stakeAmount)).sub(refund)
  return {refund, penalty}
}

async function calcNFTRewardAmount(token, toolShed, diamondAddress,  stakeTime, stakeAmount) {
  const rewardData = await toolShed.methods.tokenRewardData(token._address).call()
  const penalties = new web3.utils.BN(rewardData.penalties);
  const gtaToken =  new web3.utils.BN(rewardData.timeAmountGlobal)
  const ltaToken =  new web3.utils.BN(fromExponential(new web3.utils.BN(stakeTime)*stakeAmount))
  return ltaToken.mul(penalties).div(gtaToken)
}

async function calcSdexNFTRewardAmount(tokenFarmFacet, toolShedFacet,sdexFacet, diamondAddress, poolid, blocksAhead, user, positionid) {
  const poolInfo = (await tokenFarmFacet.methods.poolInfo(poolid).call())
  const userInfo = await tokenFarmFacet.methods.userInfo(poolid, user ).call()
  const position = userInfo.positions[positionid]

  const poolAllocPoints = new web3.utils.BN(poolInfo.allocPoint)
  const totalAllocPoints = new web3.utils.BN(await toolShedFacet.methods.totalAllocPoint().call())
  const sdexPerBlock = new web3.utils.BN(await toolShedFacet.methods.sdexPerBlock().call())


  //Update Pool""
  const sdexReward = new web3.utils.BN(blocksAhead+1).mul(sdexPerBlock).mul(poolAllocPoints).div(totalAllocPoints)
  let tAShares = [];
  for (let i=0; i < poolInfo.tokenData.length; i++) {
    const accZeroInit = new web3.utils.BN(poolInfo.tokenData[i].accSdexPerShare)
    const additionNumer = sdexReward.mul(unity)
    const supply = new web3.utils.BN(poolInfo.tokenData[i].supply)
    const length = new web3.utils.BN(poolInfo.tokenData.length)
    const additionDenominator = supply.mul(length)
    const newAddition = additionNumer.div(additionDenominator)
    const accSdex0 = accZeroInit.add(newAddition);
    const amount = new web3.utils.BN(position.amounts[i])
    const rewardDebt = new web3.utils.BN(userInfo.tokenData[i].rewardDebt)
    const timeAmountShares = amount.mul(accSdex0).sub(rewardDebt)
    tAShares.push(timeAmountShares)
  }

  const totalAmountShares = tAShares.reduce((a,b) => a.add(b))

  const tokenRewardData = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
  const diamondSdex  = await sdexFacet.methods.balanceOf(diamondAddress).call()
  const sdexBalance = new web3.utils.BN(diamondSdex).sub(new web3.utils.BN(tokenRewardData.penalties))

  const proportion = new web3.utils.BN(totalAmountShares).div(sdexReward)
  const reward = sdexBalance.mul(proportion).div(unity)
  return reward
}


async function fetchState(diamondAddress, sdexFacet, sdexVaultFacet, tokenFarmFacet, toolShedFacet, users, pool) {
  const returnObj = {}
  for (const user of users) {
    returnObj[user] = { 
      'sdex':  await sdexFacet.methods.balanceOf(user).call(),
      'userInfo': await tokenFarmFacet.methods.userInfo(pool, user).call(),
      'vUserInfo': await sdexVaultFacet.methods.vUserInfo(user).call(),
      'vShares': await sdexVaultFacet.methods.vShares(user).call()
    }
  }
  const diamondSdex = await sdexFacet.methods.balanceOf(diamondAddress).call()

  const vSdex = await sdexVaultFacet.methods.vSdex().call()
  const vSharesDiamond = await sdexVaultFacet.methods.vShares(diamondAddress).call()
  const vTotalShares = await sdexVaultFacet.methods.vTotalShares().call()

  const poolInfo = await tokenFarmFacet.methods.poolInfo(pool).call()
  const userInfo = await tokenFarmFacet.methods.userInfo(pool, diamondAddress).call()
  const tokenGlobals = await Promise.all(
    poolInfo.tokenData.map(async(tokenData) => {
      return await toolShedFacet.methods.tokenRewardData(tokenData.token).call()
    })
  )
  
  const tokenGlobalSdex = await toolShedFacet.methods.tokenRewardData(diamondAddress).call()
  tokenGlobals.push(tokenGlobalSdex)

  returnObj[diamondAddress] = {
    'sdex': diamondSdex,
    'userInfo': userInfo,
    'vShares': vSharesDiamond
  }
  returnObj['vault'] = {
      'vSdex': vSdex,
      'vTotalShares': vTotalShares
  }
  returnObj['pool'] = poolInfo
  returnObj['rewardGlobals'] = tokenGlobals
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
