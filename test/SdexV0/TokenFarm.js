const { deployDiamond } = require('../../scripts/deploy.js')
const { deploy } = require('../../scripts/libraries/diamond.js')
const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const MockERC20 = artifacts.require('MockBEP20')

contract("TokenFarmFacet", (accounts) => {
  let owner = accounts[0]
  let alice = accounts[1]
  let bob = accounts[2]
  let sdexFacet;
  let toolShedFacet;
  let tokenFarmFacet;
  let tokenA;
  let tokenB;
  
  before(async () => {
    const diamondAddress = await deployDiamond()
    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
    toolShedFacet = new web3.eth.Contract(ToolShedFacet.abi, diamondAddress)
    tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)

    let erc20TotalSupply = web3.utils.toWei('1000000', 'ether')
    tokenA = await deploy(owner, MockERC20, ['ERC20A', 'ERC20A', erc20TotalSupply])
    tokenB = await deploy(owner, MockERC20, ['ERC20B', 'ERC20B', erc20TotalSupply])
    await tokenA.methods.transfer(
      bob,
      web3.utils.toWei('2000', 'ether')).send(
      { from: owner });
    await tokenA.methods.transfer(
      alice,
      web3.utils.toWei('2000', 'ether')).send(
      { from: owner });
    await tokenB.methods.transfer(
      bob,
      web3.utils.toWei('2000', 'ether')).send(
      { from: owner });
    await tokenB.methods.transfer(
      alice,
      web3.utils.toWei('2000', 'ether')).send(
      { from: owner });
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
  })
})
