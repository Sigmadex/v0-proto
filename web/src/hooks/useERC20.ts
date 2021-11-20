import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getERC20 } from 'utils/contractHelpers'
import Addresses from 'config/Addresses.json'
//const Web3 = require('web3')


export enum ApprovalStatus {
  FALSE,
  TRUE,
  PENDING,
}

export const useGetTokenBalance = (address:string) => {
  const [balance, setBalance] = useState("")
  const { account, library } = useWeb3React()
  console.log('tokenbalance', library)

  useEffect(() => {
    const fetchBalance = async () => {
      const erc20 = getERC20(library, address)
      setBalance(await erc20.methods.balanceOf(account).call({from:account}))
    }

    if (account) {
      fetchBalance()
    }
  })
  return balance
}

export const useGetAllowance = (address:string) => {
  const [allowance, setAllowance] = useState("")
  const { account, library } = useWeb3React()

  const fetchAllowance = useCallback(async () => {
    const erc20 = getERC20(library, address)
    const allow = await erc20.methods.allowance(account, Addresses.diamond).call({from:account})
    setAllowance(allow)
    console.log('fetch allowance')
  }, [account, address, library])

  useEffect(() => {
    if (account) {
      fetchAllowance()
    }
  }, [fetchAllowance, account])

  return allowance
}


export const useSetAllowance = (address: string, amount:number) => {
  const {account, library } = useWeb3React()

  const handleApprove = useCallback(async () => {
    console.log('handleApprove')
    const contract = getERC20(library, address)
    try {
      const approve = await contract.methods.approve(
        Addresses.diamond,
        library.utils.toWei(String(amount), 'ether')
      ).send({ from: account })
      return approve.status
    } catch (e) {
      console.log(e)
      return false
    }
  }, [account, library, amount, address])

  return { onApprove: handleApprove }
}
