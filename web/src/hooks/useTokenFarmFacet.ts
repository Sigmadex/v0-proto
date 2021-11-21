import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getTokenFarmFacet } from 'utils/contractHelpers'
import Static from 'config/Static.json'

const Web3 = require('web3')

export const useGetUserInfo = () => {
  const [userInfo, setUserInfo] = useState([])

  const { account, library } = useWeb3React()

  const fetchUserInfo = useCallback(async () => {
    console.log('fetchUserInfo')
    const tmp = [];
    const tokenFarmFacet = getTokenFarmFacet(library)
    try {
      const amountOfPools = await tokenFarmFacet.methods.poolLength().call({from: account})
      for (let i=0; i < amountOfPools; i++) {
        const info = await tokenFarmFacet.methods.userInfo(i, account).call({from: account})
        tmp.push(info)
        //setUserInfo([...userInfo, info])
      }
      setUserInfo([...tmp])

    } catch (e) {
      console.log(e)
    }


  }, [account, library])

  useEffect(() => {
    if (account && library) {
      fetchUserInfo()
    }
  }, [account, fetchUserInfo, library])
  return userInfo
}




export const useDepositFarm = (
  poolid:number,
  amounts:number[],
  blocksToStake:number,
  nftAddress:string,
  nftid:number
) => {
  const {account, library } = useWeb3React()

  const handleDeposit = useCallback(async() => {
    console.log('handleDeposit')
    const contract = getTokenFarmFacet(library)
    try{
      const deposit = await contract.methods.deposit(
        poolid,
        [Web3.utils.toWei(String(amounts[0]), 'ether'), Web3.utils.toWei(String(amounts[1]), 'ether')],
        blocksToStake,
        nftAddress,
        nftid
      ).send({from:account})
      return deposit.status
    } catch(e) {
      console.log(e)
      return false
    }
  }, [account, amounts, blocksToStake, library, nftAddress, nftid, poolid])

  return { onDeposit: handleDeposit }
}


