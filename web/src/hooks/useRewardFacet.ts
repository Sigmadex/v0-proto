import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getRewardFacet } from 'utils/contractHelpers'

const Web3 = require('web3')

const useGetValidRewardsForToken = (nftAddress:string)  => {
  const [nftRewards, setNFTRewards] = useState([])

  const { account, library } = useWeb3React()

  const fetchValidRewardsForToken = useCallback(async () => {
    console.log('fetchValidRewardsForToken')
    const tmp = []
    const rewardFacet = getRewardFacet(library)

    try {

    } catch (e) {

    }
  }, [])
}


