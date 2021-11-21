import React, { FC } from "react"
import { useGetUserInfo } from 'hooks/useTokenFarmFacet'
import Position from 'components/Portfolio/Position'

const ListPositions: FC = () => {
  const userInfos = useGetUserInfo()
  
  const positions = userInfos.map((userInfo, i) => {
    return userInfo.positions.map((position, j) => {
      return <Position key={i+j} data={position} pid={i} />
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
