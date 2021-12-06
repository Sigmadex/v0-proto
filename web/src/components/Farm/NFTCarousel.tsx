import React, { FC, useEffect, useCallback } from 'react'
import Static from 'config/Static.json'
import { useParams } from 'react-router-dom'
import {
  MDBCarousel,
  MDBCarouselInner,
  MDBCarouselItem,
  MDBCarouselElement,
  MDBCarouselCaption,
} from 'mdb-react-ui-kit';

interface NFTCarouselProps {
	nfts: string[],
  tokens: string[]
}
const NFTCarousel: FC<NFTCarouselProps> = ({nfts, tokens}) => {
  const { id } = useParams()

  let items = []
  if (nfts && tokens) {
  const tokenChits = tokens.map((token, i) => {
    let name = Object.keys(Static.addresses).find(key => Static.addresses[key] === token)
    return (<span key={i} className="ms-2 badge bg-success">{name}</span>)
  })
	items = nfts.map((nft, i) => {
    let name = Object.keys(Static.addresses).find(key => Static.addresses[key] === nft)
    let description
    let example
    switch (name) {
      case 'increasedBlockReward':
        name = 'Increased Block Rewards';
        description= 'Earn double the rewards per block on your stake'
        example='if one is earning 1 Sdex per block, one earns 2 Sdex perblock until the underlying value is fulfilled'
        break
      case 'rewardAmplifierReward':
        name = 'Reward Amplificiation';
        description= 'Pass along the value of this NFT to the next reward received'
        example= "The value of the next nft received will have this value added upon it in addition"
        break
      case 'reducedPenaltyReward':
        name = 'Penalty Reducer'
        description= 'Reduce the magnitude of the penalty in the event you choose to withdraw prematurely.  Useful as insurance'
        example="if one stakes 1 SDEX and withdraws after 50% of the time staked, only 0.5 SDEX will be given back. However, if they 1 SDEX worth in this NFT, 1 SDEX will be given back, and 0.5 SDEX will remain on the NFT"
        break
    }
		return (
      <MDBCarouselItem key={i} className={((i === 0) ? 'active': '')}>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-3">
              Farmable NFT Rewards
              <span className="ms-2 badge bg-info">{name}</span>
              {tokenChits}
            </h5>
            <div className="card border-none mb-3">
              <div className="row g-0">
                <div className="col-md-4">
                  <img src="https://via.placeholder.com/150" className="img-fluid rounded-start" alt="" />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <p className="card-text">
                      <strong>Utility: </strong>
                      { description }
                    </p>
                    <p className="card-text">
                      { example }
                    </p>
                  </div>
                </div>
              </div>
            </div>              
            <dl className="row mb-0">
              <dt className="col-6 fw-normal">Rarity:</dt>
              <dd className="col-6 fw-bold text-end">2 of 5 available</dd>
              <dt className="col-6 fw-normal">Utilization:</dt>
              <dd className="col-6 fw-bold text-end">Liquidity staking</dd>
              <dt className="col-6 fw-normal">One-time use:</dt>
              <dd className="col-6 fw-bold text-end">yes</dd>
              <dt className="col-6 fw-normal">Stake length to earn:</dt>
              <dd className="col-6 fw-bold text-end">180 days</dd>
            </dl>
          </div>{/* /.card-body */}
        </div> {/* /.card */} 
      </MDBCarouselItem>
		)})
  }

	return (
    <MDBCarousel showIndicators showControls dark fade>
      <MDBCarouselInner>
			{ items }
      </MDBCarouselInner>
    </MDBCarousel>
	)
}
export default NFTCarousel
