import React from 'react' 
import ListFarms from 'components/Farm/ListFarms'
import WalletModal from 'components/WalletModal'

import { MDBBtn } from 'mdb-react-ui-kit'

const Farms: React.FC = () => {
  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1>Farms</h1>
          <p>Stake various tokens to earn limited NFTs and other rewards.</p>
            <span className="pe-2"><WalletModal/></span>
            <MDBBtn outline disabled>Learn More</MDBBtn>
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
      <ListFarms />
    </>
  )
}

export default Farms
