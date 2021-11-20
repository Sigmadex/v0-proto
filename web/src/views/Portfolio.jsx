import React from "react"
import Addresses from 'config/Addresses'

import { useWeb3React } from '@web3-react/core'
import  { useGetTokenBalance } from 'hooks/useERC20'

import WalletModal from 'components/WalletModal'


const Web3 = require('web3')

const Portfolio: React.FC = () => {
  const { account } = useWeb3React()

  const sdexBalance  = useGetTokenBalance(Addresses.diamond)
  const tokenABalance  = useGetTokenBalance(Addresses.tokenA)
  const tokenBBalance  = useGetTokenBalance(Addresses.tokenB)
  const tokenCBalance  = useGetTokenBalance(Addresses.tokenC)
  console.log(sdexBalance)
  
  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1>Portfolio</h1>
          <p>View your past and present liquidity positions, owned NFTs, and more</p>
          <div>
            <span className="pe-2"><WalletModal/></span>
            <button className="btn btn-outline-primary">Trade Now</button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <h3>Wallet</h3>
          <h5>{account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
</h5>
        </div>
      </div>{/* /.row */}

      <div className="row mb-4">
        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5>
                <i className="bi-coin"></i>
                SDEX
              </h5>
              <p className="card-text">
                <strong>{Web3.utils.fromWei(sdexBalance, 'ether')}</strong>
              </p>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col3 */}

        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5>
                <i className="bi-coin"></i> 
                DOT
              </h5>
              <p className="card-text">
                <strong>{Web3.utils.fromWei(tokenABalance, 'ether')}</strong>
              </p>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col3 */}

        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5>
                <i className="bi-coin"></i> 
                WBTC
              </h5>
                <p className="card-text">
                <strong>{Web3.utils.fromWei(tokenBBalance, 'ether')}</strong>
              </p>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col3 */}

        <div className="col-3">
          <div className="card">
            <div className="card-body">
              <h5>
                <i className="bi-coin"></i> 
                USDT
              </h5>
                <p className="card-text">
                <strong>{Web3.utils.fromWei(tokenCBalance, 'ether')}</strong>
              </p>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col3 */}
      </div>{/* /.row */}

      <div className="row mb-2">
        <div className="col-12">
          <h3>Liquidity Positions</h3>
        </div>
        <div className="col-4">
          Open positions = <strong>5</strong>
        </div>
        <div className="col-8 text-end">
          <span className="me-2">Total Amount Staked (USD) = <strong>$250,000.00</strong></span>
          <span>Unrealized Rewards = <strong>$91,529</strong></span>
        </div>
      </div>{/* /.row */}

      <div className="row">
        <div className="col-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">SDEX-DOT</h5>
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
                <dt className="col-7 fw-normal">Amount (SDEX):</dt>
                <dd className="col-5 text-end fw-bold">830.24</dd>
                <dt className="col-7 fw-normal">Amount (DOT):</dt>
                <dd className="col-5 text-end fw-bold">49.96</dd>
              </dl>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col-3 */}

        <div className="col-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                SDEX-DAI
                <small className="fs-6 text-muted">+ NFT No Tx fees</small>
              </h5>
              <dl className="row mb-0">
                <dt className="col-6 fw-normal">Total value:</dt>
                <dd className="col-6 text-end fw-bold">$50,000.00</dd>
                <dt className="col-6 fw-normal">Interest rate:</dt>
                <dd className="col-6 text-end fw-bold">25%</dd>
                <dt className="col-6 fw-normal">Maturity:</dt>
                <dd className="col-6 text-end fw-bold">91 days</dd>
              </dl>
              <hr className="my-1" />
              <dl className="row mb-0">
                <dt className="col-7 fw-normal">Amount (SDEX):</dt>
                <dd className="col-5 text-end fw-bold">830.24</dd>
                <dt className="col-7 fw-normal">Amount (DOT):</dt>
                <dd className="col-5 text-end fw-bold">49.96</dd>
              </dl>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col-3 */}

        <div className="col-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                SDEX-ETH
              </h5>
              <dl className="row mb-0">
                <dt className="col-6 fw-normal">Total value:</dt>
                <dd className="col-6 text-end fw-bold">$50,000.00</dd>
                <dt className="col-6 fw-normal">Interest rate:</dt>
                <dd className="col-6 text-end fw-bold">25%</dd>
                <dt className="col-6 fw-normal">Maturity:</dt>
                <dd className="col-6 text-end fw-bold">172 days</dd>
              </dl>
              <hr className="my-1" />
              <dl className="row mb-0">
                <dt className="col-7 fw-normal">Amount (SDEX):</dt>
                <dd className="col-5 text-end fw-bold">830.24</dd>
                <dt className="col-7 fw-normal">Amount (DOT):</dt>
                <dd className="col-5 text-end fw-bold">49.96</dd>
              </dl>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col-3 */}

        <div className="col-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                SDEX-BNB
                <small className="fs-6 text-muted">+ NFT Eearly Harvest</small>
              </h5>
              <dl className="row mb-0">
                <dt className="col-6 fw-normal">Total value:</dt>
                <dd className="col-6 text-end fw-bold">$50,000.00</dd>
                <dt className="col-6 fw-normal">Interest rate:</dt>
                <dd className="col-6 text-end fw-bold">30%</dd>
                <dt className="col-6 fw-normal">Maturity:</dt>
                <dd className="col-6 text-end fw-bold">176 days</dd>
              </dl>
              <hr className="my-1" />
              <dl className="row mb-0">
                <dt className="col-7 fw-normal">Amount (SDEX):</dt>
                <dd className="col-5 text-end fw-bold">830.24</dd>
                <dt className="col-7 fw-normal">Amount (DOT):</dt>
                <dd className="col-5 text-end fw-bold">49.96</dd>
              </dl>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col-3 */}

        <div className="col-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">
                SDEX-BTC
                <small className="fs-6 text-muted">+ NFT No Tx Fees</small>
              </h5>
              <dl className="row mb-0">
                <dt className="col-6 fw-normal">Total value:</dt>
                <dd className="col-6 text-end fw-bold">$50,000.00</dd>
                <dt className="col-6 fw-normal">Interest rate:</dt>
                <dd className="col-6 text-end fw-bold">30%</dd>
                <dt className="col-6 fw-normal">Maturity:</dt>
                <dd className="col-6 text-end fw-bold">190 days</dd>
              </dl>
              <hr className="my-1" />
              <dl className="row mb-0">
                <dt className="col-7 fw-normal">Amount (SDEX):</dt>
                <dd className="col-5 text-end fw-bold">830.24</dd>
                <dt className="col-7 fw-normal">Amount (DOT):</dt>
                <dd className="col-5 text-end fw-bold">49.96</dd>
              </dl>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col-3 */}
      </div>{/* /.row */}

      <div className="row">
        <div className="col-12 mb-2">
          <h3>NFTs</h3>
        </div>
      </div>{/* /.row */}

      <div className="row">
        <div className="col-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title">
                <span className="badge bg-primary me-2">NFT</span>
                APY Multiplier
              </h6>
              <p className="card-text">
                Multiply the preset interest rate of user's liquidity 
                positions by 2x.
              </p>
              <dl className="row mb-0">
                <dt className="col-7 fw-normal">One time use:</dt>
                <dd className="col-5 text-end fw-bold">no</dd>
                <dt className="col-7 fw-normal">Status:</dt>
                <dd className="col-5 text-end fw-bold">Owned</dd>
              </dl>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col-3 */}

        <div className="col-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title">
                <span className="badge bg-primary me-2">NFT</span>
                Penalty Rate
              </h6>
              <p className="card-text">
                Ability to remove liquidity at any point in time without 
                incurring a penalty.
              </p>
              <dl className="row mb-0">
                <dt className="col-7 fw-normal">One time use:</dt>
                <dd className="col-5 text-end fw-bold">yes</dd>
                <dt className="col-7 fw-normal">Status:</dt>
                <dd className="col-5 text-end fw-bold">Owned</dd>
              </dl>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col-3 */}

        <div className="col-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title">
                <span className="badge bg-primary me-2">NFT</span>
                No Transaction Fees
              </h6>
              <p className="card-text">
                <strong>One time use:</strong>
                No transaction fees when swapping any tokens.
              </p>
              <dl className="row mb-0">
                <dt className="col-7 fw-normal">One time use:</dt>
                <dd className="col-5 text-end fw-bold">yes</dd>
                <dt className="col-7 fw-normal">Status:</dt>
                <dd className="col-5 text-end fw-bold"><small>Owned (3)</small></dd>
              </dl>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col-3 */}

        <div className="col-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title">
                <span className="badge bg-primary me-2">NFT</span>
                APY Multiplier
              </h6>
              <p className="card-text">
                Multiply the preset interest rate of user's liquidity positions 
                by 1.5x.
              </p>
              <dl className="row mb-0">
                <dt className="col-7 fw-normal">One time use:</dt>
                <dd className="col-5 text-end fw-bold">no</dd>
                <dt className="col-7 fw-normal">Status:</dt>
                <dd className="col-5 text-end fw-bold"><small>Farming (46h left)</small></dd>
              </dl>
            </div>
          </div>{/* /.card */}
        </div>{/* /.col-3 */}
      </div>{/* /.row */}
    </>
  )
}

export default Portfolio 
