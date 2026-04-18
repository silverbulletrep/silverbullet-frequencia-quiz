import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.signupSpiriohubComEn}>
      <div className={styles.component12}>
        <div className={styles.yAxisLegend}>
          <p className={styles.variant13}>
            <span className={styles.variant1}>
              variant
              <br />
            </span>
            <span className={styles.variant12}>1</span>
          </p>
          <p className={styles.variant2}>
            <span className={styles.variant1}>
              variant
              <br />
            </span>
            <span className={styles.variant12}>2</span>
          </p>
          <p className={styles.variant2}>
            <span className={styles.variant1}>
              variant
              <br />
            </span>
            <span className={styles.variant12}>3</span>
          </p>
        </div>
        <div className={styles.component1}>
          <img src="../image/mg0a7r7a-epsu8vt.svg" className={styles.variant14} />
          <img src="../image/mg0a7r7a-1a2bezq.svg" className={styles.variant22} />
          <img src="../image/mg0a7r7a-vhdxh0m.svg" className={styles.variant3} />
        </div>
      </div>
      <div className={styles.component22}>
        <div className={styles.xAxisLegend}>
          <p className={styles.default}>default</p>
          <p className={styles.default}>hover</p>
        </div>
        <div className={styles.component2}>
          <div className={styles.variant1HoverFalse}>
            <p className={styles.text}>Continuar</p>
          </div>
          <div className={styles.variant1HoverTrue}>
            <p className={styles.text}>Continuar</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
