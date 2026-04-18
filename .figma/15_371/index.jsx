import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.httpsSignupSpiriohub}>
      <div className={styles.component12}>
        <div className={styles.xAxisLegend}>
          <p className={styles.default}>default</p>
          <p className={styles.default}>hover</p>
        </div>
        <div className={styles.component1}>
          <div className={styles.variant1HoverFalse}>
            <p className={styles.text}>CONTINUAR</p>
          </div>
          <div className={styles.variant1HoverTrue}>
            <p className={styles.text2}>CONTINUAR</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
