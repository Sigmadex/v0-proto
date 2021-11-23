import React from 'react'

import BlockNumber from 'components/BlockNumber'

const Footer: React.FC = () => {
  return (
    <footer className="mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col">
            <h5 className="display-6">SIGMADEX</h5>
          </div>
          <div className="col">
            <strong>Platform</strong>
            <ul className="list-unstyled">
              <li><a href="">Swap</a></li>
              <li><a href="">Pairs</a></li>
              <li><a href="">Farms</a></li>
              <li><a href="">Databater</a></li>
              <li><a href="">Portfolio</a></li>
              <li><a href="">Governance</a></li>
            </ul>
          </div>
          <div className="col">
            <strong>About</strong>
            <ul className="list-unstyled">
              <li><a href="">About</a></li>
              <li><a href="">Blog</a></li>
              <li><a href="">Docs</a></li>
              <li><a href="">Careers</a></li>
            </ul>
          </div>
          <div className="col">
            <strong>Socials</strong>
            <ul className="list-unstyled">
              <li><i className="bi-telegram me-1"></i><a href="">Telegram</a></li>
              <li><i className="bi-twitter me-1"></i><a href="">Twitter</a></li>
              <li><i className="bi-github me-1"></i><a href="">Github</a></li>
            </ul>
          </div>
          <div className="col">
            <BlockNumber /> 
          </div>
        </div>{/* /.row */}
      </div>{/* /.container */}
    </footer>
  )
}

export default Footer
