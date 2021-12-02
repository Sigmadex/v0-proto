import React, {FC} from "react"
import { useGetUserNFTs } from 'hooks/useNFTs'
import NFTCard from 'components/Portfolio/NFTCard'

const ListNFTs:FC = () => {
  const userNFTs = useGetUserNFTs()

  const nfts = userNFTs.map((nft, i) => {
    return (<NFTCard key={i} data={nft} />)
  })
  return (
    <>
    <div className="row">
      { nfts }
    </div>
    </>
  )

}

export default ListNFTs
