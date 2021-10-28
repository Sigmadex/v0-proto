const { deploy, getSelectors } = require('./libraries/diamond.js')

const DiamondCutFacet = artifacts.require('DiamondCutFacet')
const Diamond = artifacts.require('Diamond')
const DiamondInit = artifacts.require('DiamondInit')
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet')
const OwnershipFacet = artifacts.require('OwnershipFacet')
const IDiamondCut = artifacts.require('IDiamondCut')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')

async function deployDiamond () {
  const accounts = await web3.eth.getAccounts()
  const owner = accounts[0]
  // deploy DiamondCutFacet
  const diamondCutFacet = await deploy(owner, DiamondCutFacet)
  console.log('DiamondCutFacet deployed:', diamondCutFacet._address)
  // deploy Diamond
  const diamond = await deploy(owner, Diamond, [owner, diamondCutFacet._address])
  console.log('Diamond deployed:', diamond._address)
  // deploy DiamondInit
  const diamondInit = await deploy(owner, DiamondInit)
  console.log('DiamondInit deployed:', diamondInit._address)
  
  const FacetArtifacts = [
    DiamondLoupeFacet,
    OwnershipFacet,
    SdexFacet,
    ToolShedFacet,
    TokenFarmFacet
  ]

  const cut = []
  for (const FacetName of FacetArtifacts) {
    const facet = await deploy(owner, FacetName)
    console.log(`deployed: ${facet._address}`)
    cut.push({
      facetAddress: facet._address,
      action: 0,
      functionSelectors: getSelectors(facet)
    })
  }
  console.log('Diamond Cut:', cut)
  const diamondCut = await new web3.eth.Contract(IDiamondCut.abi, diamond._address)
  const fnCall = web3.eth.abi.encodeFunctionCall(
    DiamondInit.abi.find((f) => f.name == 'init'),
    []
  )
  console.log('function call sig: ', fnCall)

  const tx = await diamondCut.methods.diamondCut(
    cut,
    diamondInit._address,
    fnCall
  ).send({from:owner})
  return diamond._address
  /*

  // deploy facets

  // upgrade diamond with facets
  console.log('')
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address)
  let tx
  let receipt
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData('init')
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall)
  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')
  return diamond.address
  */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployDiamond = deployDiamond
