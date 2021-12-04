import React  from 'react' 
import DepositFarmForm from 'components/Farm/DepositFarmForm'
import DepositSdexFarmForm from 'components/Farm/DepositSdexFarmForm'
import NFTCarousel from 'components/Farm/NFTCarousel'
import { useGetValidNFTsForPool } from 'hooks/useTokenFarmFacet'
import { useGetUserNFTs } from 'hooks/useNFTs'
import { useParams } from 'react-router-dom'
const Web3 =require('web3')

const DepositFarm = () => {
  const { id } = useParams()
  console.log('id', id)
  const validNFTs = useGetValidNFTsForPool(id)
  const userNFTs = useGetUserNFTs()
  const usersValidNFTs = userNFTs.filter((nft) => {
    const nftAddr = Web3.utils.toChecksumAddress(nft.nft.contract.id)
    const tokenAddr = nft.amounts.token
    return validNFTs.validNFTsForPool.includes(nftAddr) && validNFTs.validTokens.includes(tokenAddr)
  })
  return (
    <>
      <div className="row">
        <div className="col-6">
          { (id == 0) ?
            <DepositSdexFarmForm farmid={id} usersValidNFTs={usersValidNFTs} /> :
            <DepositFarmForm farmid={id} usersValidNFTs={usersValidNFTs}/>
          }
        </div>{/* /.col-6 */}
        <div className="col-6">
          <div className="card">
            <div className="card-body">
              <NFTCarousel nfts={validNFTs.validNFTsForPool} tokens={validNFTs.validTokens}/>
            </div>{/* /.card-body */}
          </div>{/* /.card */}
        </div>{/* /.col-6 */}
      </div>{/* /.row */}
    </>
  )
}

export default DepositFarm
