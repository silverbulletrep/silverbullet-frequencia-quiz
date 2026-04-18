import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { leadCache } from '@/lib/leadCache'
import styles from './AuthorityHeader.module.scss'
import { useProgressStore } from '@/lib/progressStore'
import PageIndicator from './PageIndicator'
import AuraLogo from './AuraLogo'
import { asset } from '@/lib/asset'
const STAR_SVG = asset('/.figma/image/mg03ny0l-7v0e27z.svg')

const DEBUG = import.meta.env.DEV

const SKIP_HEALTHCHECK_PATHS = new Set([
  '/',
  '/quiz',
  '/age-selection-men',
  '/age-selection-women',
  '/men-success',
  '/women-success',
  '/morning-feeling',
  '/transition',
  '/start',
  '/fim',
])

const PAGES = [
  '/quiz',
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
  '/compont-test-1',
  '/compont-test-2',
  '/compont-test-3',
  '/compont-test-4',
  '/compont-test-5',
  '/compont-test-6',
  '/processing',
  '/resultado',
  '/vsl2',
]

export default function AuthorityHeader() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [apiHealth, setApiHealth] = React.useState('loading')
  const [stripeHealth, setStripeHealth] = React.useState('loading')
  const idx = PAGES.findIndex((entry) => Array.isArray(entry) ? entry.includes(pathname) : entry === pathname)
  const total = PAGES.length
  const progressPercent = idx === -1 ? 0 : Math.round(((idx + 1) / total) * 100)
  const stageProgress = useProgressStore((s) => s.stageProgress)
  const isVSL2 = pathname === '/vsl2'
  const isAudioUpsell = pathname === '/audio-upsell'
  const isFimFunil = pathname === '/fim-funil'
  const baseForContinuation = idx === -1 ? 0 : Math.round((idx / total) * 100)
  const finalPercent = (isVSL2 || isAudioUpsell || isFimFunil)
    ? Math.min(baseForContinuation + Math.round(((100 - baseForContinuation) * stageProgress) / 100), 100)
    : progressPercent
  const stageLabel = isVSL2
    ? (stageProgress < 15 ? t('authority_header.stage_initializing')
      : stageProgress < 35 ? t('authority_header.stage_analyzing')
        : stageProgress < 55 ? t('authority_header.stage_adjusting')
          : stageProgress < 75 ? t('authority_header.stage_personalizing')
            : stageProgress < 90 ? t('authority_header.stage_optimizing')
              : stageProgress < 100 ? t('authority_header.stage_almost_ready')
                : t('authority_header.stage_ready'))
    : ''
  const fillTransitionMs = isFimFunil
    ? 240
    : stageProgress < 20 ? 280 : stageProgress < 40 ? 420 : stageProgress < 70 ? 600 : stageProgress < 90 ? 900 : 1400
  const sparkDuration = stageProgress < 30 ? 2.2 : stageProgress < 70 ? 3.0 : stageProgress < 90 ? 4.0 : 5.0
  const beaconSize = stageProgress < 80 ? 12 : stageProgress < 95 ? 13 : 14
  const beaconShadow = stageProgress < 80
    ? '0 0 0 6px rgba(242,201,76,0.2), 0 0 18px rgba(242,201,76,0.35)'
    : stageProgress < 95
      ? '0 0 0 8px rgba(242,201,76,0.22), 0 0 22px rgba(242,201,76,0.5)'
      : '0 0 0 10px rgba(242,201,76,0.24), 0 0 26px rgba(242,201,76,0.6)'
  const isBackIconWhite = pathname === '/processing' || pathname === '/resultado'

  React.useEffect(() => {
    if (SKIP_HEALTHCHECK_PATHS.has(pathname)) return
    let mounted = true
    const apiPromise = import('@/lib/api')
    const check = async () => {
      try {
        const { getApiHealth } = await apiPromise
        const a = await getApiHealth()
        if (mounted) setApiHealth(a?.success ? 'ok' : 'fail')
      } catch {
        if (mounted) setApiHealth('fail')
      }
    }
    check()
    const iv = setInterval(check, 30000)
    return () => { mounted = false; try { clearInterval(iv) } catch { } }
  }, [pathname])

  const onBack = () => {
    const operacao = 'ui.back_nav'
    const prev = idx > 0 ? PAGES[idx - 1] : null
    const cache = leadCache.getAll()
    let prevPath = Array.isArray(prev)
      ? (cache.genero === 'mulher' ? '/age-selection-women' : '/age-selection-men')
      : prev
    try {
      if (DEBUG) console.log(`[HEADER] Iniciando operação: ${operacao}`, { pathname, prevPath })
      if (prevPath) navigate(prevPath)
      else navigate(-1)
      if (DEBUG) console.log(`[HEADER] Operação concluída com sucesso:`, { timestamp: new Date().toISOString() })
    } catch (error) {
      console.error(`[HEADER] Erro na operação: ${error.message}`, { stack: error.stack, pathname, prevPath, timestamp: new Date().toISOString() })
    }
  }

  if (pathname === '/fim' || pathname === '/start') return null

  const showProgressAndIndicator = pathname !== '/quiz'

  return (
    <div className={styles.header} data-app-header="header">
      <div className={styles.container}>
        {idx > 0 && (
          <button type="button" aria-label={t('authority_header.back_label')} className={styles.backLeft} onClick={onBack}>
            <ArrowLeft className={isBackIconWhite ? styles.backIconWhite : styles.backIcon} />
          </button>
        )}
        <div className={`${styles.logoWrap} ${pathname === '/quiz' ? styles.logoWrapQuiz : ''}`} aria-label={t('authority_header.logo_label')}>
          <AuraLogo size={60} title={t('authority_header.logo_title')} />
        </div>
        <div className={styles.indicatorRight}>{showProgressAndIndicator && <PageIndicator />}</div>

      </div>
      {showProgressAndIndicator && (
        <div className={styles.progress} aria-label={t('authority_header.progress_label')}>
          <div className={styles.progressHalo} style={{ width: `${finalPercent}%` }} />
          <div className={styles.progressFill} style={{ width: `${finalPercent}%`, transition: `width ${fillTransitionMs}ms cubic-bezier(0.22,1,0.36,1)` }} />
          {isVSL2 && (
            <div className={styles.progressBeacon} style={{ left: `${finalPercent}%`, width: beaconSize, height: beaconSize, boxShadow: beaconShadow }} />
          )}
          {isVSL2 && (
            <div className={styles.progressSpark} style={{ animationDuration: `${sparkDuration}s` }} />
          )}
        </div>
      )}
      {isVSL2 && (
        <div className={styles.progressInfo} aria-live="polite">
          <span className={styles.progressInfoLabel}>{stageLabel}</span>
        </div>
      )}

    </div>
  )
}
