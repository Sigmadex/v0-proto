import { useEffect, useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'


export const useBlockNumber = () => {
  const { chainId, library } = useWeb3React()

  const [blockNumber, setBlockNumber] = useState<number>()

  useEffect((): any => {
    if (!!library) {
      let stale = false
      library.eth
      .getBlockNumber()
      .then((blockNumber: number) => {
        if (!stale) {
          setBlockNumber(blockNumber)
        }
      })
      .catch(() => {

        if (!stale) {
          setBlockNumber(null)
        }
      })

      const updateBlockNumber = (blockHead) => {
        setBlockNumber(blockHead.number)
      }
      const blockSub = library.eth.subscribe('newBlockHeaders', (error, result) => {
        if (!error) {
          return
        }
        console.error(error)
      }).on('connected', (subid) => {
        console.log('subid', subid)
      })

      .on('data', (blockHeader) => {
        updateBlockNumber(blockHeader)
      })

      return () => {
        stale = true
        blockSub.unsubscribe((error, success) =>{
          if (success)  console.log('block unsub')
        })
      setBlockNumber(undefined)
      }
    }
  }, [library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

  return blockNumber
}
