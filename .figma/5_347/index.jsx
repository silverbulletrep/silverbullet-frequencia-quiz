import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
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
  );
}

export default Component;
