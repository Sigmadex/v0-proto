import Static from 'config/Static.json'
import SdexFacet from 'config/artifacts/contracts/facets/SdexFacet.sol/SdexFacet.json'
import TokenFarmFacet from 'config/artifacts/contracts/facets/TokenFarmFacet.sol/TokenFarmFacet.json'
import SdexVaultFacet from 'config/artifacts/contracts/facets/SdexVaultFacet.sol/SdexVaultFacet.json'
import ToolShedFacet from 'config/artifacts/contracts/facets/ToolShedFacet.sol/ToolShedFacet.json'

import RewardFacet from 'config/artifacts/contracts/facets/RewardFacet.sol/RewardFacet.json'

import ERC20 from 'config/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json'

import IncreasedBlockRewardFacet from 'config/artifacts/contracts/facets/RewardFacets/IncreasedBlockRewardFacet.sol/IncreasedBlockRewardFacet.json'
import ReducedPenaltyRewardFacet from 'config/artifacts/contracts/facets/RewardFacets/ReducedPenaltyRewardFacet.sol/ReducedPenaltyRewardFacet.json'
import RewardAmplifierRewardFacet from 'config/artifacts/contracts/facets/RewardFacets/RewardAmplifierRewardFacet.sol/RewardAmplifierRewardFacet.json'

export const getSdexFacet = (web3:any) => {
  return new web3.eth.Contract(SdexFacet.abi, Static.addresses.diamond)
}

export const getERC20 = (web3:any, address:string) => {
  return new web3.eth.Contract(ERC20.abi, address)
}

export const getTokenFarmFacet = (web3:any) => {
  return new web3.eth.Contract(TokenFarmFacet.abi, Static.addresses.diamond)
}

export const getSdexVaultFacet = (web3:any) => {
  return new web3.eth.Contract(SdexVaultFacet.abi, Static.addresses.diamond)
}

export const getRewardFacet = (web3:any) => {
  return new web3.eth.Contract(RewardFacet.abi, Static.addresses.diamond)
}

export const getToolShedFacet = (web3:any) => {
  return new web3.eth.Contract(ToolShedFacet.abi, Static.addresses.diamond)
}

export const getIBRFacet = (web3:any) => {
  return new web3.eth.Contract(IncreasedBlockRewardFacet.abi, Static.addresses.diamond)
}
export const getRPRFacet = (web3:any) => {
  return new web3.eth.Contract(ReducedPenaltyRewardFacet.abi, Static.addresses.diamond)
}
export const getRARFacet = (web3:any) => {
  return new web3.eth.Contract(RewardAmplifierRewardFacet.abi, Static.addresses.diamond)
}




