import React from 'react' 

const NFTReward: React.FC = () => {


  function deposit() {
    console.log('hi')
  }
  return (
    <>
      <div className="row">
        <div className="col-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Farm Details</h5>
              <p>
                Stake a minimum of <strong>15,000 SDEX</strong> and <strong>15,000 BNB</strong>
                for 180 days to earn the <a href="">APY Multiplier</a> NFT (limited to 5 pieces).
              </p>
              <div className="card bg-light">
                <div className="card-body">
                  <div className="row">
                    <div className="col-8">
                      Add:
                      <input type="text" name="from" className="form-control" placeholder="0.0" />
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
                      <input type="text" name="from" className="form-control" placeholder="0.0" />
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
              <div className="row my-4">
                <div className="col-12 d-grid gap-2">
                  <button className="btn btn-outline-primary" onClick={() => {deposit()}}>Farm</button>
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

export default NFTReward
