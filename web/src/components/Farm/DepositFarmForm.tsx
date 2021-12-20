import React, {FC, useState, useEffect, useCallback} from 'react' 
import Static from 'config/Static.json'

import { useDepositFarm } from 'hooks/useTokenFarmFacet'
import {useGetAllowance, useSetAllowance, ApprovalStatus} from 'hooks/useERC20'

import DepositSuccessModal from 'components/Farm/DepositSuccessModal'

import { CheckLg } from 'react-bootstrap-icons';


const Web3 = require('web3')

interface DepositFarmFormProps {
  usersValidNFTs: object[]
  farmid: string
}

const DepositFarmForm: FC<DepositFarmFormProps> = ({usersValidNFTs, farmid}) => {
  const farm = Static.farms[farmid]
  

  const addresses = Static.farms[farmid].map((token) => {
    return (Object.values(token)[0])
  })
  const addressA = addresses[0]
  const addressB = addresses[1]


  // Form 
  const [amountA, setAmountA] = useState(0)
  const [amountB, setAmountB] = useState(0)
  const [timeStake, setTimeStake] = useState(0)
  const [nftAddr, setNFTAddr] = useState(Static.addresses.ZERO)
  const [nftid, setNFTid] = useState(0)
  
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
  const handleNFT = (event) => {
    if (event.target.value === 'Choose NFT') {
      setNFTAddr(Static.addresses.ZERO)
      setNFTid(0)
      return
    }
    const nftData = (usersValidNFTs[event.target.value])
    setNFTAddr(nftData.nft.contract.id)
    setNFTid(nftData.nft.tokenID)
  }

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
    Number(farmid), // pull this later from url params
    [amountA, amountB],
    timeStake,
    nftAddr, // no nft for now
    nftid
  )
  const [depositPending, setDepositPending] = useState(false)
  const [depositSuccess, setDepositSuccess] = useState(false)

  const deposit = useCallback(async () => {
    try {
      setDepositPending(true)
      const status = await onDeposit()
      setDepositPending(false)
      if (status) {
        setDepositSuccess(true)
      } 
    } catch (e) {
      console.log(e)
    }
  }, [onDeposit])

  const nfts = usersValidNFTs.map((validNFT, i) => {
    return (<option key={i} value={i}>{validNFT.nft.contract.name}</option>)
  })
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
                Time To Stake:
                <input type="text" name="from" className="form-control" placeholder="0.0" value={timeStake} onChange={e => setTimeStake(e.target.value)}/>
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
                <div className="" id="userValidNFTs">
                  <select onChange={handleNFT} className="form-control" id="nftRewards">
                    <option selected>Choose NFT</option>
                    {nfts}
                  </select>
              </div>
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
