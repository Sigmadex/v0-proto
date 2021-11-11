const { deployDiamond } = require('../../scripts/deploy.js')
const { ADDRESSZERO } = require('../utilities.js')
const { getSelectors, deploy } = require('../../scripts/libraries/diamond.js')
const DiamondCutFacet = artifacts.require('DiamondCutFacet')
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet')
const OwnershipFacet = artifacts.require('OwnershipFacet')
const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const AutoSdexFarmFacet = artifacts.require('AutoSdexFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
const RewardFacet = artifacts.require('RewardFacet')
const ReducedPenaltyRewardFacet = artifacts.require('ReducedPenaltyRewardFacet')
const IncreasedBlockRewardFacet = artifacts.require('IncreasedBlockRewardFacet')


contract("Diamond", (accounts) => {
  let owner = accounts[0]
  let diamondCutFacet;
  let diamondLoupeFacet;
  let ownershipFacet;
  let sdexFacet;
  let toolShedFacet;
  let tokenFarmFacet;
  let autoSdexFarmFacet;
  let sdexVaultFacet;
  let rewardFacet;
  let reducedPenaltyRewardFacet;
  let increasedPenaltyRewardFacet;
  const addresses = []
  before(async () => {
    const diamondAddress = await deployDiamond()
    diamondCutFacet = new web3.eth.Contract(DiamondCutFacet.abi, diamondAddress)
    diamondLoupeFacet = new web3.eth.Contract(DiamondLoupeFacet.abi, diamondAddress)
    ownershipFacet = new web3.eth.Contract(OwnershipFacet.abi, diamondAddress)
    toolShedFacet = new web3.eth.Contract(ToolShedFacet.abi, diamondAddress)
    tokenFarmFacet = new web3.eth.Contract(TokenFarmFacet.abi, diamondAddress)
    autoSdexFarmFacet = new web3.eth.Contract(AutoSdexFarmFacet.abi, diamondAddress)
    sdexVaultFacet = new web3.eth.Contract(SdexVaultFacet.abi, diamondAddress)
    sdexFacet = new web3.eth.Contract(SdexFacet.abi, diamondAddress)
    rewardFacet = new web3.eth.Contract(RewardFacet.abi, diamondAddress)
    reducedPenaltyRewardFacet = new web3.eth.Contract(ReducedPenaltyRewardFacet.abi, diamondAddress)
    increasedBlockRewardFacet = new web3.eth.Contract(IncreasedBlockRewardFacet.abi, diamondAddress)

	})

  it("11 facets", async () => {
    const addrs = await diamondLoupeFacet.methods.facetAddresses().call()
    for (const address of await diamondLoupeFacet.methods.facetAddresses().call()) {
			addresses.push(address)
		}
		assert.equal(addresses.length, 11) 
  })

  it("should have correct selectors", async () => {
    let selectors = getSelectors(diamondCutFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[0]).call()
    assert.sameMembers(result, selectors)
    selectors = getSelectors(diamondLoupeFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[1]).call()
    assert.sameMembers(result, selectors)
    selectors = getSelectors(ownershipFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[2]).call()
    assert.sameMembers(result, selectors)
    selectors = getSelectors(sdexFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[3]).call()
    assert.sameMembers(result, selectors)
    selectors = getSelectors(toolShedFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[4]).call()
    assert.sameMembers(result, selectors)
    selectors = getSelectors(tokenFarmFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[5]).call()
    assert.sameMembers(result, selectors)
    selectors = getSelectors(autoSdexFarmFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[6]).call()
    assert.sameMembers(result, selectors)
    selectors = getSelectors(sdexVaultFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[7]).call()
    assert.sameMembers(result, selectors)
    selectors = getSelectors(rewardFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[8]).call()
    assert.sameMembers(result, selectors)
    selectors = getSelectors(reducedPenaltyRewardFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[9]).call()
    assert.sameMembers(result, selectors)
    selectors = getSelectors(increasedBlockRewardFacet)
    result = await diamondLoupeFacet.methods.facetFunctionSelectors(addresses[10]).call()
    assert.sameMembers(result, selectors)
  })
    /*
  it("should add test1 facet", async () => {
    const test1Facet = await deploy(owner, Test1Facet)
    addresses.push(test1Facet._address)
    let selectors = getSelectors(test1Facet)
    const supportInterfaceSig = web3.eth.abi.encodeFunctionSignature(
      'supportsInterface(bytes4)'
  )
    selectors = selectors.filter((sel) => {
      return sel != supportInterfaceSig
    })
    console.log(selectors)
    tx = await diamondCutFacet.methods.diamondCut(
      [{
        facetAddress: test1Facet._address,
        action: 0,
        functionSelectors: selectors
      }],
      ADDRESSZERO,
      '0x'
    ).send({from:owner})
  })
  */
})
