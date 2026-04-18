import React from 'react'
import styles from './AuraLogo.module.scss'
import { useTranslation } from 'react-i18next'

export default function AuraLogo({ size = 48, title }) {
  const { t } = useTranslation()
  const displayTitle = title || t('components.aura_logo_title')
  return (
    <svg
      className={styles.aura}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={displayTitle}
    >
      <defs>
        <radialGradient id="nucleusGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffeaa6" />
          <stop offset="60%" stopColor="#f2c94c" />
          <stop offset="100%" stopColor="#e5b945" />
        </radialGradient>
        <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f2c94c" />
          <stop offset="100%" stopColor="#e5b945" />
        </linearGradient>
        <filter id="auraGlowSmall" x="-50%" y="-50%" width="200%" height="200%" className="glowFilter">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.55  0 0 0 1 0" />
        </filter>
      </defs>

      <g className={styles.glowLayer} filter="url(#auraGlowSmall)">
        <circle cx="100" cy="100" r="28" fill="url(#nucleusGrad)" opacity="0.4" />
        <ellipse cx="100" cy="100" rx="56" ry="20" fill="#f2c94c" opacity="0.1" />
      </g>

      <g className={`${styles.orbit} ${styles.orbitFast}`}> 
        <ellipse cx="100" cy="100" rx="56" ry="22" fill="none" stroke="url(#orbitGrad)" strokeWidth="2" />
      </g>
      <g className={styles.orbit} transform="rotate(60 100 100)">
        <ellipse cx="100" cy="100" rx="56" ry="22" fill="none" stroke="url(#orbitGrad)" strokeWidth="2" />
      </g>
      <g className={`${styles.orbit} ${styles.orbitSlow}`} transform="rotate(120 100 100)">
        <ellipse cx="100" cy="100" rx="56" ry="22" fill="none" stroke="url(#orbitGrad)" strokeWidth="2" />
      </g>

      <g className={styles.nucleus}>
        <circle cx="100" cy="100" r="16" fill="url(#nucleusGrad)" />
        <circle cx="100" cy="100" r="20" fill="none" stroke="#f2c94c" strokeOpacity="0.35" />
      </g>
    </svg>
  )
}
