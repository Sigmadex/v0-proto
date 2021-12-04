import React, {FC} from "react"
import { Link } from 'react-router-dom'

interface FarmCardProps {
  pid: number;
  poolInfo: object;
}

const FarmCard:FC<FarmCardProps> = ({pid, poolInfo}) => {
  return (
    <>
    <div className="col-3">
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title mb-4">
            <span className="badge bg-warning">NFT</span> Reward Multiplier
          </h6>
          <div className="row mb-4">
            <div className="col-6 text-center">
              <h3>
                <i className="bi bi-coin"></i>
              </h3>
              15,000<br /><strong>SDEX</strong>
            </div>
            <div className="col-6 text-center">
              <h3>
                <i className="bi bi-coin"></i>
              </h3>
              15,000<br /><strong>HT</strong>
            </div>
          </div>
          <div className="row">
            <div className="col-8">
              Stake Duration:<br />
              Remaining NFTs:
            </div>
            <div className="col-4 text-end">
              <strong><small>270d</small></strong><br />
              <strong><small>2/5</small></strong>
            </div>

          </div>
          <hr className="my-1" />
          <div className="row">
              <Link to={'/farms/'+ pid}>
                <div className="d-grid">
                  <button className="btn btn-primary">Farm Details</button>
                </div>
              </Link>
          </div>
        </div>
      </div>{/* /.card */}
    </div>{/* /.col-3 */}
    </>
  )
}


export default FarmCard
