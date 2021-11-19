import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import Home from './views/Home'
import Portfolio from './views/Portfolio'
import Farms from './views/Farms'
import Swap from './views/Swap'
import NFTReward from './views/NFTReward'

import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core'

import { useEagerConnect, useInactiveListener} from './hooks/Connect';

function App() {
  const context = useWeb3React()
  const { connector, library, chainId, account, activate, deactivate, active, error } = context

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>()
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)
  return (
    <>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/nftreward" element={<NFTReward />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App
