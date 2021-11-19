import React from "react"
import WalletModal from '../components/WalletModal'

const Home: React.FC = () => {
  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1>Welcome!</h1>
          <p>
            Stake, earn crypto and NFTs on the most advanced, self-stabilizing, 
            game theory enhanced liquidity protocol.
          </p>
            <div>
              <span className="pe-2"><WalletModal/></span>
              <button className="btn btn-outline-primary">Trade Now</button>
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
                Active Contracts
              </p>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">$476.2 M+</h5>
              <p className="card-text">
                <i className="bi-lock text-success"></i>
                Liquidity Locked
              </p>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">$30.8 M+</h5>
              <p className="card-text">
                <i className="bi-gift text-warning"></i>
                Total Rewards
              </p>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">$714,077</h5>
              <p className="card-text">
                <i className="bi-exclamation-triangle-fill text-danger"></i>
                Total Penalties
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
                    <span className="badge bg-success">interestMultiplier</span> = <strong>2.0x</strong>
                  </p>
                </div>
                <div className="col-4">
                  <p className="card-text">
                    <span className="badge bg-success">contractMaxLen</span> = <strong>4 years</strong>
                  </p>
                </div>
                <div className="col-4">
                  <p className="card-text">
                    <span className="badge bg-success">minLiquidityStake</span> = <strong>$ 1,000</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <table className="table">
            <thead>
              <th>Rank</th>
              <th>Name</th>
              <th>APY</th>
              <th>Liquidity</th>
              <th>Price</th>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>SDEX-DOT</td>
                <td>21.50%</td>
                <td>$190,240,556</td>
                <td>$28.36</td>
              </tr>
              <tr>
                <td>2</td>
                <td>SDEX-PARA</td>
                <td>55.00%</td>
                <td>$80,351,843</td>
                <td>$0.01989</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Voting proposal</h5>
              <p className="card-text">
                Holders of SDEX are responsible for governing the Sigmadex protocol, which includes adjusting 
                policy for all staking parameters within the platform. Anybody is qualified to be a SDEX holder 
                and we're all committed to shaping the future of DeFi. Refer to <a href="">Governance</a>
                for more information.
              </p>
              <p className="card-text">
                <strong>Next round of voting is in 88 days.</strong>
              </p>
              <p className="card-text">
                <a href="" className="btn btn-outline-secondary">View proposal</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
