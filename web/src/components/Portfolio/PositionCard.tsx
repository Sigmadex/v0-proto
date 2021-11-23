import React, { FC, Fragment, useEffect, useState, useCallback } from "react"
import Static from 'config/Static.json'
import { useWithdrawFarm } from 'hooks/useTokenFarmFacet'

const Web3 = require('web3')

interface PositionCardProps {
  pid: number;
  positionid: number;
  blockNumber: number;
  amounts: number[];
  startBlock: number;
  endBlock: number;

}

const PositionCard: FC<PositionCardProps> = ({amounts, pid, startBlock, endBlock, positionid, blockNumber}) => {
  const [totalAmount, setTotalAmount] = useState(amounts.reduce((acc:number, cur:number) => Number(acc)+Number(cur)))
  const farmStatic = Static.farms[pid]
  const [maturity, setMaturity] = useState("")
  const [percent, setPercent] = useState("")
  
  const { onWithdraw } = useWithdrawFarm(
    pid,
    positionid
  )

  useEffect(() => {
    const blocksRemain = endBlock - blockNumber
    const blocksElapsed = blockNumber - startBlock
    if (blocksRemain > 0) {
      setMaturity(String(blocksRemain))
      setPercent((blocksElapsed/endBlock*100).toFixed(2))
    } else {
      setMaturity("Complete")
    }

  }, [blockNumber, maturity, endBlock, startBlock])

  let symbol = farmStatic.map((asset) => {
    return Object.keys(asset)[0]
  })
  symbol = symbol.join('-')
  const amountRow = farmStatic.map((asset, j) => {
    let amount = Web3.utils.fromWei(amounts[j], 'ether')
    amount = amount.substring(0,7)
    return (
      <Fragment key={j}>
        <dt className="col-7 fw-normal">Amount ({Object.keys(asset)[0]}):</dt>
        <dd className="col-5 text-end fw-bold">{amount}</dd>
      </Fragment>
    )
  })

  const [withdrawPending, setWithdrawPending] = useState(false)
  const withdraw = useCallback(async () => {
    try {
      setWithdrawPending(true)
      const status = await onWithdraw()
      setWithdrawPending(false)
      console.log(status)
      if (status == true) {
        setTotalAmount(0) 
      }
    } catch (e) {
      console.log(e)
    }
  }, [onWithdraw])
  return (
    <div className="col-3 mb-4">
      <div className="card h-100">
        { 
         (Number(totalAmount) === 0) ?
            (<div className="card-img-overlay bg-success opacity-62">
              <h5 className="card-title">Complete</h5>
            </div> ) :
              (<></>)
        } 
        <div className="card-body">
          <h5 className="card-title mb-3">{symbol}</h5>
          <dl className="row mb-0">
            <dt className="col-6 fw-normal">Total value:</dt>
            <dd className="col-6 text-end fw-bold">$50,000.00</dd>
            <dt className="col-6 fw-normal">Interest rate:</dt>
            <dd className="col-6 text-end fw-bold">30%</dd>
            <dt className="col-6 fw-normal">Maturity:</dt>
            <dd className="col-6 text-end fw-bold">({percent}%){maturity}</dd>
          </dl>
          <hr className="my-1" />
          <dl className="row mb-0">
            {amountRow}
            { (amountRow.length === 1) &&
              <Fragment>
                <dt className="col-7 fw-normal" style={{'visibility': 'hidden'}}>1</dt>
                <dd className="col-5 text-end fw-bold" style={{'visibility': 'hidden'}}>1</dd>
              </Fragment>
            }
          </dl>
          <div className="d-grid">
          <button className="btn btn-primary" onClick={withdraw}>
            { withdrawPending ?
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div> :
                'Withdraw'
            }
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PositionCard
