import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Web3ReactProvider, useWeb3React } from '@web3-react/core'
import reportWebVitals from './reportWebVitals'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const Web3 = require('web3')

function getLibrary(provider, connector) {
    console.log('provider', provider)
    return new Web3(provider)
    //return new Web3Provider(provider)
}

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
