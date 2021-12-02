import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getIBRFacet, getRARFacet, getRPRFacet } from 'utils/contractHelpers'
import Static from 'config/Static.json'
import { getUserNFTs } from 'queries/nftData'





export const useGetUserNFTs = () => {
  const [nftInfo, setNFTInfo] = useState([])

  const { account, library } = useWeb3React()

  const fetchNFTInfo = useCallback(async () => {
    const ibr = getIBRFacet(library)
    const rar = getRARFacet(library)
    const rpr = getRPRFacet(library)
    console.log('fetchUserNFTInfo')
    const data = await getUserNFTs(account)
    const userNFTs = []
    for (const i in data) {
      let tokenName;
      let description;
      switch(data[i].contract.name) {
        case "Reward Amplifier Reward":
          const rarAmount = await rar.methods.rARAmount(data[i].tokenID).call({from:account})
          tokenName= Object.keys(Static.addresses).find(key => Static.addresses[key] === rarAmount.token)
          description='Applies the underlying value to the next NFT minted'
          userNFTs.push({nft:data[i], amounts:rarAmount, tokenName, description})
          break;
        case "Increased Block Reward":
          const ibrAmount = await  ibr.methods.iBRAmount(data[i].tokenID).call({from:account})
          tokenName = Object.keys(Static.addresses).find(key => Static.addresses[key] === ibrAmount.token)
          description='Increases the rewards received per block'
          userNFTs.push({nft:data[i], amounts:ibrAmount, tokenName, description})
          break;
        case "Reduced Penalty Reward":
          const rprAmount = await rpr.methods.rPRAmount(data[i].tokenID).call({from:account})
          tokenName = Object.keys(Static.addresses).find(key => Static.addresses[key] === rprAmount.token)
          description='reduces any penalty that may incur while prematurely withdrawing ones stake'
          userNFTs.push({nft:data[i], amounts:rprAmount, tokenName, description})
          break;
      }
    }
    setNFTInfo([...userNFTs])
  }, [account, library])

  useEffect(() => {
    if (account && library) {
      fetchNFTInfo()
    }
  },[fetchNFTInfo, library, account])
  return nftInfo
}
