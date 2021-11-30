import React, {FC, useState, useEffect, useCallback} from 'react' 
import Static from 'config/Static.json'

import { useDepositFarm } from 'hooks/useTokenFarmFacet'
import {useGetAllowance, useSetAllowance, ApprovalStatus} from 'hooks/useERC20'

import DepositSuccessModal from 'components/Farm/DepositSuccessModal'

import { CheckLg } from 'react-bootstrap-icons';


const Web3 = require('web3')


const DepositFarmForm: FC = () => {
  
  const addressA = Static.addresses.tokenA
  const addressB = Static.addresses.tokenB

  // Form 
  const [amountA, setAmountA] = useState(0)
  const [amountB, setAmountB] = useState(0)
  const [blocksStake, setBlocksStake] = useState(0)
  
  // Will need a getTokenStatic.addressesByFarmid

  const allowanceA = useGetAllowance(addressA)
  const allowanceB = useGetAllowance(addressB)
  
  const [isApprovedA, setIsApprovedA] = useState(ApprovalStatus.FALSE)
  const [isApprovedB, setIsApprovedB] = useState(ApprovalStatus.FALSE)


  useEffect(() => {
    if (amountA > 0) {
      const amountWei = Web3.utils.toWei(String(amountA), 'ether')

      if (amountWei > Number(allowanceA)) {
        setIsApprovedA(ApprovalStatus.FALSE)
      } else {
        setIsApprovedA(ApprovalStatus.TRUE)
      }
    }
  }, [amountA, allowanceA])
  
  useEffect(() => {
    if (amountB > 0) {
      const amountWei = Web3.utils.toWei(String(amountB), 'ether')

      if (amountWei > Number(allowanceB)) {
        setIsApprovedB(ApprovalStatus.FALSE)
      } else {
        setIsApprovedB(ApprovalStatus.TRUE)
      }
    }
  }, [amountB, allowanceB])

  // if apply NFT reward clicked
  // Loading circle
  // Fetch NFTsbyUser
  // Filter by Valid NFT

  const { onApprove:onApproveA } = useSetAllowance(addressA, amountA)
  const { onApprove:onApproveB } = useSetAllowance(addressB, amountB)

  const handleApproveA = useCallback(async () => {
    try {
      setIsApprovedA(ApprovalStatus.PENDING)
      const status = await onApproveA()
      if (status) {
        setIsApprovedA(ApprovalStatus.TRUE)
      } else {
        setIsApprovedA(ApprovalStatus.FALSE)
      }
    } catch (e) {
      console.error(e)
    }
  }, [onApproveA])

  const handleApproveB = useCallback(async () => {
    try {
      setIsApprovedB(ApprovalStatus.PENDING)
      const status = await onApproveB()
      if (status) {
        setIsApprovedB(ApprovalStatus.TRUE)
      } else {
        setIsApprovedB(ApprovalStatus.FALSE)
      }
    } catch (e) {
      console.error(e)
    }
  }, [onApproveB])



  function renderApproveButtonA() {
    switch (isApprovedA) {
      case ApprovalStatus.FALSE:
        return 'Approve'
      case ApprovalStatus.PENDING:
        return (<div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>)
      case ApprovalStatus.TRUE:
        return <CheckLg/>
      default:
        return (<span>'Approve'</span>)
    }
  }
  function renderApproveButtonB() {
    switch (isApprovedB) {
      case ApprovalStatus.FALSE:
        return 'Approve'
      case ApprovalStatus.PENDING:
        return (<div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>)
      case ApprovalStatus.TRUE:
        return <CheckLg/>
      default:
        return (<span>'Approve'</span>)
    }
  }
  
  const {onDeposit} = useDepositFarm(
    1, // pull this later from url params
    [amountA, amountB],
    blocksStake,
    Static.addresses.ZERO, // no nft for now
    0
  )
  const [depositPending, setDepositPending] = useState(false)
  const [depositSuccess, setDepositSuccess] = useState(false)
  const deposit = useCallback(async () => {
    try {
      setDepositPending(true)
      const status = await onDeposit()
      setDepositPending(false)
      console.log(status)
      if (status) {
        setDepositSuccess(true)
      } 
    } catch (e) {
      console.log(e)
    }
  }, [onDeposit])


  return (
    <>
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Deposit Farm</h5>
        <p>
          Stake a minimum of <strong>15,000 SDEX</strong> and <strong>15,000 BNB</strong>
          for 180 days to earn the <a href="">APY Multiplier</a> NFT (limited to 5 pieces).
        </p>
        <div className="card bg-light">
          <div className="card-body">
            <div className="row">
              <div className="col-8">
                Add:
                <input type="text" name="from" className="form-control" 
                   value={amountA} onChange={e => setAmountA((e.target.value))}/>
              </div>
              <div className="col-4 text-end">
                <br />
                <div className="btn-group">
                  <button type="button" className="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi-coin"></i> SDEX
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><a className="dropdown-item" href="#">Coin</a></li>
                    <li><a className="dropdown-item" href="#">Another Coin</a></li>
                    <li><a className="dropdown-item" href="#">Something else here</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>{/* /.card */}
        <div className="row my-1">
          <div className="col-12 text-center">
            <i className="bi bi-arrow-down fs-5"></i>
          </div>
        </div>
        <div className="card bg-light">
          <div className="card-body">
            <div className="row">
              <div className="col-8">
                Add:
                <input type="text" name="from" className="form-control" placeholder="0.0" value={amountB} onChange={e => setAmountB(e.target.value)}/>
              </div>
              <div className="col-4 text-end">
                <br />
                <div className="btn-group">
                  <button type="button" className="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi-coin"></i> SDEX
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><a className="dropdown-item" href="#">Coin</a></li>
                    <li><a className="dropdown-item" href="#">FarmAnother Coin</a></li>
                    <li><a className="dropdown-item" href="#">Something else here</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>{/* /.card */}
        <div className="card bg-light mt-2">
          <div className="card-body">
            <div className="row">
              <div className="col-8">
                Blocks to Stake:
                <input type="text" name="from" className="form-control" placeholder="0.0" value={blocksStake} onChange={e => setBlocksStake(e.target.value)}/>
              </div>
              <div className="col-4 text-end">
                <br />
              </div>
            </div>
          </div>
        </div>{/* /.card */}
        <div className="card bg-light mt-2">
          <div className="card-body">
            <div className="row">
              <div className="col-12 d-grid gap-2">
                <button className="btn btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#userValidNFTs" aria-controls="userValidNFTs">
                  Apply NFT Reward 
                </button>
                </div>
                <div className="collapse" id="userValidNFTs">
                  hi
              </div>
            </div>
          </div>
        </div>{/* /.card */}
        <div className="row my-4">
          <div className="col-6 d-grid gap-2">
            <button disabled={(isApprovedA !== ApprovalStatus.FALSE) || amountA == 0} className="btn btn-outline-primary" onClick={handleApproveA}>
            {renderApproveButtonA()}
              </button>
          </div>
          <div className="col-6 d-grid gap-2">
            <button disabled={(isApprovedB !== ApprovalStatus.FALSE) || amountB == 0} className="btn btn-outline-primary" onClick={handleApproveB}>
            {renderApproveButtonB()}
            </button>
          </div>
        </div>
        <div className="row my-4">
          <div className="col-12 d-grid gap-2">
            <button className="btn btn-outline-primary" disabled={!isApprovedA && !isApprovedB} onClick={deposit}>
              { depositPending ?
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div> :
                  'Farm'
              }
            </button>
          </div>
        </div>
        <dl className="row mb-0">
          <dt className="col-8 fw-normal">Interest APY:</dt>
          <dd className="col-4 fw-bold text-end">10%</dd>
          <dt className="col-8 fw-normal">Reward:</dt>
          <dd className="col-4 fw-bold text-end">NFT + Interest</dd>
        </dl>
      </div>{/* /.card-body */}
    </div>{/* /.card */}
      <DepositSuccessModal success={depositSuccess} />
    </>
  )
}
export default DepositFarmForm
