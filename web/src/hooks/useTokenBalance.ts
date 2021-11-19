import { useEffect, useState  } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getSdexFacet, getERC20 } from 'utils/contractHelpers'

const Web3 = require('web3')


export const useGetTokenBalance = (address:string) => {
  const [balance, setBalance] = useState("")
  const { account, library } = useWeb3React()

  useEffect(() => {
    const fetchBalance = async () => {
      const erc20 = getERC20(library, address)
      setBalance(await erc20.methods.balanceOf(account).call({from:account}))
    }

    if (account) {
      fetchBalance()
    }
  })
  return {balance}
}


export const useGetSdexBalance = () => {
  const [balance, setBalance] = useState("")
  const { account, library } = useWeb3React()

  useEffect(()=> {
    const fetchBalance = async () => {
      const sdexFacet = getSdexFacet(library)
      setBalance( await sdexFacet.methods.balanceOf(account).call({from:account}))
    }

    if (account) {
      fetchBalance()
    }
  

  })

  
  return { balance }

}
