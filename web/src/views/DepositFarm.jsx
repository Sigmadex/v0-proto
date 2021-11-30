import React  from 'react' 
import DepositFarmForm from 'components/Farm/DepositFarmForm'
import { useGetValidNFTsForPool } from 'hooks/useTokenFarmFacet'
import { useGetUserNFTs } from 'hooks/useNFTs'
import { useParams } from 'react-router-dom'
const Web3 =require('web3')

const DepositFarm = () => {
  const { id } = useParams()
  console.log('id', id)
  const validNFTs = useGetValidNFTsForPool(id)
  const userNFTs = useGetUserNFTs()
  console.log(validNFTs)
  console.log(userNFTs)

  const nftsUserCanUse = userNFTs.filter((nft) => {
    const contract = Web3.utils.toChecksumAddress(nft.nft.contract.id)
    return validNFTs.includes(contract) 
    
  })
  console.log(nftsUserCanUse)
  return (
    <>
      <div className="row">
        <div className="col-6">
          <DepositFarmForm />
        </div>{/* /.col-6 */}
        <div className="col-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">
                NFT Reward
                <span className="ms-2 badge bg-secondary">APY Multiplier</span>
              </h5>
              <div className="card border-none mb-3">
                <div className="row g-0">
                  <div className="col-md-4">
                    <img src="https://via.placeholder.com/150" className="img-fluid rounded-start" alt="" />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <p className="card-text">
                        <strong>Utility:</strong>
                        Multiplies the preset interest rate of user's desired liquidity position by 2x.
                      </p>
                      <p className="card-text">
                        e.g: APY 20% -&gt; APY 40%
                      </p>
                    </div>
                  </div>
                </div>
              </div>              
              <dl className="row mb-0">
                <dt className="col-6 fw-normal">Rarity:</dt>
                <dd className="col-6 fw-bold text-end">2 of 5 available</dd>
                <dt className="col-6 fw-normal">Utilization:</dt>
                <dd className="col-6 fw-bold text-end">Liquidity staking</dd>
                <dt className="col-6 fw-normal">One-time use:</dt>
                <dd className="col-6 fw-bold text-end">yes</dd>
                <dt className="col-6 fw-normal">Stake length to earn:</dt>
                <dd className="col-6 fw-bold text-end">180 days</dd>
              </dl>
            </div>{/* /.card-body */}
          </div>{/* /.card */}
        </div>{/* /.col-6 */}
      </div>{/* /.row */}
    </>
  )
}

export default DepositFarm
