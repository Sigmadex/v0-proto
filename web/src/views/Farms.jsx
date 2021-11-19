import React from 'react' 
import WalletModal from '../components/WalletModal'
const Farms: React.FC = () => {
  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1>Farms</h1>
          <p>Stake various tokens to earn limited NFTs and other rewards.</p>
            <span className="pe-2"><WalletModal/></span>
            <button className="btn btn-outline-primary">Learn More</button>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-6">
          <a href="" className="btn btn-sm btn-light btn-outline-primary">All</a>
          <a href="" className="btn btn-sm btn-light btn-disabled">Available</a>
          <a href="" className="btn btn-sm btn-light">Unavailable</a>
        </div>
        <div className="col-6 text-end">
          <div className="btn-group">
            <button type="button" className="btn btn-outline-primary btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              Sort by
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#">Field 1</a></li>
              <li><a className="dropdown-item" href="#">Field 2</a></li>
              <li><a className="dropdown-item" href="#">Field 3</a></li>
            </ul>
          </div>
          <div className="btn-group">
            <button type="button" className="btn btn-outline-primary btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              Filters
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#">Field 1</a></li>
              <li><a className="dropdown-item" href="#">Field 2</a></li>
              <li><a className="dropdown-item" href="#">Field 3</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">

          <div className="col-3">
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <span className="badge bg-warning">NFT</span> Reward Multiplier
                </h6>
                <div className="row mb-4">
                  <div className="col-6 text-center">
                    <h3>
                      <i className="bi bi-coin"></i>
                    </h3>
                    15,000<br /><strong>SDEX</strong>
                  </div>
                  <div className="col-6 text-center">
                    <h3>
                      <i className="bi bi-coin"></i>
                    </h3>
                    15,000<br /><strong>HT</strong>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    Stake Duration:<br />
                    Remaining NFTs:
                  </div>
                  <div className="col-4 text-end">
                    <strong><small>270d</small></strong><br />
                    <strong><small>2/5</small></strong>
                  </div>
                </div>
              </div>
            </div>{/* /.card */}
          </div>{/* /.col-3 */}

          <div className="col-3">
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <span className="badge bg-warning">NFT</span> Inflation
                </h6>
                <div className="row mb-4">
                  <div className="col-6 text-center">
                    <h3>
                      <i className="bi bi-coin"></i>
                    </h3>
                    10,000<br /><strong>MATIC</strong>
                  </div>
                  <div className="col-6 text-center">
                    <h3>
                      <i className="bi bi-coin"></i>
                    </h3>
                    10,000<br /><strong>HT</strong>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    Stake Duration:<br />
                    Remaining NFTs:
                  </div>
                  <div className="col-4 text-end">
                    <strong><small>270d</small></strong><br />
                    <strong><small>2/5</small></strong>
                  </div>
                </div>
              </div>
            </div>{/* /.card */}
          </div>{/* /.col-3 */}

          <div className="col-3">
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <span className="badge bg-warning">NFT</span> Penalty Rate
                </h6>
                <div className="row mb-4">
                  <div className="col-6 text-center">
                    <h3>
                      <i className="bi bi-coin"></i>
                    </h3>
                    15,000<br /><strong>BNB</strong>
                  </div>
                  <div className="col-6 text-center">
                    <h3>
                      <i className="bi bi-coin"></i>
                    </h3>
                    15,000<br /><strong>MATIC</strong>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    Stake Duration:<br />
                    Remaining NFTs:
                  </div>
                  <div className="col-4 text-end">
                    <strong><small>N/A</small></strong><br />
                    <strong><small>0/5</small></strong>
                  </div>
                </div>
              </div>
            </div>{/* /.card */}
          </div>{/* /.col-3 */}

          <div className="col-3">
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <span className="badge bg-primary">NFT</span> Interest Rate
                </h6>
                <div className="row mb-4">
                  <div className="col-6 text-center">
                    <h3>
                      <i className="bi bi-coin"></i>
                    </h3>
                    12,000<br /><strong>SDEX</strong>
                  </div>
                  <div className="col-6 text-center">
                    <h3>
                      <i className="bi bi-coin"></i>
                    </h3>
                    12,000<br /><strong>MATIC</strong>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    Stake Duration:<br />
                    Remaining NFTs:
                  </div>
                  <div className="col-4 text-end">
                    <strong><small>270d</small></strong><br />
                    <strong><small>2/5</small></strong>
                  </div>
                </div>
              </div>
            </div>{/* /.card */}
          </div>{/* /.col-3 */}

          <div className="col-3">
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <span className="badge bg-danger">NFT</span> Penalty Rate
                </h6>
                <div className="row mb-4">
                  <div className="col-6 text-center">
                    <h3>
                      <i className="bi bi-coin"></i>
                    </h3>
                    10,000<br /><strong>SDEX</strong>
                  </div>
                  <div className="col-6 text-center">
                    <h3>
                      <i className="bi bi-coin"></i>
                    </h3>
                    10,000<br /><strong>BNB</strong>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    Stake Duration:<br />
                    Remaining NFTs:
                  </div>
                  <div className="col-4 text-end">
                    <strong><small>90d</small></strong><br />
                    <strong><small>9/20</small></strong>
                  </div>
                </div>
              </div>
            </div>{/* /.card */}
          </div>{/* /.col-3 */}

      </div>{/* /.row */}
    </>
  )
}

export default Farms
