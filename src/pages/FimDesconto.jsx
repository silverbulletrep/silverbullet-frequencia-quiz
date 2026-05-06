import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useWakeLock } from '../hooks/useWakeLock'
import { useExitIntent } from '../hooks/useExitIntent'
import { createFunnelTracker, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, getDefaultBaseUrl, readStoredCountry, buildRouteStep, shouldSendEvent } from '../lib/funnelTracker'

import styles from './Fim.module.scss'
import AnimatedPlanHero from '../components/AnimatedPlanHero'

const FimBelowFold = React.lazy(() => import('./FimBelowFold'))

const DEBUG = import.meta.env.DEV

const DiscountBadge = ({ label }) => (
  <div className={styles.distinctiveBadge}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.badgeSvg}>
      <defs>
        <radialGradient id="discountGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffeaa6" />
          <stop offset="100%" stopColor="#f2c94c" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#discountGrad)" fillOpacity="0.2" stroke="url(#discountGrad)" strokeWidth="1.5" />
      <path d="M12 7V17M7 12H17" stroke="url(#discountGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="12" cy="12" r="4" fill="url(#discountGrad)" />
    </svg>
    <span className={styles.badgeText}>{label}</span>
  </div>
);

export default function FimDesconto() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useExitIntent()
  useWakeLock(true)

  const isDeRoute = (() => {
    try {
      const pathname = String(window.location.pathname || '')
      return pathname.includes('/de/') || pathname === '/de' || pathname.endsWith('/de')
    } catch {
      return false
    }
  })()

  const discountLabel = isDeRoute ? '10% RABATT' : '10% OFF'
  const statusLabel = isDeRoute ? 'Dein Plan ist fertig' : 'Seu plano está pronto'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    
    // Tracking
    try {
      const tracker = createFunnelTracker({
        baseUrl: getDefaultBaseUrl(),
        funnelId: QUIZ_FUNNEL_ID,
        getCountry: () => readStoredCountry() || undefined,
        debug: DEBUG
      })

      const step = buildRouteStep('/fim-desconto', QUIZ_PROGRESS_STEPS.fim)
      if (shouldSendEvent('step_view:/fim-desconto')) {
        tracker.stepView(step).catch((err) => {
          console.error('[FIM-DESCONTO] Erro ao enviar step_view:', err)
        })
      }
    } catch (e) {
      console.error('[FIM-DESCONTO] Falha ao inicializar tracker', e)
    }

    try { document.title = t('fim.page_title') } catch { }
  }, [])

  return (
    <main className={styles.page} role="main" aria-label="Finalização do plano vibracional">
      <header className={styles.pageHeader} aria-label="Status de geração do plano">
        <div className={styles.pageHeaderInner} style={{ justifyContent: 'space-between', width: '100%', maxWidth: '560px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <div className={styles.statusTitle}>{statusLabel}</div>
          <div className={styles.headerIconsRow}>
            <DiscountBadge label={discountLabel} />
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.pageHeaderSpacer} aria-hidden="true" />

        <h1 className={styles.mainHeadline} style={{ marginTop: '24px' }}>
          {t('fim.headline.ready')}
        </h1>

        <AnimatedPlanHero />

        <React.Suspense fallback={<div style={{ minHeight: '400px' }} />}>
          <FimBelowFold
            isOfferVisible={true}
            displayedHeaderPct={100}
            DEBUG={DEBUG}
            giftThemeActive={false}
            discountThemeActive={true}
            showDiscountModal={false}
            checkoutResumeMode={null}
            hideBackgroundCard={true}
          />
        </React.Suspense>
      </div>
    </main>
  )
}
