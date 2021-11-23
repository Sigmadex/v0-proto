import React, { FC, useCallback } from 'react'

import { useBlockNumber } from 'hooks/useBlockchain'

const BlockNumber: FC = () => {

  const blockNumber = useBlockNumber()

  return  (
    <>
      <span>Block Number</span>
        <span role="img" aria-label="numbers">
          🔢
        </span>
      <span>{blockNumber === null ? 'Error' : blockNumber ?? ''}</span>
    </>
  )
}

export default BlockNumber
