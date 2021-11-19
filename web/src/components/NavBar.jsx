import React from 'react'
import { Link } from 'react-router-dom'

import WalletModal from './WalletModal.tsx'
import NetworkModal from './NetworkModal.tsx'


const NavBar: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light mb-4">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">SIGMADEX</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link active" aria-current="page">Home</Link>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Platform
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><Link to="/swap" className="dropdown-item" href="">Swap</Link></li>
                <li><Link to="/farms" className="dropdown-item" href="">Farms</Link></li>
                <li><Link to="/nftreward" className="dropdown-item" href="">NFT Reward</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                About
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><a className="dropdown-item" href="">Menu</a></li>
              </ul>
            </li>
            <li className="nav-item">
              <Link to="/portfolio" className="nav-link">Portfolio</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="">Governance</a>
            </li>
          </ul>
            <form className="d-flex justify-content-around">
              <div className="p-2"><NetworkModal/></div>
              <div className="p-2"><WalletModal/></div>
          </form>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
