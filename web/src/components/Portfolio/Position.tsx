import React, { FC, Fragment } from "react"
import Static from 'config/Static.json'
const Web3 = require('web3')

interface PositionProps {
  data: object;
  pid: string;

}


const Position: FC<PositionProps> = ({data, pid}) => {
  const farmStatic = Static.farms[pid]
  
  let symbol = farmStatic.map((asset) => {
    return Object.keys(asset)[0]
  })
  symbol = symbol.join('-')
  
  const amounts = farmStatic.map((asset, j) => {
    let amount = Web3.utils.fromWei(data.amounts[j], 'ether')
    amount = amount.substring(0,7)
    return (
      <Fragment key={j}>
        <dt className="col-7 fw-normal">Amount ({Object.keys(asset)[0]}):</dt>
        <dd className="col-5 text-end fw-bold">{amount}</dd>
      </Fragment>
    )
  })
  return (
    <div className="col-3 mb-4">
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title mb-3">{symbol}</h5>
        <dl className="row mb-0">
          <dt className="col-6 fw-normal">Total value:</dt>
          <dd className="col-6 text-end fw-bold">$50,000.00</dd>
          <dt className="col-6 fw-normal">Interest rate:</dt>
          <dd className="col-6 text-end fw-bold">30%</dd>
          <dt className="col-6 fw-normal">Maturity:</dt>
          <dd className="col-6 text-end fw-bold">55 days</dd>
        </dl>
        <hr className="my-1" />
        <dl className="row mb-0">
          {amounts}
        </dl>
      </div>
    </div>
    </div>
  )
}

export default Position
