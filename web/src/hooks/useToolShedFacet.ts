import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import Static from 'config/Static.json'
import { getToolShedFacet } from 'utils/contractHelpers'

const Web3 = require('web3')

export const useGetRewardDataForFarm = (farmid:string) => {
  const [rewardData, setRewardData] = useState([])

  const {account, library} = useWeb3React()

  const fetchRewardData = useCallback(async () => {
    const contract = getToolShedFacet(library)
    const tmp = [];
    try {
      const farm = Static.farms[farmid]
      for(let i=0; i < farm.length; i++) {
        const address = Object.values(farm[i])[0]
        const data = await contract.methods.tokenRewardData(address).call({from:account})
        tmp.push(data)
      }
      setRewardData(tmp)
    } catch (e) {
      console.log(e)
      return
    }
  }, [account, farmid, library])

  useEffect(() => {
    if (account && library) {
      fetchRewardData()
    }
  }, [account, fetchRewardData, library])
  return rewardData
}
