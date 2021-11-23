import React, { FC } from "react"
import { useGetUserInfo } from 'hooks/useTokenFarmFacet'
import PositionCard from 'components/Portfolio/PositionCard'

import { useBlockNumber } from 'hooks/useBlockchain'

const ListPositions: FC = () => {
  const userInfos = useGetUserInfo()
  const blockNumber = useBlockNumber()
  
  const positions = userInfos.map((userInfo, i:number) => {
    return userInfo.positions.map((position, j:number) => {
      return <PositionCard key={i+j} amounts={position.amounts} startBlock={position.startBlock} endBlock={position.endBlock} pid={i} positionid={j} blockNumber={Number(blockNumber)} />
    })
  }) 
  
  return (
    <>
    <div className="row">
    { positions }
    </div>
    </>
  )
}


export default ListPositions
