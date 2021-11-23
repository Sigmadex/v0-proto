import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getTokenFarmFacet } from 'utils/contractHelpers'
import Static from 'config/Static.json'

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
      console.log('tmp', tmp)
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
      console.log('tmp', tmp)
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


export const useWithdrawFarm = (
  poolid:number,
  positionid:number
) => {
  const {account, library } = useWeb3React()

  const handleWithdraw = useCallback(async() => {
    console.log('handleWithdraw')
    const contract = getTokenFarmFacet(library)
    try{
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
