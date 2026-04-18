import React from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styles from './PageIndicator.module.scss'

const COUNT_PAGES = [
  ['/age-selection-men', '/age-selection-women'],
  ['/men-success', '/women-success'],
  '/morning-feeling',
  '/transition',
  '/vsl',
  '/quiz-step-1',
  '/quiz-step-2',
  '/quiz-step-3',
  '/quiz-step-4',
  '/quiz-step-5',
  '/quiz-step-6',
  '/processing',
  '/resultado',
  '/vsl2',
]
const TOTAL = COUNT_PAGES.length

export default function PageIndicator() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const idx = COUNT_PAGES.findIndex((entry) => Array.isArray(entry) ? entry.includes(pathname) : entry === pathname)
  if (idx === -1) return null
  const isWhite = pathname === '/processing' || pathname === '/resultado'
  return (
    <div className={styles.indicator} aria-label={t('components.page_indicator_aria', { current: idx + 1, total: TOTAL })}>
      <span className={styles.numberCurrent}>{idx + 1}</span>
      <span className={isWhite ? styles.separator : styles.separatorBlack}>/</span>
      <span className={isWhite ? styles.numberTotal : styles.numberTotalBlack}>{TOTAL}</span>
    </div>
  )
}
