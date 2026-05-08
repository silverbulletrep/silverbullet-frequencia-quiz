import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { API_BASE_URL } from '@/lib/api'
import { asset } from '@/lib/asset'
import { leadCache } from '@/lib/leadCache'
import { isMetaPixelPaused } from '@/lib/metaPixel'
import {
  createFunnelTracker,
  QUIZ_FUNNEL_ID,
  QUIZ_PROGRESS_STEPS,
  getDefaultBaseUrl,
  readStoredCountry,
  buildRouteStep,
  shouldSendEvent
} from '../lib/funnelTracker';
import { useExitIntent } from '../hooks/useExitIntent';
import { useWakeLock } from '../hooks/useWakeLock';
import styles from './Fim.module.scss'
import expertImg from '../../img/expert.webp'
import expertPtImg from '../../img/expert-pt.webp'
import expertTeamImg from '../../img/Equipe-quantica.webp'
import expertTeamDeImg from '../../img/equipe-de.webp'
import SurpriseGiftModal from '../components/retention/SurpriseGiftModal'
import DiscountModal from '../components/retention/DiscountModal'

const CommentsSection = React.lazy(() => import('./CommentsSection'))
const FimBelowFold = React.lazy(() => import('./FimBelowFold'))

const DEBUG = import.meta.env.DEV

export default function Fim() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useExitIntent();
  useWakeLock(true);
  const introRef = useRef(null)
  const debugRef = useRef({ currentTime: 0, duration: 0, source: 'init' })
  const offerRevealTrackedRef = useRef(false)
  const [introState, setIntroState] = useState('enter')
  const [dotsCount, setDotsCount] = useState(1)
  const [engagementState, setEngagementState] = useState('hidden') // 'hidden' | 'entering' | 'visible' | 'exiting'
  const [ctaChecked, setCtaChecked] = useState(false)
  const [ringVariant, setRingVariant] = useState('gold')
  const isPtRoute = (() => {
    try {
      const pathname = String(window.location.pathname || '')
      return pathname.includes('/pt/') || pathname === '/pt' || pathname.endsWith('/pt')
    } catch {
      return false
    }
  })()
  const playerConfig = isPtRoute ? {
    playerId: '69b6fb194601d16cb06de295',
    playerSrc: 'https://scripts.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/players/69b6fb194601d16cb06de295/v4/player.js',
    hlsSrc: 'https://cdn.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/69b6fae3005f4e6dadb06950/main.m3u8'
  } : {
    playerId: '69387a2b34c2b56109b02cb9',
    playerSrc: 'https://scripts.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/players/69387a2b34c2b56109b02cb9/v4/player.js',
    hlsSrc: ''
  }
  const smartplayerId = `vid-${playerConfig.playerId}`

  // "3.5s Budget" Strategy removed - rendering immediately for CLS stability

  const TARGET_SECONDS = isPtRoute ? 872 : 865 // PT: 14:27 | DE: 14:20
  const TARGET_MS_BAR = TARGET_SECONDS * 1000
  const [gatingComplete, setGatingComplete] = useState(false)

  const [headerPct, setHeaderPct] = useState(0)
  const [displayedHeaderPct, setDisplayedHeaderPct] = useState(0)

  // Epic Retainer Duplo: Modal de espera antes do Pitch Reveal
  const [showWaitModal, setShowWaitModal] = useState(false)
  const [hasShownWaitModal, setHasShownWaitModal] = useState(false)
  const [modalProgress, setModalProgress] = useState(0)

  // Retention Modals States
  const [giftThemeActive, setGiftThemeActive] = useState(false)
  const [discountThemeActive, setDiscountThemeActive] = useState(false)
  const [showSurpriseModal, setShowSurpriseModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [hasOpenedCheckout, setHasOpenedCheckout] = useState(false)
  const [checkoutResumeMode, setCheckoutResumeMode] = useState(null)
  const [discountTimerEnd, setDiscountTimerEnd] = useState(() => {
    const saved = sessionStorage.getItem('discount_timer_end');
    return saved ? parseInt(saved, 10) : null;
  })
  const [videoCurrentTime, setVideoCurrentTime] = useState(0)
  const [headerTimerDisplay, setHeaderTimerHeader] = useState('')

  // Trigger deferred load removed

  useEffect(() => {
    // Garantir que a página inicie e se mantenha no topo
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 50);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 300);

    // Inicializar o tracker no carregamento da página
    try {
      const tracker = createFunnelTracker({
        baseUrl: getDefaultBaseUrl(),
        funnelId: QUIZ_FUNNEL_ID,
        getCountry: () => readStoredCountry() || undefined,
        debug: DEBUG
      });

      const step = buildRouteStep('/fim', QUIZ_PROGRESS_STEPS.fim);
      if (shouldSendEvent('step_view:/fim')) {
        tracker.stepView(step).catch((err) => {
          console.error('[FIM] Erro ao enviar step_view:', err);
        });
      }
    } catch (e) {
      console.error('[FIM] Falha ao inicializar tracker', e);
    }

    try { document.title = t('fim.page_title') } catch { }
    const enterDuration = 1000
    const holdAfterOpen = 1500
    const exitDuration = 1000

    const t1 = setTimeout(() => { setIntroState('exit') }, enterDuration + holdAfterOpen)
    const t2 = setTimeout(() => {
      setIntroState('hidden')
      console.log('[FIM] Intro animation completed', { timestamp: new Date().toISOString() })
    }, enterDuration + holdAfterOpen + exitDuration)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Epic 004: Engagement ring/chat appears 3s after intro hides
  useEffect(() => {
    if (introState !== 'hidden') return
    const timer = setTimeout(() => setEngagementState('entering'), 3000)
    return () => clearTimeout(timer)
  }, [introState])

  // Transition from 'entering' to 'visible' after CSS animation completes
  useEffect(() => {
    if (engagementState !== 'entering') return
    const timer = setTimeout(() => setEngagementState('visible'), 600)
    return () => clearTimeout(timer)
  }, [engagementState])

  const dismissEngagement = useCallback(() => {
    setEngagementState('exiting')
    setTimeout(() => {
      setEngagementState('hidden')
    }, 400)
  }, [])

  const handleCtaClick = useCallback(() => {
    if (ctaChecked) return
    setCtaChecked(true)
    setRingVariant('green')
    setTimeout(() => dismissEngagement(), 420)
  }, [ctaChecked, dismissEngagement])

  useEffect(() => {
    const get = () => ({ ...debugRef.current, gatingComplete })
    window.__fimVideoDebug = { get }
    const onMessage = (event) => {
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (payload?.type === 'smartplayer.timeupdate') {
          debugRef.current = {
            currentTime: payload.currentTime,
            duration: payload.duration,
            source: 'postMessage'
          }
          setVideoCurrentTime(payload.currentTime || 0)
        }
      } catch { }
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
      try { delete window.__fimVideoDebug } catch { }
    }
  }, [gatingComplete])

  // Trigger Logic for SurpriseGiftModal (Modal 01) with VTurb Delegate
  const [surpriseTargetMet, setSurpriseTargetMet] = useState(false);
  const surpriseTimerRef = useRef(null);

  useEffect(() => {
    if (gatingComplete) {
      // Just keep this old log for debug continuity without erroring if videoCurrentTime exists
      console.log(`[GATING] Offer released. VideoTime: ${videoCurrentTime}s`);
    }
  }, [gatingComplete, videoCurrentTime]);

  useEffect(() => {
    if (surpriseTargetMet === true && !showSurpriseModal && !surpriseTimerRef.current) {
      console.log(`[DEBUG] Surprise gift target met. Starting 20s delayed activation timer...`);
      surpriseTimerRef.current = setTimeout(() => {
        setSurpriseTargetMet('EVALUATE');
      }, 20000);
    }
  }, [surpriseTargetMet, showSurpriseModal]);

  useEffect(() => {
    if (
      surpriseTargetMet === 'EVALUATE' &&
      !hasOpenedCheckout &&
      !discountThemeActive &&
      !showSurpriseModal &&
      !giftThemeActive
    ) {
      console.warn('[RETENTION] !!! SURPRISE GIFT THRESHOLD REACHED !!!', {
        hasOpenedCheckout,
        discountActive: discountThemeActive
      });
      setShowSurpriseModal(true);
      setSurpriseTargetMet('DONE');
    }
  }, [surpriseTargetMet, hasOpenedCheckout, discountThemeActive, showSurpriseModal, giftThemeActive]);

  // Header Timer Update for Discount Theme
  useEffect(() => {
    if (!discountThemeActive || !discountTimerEnd) return;

    const updateHeaderTimer = () => {
      const now = Date.now();
      const end = parseInt(discountTimerEnd, 10);
      const remaining = Math.max(0, Math.floor((end - now) / 1000));

      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setHeaderTimerHeader(remaining > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : t('discount_modal.timer_expired'));
    };

    updateHeaderTimer();
    const interval = setInterval(updateHeaderTimer, 1000);
    return () => clearInterval(interval);
  }, [discountThemeActive, discountTimerEnd, t]);





  useEffect(() => {
    const operacao = 'fim.apply_background';
    try {
      const pageEl = document.querySelector(`.${styles.page}`);
      const bg = (pageEl && window.getComputedStyle(pageEl).backgroundColor) || '#0f192d';
      document.documentElement.style.backgroundColor = bg;
      document.body.style.backgroundColor = bg;
      try {
        document.body.style.setProperty('--color-bg-main', bg);
        document.body.style.setProperty('--color-bg-alt', bg);
      } catch { }
      return () => {
        try {
          document.documentElement.style.backgroundColor = '';
          document.body.style.backgroundColor = '';
          document.body.style.removeProperty('--color-bg-main');
          document.body.style.removeProperty('--color-bg-alt');
        } catch { }
      };
    } catch (error) {
    }
  }, [])

  useEffect(() => {
    const DELAY_SECONDS = isPtRoute ? 867 : 860 // Sincronizado com TARGET_MS_BAR
    const SURPRISE_DELAY_SECONDS = isPtRoute ? 1023 : 1016 // Surprise Gift Trigger
    const cleanup = []
    const shownRef = { current: false }
    const surpriseShownRef = { current: false }
    const ensureLink = (rel, href, attrs = {}) => {
      if (!href) return
      if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return
      const l = document.createElement('link')
      l.rel = rel
      l.href = href
      Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, String(v)))
      document.head.appendChild(l)
      cleanup.push(() => { try { document.head.removeChild(l) } catch { } })
    }
    const ensureScript = (id, textContent) => {
      if (document.getElementById(id)) return
      const s = document.createElement('script')
      s.id = id
      s.textContent = textContent
      document.head.appendChild(s)
      cleanup.push(() => { try { document.head.removeChild(s) } catch { } })
    }

    const attach = () => {
      const smart = document.getElementById(smartplayerId) || document.querySelector('vturb-smartplayer')
      if (!smart) return false

      const ensureHidden = () => {
        try {
          if (!shownRef.current) {
            const els = document.querySelectorAll('.esconder')
            els.forEach((el) => {
              const cs = window.getComputedStyle(el)
              if (cs && cs.display !== 'none') el.style.display = 'none'
            })
          }
          if (!surpriseShownRef.current) {
            const sEls = document.querySelectorAll('.esconder-surprise-gift')
            sEls.forEach((el) => {
              const cs = window.getComputedStyle(el)
              if (cs && cs.display !== 'none') el.style.display = 'none'
            })
          }
        } catch { }
      }

      const onReady = () => {
        try {
          ensureHidden()
          smart.displayHiddenElements(DELAY_SECONDS, ['.esconder'], { persist: false })
          console.log(`[DEBUG] VTurb API call: displayHiddenElements for surprise gift at ${SURPRISE_DELAY_SECONDS}s`);
          smart.displayHiddenElements(SURPRISE_DELAY_SECONDS, ['.esconder-surprise-gift'], { persist: false })
        } catch { }
      }

      smart.addEventListener('player:ready', onReady)
      cleanup.push(() => smart.removeEventListener('player:ready', onReady))

      // Contingência: se o smartplayer já parecer pronto ou já estiver no DOM há algum tempo
      const tCheck = setTimeout(() => {
        if (!shownRef.current) {
          try {
            onReady();
          } catch (e) { }
        }
      }, 3000);
      cleanup.push(() => clearTimeout(tCheck));

      const hiddenTargets = document.querySelectorAll('.esconder')
      hiddenTargets.forEach((el) => {
        const mo = new MutationObserver(() => {
          const target = document.querySelector('.esconder') || el
          const cs = target ? window.getComputedStyle(target) : null
          if (!shownRef.current && cs && cs.display !== 'none') {
            shownRef.current = true
            setGatingComplete(true)
          }
        })
        mo.observe(el, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] })
        cleanup.push(() => mo.disconnect())
      })

      const surpriseTargets = document.querySelectorAll('.esconder-surprise-gift')
      surpriseTargets.forEach((el) => {
        const mo = new MutationObserver(() => {
          const target = document.querySelector('.esconder-surprise-gift') || el
          const cs = target ? window.getComputedStyle(target) : null
          if (!surpriseShownRef.current && cs && cs.display !== 'none') {
            surpriseShownRef.current = true
            console.log(`[DEBUG] VTurb MutationObserver triggered: .esconder-surprise-gift became visible.`);
            setSurpriseTargetMet(true)
          }
        })
        mo.observe(el, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] })
        cleanup.push(() => mo.disconnect())
      })

      const checkInterval = window.setInterval(() => {
        if (!shownRef.current) {
          try {
            const targets = document.querySelectorAll('.esconder')
            for (let i = 0; i < targets.length; i++) {
              const cs = window.getComputedStyle(targets[i])
              if (cs && cs.display !== 'none') {
                shownRef.current = true
                setGatingComplete(true)
                break
              }
            }
          } catch { }
        }
        if (!surpriseShownRef.current) {
          try {
            const sTargets = document.querySelectorAll('.esconder-surprise-gift')
            for (let i = 0; i < sTargets.length; i++) {
              const cs = window.getComputedStyle(sTargets[i])
              if (cs && cs.display !== 'none') {
                surpriseShownRef.current = true
                console.log(`[DEBUG] VTurb Interval check triggered: .esconder-surprise-gift became visible.`);
                setSurpriseTargetMet(true)
                break
              }
            }
          } catch { }
        }
        if (shownRef.current && surpriseShownRef.current) {
          window.clearInterval(checkInterval)
        }
      }, 500)
      cleanup.push(() => window.clearInterval(checkInterval))

      ensureHidden()
      const hideInterval = window.setInterval(() => ensureHidden(), 700)
      cleanup.push(() => window.clearInterval(hideInterval))
      return true
    }

    // Scripts load logic — Story 3.2: deferred via requestIdleCallback
    // to avoid blocking the component's first render (reduces element render delay)
    const libId = 'vturb-smartplayer-js'
    const libSrc = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js'
    const scriptId = `vturb-player-script-${playerConfig.playerId}`
    const playerSrc = playerConfig.playerSrc

    const loadScript = (id, url) => {
      const existing = document.getElementById(id)
      if (existing) return
      const s = document.createElement('script')
      s.id = id; s.src = url; s.async = true
      document.head.appendChild(s)
      cleanup.push(() => { try { document.head.removeChild(s) } catch { } })
    }

    // Intersection Observer to delay injection of Smartplayer scripts until near viewport
    let observer;
    const loadPlayerScripts = () => {
      if (isPtRoute) {
        ensureScript('vturb-plt-script', '!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);')
        ensureLink('preload', playerConfig.playerSrc, { as: 'script' })
        ensureLink('preload', 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js', { as: 'script' })
        ensureLink('preload', playerConfig.hlsSrc, { as: 'fetch' })
        ensureLink('dns-prefetch', 'https://cdn.converteai.net')
        ensureLink('dns-prefetch', 'https://scripts.converteai.net')
        ensureLink('dns-prefetch', 'https://images.converteai.net')
        ensureLink('dns-prefetch', 'https://api.vturb.com.br')
      }
      loadScript(libId, libSrc)
      setTimeout(() => loadScript(scriptId, playerSrc), 100)
    };

    if ('IntersectionObserver' in window) {
      const waitTarget = document.getElementById(smartplayerId)
      if (waitTarget) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            // Quando estiver perto da view (+300px), carrega o script e remove observer
            if (entry.isIntersecting) {
              loadPlayerScripts();
              observer.disconnect();
            }
          });
        }, { rootMargin: '300px' });
        observer.observe(waitTarget);
      } else {
        loadPlayerScripts(); // fallback
      }
    } else {
      if (typeof window.requestIdleCallback === 'function') {
        const idleCbId = window.requestIdleCallback(loadPlayerScripts, { timeout: 1500 })
        cleanup.push(() => { try { window.cancelIdleCallback(idleCbId) } catch { } })
      } else {
        const t = window.setTimeout(loadPlayerScripts, 200)
        cleanup.push(() => { try { clearTimeout(t) } catch { } })
      }
    }

    cleanup.push(() => { if (observer) observer.disconnect() })

    const poll = setInterval(() => {
      if (attach()) clearInterval(poll)
    }, 500)
    cleanup.push(() => clearInterval(poll))

    return () => { cleanup.forEach(fn => fn()) }
  }, [])

  useEffect(() => {
    let timer = 0
    try {
      const start = Date.now()
      const total = TARGET_MS_BAR
      const tick = () => {
        try {
          const elapsed = Date.now() - start
          const r = Math.min(1, elapsed / total)
          const eased = 1 - Math.pow(2, -8 * r)
          const target = Math.min(97, Math.floor(eased * 97))
          setHeaderPct(target)
          if (target < 97) {
            timer = window.setTimeout(tick, 1000)
          }
        } catch { }
      }
      tick()
    } catch { }
    return () => { try { window.clearTimeout(timer) } catch { } }
  }, [])

  useEffect(() => {
    try {
      if (gatingComplete) {
        setHeaderPct(100);
        // Atualiza o checkpoint para o redirecionamento do WhatsApp (Agente 3 - Pós Pitch)
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('ei_checkpoint', '/fim-pos-pitch');
        }

        if (!offerRevealTrackedRef.current && shouldSendEvent('offer_revealed:/fim', 60000)) {
          offerRevealTrackedRef.current = true;

          const tracker = createFunnelTracker({
            baseUrl: getDefaultBaseUrl(),
            funnelId: QUIZ_FUNNEL_ID,
            getCountry: () => readStoredCountry() || undefined,
            debug: DEBUG
          });

          const step = buildRouteStep('/fim-pos-pitch', QUIZ_PROGRESS_STEPS.fim, 'Oferta liberada pos-pitch');
          tracker.customEvent('offer_revealed', step, {
            source: 'gatingComplete',
            gate: 'fim_below_fold',
            target_seconds: TARGET_SECONDS,
            player_id: playerConfig.playerId,
            route_language: isPtRoute ? 'pt' : 'de'
          }).catch((err) => {
            offerRevealTrackedRef.current = false;
            console.error('[FIM] Erro ao enviar offer_revealed:', err);
          });
        }
      }
    } catch { }
  }, [gatingComplete, isPtRoute, playerConfig.playerId, TARGET_SECONDS])

  const handleDebugClick = () => {
    console.log('[FIM] Debug button clicked, forcing gating complete.')
    setGatingComplete(true)
  }

  useEffect(() => {
    let t = 0
    try {
      if (gatingComplete || displayedHeaderPct >= 97) return
      t = window.setInterval(() => {
        setDotsCount((prev) => (prev >= 3 ? 1 : prev + 1))
      }, 600)
    } catch { }
    return () => { try { window.clearInterval(t) } catch { } }
  }, [gatingComplete, displayedHeaderPct])

  useEffect(() => {
    try {
      // Smooth interpolation for visual progress
      let timer = 0
      const v = displayedHeaderPct
      const target = headerPct
      if (target > v) {
        setDisplayedHeaderPct(prev => Math.min(target, prev + 1))
        // Loop handled by next render effect if needed, but react handles dependency change
      }
      // Simple loop logic replacer
      if (displayedHeaderPct < headerPct) {
        timer = setTimeout(() => setDisplayedHeaderPct(p => Math.min(headerPct, p + 1)), 50)
      }
      return () => clearTimeout(timer)
    } catch { }
  }, [headerPct, displayedHeaderPct])

  // --- REGISTRO DO INTERCEPTOR DE SAÍDA (Ouvidinho do BackRedirect) ---
  useEffect(() => {
    console.log('[Fim] Registrando interceptor de saída...');
    window.__br_interceptor = () => {
      console.log('[Fim] Interceptor disparado. gatingComplete:', gatingComplete);

      // Se a oferta já apareceu, retorna o checkpoint pós-pitch
      if (gatingComplete) return '/fim-pos-pitch';

      // Se o modal de retenção já foi mostrado, retorna o checkpoint padrão (pro zap)
      if (hasShownWaitModal) return '/fim';

      // Senão, mostra o modal e bloqueia a saída (retornando true)
      setShowWaitModal(true);
      setHasShownWaitModal(true);
      return true;
    };

    return () => {
      console.log('[Fim] Removendo interceptor...');
      window.__br_interceptor = null;
    };
  }, [gatingComplete, hasShownWaitModal]);

  // Efeito de Rápida Progressão do Modal para gerar Alívio Psicológico
  useEffect(() => {
    let t = 0;
    if (showWaitModal) {
      // Pequeno delay para a UI renderizar o `modalProgress` inicial (ex: 20%), 
      // e depois injeta 100% forçando o css-transition esticar rapidamente a barra turquesa.
      t = window.setTimeout(() => {
        setModalProgress(100);
      }, 50);
    }
    return () => { try { clearTimeout(t) } catch { } };
  }, [showWaitModal]);

  const handleCheckoutOpen = useCallback(() => setHasOpenedCheckout(true), []);

  const handleDiscountActivated = useCallback((targetTime) => {
    if (DEBUG) {
      console.log('[RETENTION] Activating discount modal takeover', {
        targetTime,
        route: window.location.pathname
      });
    }
    setDiscountThemeActive(true);
    setDiscountTimerEnd(targetTime);
    setShowDiscountModal(true);
    sessionStorage.setItem('discount_timer_end', targetTime.toString());
  }, [DEBUG]);

  return (
    <main className={styles.page} role="main" aria-label="Finalização do plano vibracional">

      {DEBUG && (
        <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleDebugClick}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(255, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '800'
            }}
          >
            DEBUG: LIBERAR CONTEÚDO
          </button>
          <button
            onClick={() => setShowSurpriseModal(true)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '800'
            }}
          >
            DEBUG: MODAL PRESENTE
          </button>
          {!isPtRoute && (
            <button
              onClick={() => setShowDiscountModal(true)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '800'
              }}
            >
              DEBUG: MODAL DESCONTO
            </button>
          )}
        </div>
      )}

      <div ref={introRef} className={`${styles.introOverlay} ${introState === 'enter' ? styles.introEnter : introState === 'exit' ? styles.introExit : styles.hidden}`} aria-hidden={introState === 'hidden'}>
        <div className={styles.svgWrap}>
          <p className={`${styles.introTextTop} ${introState === 'enter' ? styles.introEnter : introState === 'exit' ? styles.introExit : styles.hidden}`}>{t('fim.loading_plan')}</p>
          <svg className={styles.auraSvg} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img">
            <title id="auraTitle">{t('fim.svg.title')}</title>
            <desc id="auraDesc">{t('fim.svg.desc')}</desc>
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
              <filter id="auraGlow" x="-50%" y="-50%" width="200%" height="200%" className="glowFilter">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.55  0 0 0 1 0" />
              </filter>
            </defs>
            <g className={styles.glowLayer} filter="url(#auraGlow)">
              <circle cx="100" cy="100" r="36" fill="url(#nucleusGrad)" opacity="0.45" />
            </g>
            <g className={`${styles.orbit} ${styles.orbitFast}`}>
              <ellipse cx="100" cy="100" rx="64" ry="26" fill="none" stroke="url(#orbitGrad)" strokeWidth="2.2" />
            </g>
            <g className={styles.orbit} transform="rotate(60 100 100)">
              <ellipse cx="100" cy="100" rx="64" ry="26" fill="none" stroke="url(#orbitGrad)" strokeWidth="2.2" />
            </g>
            <g className={`${styles.orbit} ${styles.orbitSlow}`} transform="rotate(120 100 100)">
              <ellipse cx="100" cy="100" rx="64" ry="26" fill="none" stroke="url(#orbitGrad)" strokeWidth="2.2" />
            </g>
            <g className={styles.nucleus}>
              <circle cx="100" cy="100" r="18" fill="url(#nucleusGrad)" />
            </g>
          </svg>
          <p className={`${styles.introTextBottom} ${introState === 'enter' ? styles.introEnter : introState === 'exit' ? styles.introExit : styles.hidden}`}>{t('fim.important_video')}</p>
        </div>
      </div>

      <header className={styles.pageHeader} aria-label="Status de geração do plano">
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageHeaderTitle}>{(gatingComplete || displayedHeaderPct >= 97) ? t('fim.status.ready') : t('fim.status.generating')}{(gatingComplete || displayedHeaderPct >= 97) ? '' : <span className={styles.dots}>{'.'.repeat(dotsCount)}</span>}</div>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar}><div className={styles.progressFill} style={{ transform: `scaleX(${displayedHeaderPct / 100})` }} /></div>
            <div className={styles.progressPercent}>{displayedHeaderPct}%</div>
          </div>
          <div className={styles.headerIconsRow}>
            {(gatingComplete || displayedHeaderPct >= 100) && (
              <button
                type="button"
                className={styles.accessPlanBtn}
                onClick={() => {
                  const el = document.getElementById('plan-receipt-anchor')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
              >
                {t('fim.cta.access_plan')}
              </button>
            )}
            {(giftThemeActive || showSurpriseModal) && (
              <div
                className={styles.giftIconHeader}
                onClick={() => setShowSurpriseModal(true)}
                title={t('fim_gift.title')}
              >
                🎁
              </div>
            )}
            {discountThemeActive && (
              <div className={styles.discountBadgeHeader}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <span style={{ color: '#ef4444', fontWeight: '900' }}>10% OFF</span>
                <span className={styles.timerValueHeader} style={{ marginLeft: '6px', borderLeft: '1px solid rgba(239,68,68,0.3)', paddingLeft: '6px', color: '#ef4444' }}>{headerTimerDisplay}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.pageHeaderSpacer} aria-hidden="true" />

        <h1 className={styles.mainHeadline}>
          {(gatingComplete || displayedHeaderPct >= 100)
            ? t('fim.headline.ready')
            : (
              <>{t('fim.headline.generating_part1')} <span className={styles.abundanceHighlight}>{t('fim.headline.generating_highlight')}</span></>
            )}
        </h1>



        {/* Epic 004: Expert engagement chat box — ABOVE the video */}
        {engagementState !== 'hidden' && (
          <div className={`${styles.expertEngagement} ${engagementState === 'entering' ? styles.engagementEnter : ''} ${engagementState === 'exiting' ? styles.engagementExit : ''}`}>
            <div className={styles.expertDialog}>
              <div className={styles.expertAvatar}>
                <img src={isPtRoute ? expertPtImg : expertImg} alt={isPtRoute ? "Especialista" : "Experte"} width="46" height="46" loading="lazy" decoding="async" />
              </div>
              <div className={styles.expertBubble}>
                <span className={styles.expertMiniHeadline}>{t('fim.expert_dialog.headline')}</span>
                <p className={styles.expertMessage}>{t('fim.expert_dialog.message')}</p>
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
              <button type="button" className={styles.expertCtaBtn} onClick={handleCtaClick}>
                <span className={styles.ctaLabel}>{t('fim.expert_dialog.cta_confirm')}</span>
                <span className={`${styles.ctaCheckbox} ${ctaChecked ? styles.ctaCheckboxChecked : ''}`} aria-hidden="true"></span>
              </button>
            </div>
          </div>
        )}

        <div
          className={`${styles.videoCard}${(engagementState === 'entering' || engagementState === 'visible') ? ` ${styles.videoRingGold}` : ringVariant === 'green' ? ` ${styles.videoRingGreen}` : ''}`}
          aria-label="Pré-visualização de vídeo"
        >
          <div className="esconder-surprise-gift" style={{ display: 'none' }} aria-hidden="true"></div>
          <vturb-smartplayer
            id={smartplayerId}
            style={{ display: 'block', margin: '0 auto', width: '100%' }}
          ></vturb-smartplayer>
        </div>

        <React.Suspense fallback={<div style={{ minHeight: '400px' }} />}>
          <FimBelowFold
            isOfferVisible={gatingComplete || displayedHeaderPct >= 100}
            displayedHeaderPct={displayedHeaderPct}
            DEBUG={DEBUG}
            giftThemeActive={giftThemeActive}
            discountThemeActive={discountThemeActive}
            showDiscountModal={showDiscountModal}
            checkoutResumeMode={checkoutResumeMode}
            onCheckoutOpen={handleCheckoutOpen}
            onCheckoutResumeHandled={() => setCheckoutResumeMode(null)}
            onDiscountActivated={handleDiscountActivated}
          />


          <CommentsSection />
        </React.Suspense>
      </div>

      {/* MODAL DE ESPERA (Retainer Tático) */}
      {showWaitModal && (
        <div className={styles.waitModalOverlay}>
          <div className={styles.waitModalBox}>

            {/* Imagem da Equipa */}
            <div className={styles.waitModalImagePlaceholder}>
              <img src={isPtRoute ? expertTeamImg : expertTeamDeImg} alt={isPtRoute ? "Equipa Quântica a rever os seus dados" : "Quanten Team überprüft Ihre Daten"} loading="lazy" decoding="async" />
            </div>

            {/* Título Clean */}
            <h2 className={styles.waitModalTitle}>
              <Trans i18nKey="fim.wait_modal.title" components={{ 1: <span /> }} />
            </h2>

            {/* Alerta Simplificado */}
            <div className={styles.waitModalAlert}>
              {(() => {
                const areaMap = t('fim.wait_modal.area_map', { returnObjects: true }) || {}
                const chaves = leadCache.getAll()?.problemaPrincipal || []
                let areas = ''
                if (chaves.length > 0) {
                  const traduzidas = chaves.map(k => areaMap[k]).filter(Boolean)
                  if (traduzidas.length === 1) areas = traduzidas[0]
                  else if (traduzidas.length > 1) {
                    const ultima = traduzidas.pop()
                    areas = `${traduzidas.join(', ')} ${t('fim.wait_modal.connector_and')} ${ultima}`
                  }
                }

                return (
                  <>
                    {t('fim.wait_modal.alert_prefix')} <strong>{t('fim.wait_modal.alert_blocks')}</strong> {t('fim.wait_modal.alert_suffix', { areas: areas || t('fim.wait_modal.alert_default_area') })}
                  </>
                )
              })()}
            </div>

            {/* Barra de progresso conectada ao Smartplayer — Layout estabilizado */}
            <div className={styles.waitModalProgressWrap}>
              <div className={styles.waitModalProgressHeader}>
                <div className={styles.waitModalProgressLabel}>
                  {(gatingComplete || displayedHeaderPct >= 97)
                    ? t('fim.status.ready')
                    : t('fim.wait_modal.progress_label')}
                  {!(gatingComplete || displayedHeaderPct >= 97) && (
                    <span className={styles.dots}>{'.'.repeat(dotsCount)}</span>
                  )}
                </div>
                <div className={styles.waitModalProgressPct}>{displayedHeaderPct}%</div>
              </div>
              <div className={styles.waitModalProgressBarContainer}>
                <div className={styles.waitModalProgressBarFill} style={{ transform: `scaleX(${displayedHeaderPct / 100})` }} />
              </div>
            </div>

            <button
              className={styles.waitModalBtn}
              onClick={() => setShowWaitModal(false)}
            >
              {t('fim.wait_modal.cta_button')}
            </button>

            <p className={styles.waitModalSubText}>
              <Trans i18nKey="fim.wait_modal.sub_text" components={{ 1: <strong /> }} />
            </p>
          </div>
        </div>
      )}

      {/* Retention Modals */}
      <SurpriseGiftModal
        open={showSurpriseModal}
        onClose={() => {
          setShowSurpriseModal(false);
          setGiftThemeActive(true);
          sessionStorage.setItem('gift_theme_active', 'true');

          // Scroll automático para a oferta
          setTimeout(() => {
            const el = document.getElementById('plan-receipt-anchor')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 300);
        }}
        onRedirectChat={() => {
          navigate(`${isPtRoute ? '/pt' : '/de'}/chat-whatsapp?from=/fim-gift`);
        }}
        leadData={leadCache.getAll()}
        isPtRoute={isPtRoute}
      />

      <DiscountModal
        open={showDiscountModal}
        onClose={() => {
          if (DEBUG) {
            console.log('[RETENTION] Discount modal closed');
          }
          setShowDiscountModal(false);
        }}
        onActivate={() => {
          const targetTime = Date.now() + (300 * 1000);
          if (DEBUG) {
            console.log('[RETENTION] Discount CTA accepted; discounted checkout can resume', {
              targetTime
            });
          }
          setDiscountThemeActive(true);
          setDiscountTimerEnd(targetTime);
          setShowDiscountModal(false);
          setCheckoutResumeMode('discount');
          sessionStorage.setItem('discount_timer_end', targetTime.toString());
          const el = document.getElementById('plan-receipt-anchor');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />

    </main>
  )
}
