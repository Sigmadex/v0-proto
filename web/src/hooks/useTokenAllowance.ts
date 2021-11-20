import { useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'

import { getERC20 } from 'utils/contractHelpers'

function useTokenAllowance(
  tokenAddress: string,
  owner: string,
  spender: string
) {
  const {library, account} = useWeb3React()
  const contract =  getERC20(library, tokenAddress)
  
  const inputs = useMemo(() => [owner, spender], [owner, spender])


}

