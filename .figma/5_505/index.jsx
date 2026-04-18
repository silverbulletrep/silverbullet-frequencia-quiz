import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.httpsSignupSpiriohub}>
      <div className={styles.background}>
        <div className={styles.container5}>
          <div className={styles.container4}>
            <div className={styles.container3}>
              <div className={styles.container}>
                <img
                  src="../image/mg2if5h6-ggwxca2.svg"
                  className={styles.component1}
                />
              </div>
              <div className={styles.container2}>
                <img
                  src="../image/mg2if5h6-xtt8jhz.svg"
                  className={styles.component12}
                />
                <div className={styles.verticalDivider} />
                <img
                  src="../image/mg2if5h6-n93vrl1.svg"
                  className={styles.component13}
                />
              </div>
            </div>
            <p className={styles.a224}>2/24</p>
          </div>
          <div className={styles.horizontalDivider2}>
            <div className={styles.horizontalDivider} />
          </div>
        </div>
        <div className={styles.container8}>
          <div className={styles.container6}>
            <p className={styles.comoVocSeSenteAoAcor}>
              Como você se sente ao acordar de manhã?
            </p>
            <p className={styles.selecioneOMaisReleva}>
              Selecione o mais relevante
            </p>
          </div>
          <div className={styles.container7}>
            <div className={styles.component2}>
              <p className={styles.a}>😩</p>
              <p className={styles.cansadoOuPesado}>Cansado ou pesado</p>
            </div>
            <div className={styles.component2}>
              <p className={styles.a}>😣</p>
              <p className={styles.cansadoOuPesado}>Descansado, mas ansioso</p>
            </div>
            <div className={styles.component2}>
              <p className={styles.a}>🤩</p>
              <p className={styles.cansadoOuPesado}>Calmo e com energia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
