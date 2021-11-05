import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';
import Favicon from '@site/static/img/favicon.ico';
import ImageTokenMobile from '@site/static/img/image-token-mobile.png';
import CrossChainMobile from '@site/static/img/crosschain-mobile.png';


const FeatureList = [
  {
    title: 'Protocol Overview',
    image: Favicon,
    link: 'docs/Protocol Overview/Protocol Overview',
    description: (
      <>
      A Decentralized Exchange Focused on creating
      long term incentives through the use of a time staking mechanism
      that penalizes users for premature withdrawls and rewarding users with
      Platform Rewards in the form of NFTs
      </>
    ),
  },
  {
    title: 'Systems Overview',
    image: ImageTokenMobile,
    link: 'docs/System Overview/System Overview',
    description: (
      <>
      Sigmadex utilizes the EIP-2535 Diamond architecture to bring the native token SDEX,
      A multi-token farm, an autocompounding native token pool, and a Governance structure.
      Swap/Pool systems coming Soon!
      </>
    ),
  },
  {
    title: 'API Spec',
    image: CrossChainMobile,
    link: 'docs/API Specification/Diamond',
    description: (
      <>
      A description of the various sigmadex smart contract funtions
      </>
    ),
  },
];

function Feature({image, link, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <a href={link}>
        <div className="text--center">
          <img src={image} className={styles.featureSvg} alt={title} />
        </div>
        <div className="text--center padding-horiz--md">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </a>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
