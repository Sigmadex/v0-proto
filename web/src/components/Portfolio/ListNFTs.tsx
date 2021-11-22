import React, {FC} from "react"
import { useGetUserNFTs } from 'hooks/useNFTs'
import NFT from 'components/Portfolio/NFT'

const ListNFTs:FC = () => {
  const userNFTs = useGetUserNFTs()

  const nfts = userNFTs.map((nft, i) => {
    return (<NFT key={i} data={nft.nft} />)
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
