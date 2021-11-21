import Static from 'config/Static.json'
import SdexFacet from 'config/artifacts/contracts/facets/SdexFacet.sol/SdexFacet.json'
import TokenFarmFacet from 'config/artifacts/contracts/facets/TokenFarmFacet.sol/TokenFarmFacet.json'
import ERC20 from 'config/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json'

export const getSdexFacet = (web3:any) => {
  return new web3.eth.Contract(SdexFacet.abi, Static.addresses.diamond)
}

export const getERC20 = (web3:any, address:string) => {
  return new web3.eth.Contract(ERC20.abi, address)
}

export const getTokenFarmFacet = (web3:any) => {
  return new web3.eth.Contract(TokenFarmFacet.abi, Static.addresses.diamond)
}
