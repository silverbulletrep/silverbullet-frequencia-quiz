import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.container11}>
      <div className={styles.blur}>
        <p className={styles.yourPalmReadingRepor}>
          Your palm reading report is ready
        </p>
        <div className={styles.container4}>
          <div className={styles.item}>
            <p className={styles.loveLineShowsYourAtt3}>
              <span className={styles.loveLineShowsYourAtt}>Love line</span>
              <span className={styles.loveLineShowsYourAtt2}>
                &nbsp;shows your
                <br />
                attitude to love and the
                <br />
                quality of love
              </span>
            </p>
          </div>
          <div className={styles.container}>
            <img
              src="../image/mg76oxnj-fbnptkq.svg"
              className={styles.component1}
            />
          </div>
          <div className={styles.container2}>
            <img
              src="../image/mg76oxnj-w6z1b4w.svg"
              className={styles.component12}
            />
          </div>
          <div className={styles.container3}>
            <img
              src="../image/mg76oxnj-4bwyyfr.svg"
              className={styles.component12}
            />
          </div>
          <div className={styles.container2}>
            <img
              src="../image/mg76oxnj-xoizziz.svg"
              className={styles.component12}
            />
          </div>
        </div>
      </div>
      <div className={styles.backgroundShadow}>
        <div className={styles.heading2}>
          <p className={styles.signUpToUnderstandYo}>
            Sign up to understand yourself better
            <br />
            with Astroline
          </p>
        </div>
        <div className={styles.container9}>
          <div className={styles.container6}>
            <div className={styles.container5}>
              <p className={styles.enterYourEmail}>Enter your email</p>
            </div>
          </div>
          <div className={styles.container8}>
            <div className={styles.sVgMargin}>
              <img
                src="../image/mg76oxnk-zywmxti.svg"
                className={styles.component13}
              />
            </div>
            <div className={styles.container7}>
              <p className={styles.yourPersonalDataIsSa}>
                Your personal data is safe with us. We'll use your email for
                <br />
                updates, receipts, and subscription details.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.buttonMargin}>
          <div className={styles.container10}>
            <p className={styles.continue}>Continue</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
