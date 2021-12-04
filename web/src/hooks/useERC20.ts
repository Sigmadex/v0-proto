import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getERC20 } from 'utils/contractHelpers'
import Static from 'config/Static.json'
//const Web3 = require('web3')


export enum ApprovalStatus {
  FALSE,
  TRUE,
  PENDING,
}

export const useGetTokenBalance = (address:string) => {
  const [balance, setBalance] = useState("")
  const { account, library } = useWeb3React()
  
  const fetchBalance = useCallback(async () => {
    console.log('fetching balance')
    const erc20 = getERC20(library, address)
    try {
      setBalance(await erc20.methods.balanceOf(account).call({from:account}))

    } catch (e) {
      console.log(e)
      setBalance('0')
    }
  }, [account, address, library])

  useEffect(() => {
    if (account && library) {
      fetchBalance()
    }
  }, [account, library, fetchBalance])

  return {balance, fetchBalance}
}

export const useGetAllowance = (address:string) => {
  const [allowance, setAllowance] = useState("")
  const { account, library } = useWeb3React()

  const fetchAllowance = useCallback(async () => {
    const erc20 = getERC20(library, address)
    const allow = await erc20.methods.allowance(account, Static.addresses.diamond).call({from:account})
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
        Static.addresses.diamond,
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
