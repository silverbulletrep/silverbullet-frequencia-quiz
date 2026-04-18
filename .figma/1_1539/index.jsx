import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.container5}>
      <div className={styles.background}>
        <img src="../image/miuyt844-4lc83fx.png" className={styles.shieldIcon} />
        <p className={styles.a30DayMoneyBackGuara}>30-day money‑back guarantee</p>
        <p className={styles.weBelieveThatOurPlan}>
          We believe that our plan will work for you and you will get noticeable
          <br />
          results in just 4 weeks! We are even ready to return your money back if
          <br />
          this plan is not for you!
        </p>
        <p className={styles.findMoreAboutApplica3}>
          <span className={styles.findMoreAboutApplica}>
            Find more about applicable limitations in our&nbsp;
          </span>
          <span className={styles.findMoreAboutApplica2}>money-back policy.</span>
        </p>
      </div>
      <div className={styles.background2}>
        <div className={styles.container2}>
          <div className={styles.container}>
            <img
              src="../image/miuyt840-w332kmo.svg"
              className={styles.component1}
            />
            <p className={styles.yourInformationIsSaf}>Your information is safe</p>
          </div>
          <p className={styles.weWonTSellOrRentYour}>
            We won't sell or rent your personal contact information for any
            marketing
            <br />
            purposes whatsoever.
          </p>
        </div>
        <div className={styles.container4}>
          <div className={styles.container3}>
            <img
              src="../image/miuyt840-505aobw.svg"
              className={styles.component12}
            />
            <p className={styles.yourInformationIsSaf}>Secure checkout</p>
          </div>
          <p className={styles.weWonTSellOrRentYour}>
            All information is encrypted and transmitted without risk using a Secure
            Socket
            <br />
            Layer protocol.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Component;
