import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getTokenFarmFacet } from 'utils/contractHelpers'
import Static from 'config/Static.json'

import { getActivePositions } from 'queries/positionData'
const Web3 = require('web3')


export const useGetPoolInfos = () => {
  const [poolInfo, setPoolInfo] = useState([])

  const { account, library } = useWeb3React()

  const fetchPoolInfo = useCallback(async () => {
    console.log('fetchPoolInfo')
    const tmp = [];
    const tokenFarmFacet = getTokenFarmFacet(library)
    try {
      const amountOfPools = await tokenFarmFacet.methods.poolLength().call({from: account})
      for (let i=0; i < amountOfPools; i++) {
        const info = await tokenFarmFacet.methods.poolInfo(i).call({from: account})
        tmp.push(info)
        //setPoolInfo([...poolInfo, info])
      }
      setPoolInfo(tmp)

    } catch (e) {
      console.log(e)
    }


  }, [account, library])

  useEffect(() => {
    if (account && library) {
      fetchPoolInfo()
    }
  }, [account, fetchPoolInfo, library])
  return poolInfo
}


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
      setUserInfo(tmp)

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
    amounts = amounts.map((amount) => {
      return Web3.utils.toWei(String(amount), 'ether')
    })
    console.log('handleDeposit')
    const contract = getTokenFarmFacet(library)
    try{
      const deposit = await contract.methods.deposit(
        poolid,
        amounts,
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


export const useWithdrawFarm = (
  poolid:number,
  positionid:number
) => {
  const {account, library } = useWeb3React()

  const handleWithdraw = useCallback(async() => {
    console.log('handleWithdraw')
    const contract = getTokenFarmFacet(library)
    try{
      console.log(poolid, positionid)
      const withdraw = await contract.methods.withdraw(
        poolid,
        positionid
      ).send({from:account})
      return withdraw.status
    } catch(e) {
      console.log(e)
      return false
    }
  }, [account, positionid, library, poolid])

  return { onWithdraw: handleWithdraw }
}


export const useGetValidNFTsForPool = (pid: string) => {
  const [validNFTs, setValidNFTs] = useState({})

  const { account, library } = useWeb3React()

  const fetchValidNFTsForPool = useCallback(async () => {
    console.log('fetchValidNFTsForPool')
    const tokenFarmFacet = getTokenFarmFacet(library)
    try {
      const validNFTsForPool = await tokenFarmFacet.methods.validNFTsForPool(pid).call({from: account})
      const poolInfo = await tokenFarmFacet.methods.poolInfo(pid).call({from: account})
      const validTokens = poolInfo.tokenData.map((tokenData) => {
        return tokenData.token
      })
      const returnData = {
        validNFTsForPool,
        validTokens
      }
      setValidNFTs(returnData)

    } catch (e) {
      console.log(e)
    }


  }, [account, pid, library])

  useEffect(() => {
    if (account && library) {
      fetchValidNFTsForPool()
    }
  }, [account, fetchValidNFTsForPool, library])
  return validNFTs
}

export const useGetTotalActivePositions = () => {
  const [totalActivePositions, setTotalActivePositions] = useState(0)

  const { account, library } = useWeb3React()

  const fetchTotalActivePositions = useCallback(async () => {
    const data = await getActivePositions()
    setTotalActivePositions(data)

  }, [])

  useEffect(() => {
    if (account && library) {
      fetchTotalActivePositions()
    }
  })
  return totalActivePositions
}
