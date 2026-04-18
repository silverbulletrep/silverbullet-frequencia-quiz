import React from 'react'
import { motion } from 'framer-motion'
import styles from './FimFunil.module.scss'
import { getApiHealth } from '@/lib/api'
import { useProgressStore } from '@/lib/progressStore'
import { useTranslation } from 'react-i18next'

export default function FimFunil() {
  const { t } = useTranslation()
  const [completed, setCompleted] = React.useState(false)
  const [dots, setDots] = React.useState(1)
  const setStageProgress = useProgressStore((s) => s.setStageProgress)
  const setRemainingSeconds = useProgressStore((s) => s.setRemainingSeconds)
  const resetProgress = useProgressStore((s) => s.resetProgress)
  React.useEffect(() => {
    const pageEl = document.querySelector(`.${styles.page}`)
    const bg = (pageEl && window.getComputedStyle(pageEl).backgroundColor) || '#0f192d'
    document.documentElement.style.backgroundColor = bg
    document.body.style.backgroundColor = bg
    document.body.style.setProperty('--color-bg-main', bg)
    document.body.style.setProperty('--color-bg-alt', bg)
    return () => {
      document.documentElement.style.backgroundColor = ''
      document.body.style.backgroundColor = ''
      document.body.style.removeProperty('--color-bg-main')
      document.body.style.removeProperty('--color-bg-alt')
    }
  }, [])

  React.useEffect(() => {
    const operacao = 'progress.fim_funil_header_schedule'
    const EXPECTED_MS = 2500
    const dados_entrada = { expected_ms: EXPECTED_MS }
    try {
      console.log(`[FIM_FUNIL] Iniciando operação: ${operacao}`, { dados_entrada })
      const start = Date.now()
      const iv = window.setInterval(() => {
        try {
          const elapsed = Date.now() - start
          const p = Math.min(1, Math.max(0, elapsed / EXPECTED_MS))
          const pct = Math.floor(p * 100)
          setStageProgress(pct)
          setRemainingSeconds(Math.max(0, Math.ceil((EXPECTED_MS - elapsed) / 1000)))
          if (pct >= 100) {
            window.clearInterval(iv)
            setCompleted(true)
            console.log('[FIM_FUNIL] Operação concluída com sucesso:', { id_resultado: 'progress_completed', timestamp: new Date().toISOString() })
          }
        } catch (e) {
          console.error('[FIM_FUNIL] progress_update_error', { message: e?.message })
        }
      }, 80)
      return () => { try { window.clearInterval(iv); resetProgress() } catch {} }
    } catch (error) {
      console.error(`[FIM_FUNIL] Erro na operação: ${operacao}: ${error.message}`, { stack: error.stack })
    }
  }, [])

  React.useEffect(() => {
    let iv = 0
    iv = window.setInterval(() => {
      setDots((d) => (d >= 3 ? 1 : d + 1))
    }, 600)
    return () => { try { window.clearInterval(iv) } catch {} }
  }, [])

  React.useEffect(() => {
    (async () => {
      try {
        const h = await getApiHealth()
        console.log('[FIM_FUNIL] api_health', { ok: !!h?.success })
      } catch (e) {
        console.warn('[FIM_FUNIL] api_health_fail')
      }
    })()
  }, [])

  function onLoginClick() {
    const operacao = 'fim_funil.login_redirect'
    const dados_entrada = { url: 'https://fundaris.space/app/criar' }
    try {
      console.log(`[FIM_FUNIL] Iniciando operação: ${operacao}`, { dados_entrada })
      const target = dados_entrada.url
      window.open(target, '_blank', 'noopener,noreferrer')
      console.log('[FIM_FUNIL] Operação concluída com sucesso:', {
        id_resultado: 'redirect_opened',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`[FIM_FUNIL] Erro na operação: ${error.message}`, {
        dados_entrada,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerSpacer} />
      <div className={styles.container}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 10, scale: 0.98, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('fim_funil.title')}
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('fim_funil.subtitle')}
        </motion.p>

        

        {completed && (
          <motion.div
            className={styles.completionBadge}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            aria-live="polite"
          >
            {t('fim_funil.completed_badge')}
          </motion.div>
        )}

        <motion.button
          className={styles.cta}
          onClick={onLoginClick}
          aria-label="Acessar plataforma"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: completed ? 1 : 0.4, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {completed ? t('fim_funil.access_button') : `${t('fim_funil.preparing')}${'.'.repeat(dots)}`}
        </motion.button>
      </div>
    </div>
  )
}
