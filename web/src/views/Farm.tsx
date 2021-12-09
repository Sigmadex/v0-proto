import React, {FC} from 'react' 

import { useParams, Link } from "react-router-dom";
import Static from 'config/Static.json'
import { useGetActivePositionsForFarm, useGetPoolInfo } from 'hooks/useTokenFarmFacet'
import {useGetRewardDataForFarm} from 'hooks/useToolShedFacet'

import { 
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn
} from 'mdb-react-ui-kit'

const Web3 = require('web3')
const Farm: FC = () => {
  const { id } = useParams()
  const tokenSymbols = []
  const farmName = Static.farms[id].map((token) => {
    const symbol = Object.keys(token)[0]
    tokenSymbols.push(symbol)
    return symbol
  }).join('-') + ' Farm'

  const activePositions = useGetActivePositionsForFarm(id)

  const poolInfo = useGetPoolInfo(id)
  let supplies;
  if (poolInfo.tokenData) {
    supplies = poolInfo.tokenData.map((td, i) => {
      return (<h5 key={i} className="card-title">{Web3.utils.fromWei(td.supply, 'ether')} {tokenSymbols[i]}</h5>)
    })
  }

  const rewardData = useGetRewardDataForFarm(id)
  console.log('rewarddata', rewardData)
  let rewardPool = []
  let penaltyPool = []
  if (rewardData.length) {
    rewardPool = rewardData.map((rd, i) => {
      return (<h5 key={i} className="card-title">{Web3.utils.fromWei(rd.rewarded, 'ether')} {tokenSymbols[i]}</h5>)
    })
    penaltyPool = rewardData.map((rd, i) => {
      return (<h5 key={i} className="card-title">{Web3.utils.fromWei(rd.penalties, 'ether')} {tokenSymbols[i]}</h5>)
    })
  }


  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1>{farmName}</h1>
        
      <div className="d-flex flex-row flex-wrap mb-3">
        <MDBBtn outline className="my-2 me-2" href={`${id}/deposit`}>Create a Position</MDBBtn>
        { id === '0' ? <MDBBtn outline className="m-2" href={`${id}/vault/deposit`}>Create a Position in the Vault</MDBBtn> : null}
        <MDBBtn outline className="m-2 " disabled>Swap</MDBBtn>
        <MDBBtn outline className="m-2" disabled>Add Liquidity</MDBBtn>
      </div>

        </div>
      </div>

      <div className="row mb-4">
        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">{activePositions}</h5>
              <p className="card-text">
                <i className="bi-file-text text-info"></i>
                Active Positions
              </p>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">$476.2 M+</h5>
              {supplies}
              <p className="card-text">
                <i className="bi-lock text-success"></i>
                Locked Liquidity
              </p>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">$30.8 M+</h5>
              {rewardPool}
              <p className="card-text">
                <i className="bi-gift text-warning"></i>
                Total Outstanding Rewards
              </p>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">$714,933</h5>
              {penaltyPool}
              <p className="card-text">
                <i className="bi-exclamation-triangle-fill text-danger"></i>
                Total Penalties To be Claimed
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Current Parameters</h6>
              <div className="row">
                <div className="col-4">
                  <p className="card-text">
                    <span className="badge bg-success">% of Emission per Block</span> = <strong>2.0x</strong>
                  </p>
                </div>
                <div className="col-4">
                  <p className="card-text">
                    <span className="badge bg-success">Estimated APY</span> = <strong>4 years</strong>
                  </p>
                </div>
                <div className="col-4">
                  <p className="card-text">
                    <span className="badge bg-success">Pool Balance ($)</span> = <strong>0.5 $(ETH)/$(DOT) </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


export default Farm
