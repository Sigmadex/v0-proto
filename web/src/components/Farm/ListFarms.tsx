import React, { FC } from "react"

import FarmCard from 'components/Farm/FarmCard'

import { useGetPoolInfos } from 'hooks/useTokenFarmFacet'


const ListFarms: FC = () => {

  const poolInfos = useGetPoolInfos()
  console.log(poolInfos)

  const poolCards = poolInfos.map((poolInfo, i:number) => {
    return (<FarmCard key={i} pid={i} poolInfo={poolInfo} />)
  })

  return (
    <>
      <div className="row">
        {poolCards}
      </div>
    </>
  )
}

export default ListFarms
