import React from 'react'
import styles from './ExpertEngagement.module.scss'
import expertImg from '../../../img/expert.webp'

export default function ExpertEngagement({
  engagementState = 'entering',
  message = 'Wir erstellen Ihren Plan. Das Video enthüllt die wahre Kraft dieser Methode.',
  ctaLabel = 'Einverstanden',
  checked = false,
  onCtaClick
}) {
  return (
    <div
      className={`${styles.expertEngagement} ${engagementState === 'entering' ? styles.engagementEnter : ''} ${engagementState === 'exiting' ? styles.engagementExit : ''}`}
    >
      <div className={styles.expertDialog}>
        <div className={styles.expertAvatar}>
          <img src={expertImg} alt="Experte" width="46" height="46" />
        </div>
        <div className={styles.expertBubble}>
          <p className={styles.expertMessage}>{message}</p>
        </div>
      </div>
      <div className={styles.expertCtaRow}>
        <div className={styles.ctaArrow} aria-hidden="true">
          <svg viewBox="0 0 140 56" className={styles.ctaArrowSvg} role="img" aria-label="Hinweis">
            <defs>
              <linearGradient id="ctaArrowGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8E1B1B" />
                <stop offset="100%" stopColor="#B3261E" />
              </linearGradient>
            </defs>
            <path d="M6,30 C40,18 74,18 108,26" className={styles.ctaArrowCurve}></path>
            <path d="M108,26 L98,18 M108,26 L98,34" className={styles.ctaArrowHead}></path>
          </svg>
        </div>
        <button type="button" className={styles.expertCtaBtn} onClick={onCtaClick}>
          <span className={styles.ctaLabel}>{ctaLabel}</span>
          <span className={`${styles.ctaCheckbox} ${checked ? styles.ctaCheckboxChecked : ''}`} aria-hidden="true"></span>
        </button>
      </div>
    </div>
  )
}
