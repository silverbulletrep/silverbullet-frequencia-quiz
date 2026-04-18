import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styles from './Start.module.scss'
import { API_BASE_URL } from '@/lib/api'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Start() {
  const { t } = useTranslation()

  const steps = [
    {
      id: '01',
      title: t('start.steps.01.title'),
      urls: ['/quiz'],
      bullets: t('start.steps.01.bullets', { returnObjects: true })
    },
    {
      id: '02',
      title: t('start.steps.02.title'),
      urls: ['/age-selection-women', '/age-selection-men'],
      bullets: t('start.steps.02.bullets', { returnObjects: true })
    },
    {
      id: '03',
      title: t('start.steps.03.title'),
      urls: ['/men-success', '/women-success'],
      bullets: t('start.steps.03.bullets', { returnObjects: true })
    },
    {
      id: '04',
      title: t('start.steps.04.title'),
      urls: ['/morning-feeling'],
      bullets: t('start.steps.04.bullets', { returnObjects: true })
    },
    {
      id: '05',
      title: t('start.steps.05.title'),
      urls: ['/transition'],
      bullets: t('start.steps.05.bullets', { returnObjects: true })
    },
    {
      id: '06',
      title: t('start.steps.06.title'),
      urls: ['/vsl'],
      bullets: t('start.steps.06.bullets', { returnObjects: true })
    },
    {
      id: '07',
      title: t('start.steps.07.title'),
      urls: ['/quiz-step-1', '/quiz-step-2', '/quiz-step-3', '/quiz-step-4', '/quiz-step-5', '/quiz-step-6'],
      bullets: t('start.steps.07.bullets', { returnObjects: true })
    },
    {
      id: '08',
      title: t('start.steps.08.title'),
      urls: ['/vsl2'],
      bullets: t('start.steps.08.bullets', { returnObjects: true })
    },
  ]

  return (
    <div className={styles.startContainer}>
      <div className={styles.background}>
        <div className={styles.content}>
          <LanguageSwitcher />
          
          <h1 className={styles.headline}>{t('start.headline')}</h1>
          <p className={styles.subhead}>{t('start.subhead')}</p>

          <div className={styles.grid}>
            {steps.map((s) => (
              <div key={s.id} className={styles.card}>
                <div className={styles.cardTitle}>
                  <span style={{ fontWeight: 800 }}>{s.title}</span>
                  <span className={styles.stepBadge}>#{s.id}</span>
                </div>
                <div style={{ display: 'grid', rowGap: 6 }}>
                  {Array.isArray(s.bullets) && s.bullets.map((b, i) => (
                    <div key={i} style={{ fontSize: 13 }}>{b}</div>
                  ))}
                </div>
                <div className={styles.links}>
                  {s.urls.map((u) => (
                    <Link key={u} to={u} className={styles.link}>{u}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.infoBox}>
            <div style={{ fontWeight: 800 }}>{t('start.storage_title')}</div>
            <div>{t('start.storage_cache')}</div>
            <div>{t('start.storage_backend')}</div>
            <div>{t('start.api_base_label')} {API_BASE_URL}</div>
          </div>

          <div className={styles.cta}>
            <Link to="/quiz" className={styles.ctaButton}>{t('start.cta_button')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
