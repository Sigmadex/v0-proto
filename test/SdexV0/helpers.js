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
exports.calcSdexReward = calcSdexReward
exports.unity = unity
exports.calcPenalty = calcPenalty
