import React from 'react' 
import WalletModal from '../components/WalletModal'

const Swap: React.FC = () => {
  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1>Swap</h1>
          <p>Swap tokens.</p>
          <div>
            <span className="pe-2"><WalletModal/></span>
            <button className="btn btn-outline-primary">Trade Now</button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <div className="card mb-2">
            <div className="card-body">

              <div className="card bg-light">
                <div className="card-body">
                  <div className="row">
                    <div className="col-8">
                      From:
                      <input type="text" name="from" className="form-control" placeholder="0.0" />
                    </div>
                    <div className="col-4 text-end">
                      Balance: 0.0<br />
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
              <div className="row my-2">
                <div className="col-12 text-center">
                  <i className="bi bi-arrow-down fs-3"></i>
                </div>
              </div>
              <div className="card bg-light mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-8">
                      To:
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

              <dl className="row">
                <dt className="col-7 fw-normal">SDEX per BNB:</dt>
                <dd className="col-5 fw-bold text-end">0.00</dd>
                <dt className="col-7 fw-normal">BNB per SDEX:</dt>
                <dd className="col-5 fw-bold text-end">0.00</dd>
              </dl>
              <div className="row">
                <div className="col-6 d-grid gap-2">
                  <button className="btn btn-outline-primary">Attach NFT</button>
                </div>
                <div className="col-6 d-grid gap-2">
                  <button className="btn btn-outline-primary">Swap</button>
                </div>
              </div>
            </div>
          </div>{/* /.card */}
          <div className="card">
            <div className="card-body">
              <dl className="row mb-0">
                <dt className="col-7 fw-normal">BNB received:</dt>
                <dd className="col-5 fw-bold text-end">0.00</dd>
                <dt className="col-7 fw-normal">Price impact:</dt>
                <dd className="col-5 fw-bold text-end">&lt;0.01%</dd>
                <dt className="col-7 fw-normal">Liquidity Provider Fee:</dt>
                <dd className="col-5 fw-bold text-end">0.22 SDEX</dd>
              </dl>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col6 */}

        <div className="col-6">
          <h5>Tx History</h5>
          <table className="table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Value</th>
                <th>ID</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>SDEX &rarr; BNB</td>
                <td>$40.52</td>
                <td>0x8424...E812</td>
                <td>3 min</td>
              </tr>
              <tr>
                <td>SDEX &rarr; BNB</td>
                <td>$2,188.05</td>
                <td>0x8214...E912</td>
                <td>4 min</td>
              </tr>
              <tr>
                <td>SDEX &rarr; BNB</td>
                <td>$20.10</td>
                <td>0x322F...A872</td>
                <td>10 min</td>
              </tr>
              <tr>
                <td>SDEX &rarr; BNB</td>
                <td>$9,127.95</td>
                <td>0x8144...B817</td>
                <td>22 min</td>
              </tr>
              <tr>
                <td>SDEX &rarr; BNB</td>
                <td>$150.12</td>
                <td>0x7404...3812</td>
                <td>30 min</td>
              </tr>
            </tbody>
          </table>
        </div>{/* /.col6 */}
      </div>{/* /.row */}
    </>
  )
}

export default Swap
