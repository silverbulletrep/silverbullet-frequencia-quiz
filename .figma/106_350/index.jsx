import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.container}>
      <div className={styles.input}>
        <div className={styles.defaultSvgFill}>
          <img src="../image/mkn26x56-65cdakx.svg" className={styles.component1} />
        </div>
        <p className={styles.labelNMeroDoCartO}>Número do cartão</p>
      </div>
      <div className={styles.autoWrapper}>
        <div className={styles.margin}>
          <div className={styles.input2}>
            <p className={styles.labelExpiraO}>Expiração</p>
          </div>
        </div>
        <div className={styles.margin2}>
          <div className={styles.input3}>
            <p className={styles.labelCvvcvc}>CVV/CVC</p>
            <div className={styles.component2}>
              <div className={styles.background}>
                <p className={styles.text}>i</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
