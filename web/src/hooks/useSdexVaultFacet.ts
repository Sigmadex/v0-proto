import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getSdexVaultFacet } from 'utils/contractHelpers'
import Static from 'config/Static.json'

const Web3 = require('web3')

export const useGetvUserInfo = () => {
  const [userInfo, setUserInfo] = useState({})

  const { account, library } = useWeb3React()

  const fetchUserInfo = useCallback(async () => {
    console.log('fetchUserInfo')
    const contract = getSdexVaultFacet(library)
    try {
        const info = await contract.methods.vUserInfo(account).call({from: account})
      setUserInfo(info)

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

export const useDepositSdexVault = (
  amount: number,
  timeToStake: number,
  nftAddress: string,
  nftid: number
) => {
  const {account, library } = useWeb3React()

  const handleDeposit = useCallback(async() => {
    console.log('handleDepositSdexVault')
    const contract = getSdexVaultFacet(library)
    try {
      const deposit = await contract.methods.depositVault(
        Web3.utils.toWei(String(amount), 'ether'),
        timeToStake,
        nftAddress,
        nftid
      ).send({from:account})
      return deposit.status

    } catch(e) {
      console.log(e)
      return false
    }
  },[account, library, amount, timeToStake, nftAddress, nftid])

  return { onDeposit: handleDeposit  }
}

export const useWithdrawSdexVault = (
  positionid: number
) => {
  const {account, library } = useWeb3React()

  const handleWithdraw = useCallback(async () => {
    console.log('handleWithdrawSdexVault')
    const contract = getSdexVaultFacet(library)
    try {
      const withdraw = await contract.methods.withdrawVault(
        positionid
      ).send({from:account})
      return withdraw.status
    } catch (e) {
      console.log(e)
      return false
    }
  },[account, library, positionid]) 
  return { onWithdraw: handleWithdraw }
}
 
 
 
