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
const AutoSdexFarmFacet = artifacts.require('AutoSdexFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
//Rewards
const RewardFacet = artifacts.require('RewardFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')
const ReducedPenaltyFacet = artifacts.require('ReducedPenaltyFacet')


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
    TokenFarmFacet,
    AutoSdexFarmFacet,
    SdexVaultFacet,
    RewardFacet,
    ReducedPenaltyFacet
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


  //Gen 0 NFTS
  const reducedPenaltyReward =  await deploy(owner, ReducedPenaltyReward, [diamond._address])
  const withdrawSignature = web3.eth.abi.encodeFunctionSignature(
    ReducedPenaltyFacet.abi.find((f) => /rPWithdraw/.test(f.name) == true)
  )
  const vaultWithdrawSignature = web3.eth.abi.encodeFunctionSignature(
    ReducedPenaltyFacet.abi.find((f) => /rPWithdrawVault/.test(f.name) == true)
  )
  const rewardSignature = web3.eth.abi.encodeFunctionSignature(
    ReducedPenaltyFacet.abi.find((f) => /rPReward/.test(f.name) == true)
  )

  

  const diamondCut = await new web3.eth.Contract(IDiamondCut.abi, diamond._address)
  const fnCall = web3.eth.abi.encodeFunctionCall(
    DiamondInit.abi.find((f) => f.name == 'init'),
    [reducedPenaltyReward._address, withdrawSignature, vaultWithdrawSignature, rewardSignature]
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
