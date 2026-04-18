import React from 'react'
import styles from './ComparisonCard.module.scss'
import mulherTriste from '../../img/MulherTriste.webp'
import mulherFeliz from '../../img/Mulherfeliz.webp'

export default function ComparisonCard() {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.discountHeadline} id="comparison-headline">
        Consiga seu <span className={styles.highlightText}>Plano de Frequências</span> com 34% de desconto
      </h2>

      
      <div className={styles.container}>
        {/* Lado Esquerdo - NOW */}
        <div className={styles.cardLeft}>
          <div className={styles.header}>
            <div className={styles.labelContainerLeft}>
              <div className={styles.labelBadgeLeft}>
                <p className={styles.labelText}>Now</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5" className={styles.labelArrowLeft}>
                <path d="M4 5L0 0H8L4 5Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>
          
          <div className={styles.imageContainer}>
            {/* Substituir por imagem local da mulher triste */}
            <img src={mulherTriste} alt="Mulher triste" className={styles.mainImage} />
          </div>

          <div className={styles.metricsContainer}>
            {/* Métrica 1: Vibrations */}
            <div className={styles.metricRow}>
              <div className={styles.metricHeader}>
                <p className={styles.metricTitle}>Vibrations</p>
                <div className={styles.metricValueContainer}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" className={styles.iconDown}>
                    <path d="M8 12L2 6H14L8 12Z" fill="#EF4444"></path>
                  </svg>
                  <p className={styles.metricStatusLow}>Low</p>
                </div>
              </div>
              <div className={styles.metricBarContainer}>
                 <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
                   <path d="M0 12 Q 25 24, 50 12 T 100 12 T 150 12 T 200 12" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.5"/>
                   <path d="M0 12 Q 25 0, 50 12 T 100 12 T 150 12 T 200 12" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="4 2"/>
                 </svg>
              </div>
            </div>

            {/* Métrica 2: Energy */}
            <div className={styles.metricRow}>
              <div className={styles.metricHeader}>
                <p className={styles.metricTitle}>Energy</p>
                <p className={styles.metricStatusText}>Drained</p>
              </div>
              <div className={styles.batteryContainer}>
                <div className={`${styles.batteryLevel} ${styles.levelLow}`}></div>
                <div className={styles.batteryLevel}></div>
                <div className={styles.batteryLevel}></div>
              </div>
            </div>

            {/* Métrica 3: Life Purpose */}
            <div className={styles.metricRow}>
              <div className={styles.metricHeader}>
                <p className={styles.metricTitle}>Life purpose</p>
                <p className={styles.metricStatusText}>Lost</p>
              </div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBarBackground}></div>
                <div className={`${styles.progressBarFill} ${styles.fillLow}`} style={{ width: '30%' }}></div>
                <div className={`${styles.progressKnob} ${styles.knobLow}`} style={{ left: '30%' }}>
                  <div className={styles.knobInner}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separador Central */}
        <div className={styles.separator}>
          <div className={styles.separatorIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" className={styles.iconArrowRight}>
                <path d="M6 12L10 8L6 4" stroke="#271f2f" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
          </div>
        </div>

        {/* Lado Direito - YOUR GOAL */}
        <div className={styles.cardRight}>
          <div className={styles.header}>
            <div className={styles.labelContainerRight}>
              <div className={styles.labelBadgeRight}>
                <p className={styles.labelText}>Your goal</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5" className={styles.labelArrowRight}>
                <path d="M4 5L0 0H8L4 5Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>

          <div className={styles.imageContainer}>
            {/* Substituir por imagem local da mulher feliz */}
            <img src={mulherFeliz} alt="Mulher feliz" className={styles.mainImage} />
          </div>

          <div className={styles.metricsContainer}>
            {/* Métrica 1: Vibrations */}
            <div className={styles.metricRow}>
              <div className={styles.metricHeader}>
                <p className={styles.metricTitle}>Vibrations</p>
                <div className={styles.metricValueContainer}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" className={styles.iconUp}>
                    <path d="M8 4L14 10H2L8 4Z" fill="#22C55E"></path>
                  </svg>
                  <p className={styles.metricStatusHigh}>High</p>
                </div>
              </div>
              <div className={styles.metricBarContainer}>
                 <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
                   <path d="M0 12 Q 10 2, 20 12 T 40 12 T 60 12 T 80 12 T 100 12 T 120 12 T 140 12 T 160 12 T 180 12 T 200 12" stroke="#22C55E" strokeWidth="2" fill="none"/>
                 </svg>
              </div>
            </div>

            {/* Métrica 2: Energy */}
            <div className={styles.metricRow}>
              <div className={styles.metricHeader}>
                <p className={styles.metricTitle}>Energy</p>
                <p className={styles.metricStatusText}>Restored</p>
              </div>
              <div className={styles.batteryContainer}>
                <div className={`${styles.batteryLevel} ${styles.levelHigh}`}></div>
                <div className={`${styles.batteryLevel} ${styles.levelHigh}`}></div>
                <div className={`${styles.batteryLevel} ${styles.levelHigh}`}></div>
              </div>
            </div>

            {/* Métrica 3: Life Purpose */}
            <div className={styles.metricRow}>
              <div className={styles.metricHeader}>
                <p className={styles.metricTitle}>Life purpose</p>
                <p className={styles.metricStatusText}>Aligned</p>
              </div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBarBackground}></div>
                <div className={`${styles.progressBarFill} ${styles.fillHigh}`} style={{ width: '75%' }}></div>
                <div className={`${styles.progressKnob} ${styles.knobHigh}`} style={{ left: '75%' }}>
                  <div className={styles.knobInner}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
