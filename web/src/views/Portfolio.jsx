import React, {useState, useEffect} from "react"
import Static from 'config/Static.json'

import { useWeb3React } from '@web3-react/core'
import  { useGetTokenBalance } from 'hooks/useERC20'

import WalletModal from 'components/WalletModal'
import ListPositions from 'components/Portfolio/ListPositions'
import ListVaultPositions from 'components/Portfolio/ListVaultPositions'
import ListNFTs from 'components/Portfolio/ListNFTs'

import { MDBBtn } from 'mdb-react-ui-kit'

const Web3 = require('web3')



const Portfolio: React.FC = () => {
  const [withdrawEvt, setWithdrawEvt] = useState(false)
  const { account } = useWeb3React()

  const {
    balance:sdexBalance,
    fetchBalance:fetchSdexBalance,
  }  = useGetTokenBalance(Static.addresses.diamond)
  const {
    balance:tokenABalance,
    fetchBalance:fetchTokenABalance,
  }  = useGetTokenBalance(Static.addresses.DOT)
  const {
    balance:tokenBBalance,
    fetchBalance:fetchTokenBBalance,
  }  = useGetTokenBalance(Static.addresses.WBTC)
  const {
    balance:tokenCBalance,
    fetchBalance:fetchTokenCBalance,
  }  = useGetTokenBalance(Static.addresses.USDT)

  useEffect(() => {
    if (withdrawEvt) {
      console.log('hello withdraw evt')
      fetchSdexBalance()
      fetchTokenABalance()
      fetchTokenBBalance()
      fetchTokenCBalance()
      setWithdrawEvt(false)
    }
  }, [withdrawEvt, fetchTokenABalance, fetchTokenBBalance,fetchTokenCBalance, fetchSdexBalance])
  

  const listenForWithdrawEvt = () => {
    setWithdrawEvt(true)
  }
  
  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1>Portfolio</h1>
          <p>View your past and present liquidity positions, owned NFTs, and more</p>
          <div>
            <span className="pe-2"><WalletModal/></span>
            <MDBBtn outline disabled>Trade Now</MDBBtn>
          </div>
        </div>
      </div>

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
          <h3>Farm Positions</h3>
        </div>
        <div className="col-4">
          Open positions = <strong>5</strong>
        </div>
        <div className="col-8 text-end">
          <span className="me-2">Total Amount Staked (USD) = <strong>$250,000.00</strong></span>
          <span>Unrealized Rewards = <strong>$91,529</strong></span>
        </div>
      </div>{/* /.row */}
      <ListPositions listenForWithdrawEvt={listenForWithdrawEvt}/>
      <div className="row mb-2">
        <div className="col-12">
          <h3>Sdex Vault Positions</h3>
        </div>
        <div className="col-4">
          Open positions = <strong>5</strong>
        </div>
        <div className="col-8 text-end">
          <span className="me-2">Total Amount Staked (USD) = <strong>$250,000.00</strong></span>
          <span>Unrealized Rewards = <strong>$91,529</strong></span>
        </div>
      </div>{/* /.row */}
      <ListVaultPositions listenForWithdrawEvt={listenForWithdrawEvt}/>
      <div className="row">
        <div className="col-12 mb-2">
          <h3>NFTs</h3>
        </div>
      </div>{/* /.row */}
      <ListNFTs />
    </>
  )
}

export default Portfolio 
