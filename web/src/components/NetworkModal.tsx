import React, { FC, useCallback } from 'react'

import { useWeb3React } from '@web3-react/core'

const chainData = {
  // cant use this to add chain unfortunately, metamask requires an https:// for this,
  // localhost nodes just use http
  // can still switch to localhost though
  'localhost': {
    chainId: '0x539',
    chainName: 'Localhost',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    'blockExplorerUrls': ['https://example.com'],
    'rpcUrls': ['http://127.0.0.1:8545/'],
  },
  'bsc': {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'Binance',
      symbol: 'BNB',
      decimals: 18
    },
    'blockExplorerUrls': ['https://bscscan.com/'],
    'rpcUrls': ['https://bsc-dataseed.binance.org/'],
  }
}

const NetworkModal: FC  = () => {
  const closeRef = React.createRef()

  const {chainId, connector, account } = useWeb3React()
  
  const [networkName, setNetworkName] = React.useState('Network Unsupported')

  const clickModal = useCallback(() => {
    closeRef.current.click()
  }, [closeRef])
  React.useEffect(() => {
    console.log('use effect triggered ')
    if (chainId) {
      switch (chainId) {
          case 1:
            setNetworkName('Ethereum (Mainnet)')
            break;
          case 56:
            setNetworkName('Binance Smart Chain')
            break;
          case 1337:
            setNetworkName('Localhost')
            break;
          default:
            setNetworkName('Chain Not Supported')
            break;
        }
    } else {
      if (account) {
        setNetworkName('Network Not Supported')
      } else {
        setNetworkName('Network Unknown')
      }
    }
    clickModal()

  }, [chainId, account, clickModal])


	async function requestChain(chain) {
    const { chainId } = chainData[chain]
		// Check if MetaMask is installed
		// MetaMask injects the global API into window.ethereum
		if (window.ethereum) {
			try {
				// check if the chain to connect to is installed
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ 'chainId': chainId }], // chainId must be in hexadecimal numbers
				});
			} catch (error) {
				// This error code indicates that the chain has not been added to MetaMask
				// if it is not, then install it into the user MetaMask
        console.log(error.code)
				if (error.code === 4902) {
          const {chainName, nativeCurrency, blockExplorerUrls, rpcUrls} = chainData[chain]
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{
									'chainId': chainId,
                  'chainName': chainName,
                  'nativeCurrency': nativeCurrency,
                  'blockExplorerUrls': blockExplorerUrls,
                  'rpcUrls': rpcUrls,
								},
							],
						});
					} catch (addError) {
						console.error(addError);
					}
				}
				console.error(error);
			}
		} else {
			// if no window.ethereum then MetaMask is not installed
			alert('MetaMask is not installed. Please consider installing it: https://metamask.io/download.html');
		} 
	}

  return (
    <>
      <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#networkModal"> { networkName }
			</button>


			<div className="modal fade" id="networkModal" tabIndex="-1" aria-labelledby="networkModalLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="networkModalLabel">Select Network</h5>
							<button ref={closeRef} type="button" id="close" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
              <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary"  type="button"
                    onClick={async () => {
                      await requestChain('localhost')
                    }}
                  >Localhost (8545)</button>
                  <button className="btn btn-outline-primary"  type="button"
                    onClick={async () => {
                      await requestChain('bsc')
                    }}
                  >Binance Smart Chain</button>
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

export default NetworkModal
