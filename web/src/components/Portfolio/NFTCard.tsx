import React, {FC} from "react"

const Web3 = require('web3')
interface NFTCardProps {
  data: object
}

const NFTCard:FC<NFTCardProps> = ({data}) => {
  return (
    <div className="col-3 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <h6 className="card-title">
            <span className="badge bg-primary me-2">NFT</span>
            {data.nft.contract.name}
          </h6>
          <p className="card-text">
            {data.description}
          </p>
          <dl className="row mb-0">
            <dt className="col-7 fw-normal">Underlying Asset: </dt>
            <dd className="col-5 text-end fw-bold">{data.tokenName}</dd>
            <dt className="col-7 fw-normal">Amount</dt>
            <dd className="col-5 text-end fw-bold">{Web3.utils.fromWei(data.amounts.amount, 'ether')}</dd>
          </dl>
        </div>
      </div>
    </div>

  )
}

export default NFTCard
