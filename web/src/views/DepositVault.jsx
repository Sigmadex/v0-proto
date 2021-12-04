import React  from 'react' 
import DepositSdexVaultForm from 'components/Farm/DepositSdexVaultForm'
import NFTCarousel from 'components/Farm/NFTCarousel'
import { useGetValidNFTsForPool } from 'hooks/useTokenFarmFacet'
import { useGetUserNFTs } from 'hooks/useNFTs'

const Web3 =require('web3')

const DepositVault = () => {
  const id = 0
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
            <DepositSdexVaultForm farmid={0} usersValidNFTs={usersValidNFTs} /> :
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

export default DepositVault
