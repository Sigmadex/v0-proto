import React, {FC} from "react"

interface NFTProps {
  data: object
}

const NFT:FC<NFTProps> = ({data}) => {
  return (
    <div className="col-3 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <h6 className="card-title">
            <span className="badge bg-primary me-2">NFT</span>
            {data.contract.name}
          </h6>
          <p className="card-text">
            <strong>One time use:</strong>
            No transaction fees when swapping any tokens.
          </p>
          <dl className="row mb-0">
            <dt className="col-7 fw-normal">One time use:</dt>
            <dd className="col-5 text-end fw-bold">yes</dd>
            <dt className="col-7 fw-normal">Status:</dt>
            <dd className="col-5 text-end fw-bold"><small>Owned (3)</small></dd>
          </dl>
        </div>
      </div>
    </div>

  )
}

export default NFT
