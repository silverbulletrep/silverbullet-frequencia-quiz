import React from 'react'
import styles from './AudioUpsell.module.scss'
import { useTranslation } from 'react-i18next'
const BackgroundBorder = React.lazy(() => import('@/components/BackgroundBorder/BackgroundBorder'))
const PaymentMethodModal = React.lazy(() => import('@/components/PaymentMethodModal'))
const CheckoutModal = React.lazy(() => import('@/components/CheckoutModal'))
import { useExitIntent } from '@/hooks/useExitIntent'
import { motion } from 'framer-motion'
import { API_BASE_URL, updateLeadPurchase } from '@/lib/api'
import { asset } from '@/lib/asset'
import { leadCache } from '@/lib/leadCache'
import { buildHotmartCheckoutUrl, makeLeadIdShort, normalizeHotmartPaymentMethod } from '@/lib/hotmartCheckout'
import { useProgressStore } from '@/lib/progressStore'
import { useNavigate } from 'react-router-dom'
import { createFunnelTracker, QUIZ_FUNNEL_ID, getDefaultBaseUrl, readStoredCountry, buildRouteStep } from '@/lib/funnelTracker'

import expertImg from '../../img/expert.webp'
import expertPtImg from '../../img/expert-pt.webp'

const HOTMART_UPSELL_CHECKOUT_URL = 'https://pay.hotmart.com/J105101811T?checkoutMode=10'

export default function AudioUpsell() {
  const { t } = useTranslation()

  useExitIntent();
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [hasEnded, setHasEnded] = React.useState(false)
  const [dots, setDots] = React.useState(1)
  const audioRef = React.useRef(null)
  const [audioUrl, setAudioUrl] = React.useState('')
  const candidateIndexRef = React.useRef(0)
  const candidatesRef = React.useRef([])

  const isPtRoute = (() => {
    try {
      const pathname = String(window.location.pathname || '')
      return pathname.includes('/pt/') || pathname === '/pt' || pathname.endsWith('/pt')
    } catch {
      return false
    }
  })()

  const EXPECTED_DURATION_SEC = isPtRoute ? 453 : 780 // Math.ceil((13 * 60) / 0.9) vs 7m33s
  const EXPECTED_TRIGGER_SEC = isPtRoute ? 348 : (8 * 60 + 5)

  const [visualPct, setVisualPct] = React.useState(0)
  const [hasInteracted, setHasInteracted] = React.useState(() => {
    return new URLSearchParams(window.location.search).get('autoPlay') === 'true'
  })
  const [docked, setDocked] = React.useState(() => {
    return new URLSearchParams(window.location.search).get('autoPlay') === 'true'
  })
  const [uiRevealed, setUiRevealed] = React.useState(() => {
    return new URLSearchParams(window.location.search).get('autoPlay') === 'true'
  })
  const lastTimeRef = React.useRef(0)
  const opIdRef = React.useRef(`${Date.now()}_${Math.random().toString(36).slice(2)}`)
  const audioObjRef = React.useRef(null)
  const setStageProgress = useProgressStore((s) => s.setStageProgress)
  const setRemainingSeconds = useProgressStore((s) => s.setRemainingSeconds)
  const resetProgress = useProgressStore((s) => s.resetProgress)
  const [ctaReady, setCtaReady] = React.useState(false)
  const [loadingCheckout, setLoadingCheckout] = React.useState(false)
  const [showPaymentMethodModal, setShowPaymentMethodModal] = React.useState(false)
  const [showStripeCheckout, setShowStripeCheckout] = React.useState(false)
  const hasInteractedRef = React.useRef(false)
  const ctaReadyRef = React.useRef(false)
  const DEBUG = import.meta.env.DEV
  const navigate = useNavigate()
  const tracker = React.useMemo(() => createFunnelTracker({
    baseUrl: getDefaultBaseUrl(),
    funnelId: QUIZ_FUNNEL_ID,
    getCountry: () => readStoredCountry() || undefined,
    debug: DEBUG
  }), [DEBUG])

  React.useEffect(() => {
    hasInteractedRef.current = hasInteracted
  }, [hasInteracted])

  React.useEffect(() => {
    ctaReadyRef.current = ctaReady
  }, [ctaReady])

  // Atualiza o checkpoint do exit intent de acordo com a interação inicial (play)
  React.useEffect(() => {
    if (hasInteracted) {
      sessionStorage.setItem('ei_checkpoint', '/audio-upsell-pos-play')
    } else {
      sessionStorage.setItem('ei_checkpoint', '/audio-upsell')
    }

    // 1. Garante que variáveis prévias não impeçam o redirecionamento:
    window._br_firing = false;

    // 2. Interceptor que envia o parâmetro correto para o hook global
    window.__br_interceptor = () => {
      console.log('[AudioUpsell] Interceptor ativado.');
      // Retorna o checkpoint personalizado que o JohannChat espera
      return hasInteractedRef.current ? '/audio-upsell-pos-play' : '/audio-upsell';
    };

    return () => {
      window.__br_interceptor = null;
    };
  }, [hasInteracted])

  // Disparo automático para quando vem do Chat (Gatilho #LIBERAR_AUDIO#)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoPlay') === 'true' && !isPlaying) {
      // Pequeno delay para garantir que os refs de áudio estejam prontos
      const timer = setTimeout(() => {
        handleToggle();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  React.useEffect(() => {
    if (hasInteracted && ctaReady) {
      try { setStageProgress(100) } catch { }
      try { setRemainingSeconds(0) } catch { }
    }
  }, [hasInteracted, ctaReady])

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
    let iv = 0
    iv = window.setInterval(() => {
      setDots((d) => (d >= 3 ? 1 : d + 1))
    }, 600)
    return () => { try { window.clearInterval(iv) } catch { } }
  }, [])

  React.useEffect(() => {
    return () => {
      try {
        const el = audioObjRef.current
        if (el) {
          el.pause()
          el.src = ''
        }
      } catch { }
    }
  }, [])

  React.useEffect(() => { }, [isPlaying])

  React.useEffect(() => { }, [])
  React.useEffect(() => {
    try {
      const step = buildRouteStep('/audio-upsell', { id: 'audio_upsell', index: 16 }, 'Página de Upsell')
      tracker.stepView(step)
    } catch { }
  }, [tracker])
  React.useEffect(() => {
    const operacao = 'progress.audio_upsell_schedule'
    const dados_entrada = { expected_sec: EXPECTED_DURATION_SEC }
    try {
      console.log(`[AUDIO] Iniciando operação: ${operacao}`, { dados_entrada })
      const start = Date.now()
      const iv = window.setInterval(() => {
        try {
          if (hasInteractedRef.current && ctaReadyRef.current) {
            setStageProgress(100)
            setRemainingSeconds(0)
            window.clearInterval(iv)
            return
          }
          const elapsedSec = Math.floor((Date.now() - start) / 1000)
          const p = Math.min(1, Math.max(0, elapsedSec / EXPECTED_DURATION_SEC))
          const visual = mapProgressForRing(p)
          const stage = Math.floor(visual * 100)
          setStageProgress(stage)
          setRemainingSeconds(Math.max(0, EXPECTED_DURATION_SEC - elapsedSec))
          if (p >= 1) {
            window.clearInterval(iv)
            console.log('[AUDIO] Operação concluída com sucesso:', { id_resultado: 'progress_completed', timestamp: new Date().toISOString() })
          }
        } catch (e) {
          console.error('[AUDIO] progress_schedule_error', { message: e?.message })
        }
      }, 1000)
      return () => {
        try { window.clearInterval(iv) } catch { }
        try { resetProgress() } catch { }
      }
    } catch (error) {
      console.error(`[AUDIO] Erro na operação: ${operacao}: ${error.message}`, { stack: error.stack, timestamp: new Date().toISOString() })
    }
  }, [])
  function mapProgressForRing(p) {
    if (p <= 0) return 0
    if (p >= 1) return 1
    const a = 0.18
    const b = 0.82
    if (p < a) {
      const x = p / a
      return 0.34 * (1 - Math.pow(1 - x, 2.2))
    }
    if (p < b) {
      const x = (p - a) / (b - a)
      return 0.34 + 0.46 * (Math.pow(x, 0.85))
    }
    const x = (p - b) / (1 - b)
    const accel = Math.pow(x, 0.55)
    const slowTail = Math.min(1, Math.max(0, 1 - Math.pow(x, 2.2)))
    return Math.min(1, 0.8 + 0.18 * accel * slowTail)
  }

  React.useEffect(() => {
    const operacao = 'audio.resolve_source_candidates'
    try {
      const cand = isPtRoute ? [
        asset('/Audio/audio-upsell-pt.mp3')
      ] : [
        asset('/Audio/Upsell-Audio.mp3'),
        asset('/Audio/Upsell-Audio.MP3')
      ]
      candidatesRef.current = cand
      console.log(`[AUDIO] Iniciando operação: ${operacao}`, { candidatos: cand })
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 6500)
        ; (async () => {
          let resolvedUrl = ''
          try {
            for (let i = 0; i < cand.length; i++) {
              const url = cand[i]
              try {
                const head = await fetch(url, { method: 'HEAD', mode: 'cors', cache: 'no-store', signal: controller.signal })
                if (head.ok) {
                  resolvedUrl = url
                  candidateIndexRef.current = i
                  console.log('[AUDIO] Fonte resolvida com sucesso', { url })
                  break
                }
                if ([400, 403, 405].includes(head.status)) {
                  const get = await fetch(url, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'no-store',
                    headers: { Range: 'bytes=0-1' },
                    signal: controller.signal,
                  })
                  if (get.ok || get.status === 206) {
                    resolvedUrl = url
                    candidateIndexRef.current = i
                    console.log('[AUDIO] Fonte resolvida com sucesso', { url })
                    break
                  }
                }
                console.error('[AUDIO] Pré-checagem falhou', { url, status: head.status })
              } catch (e) {
                console.error('[AUDIO] Pré-checagem erro', { message: e?.message })
              }
            }
          } finally {
            window.clearTimeout(timeout)
          }

          if (resolvedUrl) {
            setAudioUrl(resolvedUrl)
            return
          }

          if (cand.length) {
            candidateIndexRef.current = 0
            setAudioUrl(cand[0])
          }
        })()
    } catch (error) {
      console.error(`[AUDIO] Erro na operação: ${operacao}: ${error.message}`, { stack: error.stack })
    }
  }, [])

  React.useEffect(() => { }, [docked])

  async function togglePlay() {
    const operacao = 'audio.play_toggle'
    const dados_entrada = { src: audioUrl || candidatesRef.current[0] }
    try {
      console.log(`[AUDIO] Iniciando operação: ${operacao}`, { dados_entrada })
      setUiRevealed(true)
      if (!hasInteracted) {
        setHasInteracted(true)
        hasInteractedRef.current = true
        console.log('[AUDIO] interacao_inicial', { timestamp: new Date().toISOString() })
      }
      if (!audioObjRef.current) {
        const initialSrc = audioUrl || candidatesRef.current[0]
        const obj = new Audio(initialSrc)
        try { obj.crossOrigin = 'anonymous' } catch { }
        try { obj.preload = 'auto' } catch { }
        const onError = async () => {
          console.error('[AUDIO] Falha ao carregar', { src: obj.src, networkState: obj.networkState, readyState: obj.readyState })
          const cand = candidatesRef.current
          let idx = candidateIndexRef.current || 0
          if (idx < cand.length - 1) {
            idx += 1
            candidateIndexRef.current = idx
            const next = cand[idx]
            console.log('[AUDIO] Tentando próximo candidato', { next })
            try {
              obj.src = next
              obj.load()
              await obj.play()
              return
            } catch (err) {
              console.error('[AUDIO] Próximo candidato falhou', { message: err?.message })
            }
          }
          alert(t('audio_upsell.audio_load_error'))
        }
        const onPlay = () => { setIsPlaying(true); setDocked(true); setHasEnded(false) }
        const onPause = () => { setIsPlaying(false) }
        const onEnded = () => { setIsPlaying(false); setHasEnded(true) }
        const onRateChange = () => {
          try {
            if (obj.playbackRate !== 0.9) obj.playbackRate = 0.9
          } catch { }
        }
        const onTimeUpdate = () => {
          try {
            const now = obj.currentTime || 0
            lastTimeRef.current = now
            const duration = Math.max(EXPECTED_DURATION_SEC, obj.duration || 0)
            const p = Math.min(1, Math.max(0, now / duration))
            const visual = mapProgressForRing(p)
            const shouldForceComplete = !!(hasInteractedRef.current && ctaReadyRef.current)
            setVisualPct(shouldForceComplete ? 100 : Math.floor(visual * 100))
            console.log('[AUDIO] progress_update', { opId: opIdRef.current, t: now, duration, pct_audio: Math.floor(p * 100), pct_visual: Math.floor(visual * 100) })
            if (!ctaReadyRef.current && now >= EXPECTED_TRIGGER_SEC) {
              setCtaReady(true)
              ctaReadyRef.current = true
              try { setStageProgress(100) } catch { }
              try { setRemainingSeconds(0) } catch { }
              setVisualPct(100)
              console.log('[AUDIO] cta_ready', { at_seconds: now })
            }
          } catch (e) {
            console.error('[AUDIO] progress_update_error', { message: e?.message })
          }
        }
        obj.addEventListener('error', onError)
        obj.addEventListener('play', onPlay)
        obj.addEventListener('pause', onPause)
        obj.addEventListener('ended', onEnded)
        obj.addEventListener('timeupdate', onTimeUpdate)
        obj.addEventListener('ratechange', onRateChange)
        audioObjRef.current = obj
      }
      const el = audioObjRef.current
      if (el.paused) {
        const duration = Number(el.duration || 0)
        const current = Number(el.currentTime || 0)
        const ended = Boolean(el.ended) || (duration > 0 && current >= Math.max(0, duration - 0.25))
        if (ended) {
          try { el.currentTime = 0 } catch { }
          setHasEnded(false)
        }
        setIsPlaying(true)
        setDocked(true)
        try { el.playbackRate = 0.9 } catch { }
        try { el.defaultPlaybackRate = 0.9 } catch { }
        try { el.preservesPitch = true } catch { }
        try { el.mozPreservesPitch = true } catch { }
        try { el.webkitPreservesPitch = true } catch { }
        if (el.readyState < 2) {
          try { el.load() } catch { }
        }
        try {
          await el.play()
        } catch (playErr) {
          console.error('[AUDIO] play() falhou', { message: playErr?.message })
          setIsPlaying(false)
          return
        }
      } else {
        try { el.pause() } catch { }
      }
      console.log('[AUDIO] Operação concluída com sucesso:', { playing: !el.paused, timestamp: new Date().toISOString() })
    } catch (error) {
      console.error(`[AUDIO] Erro na operação: ${error.message}`, { dados_entrada, stack: error.stack, timestamp: new Date().toISOString() })
    }
  }

  function handleToggle() {
    const el = audioObjRef.current
    if (el && !el.paused) {
      const operacao = 'audio.pause_toggle'
      const dados_entrada = { opId: opIdRef.current }
      try { console.log(`[AUDIO] Iniciando operação: ${operacao}`, { dados_entrada }) } catch { }
      try { el.pause() } catch { }
      setIsPlaying(false)
      try { console.log('[AUDIO] Operação concluída com sucesso:', { id_resultado: 'paused', timestamp: new Date().toISOString() }) } catch { }
      return
    }
    togglePlay()
  }

  function onKeyControl(e) {
    if (e?.key === 'Enter' || e?.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  function renderProgressRing() {
    const size = docked ? 92 : 260
    const stroke = docked ? 6 : 8
    const r = (size / 2) - stroke - 4
    const circumference = 2 * Math.PI * r
    const pct = Math.max(0, Math.min(100, visualPct))
    const offset = circumference * (1 - pct / 100)
    return (
      <svg className={styles.progressRing} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className={styles.progressTrack} />
        <circle cx={size / 2} cy={size / 2} r={r} className={styles.progressBar} style={{ strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: offset }} />
      </svg>
    )
  }

  function primeCaptions() {
    // Caption logic disabled - placeholder
  }

  async function beginCheckout(origin) {
    const operacao = 'audio_upsell.begin_checkout'
    try {
      setLoadingCheckout(true)

      const cache = leadCache.getAll()
      const leadId = (() => {
        try {
          const storedLeadId = localStorage.getItem('lead_id')
          if (typeof storedLeadId === 'string' && storedLeadId.trim()) return storedLeadId.trim()
        } catch { }
        if (typeof cache?.lead_id === 'string' && cache.lead_id.trim()) return cache.lead_id.trim()
        if (typeof cache?.id_lead === 'string' && cache.id_lead.trim()) return cache.id_lead.trim()
        return ''
      })()
      const email = typeof cache?.email === 'string' ? cache.email.trim() : ''
      const storedMethod = (() => {
        try {
          const raw = localStorage.getItem('metodo_pagamento') || ''
          return normalizeHotmartPaymentMethod(raw.trim() || '')
        } catch {
          return ''
        }
      })()
      const leadIdShort = leadId ? makeLeadIdShort(leadId) : ''

      if (leadIdShort) {
        try { leadCache.setLeadIdShort(leadIdShort) } catch { }
      }

      try {
        const step = buildRouteStep('/audio-upsell', { id: 'audio_upsell', index: 16 }, 'Página de Upsell')
        await tracker.checkoutStart(
          step,
          { value: 37, currency: 'EUR' },
          {
            journey_type: 'upsell',
            purchase_kind: 'upsell',
            product_id: 'elevate_up01',
            checkout_origin: origin || 'audio_upsell',
            payment_method: storedMethod || undefined,
            email_present: Boolean(email),
            ...(leadIdShort ? { lead_id_short: leadIdShort } : {})
          }
        )
      } catch (error) {
        console.error('[AUDIO] Falha ao enviar checkout_start', { message: error?.message })
      }

      if (!isPtRoute) {
        setShowStripeCheckout(true)
        setLoadingCheckout(false)
        return
      }

      const checkoutUrl = buildHotmartCheckoutUrl({
        baseUrl: HOTMART_UPSELL_CHECKOUT_URL,
        paymentMethod: storedMethod || undefined,
        leadIdShort: leadIdShort || undefined,
        email: email || undefined
      })

      window.location.href = checkoutUrl
    } catch (error) {
      console.error(`[AUDIO] Erro na operação: ${operacao}: ${error.message}`, {
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
      setLoadingCheckout(false)
    }
  }

  function onPaymentSuccess(info) {
    const operacao = 'audio_upsell.payment_success_redirect'
    const dados_entrada = { info }
    try {
      console.log(`[FRONT] Iniciando operação: ${operacao}`, { dados_entrada })
      try {
        const cache = leadCache.getAll()
        void updateLeadPurchase({
          id_lead: cache?.id_lead,
          whatsapp: cache?.whatsapp,
          dados_compra: info,
        })
      } catch (e) {
        console.warn('[FRONT] Falha ao atualizar lead após compra', { message: e?.message })
      }
      try {
        navigate('/fim-funil')
      } catch (e) {
        console.error('[FRONT] Falha ao redirecionar para /fim-funil', { message: e?.message })
      }
      console.log('[FRONT] Operação concluída com sucesso:', {
        id_resultado: info?.referenceId || 'sem_ref',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`[FRONT] Erro na operação: ${operacao}: ${error.message}`, {
        dados_entrada,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }
  }

  function forceShowCta() {
    const operacao = 'audio_upsell.debug_force_cta'
    const dados_entrada = { hasInteracted, ctaReady }
    try {
      console.log(`[DEBUG] Iniciando operação: ${operacao}`, { dados_entrada })
      if (!hasInteracted) {
        setHasInteracted(true)
        hasInteractedRef.current = true
      }
      setCtaReady(true)
      ctaReadyRef.current = true
      try { setStageProgress(100) } catch { }
      try { setRemainingSeconds(0) } catch { }
      setVisualPct(100)
      console.log('[DEBUG] Operação concluída com sucesso:', {
        id_resultado: 'debug_cta_shown',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`[DEBUG] Erro na operação: ${operacao}: ${error.message}`, {
        dados_entrada,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }
  }



  return (
    <div className={styles.page}>
      {DEBUG && (
        <button
          onClick={forceShowCta}
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 9999,
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Debug: Liberar Conteúdo
        </button>
      )}
      <div className={styles.headerSpacer} />
      <div className={styles.container}>
        <div className={`${styles.upsellRow} ${uiRevealed ? styles.upsellRowSplit : ''} ${docked ? styles.upsellRowDocked : ''}`}>
          <div className={styles.headerGroup}>
            <h1 className={styles.title}>{(hasInteracted && ctaReady) ? t('audio_upsell.success_title') : t('audio_upsell.processing', { dots: '.'.repeat(dots) })}</h1>

            <p className={styles.subtitle}>{t('audio_upsell.subtitle')}</p>
          </div>

          <div
            className={`${styles.audioDisc} ${styles.audioControl} ${docked ? styles.audioDocked : ''} ${(hasInteracted && !isPlaying && !hasEnded) ? styles.audioPaused : ''} ${isPlaying ? styles.controlPlaying : styles.controlPaused}`}
            onClick={handleToggle}
            onKeyDown={onKeyControl}
            role="button"
            tabIndex={0}
            aria-label={isPlaying ? t('audio_upsell.aria_pause') : t('audio_upsell.aria_play')}
            aria-pressed={isPlaying}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.expertAvatarWrap}>
              <img src={isPtRoute ? expertPtImg : expertImg} alt={t('audio_upsell.expert_alt')} className={styles.expertAvatar} width="535" height="473" fetchpriority="high" loading="eager" />
              {renderProgressRing()}
              <div className={`${styles.controlOverlay} ${!hasInteracted ? styles.controlInitial : ''}`} aria-hidden="true">
                {isPlaying ? (
                  <motion.svg className={styles.controlIcon} viewBox="0 0 24 24" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
                    <rect x="7" y="5" width="4" height="14" rx="1" />
                    <rect x="13" y="5" width="4" height="14" rx="1" />
                  </motion.svg>
                ) : (
                  <motion.svg className={styles.controlIcon} viewBox="0 0 24 24" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
                    <path d="M8 5v14l11-7z" />
                  </motion.svg>
                )}
                {(hasInteracted && !isPlaying && !hasEnded) && (
                  <motion.div
                    className={styles.pauseBalloon}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    aria-live="polite"
                  >
                    <div className={styles.pauseBalloonInner}>
                      <img src={asset('/.figma/image/mg2zmbvd-08e800q.svg')} alt="Alerta" className={styles.pauseBalloonIcon} />
                      <div className={styles.pauseBalloonText}>{t('audio_upsell.pause_balloon_text')}</div>
                    </div>
                    <div className={styles.pauseBalloonArrow} />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {!hasInteracted && (
            <div className={styles.playHint} aria-live="polite">
              {t('audio_upsell.play_hint')}
            </div>
          )}

          {uiRevealed && (
            <motion.div className={styles.graphContainer} initial={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div className={styles.graphCanvas} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <motion.svg className={styles.graphGrid} viewBox="0 0 496 242" preserveAspectRatio="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }}>
                  <line x1="0" y1="30" x2="496" y2="30" className={styles.gridLine} />
                  <line x1="0" y1="80" x2="496" y2="80" className={styles.gridLine} />
                  <line x1="0" y1="130" x2="496" y2="130" className={styles.gridLine} />
                  <line x1="0" y1="180" x2="496" y2="180" className={styles.gridLine} />
                  <line x1="0" y1="228" x2="496" y2="228" className={styles.gridLine} />
                  <line x1="360" y1="0" x2="360" y2="242" className={styles.gridLineDash} />
                </motion.svg>
                <motion.svg className={styles.graphOverlay} viewBox="0 0 496 242" preserveAspectRatio="none" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18, duration: 0.5 }}>
                  <polyline points="10,170 120,160 240,150 360,130 480,120" className={styles.lineNoPlan} />
                  <polyline points="10,160 100,150 180,120 260,80 340,70 420,66 480,64" className={styles.linePlan} />
                </motion.svg>
                <motion.div className={styles.labelEquilibrio} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.4 }}>{t('audio_upsell.chart.balance')}</motion.div>
                <motion.div className={styles.labelNoPlan} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>{t('audio_upsell.chart.plan_1')}</motion.div>
                <motion.div className={styles.labelPlan} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.4 }}>{t('audio_upsell.chart.plan_2')}</motion.div>
                <motion.div className={styles.axisLabels} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.4 }}>
                  <span>{t('audio_upsell.chart.today')}</span>
                  <span>{t('audio_upsell.chart.month_1')}</span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {hasInteracted && ctaReady && (
            <button className={styles.cta} onClick={() => beginCheckout('audio_upsell')} disabled={loadingCheckout}>
              {loadingCheckout ? t('audio_upsell.cta_loading') : t('audio_upsell.cta')}
            </button>
          )}

          {hasInteracted && (
            <div className={styles.chips}>
              <div className={`${styles.chip} ${styles.chipGreen}`}>{t('audio_upsell.chip_official')}</div>
              <div className={`${styles.chip} ${styles.chipGreen}`}>{t('audio_upsell.chip_recommended')}</div>
            </div>
          )}
        </div>

        {hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <React.Suspense fallback={null}><BackgroundBorder /></React.Suspense>
          </motion.div>
        )}


        {/* comment card removido */}

        {showPaymentMethodModal && (
          <React.Suspense fallback={null}>
            <PaymentMethodModal
              open={showPaymentMethodModal}
              onClose={() => setShowPaymentMethodModal(false)}
              onSelect={(methodId) => {
                const links = {
                  card: 'https://pay.hotmart.com/N105101154W?bid=1775256934969&paymentMethod=credit_card',
                  multibanco: 'https://pay.hotmart.com/N105101154W?bid=1775256934969&paymentMethod=billet',
                  mbway: 'https://pay.hotmart.com/N105101154W?bid=1775256934969&paymentMethod=mbway'
                }
                window.location.href = links[methodId] || 'https://pay.hotmart.com/N105101154W?bid=1775256934969'
              }}
            />
          </React.Suspense>
        )}

        <React.Suspense fallback={null}>
          {showStripeCheckout && (
            <CheckoutModal
                onClose={() => setShowStripeCheckout(false)}
                onSuccess={(data) => {
                    console.log('[AUDIO_UPSELL] De checkout success:', data)
                    setShowStripeCheckout(false)
                    onPaymentSuccess(data)
                }}
                amount_cents={4700}
                currency="eur"
                metadata={{
                    origin: 'audio_upsell',
                    product_name: 'Personalisierter Plan 2.0',
                    variant: 'audio_upsell'
                }}
            />
          )}
        </React.Suspense>
      </div>
    </div>
  )
}
