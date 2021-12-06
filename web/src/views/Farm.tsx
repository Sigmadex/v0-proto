import React, {FC} from 'react' 

import { useParams, Link } from "react-router-dom";
import Static from 'config/Static.json'

import { 
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn
} from 'mdb-react-ui-kit'

const Farm: FC = () => {
  const { id } = useParams()
  const farmName = Static.farms[id].map((token) => {
    return Object.keys(token)[0]
  }).join('-') + ' Farm'

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
              <h5 className="card-title">6,499</h5>
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
              <h5 className="card-title">1000 ETH</h5>
              <h5 className="card-title">5000 DOT</h5>
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
              <h5 className="card-title">500 ETH</h5>
              <h5 className="card-title">256 DOT</h5>
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
              <h5 className="card-title">256 ETH</h5>
              <h5 className="card-title">1000 DOT</h5>
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

/*
 *
      <div className="row mb-4">
        <div className="col-12">
          <h1>Name of Pool</h1>
          <p>
            A Farm of the Tokens Asset A and Asset B
          </p>
            <div>
              <Link to='deposit'>
              <button className="btn btn-outline-primary">Create a Position</button>
              </Link>
              { id === '0' ?
                <Link to="vault/deposit">
                  <button className="m-2 btn btn-outline-primary">Create a Position in the Vault</button>
                </Link> : null
              }
              <button className="btn btn-outline-primary m-2 disabled">Swap Now</button>
              <button className="btn btn-outline-primary disabled">Pool Now</button>
            </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">6,499</h5>
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
              <h5 className="card-title">1000 ETH</h5>
              <h5 className="card-title">5000 DOT</h5>
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
              <h5 className="card-title">500 ETH</h5>
              <h5 className="card-title">256 DOT</h5>
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
              <h5 className="card-title">256 ETH</h5>
              <h5 className="card-title">1000 DOT</h5>
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

      */