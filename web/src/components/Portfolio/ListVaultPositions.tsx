import React, { FC } from "react"
import { useGetvUserInfo } from 'hooks/useSdexVaultFacet'
import VaultPositionCard from 'components/Portfolio/VaultPositionCard'

import { useBlockNumber } from 'hooks/useBlockchain'

interface ListVaultPositionsProps {
  listenForWithdrawEvt: Function
}

const ListVaultPositions: FC<ListVaultPositionsProps> = ({listenForWithdrawEvt}) => {
  const userInfos = useGetvUserInfo()
  const blockNumber = useBlockNumber()
  let positions = []
  if (userInfos.positions) {
    positions = userInfos.positions.map((position, j:number) => {
      return <VaultPositionCard key={j} amounts={[position.amount]} startBlock={position.startBlock} endBlock={position.endBlock} pid={0} positionid={j} blockNumber={Number(blockNumber)} listenForWithdrawEvt={listenForWithdrawEvt} />
    })

  }
  
  return (
    <>
    <div className="row">
    { positions }
    </div>
    </>
  )
}


export default ListVaultPositions
