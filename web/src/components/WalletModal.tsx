import React, { FC } from 'react'
import { injected } from '../connectors'
import { useWeb3React } from '@web3-react/core'

const WalletModal: FC = () => {
  const closeRef = React.createRef()
  const context = useWeb3React()
  const { connector, activate, account } = context
  
  React.useEffect(() => {
    clickModal() 
  }, [account])

  const [activatingConnector, setActivatingConnector] = React.useState()

  function clickModal() {
    closeRef.current.click()
  }


  return (
    <>
			<button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#walletModal" >
        {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
			</button>

			<div className="modal fade" id="walletModal" tabIndex="-1" aria-labelledby="walletModalLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="walletModalLabel">Connect Wallet</h5>
							<button ref={closeRef} type="button" id="close" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
              <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary"  type="button"
                    onClick={() => {
                      setActivatingConnector(injected)
                      activate(injected)
                    }}
                  >Metamask (and other injected)</button>
              </div>
              <div className="text-center">
              </div>	
						</div>
					</div>
				</div>
			</div>
    </>
  )
}


export default WalletModal

