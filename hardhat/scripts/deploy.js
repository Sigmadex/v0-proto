const fs = require('fs')

const { deploy, getSelectors, initArgs, ADDRESSZERO } = require('./libraries/diamond.js')

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
const ReducedPenaltyRewardFacet = artifacts.require('ReducedPenaltyRewardFacet')

const IncreasedBlockReward = artifacts.require('IncreasedBlockReward')
const IncreasedBlockRewardFacet = artifacts.require('IncreasedBlockRewardFacet')

const RewardAmplifierReward = artifacts.require('RewardAmplifierReward')
const RewardAmplifierRewardFacet = artifacts.require('RewardAmplifierRewardFacet')

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
    ReducedPenaltyRewardFacet,
    IncreasedBlockRewardFacet,
    RewardAmplifierRewardFacet
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
  const increasedBlockReward =  await deploy(owner, IncreasedBlockReward, [diamond._address])
  const rewardAmplifierReward =  await deploy(owner, RewardAmplifierReward, [diamond._address])
  
  console.log('deploy::rPR::address::', reducedPenaltyReward._address)
  console.log('deploy::iBR::address::', increasedBlockReward._address)
  console.log('deploy::rAR::address::', rewardAmplifierReward._address)
  
  const initalArgs =  initArgs(
    [reducedPenaltyReward._address, increasedBlockReward._address, rewardAmplifierReward._address],
    [ReducedPenaltyRewardFacet, IncreasedBlockRewardFacet, RewardAmplifierRewardFacet],
    ['rPR', 'iBR', 'rAR']) 

  const diamondCut = await new web3.eth.Contract(IDiamondCut.abi, diamond._address)
  const fnCall = web3.eth.abi.encodeFunctionCall(
    DiamondInit.abi.find((f) => f.name == 'init'),
    initalArgs
  )
  console.log('function call sig: ', fnCall)

  const tx = await diamondCut.methods.diamondCut(
    cut,
    diamondInit._address,
    fnCall
  ).send({from:owner})

  const data = {
    addresses:  {
      'diamond': diamond._address,
      'ZERO': ADDRESSZERO,
      'reducedPenaltyReward': reducedPenaltyReward._address,
      'increasedBlockReward': increasedBlockReward._address,
      'rewardAmplifierReward': rewardAmplifierReward._address
    },
  }
  console.log('IS_DOCKER', process.env.IS_DOCKER)
  const destStatic = (process.env.IS_DOCKER === 'true') ? '/web/src/config/Static.json': '../web/src/config/Static.json'
  fs.writeFileSync(destStatic, JSON.stringify(data), (err) => {
    if (err) {
      throw err
    } else {
      console.log('Diamond Address Written to the web/public directory')
    }
  })
  const subgraphVars = `
  reducedPenaltyReward=${reducedPenaltyReward._address}
  increasedBlockReward=${increasedBlockReward._address}
  rewardAmplifierReward=${rewardAmplifierReward._address}
  `

  const destSubGraph = (process.env.IS_DOCKER === 'true') ? '/subgraph/.env': '../subgraph/.env'
  fs.writeFileSync(destSubGraph, subgraphVars, (err) => {
    if (err) {
      throw err
    } else {
      console.log('Diamond Address Written to the web/public directory')
    }
  })
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
