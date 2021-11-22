import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
//import { getERC1155 } from 'utils/contractHelpers'
import Static from 'config/Static.json'
import { getUserNFTs } from 'queries/nftData'



export const useGetUserNFTs = () => {
  const [nftInfo, setNFTInfo] = useState([])

  const { account } = useWeb3React()

  const fetchNFTInfo = useCallback(async () => {
    console.log('fetchUserNFTInfo')
    const data = await getUserNFTs(account)
    setNFTInfo([...data])
  }, [account])

  useEffect(() => {
    if (account) {
      fetchNFTInfo()
    }
  },[fetchNFTInfo, account])
  return nftInfo
}
