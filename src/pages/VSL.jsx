import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './VSL.module.scss';
import { asset } from '@/lib/asset';
import { buildRouteStep, buildRouteStepIndex, createFunnelTracker, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, readStoredCountry, getDefaultBaseUrl, shouldSendEvent } from '../lib/funnelTracker';
import { useExitIntent } from '../hooks/useExitIntent';
import { useWakeLock } from '../hooks/useWakeLock';

const EXPERT_IMG = (() => {
  try {
    const pathname = String(window.location.pathname || '');
    const isPt = pathname.includes('/pt/') || pathname === '/pt' || pathname.endsWith('/pt');
    return isPt ? asset('/img/expert-pt.webp') : asset('/img/expert.webp');
  } catch {
    return asset('/img/expert.webp');
  }
})();

const DEBUG = import.meta.env.DEV

const VSL = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showButton, setShowButton] = useState(true);
  const [gatingComplete, setGatingComplete] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const playerContainerRef = useRef(null);
  const selectedOption = searchParams.get('option') || 'default';
  const [isMindfulnessTransitioning, setIsMindfulnessTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState('');

  useExitIntent();
  useWakeLock(true);
  const isPtRoute = (() => {
    try {
      const pathname = String(window.location.pathname || '')
      return pathname.includes('/pt/') || pathname === '/pt' || pathname.endsWith('/pt')
    } catch {
      return false
    }
  })()
  const playerConfig = isPtRoute ? {
    playerId: '69b6fb2946625199476eb4f6',
    playerSrc: 'https://scripts.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/players/69b6fb2946625199476eb4f6/v4/player.js',
    hlsSrc: 'https://cdn.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/69b6fb1afaf9397e2338b188/main.m3u8'
  } : {
    playerId: '692f6c547fbe07d9ce40cfe5',
    playerSrc: 'https://scripts.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/players/692f6c547fbe07d9ce40cfe5/v4/player.js',
    hlsSrc: 'https://cdn.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/692f6c1be5f771ce8694b5ae/main.m3u8'
  }
  const smartplayerId = `vid-${playerConfig.playerId}`

  // Headlines personalizadas para cada opção
  const headlineMap = {
    'manifest': t('vsl.headline_map.manifest'),
    'attract': t('vsl.headline_map.attract'),
    'abundance': t('vsl.headline_map.abundance'),
    'healing': t('vsl.headline_map.healing'),
    'energy': t('vsl.headline_map.energy'),
    'other': t('vsl.headline_map.other'),
    'default': t('vsl.headline_map.default')
  };

  const selectedLabelMap = {
    manifest: t('vsl.selected_label_map.manifest'),
    attract: t('vsl.selected_label_map.attract'),
    abundance: t('vsl.selected_label_map.abundance'),
    healing: t('vsl.selected_label_map.healing'),
    energy: t('vsl.selected_label_map.energy'),
    other: t('vsl.selected_label_map.other'),
    default: t('vsl.selected_label_map.default')
  };
  const selectedOptionsParam = searchParams.get('options') || '';
  const selectedOptionsArr = selectedOptionsParam ? selectedOptionsParam.split(',') : [selectedOption];
  const painHeadlineMap = {
    manifest: t('vsl.pain_headline_map.manifest'),
    attract: t('vsl.pain_headline_map.attract'),
    abundance: t('vsl.pain_headline_map.abundance'),
    healing: t('vsl.pain_headline_map.healing'),
    energy: t('vsl.pain_headline_map.energy'),
    other: t('vsl.pain_headline_map.other'),
    default: t('vsl.pain_headline_map.default')
  };
  function composePainsHeadline(options) {
    const phrases = options
      .filter(Boolean)
      .slice(0, 2)
      .map((opt) => painHeadlineMap[opt] || painHeadlineMap.default)
      .map((p) => p.replace(/[.…]+$/g, ''))

    // Translation note: This logic is specific to the structure "PREFIX that SUFFIX"
    // For German or other languages, this might need adjustment.
    // We try to match "que" (PT) or "die" (DE) or generic separator.
    const PREFIX = t('vsl.pain_headline_prefix');
    const suffixes = []

    // Regex to find the part after the connector (que/die/etc)
    // Matches "que " or "die " followed by content
    const connectorRegex = new RegExp(`(?:${t('vsl.pain_headline_connector')}|que|die)\\s+(.+)`, 'i');

    for (const phrase of phrases) {
      const m = phrase.match(connectorRegex)
      if (m && m[1]) {
        suffixes.push(m[1])
        continue
      }
      // Fallback: try to remove prefix
      const cleaned = phrase.replace(new RegExp(`^${PREFIX}\\s*`, 'i'), '').trim()
      if (cleaned) suffixes.push(cleaned)
    }
    const unique = []
    for (const s of suffixes) {
      const key = s.toLowerCase()
      if (!unique.some((u) => u.toLowerCase() === key)) unique.push(s)
    }
    if (unique.length === 0) return painHeadlineMap.default
    if (unique.length === 1) return `${PREFIX} ${t('vsl.pain_headline_connector')} ${unique[0]}`
    return `${PREFIX} ${t('vsl.pain_headline_connector')} ${unique.join(' e ')}`
  }

  const painsHeadline = composePainsHeadline(selectedOptionsArr)

  function getResolutionStep(option) {
    const map = {
      manifest: t('vsl.resolution_step.manifest'),
      abundance: t('vsl.resolution_step.abundance'),
      attract: t('vsl.resolution_step.attract'),
      healing: t('vsl.resolution_step.healing'),
      energy: t('vsl.resolution_step.energy'),
      other: t('vsl.resolution_step.other'),
      default: t('vsl.resolution_step.default')
    }
    return map[option] || map.default
  }

  const resolutionStep = getResolutionStep(selectedOption)
  const currentHeadline = t('vsl.current_headline');
  const CTA_SECONDS_THRESHOLD = 185 // 3:05 exatos assistidos

  // Timer de tempo real removido para evitar aparição prematura se o vídeo for pausado.
  // A exibição agora é controlada estritamente pelo tempo do Smartplayer (Vturb).

  // === INÍCIO LOGICA MODAL DE RETENÇÃO ===
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitModalDismissed, setExitModalDismissed] = useState(false);
  const [modalState, setModalState] = useState('warning'); // warning | success
  const [showNotification, setShowNotification] = useState(false);

  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [virtualElapsedTime, setVirtualElapsedTime] = useState(0);

  useEffect(() => {
    let lastTick = Date.now();
    let lastVidTime = 0;

    const t = setInterval(() => {
      const currTick = Date.now();
      const delta = currTick - lastTick;
      lastTick = currTick;

      let isLocalPaused = false;
      try {
        const smart = document.getElementById(smartplayerId) || document.querySelector('vturb-smartplayer');
        if (smart) {
          const vid = smart.querySelector('video') || smart.shadowRoot?.querySelector('video');
          if (vid) {
            isLocalPaused = vid.paused && vid.currentTime > 0;
            setIsVideoPaused(isLocalPaused);

            // Resync once a second or if drifted too much
            if (Math.abs(lastVidTime - vid.currentTime) > 0.05) {
              lastVidTime = vid.currentTime;
              setVirtualElapsedTime(vid.currentTime * 1000);
            } else if (!isLocalPaused) {
              // Estimate
              setVirtualElapsedTime(prev => prev + delta);
            }
          }
        }
      } catch (e) { }
    }, 50);

    return () => clearInterval(t);
  }, [smartplayerId]);

  useEffect(() => {
    window.__br_interceptor = () => {
      if (!exitModalDismissed && !showExitModal) {
        setShowExitModal(true);
        return true; // 1a tentativa: mostrar modal
      }
      return '/vsl-abandon'; // 2a tentativa: redirecionar para WhatsApp
    };
    return () => {
      window.__br_interceptor = null;
    };
  }, [showExitModal, exitModalDismissed]);

  const videoDurationMs = 256000;
  const remainingTime = Math.max(0, videoDurationMs - virtualElapsedTime);
  const mins = Math.floor(remainingTime / 60000).toString().padStart(2, '0');
  const secs = Math.floor((remainingTime % 60000) / 1000).toString().padStart(2, '0');
  const ms = Math.floor((remainingTime % 1000) / 10).toString().padStart(2, '0');
  const formatTime = `${mins}:${secs}:${ms}`;
  // === FIM LOGICA MODAL DE RETENÇÃO ===
  useEffect(() => {
    const tracker = createFunnelTracker({
      baseUrl: getDefaultBaseUrl(),
      funnelId: QUIZ_FUNNEL_ID,
      getCountry: () => readStoredCountry() || undefined,
      debug: DEBUG
    });

    const from_step = buildRouteStepIndex('/transition', QUIZ_PROGRESS_STEPS.transition);
    const to_step = buildRouteStepIndex('/vsl', QUIZ_PROGRESS_STEPS.vsl);
    const step = buildRouteStep('/vsl', QUIZ_PROGRESS_STEPS.vsl, 'VSL');

    if (shouldSendEvent('step_progress:/transition->/vsl')) {
      tracker.stepProgress(from_step, to_step).catch((err) => {
        console.error('[VSL] Erro ao enviar step_progress:', err);
      });
    }

    if (shouldSendEvent('step_view:/vsl')) {
      tracker.stepView(step).catch((err) => {
        console.error('[VSL] Erro ao enviar step_view:', err);
      });
    }

    // Pre-warming "Under the Hood": Carregar audioManager silenciosamente após o load da página
    const w = window
    const warmAudio = () => {
      import('../lib/audioManager').catch(() => {})
    }
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(warmAudio, { timeout: 3000 })
    } else {
      setTimeout(warmAudio, 2000)
    }
  }, []);

  // Otimização de carregamento de scripts do vídeo
  useEffect(() => {
    let unmounted = false;
    const playerEl = playerContainerRef.current;

    const initVTurb = () => {
      if (unmounted) return;
      if (playerEl) {
        playerEl.innerHTML = `<vturb-smartplayer id="${smartplayerId}" style="display: block; margin: 0 auto; width: 100%; max-width: 400px;"></vturb-smartplayer>`;
      }

      const ensureLink = (rel, href, attrs = {}) => {
        if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return
        const l = document.createElement('link')
        l.rel = rel
        l.href = href
        Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, String(v)))
        document.head.appendChild(l)
      }
      const ensureScript = (id, textContent) => {
        if (document.getElementById(id)) return
        const s = document.createElement('script')
        s.id = id
        s.textContent = textContent
        document.head.appendChild(s)
      }

      try {
        if (isPtRoute) {
          ensureScript('vturb-plt-script', '!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);')
          ensureLink('preload', playerConfig.playerSrc, { as: 'script' })
          ensureLink('preload', 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js', { as: 'script' })
          ensureLink('preload', playerConfig.hlsSrc, { as: 'fetch', crossorigin: 'anonymous' })
          ensureLink('dns-prefetch', 'https://cdn.converteai.net')
          ensureLink('dns-prefetch', 'https://scripts.converteai.net')
          ensureLink('dns-prefetch', 'https://images.converteai.net')
          ensureLink('dns-prefetch', 'https://api.vturb.com.br')
        } else {
          ensureLink('preconnect', 'https://scripts.converteai.net')
          ensureLink('preconnect', 'https://cdn.converteai.net')
          ensureLink('dns-prefetch', 'https://images.converteai.net')
          ensureLink('dns-prefetch', 'https://api.vturb.com.br')
          ensureLink('preload', playerConfig.playerSrc, { as: 'script' })
          ensureLink('preload', 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js', { as: 'script' })
        }
      } catch (e) {
        console.warn('[VSL] Erro ao configurar preloads lazily:', e)
      }

      const preloadStream = () => {
        try {
          ensureLink('preload', playerConfig.hlsSrc, { as: 'fetch', crossorigin: 'anonymous' })
        } catch { }
      }

      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(preloadStream, { timeout: 2000 })
      } else {
        setTimeout(preloadStream, 1500)
      }

      const scriptId = `vturb-player-script-${playerConfig.playerId}`
      const src = playerConfig.playerSrc
      const libId = 'vturb-smartplayer-js'
      const libSrc = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js'

      const loadScript = (id, url) => new Promise((resolve, reject) => {
        if (document.getElementById(id)) return resolve('exists')
        const s = document.createElement('script')
        s.id = id
        s.src = url
        s.async = true
        s.onload = () => resolve()
        s.onerror = (e) => reject(e)
        document.head.appendChild(s)
      })

      loadScript(libId, libSrc)
        .then(() => {
          const existing = document.getElementById(scriptId)
          if (existing) existing.remove()
          return loadScript(scriptId, src)
        })
        .then(() => {
          if (DEBUG) console.log('[VSL] Scripts carregados com sucesso')
          const elem = document.getElementById(smartplayerId)
          if (elem && typeof elem.start === 'function') {
            try { elem.start() } catch { }
          }
        })
        .catch((e) => {
          console.error('[VSL] Erro carregando scripts lazily:', e)
          setPlayerError(true)
        })

      setTimeout(() => {
        const smart = document.getElementById(smartplayerId)
        if (smart && !(smart.querySelector('video') || smart.shadowRoot?.querySelector('video'))) {
          console.warn('[VSL] Fallback: Player não detectado após 5s lazily')
        }
      }, 5000)
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          initVTurb();
          observer.disconnect();
        }
      }, { rootMargin: '400px 0px' });
      if (playerEl) observer.observe(playerEl);
    } else {
      setTimeout(initVTurb, 1000);
    }

    return () => {
      unmounted = true;
      try {
        const scriptId = `vturb-player-script-${playerConfig.playerId}`;
        ['vturb-smartplayer-js', scriptId, 'vturb-plt-script'].forEach(id => {
          const script = document.getElementById(id);
          if (script) script.remove();
        });
        document.querySelectorAll('vturb-smartplayer').forEach(el => el.remove());
        document.querySelectorAll('script[src*="converteai.net"]').forEach(el => el.remove());
      } catch (e) { }
    }
  }, []);

  // Re-parent vturb-smartplayer if Vturb teleports it to <body>
  useEffect(() => {
    let done = false
    const observer = new MutationObserver(() => {
      if (done) return
      const player = document.querySelector('body > vturb-smartplayer')
      const container = document.querySelector(`.${styles.videoContainer}`)
      if (player && container) {
        done = true
        container.appendChild(player)
        observer.disconnect()
      }
    })
    observer.observe(document.body, { childList: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const cleanup = []
    const DELAY_SECONDS = 200 // 3:20 assistidos
    const shownRef = { current: false }
    const attach = () => {
      const smart = document.getElementById(smartplayerId) || document.querySelector('vturb-smartplayer')
      if (!smart) return false
      const ensureHidden = () => {
        try {
          if (shownRef.current) return
          const els = document.querySelectorAll('.esconder')
          els.forEach((el) => {
            const cs = window.getComputedStyle(el)
            if (cs && cs.display !== 'none') el.style.display = 'none'
          })
        } catch { }
      }
      const onReady = () => {
        try {
          ensureHidden()
          smart.displayHiddenElements(DELAY_SECONDS, ['.esconder'])
          if (DEBUG) console.log('[VSL] Vturb displayHiddenElements configurado para:', DELAY_SECONDS)
        } catch { }
      }

      smart.addEventListener('player:ready', onReady)

      cleanup.push(() => {
        smart.removeEventListener('player:ready', onReady)
        smart.removeEventListener('timeupdate', onTimeUpdate)
        window.removeEventListener('message', onMessage)
      })

      // 3. Varredura de Segurança (Scanner Visual a cada 500ms) - Método Fim.jsx
      const checkInterval = window.setInterval(() => {
        if (shownRef.current) return
        try {
          const targets = document.querySelectorAll('.esconder')
          for (let i = 0; i < targets.length; i++) {
            const cs = window.getComputedStyle(targets[i])
            if (cs && cs.display !== 'none' && cs.opacity !== '0' && cs.visibility !== 'hidden') {
              shownRef.current = true
              setShowButton(true)
              if (DEBUG) console.log('[VSL] Botão detectado via Scanner Visual')
              break
            }
          }
        } catch { }
      }, 500)
      cleanup.push(() => window.clearInterval(checkInterval))

      // 4. MutationObserver (Monitor de Atributos)
      const el = document.querySelector('.esconder')
      if (el) {
        const mo = new MutationObserver(() => {
          const target = document.querySelector('.esconder') || el
          const cs2 = target ? window.getComputedStyle(target) : null
          if (!shownRef.current && cs2 && cs2.display !== 'none' && cs2.opacity !== '0' && cs2.visibility !== 'hidden') {
            shownRef.current = true
            setShowButton(true) 
          }
        })
        mo.observe(el, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] })
        cleanup.push(() => mo.disconnect())
      }

      ensureHidden()
      const hideInterval = window.setInterval(() => ensureHidden(), 700)
      cleanup.push(() => window.clearInterval(hideInterval))

      return true
    }
    let ok = attach()
    if (!ok) {
      const poll = setInterval(() => { if (attach()) clearInterval(poll) }, 500)
      cleanup.push(() => clearInterval(poll))
    }
    if (gatingComplete) {
      shownRef.current = true
      setShowButton(true)
    }
    return () => { cleanup.forEach(fn => { try { fn() } catch { } }) }
  }, [gatingComplete, smartplayerId, DEBUG])




  const [showClickIndicator, setShowClickIndicator] = useState(false);

  useEffect(() => {
    if (showButton) {
      const timer = setTimeout(() => {
        setShowClickIndicator(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showButton]);

  const handleDebugClick = () => {
    if (DEBUG) {
      console.log('[VSL] Debug button clicked, forcing gating complete.')
      setGatingComplete(true)
    }
  }

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    setShowClickIndicator(false); // Esconde ao clicar
    if (DEBUG) console.log('[VSL] Botão continuar clicado, iniciando transição Mindfulness...');

    // Mostra overlay bloqueando interações indesejadas e dando o clima
    setIsMindfulnessTransitioning(true);

    // Tenta puxar o AudioManager globalmente se houver (o browser agora permite pq foi um clique de user)
    import('../lib/audioManager').then(({ startMindfulAudio }) => {
      startMindfulAudio();
    }).catch(() => {});

    // Offloading de persistência para não travar a animação/transição
    const w = window;
    const persist = () => {
      try {
        // Puxar leadCache se disponível ou outras lógicas de persistência
      } catch (e) {}
    };
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(persist, { timeout: 1000 });
    } else {
      setTimeout(persist, 0);
    }

    // Lazy load garantido no background
    try { import('./CompontTest1').catch(() => {}); } catch {}

    // Sequence of phrases for guided transition - Rhythm 50-65+
    const mindfulnessPhrases = [
      t('vsl.mindfulness.phrase1'),
      t('vsl.mindfulness.phrase2'),
      t('vsl.mindfulness.phrase3'),
      t('vsl.mindfulness.phrase4'),
      t('vsl.mindfulness.phrase5'),
      t('vsl.mindfulness.phrase6'),
      t('vsl.mindfulness.phrase7'),
      t('vsl.mindfulness.phrase8')
    ];

    let currentIdx = 0;
    
    const showNextPhrase = () => {
      if (currentIdx < mindfulnessPhrases.length) {
        setTransitionText(mindfulnessPhrases[currentIdx]);
        currentIdx++;
        // 2.7s per phrase - Rítmico para respiração guiada (ajustado para público 50-65+)
        setTimeout(showNextPhrase, 2700); 
      } else {
        // End of transition
        const currentParams = new URLSearchParams(searchParams);
        const queryString = currentParams.toString();
        navigate(`/compont-test-1${queryString ? `?${queryString}` : ''}`);
      }
    };

    // Start sequence
    showNextPhrase();
  };

  const [headerOffset, setHeaderOffset] = useState(0)

  useEffect(() => {
    try {
      const el = document.querySelector('[data-app-header="header"]')
      const rect = el && el.getBoundingClientRect()
      const h = rect ? rect.height : 0
      let offset = h + 24
      if (window.innerWidth <= 480) offset = h + 36
      else if (window.innerWidth <= 768) offset = h + 30
      setHeaderOffset(offset)
      if (DEBUG) console.log('[VSL] Header medido', { height: h, offset, innerWidth: window.innerWidth })
    } catch (e) {
      console.error('[VSL] Falha ao medir header', e)
    }
    const onResize = () => {
      try {
        const el = document.querySelector('[data-app-header="header"]')
        const rect = el && el.getBoundingClientRect()
        const h = rect ? rect.height : 0
        let offset = h + 24
        if (window.innerWidth <= 480) offset = h + 36
        else if (window.innerWidth <= 768) offset = h + 30
        setHeaderOffset(offset)
        if (DEBUG) console.log('[VSL] Header medido (resize)', { height: h, offset, innerWidth: window.innerWidth })
      } catch { }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className={styles.vslContainer}>
      {DEBUG && (
        <button
          onClick={handleDebugClick}
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
      <div className={styles.background}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.backButton} onClick={handleBackClick}>
                <ArrowLeft className={styles.backIcon} />
              </div>
              <div className={styles.logoContainer}>
                <img
                  src={asset('/.figma/image/mg2if5h6-xtt8jhz.svg')}
                  className={styles.spirioLogo}
                  alt="Spirio"
                />
                <div className={styles.verticalDivider} />
                <img
                  src={asset('/.figma/image/mg2if5h6-n93vrl1.svg')}
                  className={styles.quizLogo}
                  alt="Quiz"
                />
              </div>
            </div>
            <p className={styles.progressText}>VSL</p>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} />
          </div>
        </div>

        <div className={styles.content} style={{ paddingTop: headerOffset || undefined }}>
          <div className={styles.headlineContainer}>
            <h1 className={styles.headline}>
              <span className={styles.upperBoldBlack}>{t('vsl.current_headline')}</span>
              <span className={styles.headlineAccent}> {painsHeadline}</span>
            </h1>
            <p className={styles.impactText}>
              <span className={styles.impactBox}>
                <Trans i18nKey="vsl.impact_text">
                  Assista e veja a <span className={styles.upper}>CHAVE ESCONDIDA</span> que <strong>REPROGRAMA</strong> sua mente
                  para <strong>vibrar alto</strong> em poucos dias.
                </Trans>
              </span>
            </p>
          </div>



          <div className={styles.videoContainer}>
            {playerError ? (
              <div className={styles.videoError}>
                <p>{t('vsl.video_error', 'O vídeo não pôde ser carregado. Por favor, recarregue a página.')}</p>
                <button onClick={() => window.location.reload()} className={styles.retryButton}>
                  {t('vsl.retry', 'Recarregar')}
                </button>
              </div>
            ) : (
              <div ref={playerContainerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
            )}
          </div>

          <div className="esconder" style={!gatingComplete ? { display: 'none' } : undefined}>
            <div className={styles.fixedButtonContainer}>
              <div className={styles.buttonWrapper}>
                {showClickIndicator && (
                  <motion.div
                    initial={{ opacity: 0, x: 150 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0],
                      x: [150, 0, 0, 0],
                      scale: [1, 1, 0.8, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      times: [0, 0.4, 0.6, 0.8, 1]
                    }}
                    className={styles.clickIndicator}
                  >
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 256 256" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className={styles.handIcon}
                    >
                      <path 
                        d="M200 112V160C200 204.183 164.183 240 120 240C75.8172 240 40 204.183 40 160V112C40 101.5 48.5 93 59 93C69.5 93 78 101.5 78 112V136" 
                        stroke="white" 
                        strokeWidth="16" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M78 112V56C78 45.5 86.5 37 97 37C107.5 37 116 45.5 116 56V112" 
                        stroke="white" 
                        strokeWidth="16" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M116 112V96C116 85.5 124.5 77 135 77C145.5 77 154 85.5 154 96V112" 
                        stroke="white" 
                        strokeWidth="16" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M154 112V104C154 93.5 162.5 85 173 85C183.5 85 192 93.5 192 104V112" 
                        stroke="white" 
                        strokeWidth="16" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}
                <motion.button 
                  className={styles.continueButton} 
                  onClick={handleContinue}
                  animate={showClickIndicator ? {
                    scale: [1, 1, 1.05, 1, 1], // Sincronizado com o clique
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.4, 0.6, 0.8, 1]
                  }}
                >
                  <span className={styles.buttonText}>{t('vsl.button_discover')}</span>
                </motion.button>
                <div className={styles.stepsContainer}>
                  <div className={styles.stepHeader}>{t('vsl.steps.header')}</div>
                  <div className={styles.stepItem}>
                    <div className={styles.iconBox}>1</div>
                    <div className={styles.stepText}>
                      <Trans i18nKey="vsl.steps.step1">
                        Descobrir seus <strong>Bloqueios</strong>
                      </Trans>
                    </div>
                  </div>
                  <div className={styles.stepItem}>
                    <div className={styles.iconBox}>2</div>
                    <div className={styles.stepText}>
                      <Trans i18nKey="vsl.steps.step2">
                        Medir sua <strong>Frequência Hz</strong>
                      </Trans>
                    </div>
                  </div>
                  <div className={`${styles.stepItem} ${styles.final}`}>
                    <div className={styles.iconBox}>3</div>
                    <div className={styles.stepText}>
                      <Trans i18nKey="vsl.steps.step3">
                        Gerar plano que <strong>Elevará sua Vibração</strong>
                      </Trans>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
        </div>

        {/* MODAL DE RETENÇÃO E NOTIFICAÇÃO (UI) */}
        {exitModalDismissed && showNotification && (
          <div className={styles.notificationBubble} onClick={() => {
            setShowNotification(false);
            const rect = document.querySelector('.esconder')?.getBoundingClientRect();
            if (rect && rect.top > 0) {
              window.scrollTo({ top: window.scrollY + rect.top - 100, behavior: 'smooth' });
            }
          }}>
            <div className={styles.balloonMessage}>
              {t('vsl.preparing_exam')}
            </div>
            <img src={EXPERT_IMG} className={styles.floatingExpertImg} alt="Johann Müller" />
          </div>
        )}

        {showExitModal && !exitModalDismissed && (
          <div className={styles.exitModalOverlay}>
            <div className={styles.exitModal} onClick={(e) => e.stopPropagation()}>
              {modalState === 'warning' ? (
                <>
                  <div className={styles.expertContainer}>
                    <img src={EXPERT_IMG} alt="Johann Müller" className={styles.expertImage} style={isVideoPaused ? { borderColor: '#ff3c3c', boxShadow: '0 0 15px rgba(255,0,0,0.4)', animation: 'pulseEmoji 2s infinite' } : {}} />
                    <div className={styles.expertInfo}>
                      {isVideoPaused ? (
                        <>
                          <div className={styles.expertName} style={{ color: '#ff3c3c' }}>{t('vsl.exit_modal.important_warning')}</div>
                          <div className={styles.expertStatus} style={{ color: '#ffaa00' }}>
                            <span style={{ backgroundColor: '#ffaa00', width: 8, height: 8, borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #ffaa00', marginRight: '6px' }}></span>
                            {t('vsl.exit_modal.unpause_video')}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.expertName}>{t('vsl.exit_modal.expert_name')}</div>
                          <div className={styles.expertStatus}>{t('vsl.exit_modal.exam_in_progress')}</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.exitModalHeader}>
                    <div className={styles.timerTitle} style={isVideoPaused ? { color: '#ffaa00' } : {}}>
                      {isVideoPaused ? t('vsl.exit_modal.video_paused_msg') : t('vsl.exit_modal.preparing_questions')}
                    </div>
                  </div>

                  <div className={styles.modalContent}>
                    <div className={styles.modalIntro}>{t('vsl.exit_modal.intro')}</div>
                    <ul className={styles.bulletList}>
                      <li className={styles.bulletItem}>
                        <span className={styles.bulletIcon}>✓</span>
                        <span><Trans i18nKey="vsl.exit_modal.bullet1" components={{ strong: <strong /> }} /></span>
                      </li>
                      <li className={styles.bulletItem}>
                        <span className={styles.bulletIcon}>✓</span>
                        <span><Trans i18nKey="vsl.exit_modal.bullet2" components={{ strong: <strong /> }} /></span>
                      </li>
                      <li className={styles.bulletItem}>
                        <span className={styles.bulletIcon}>✓</span>
                        <span><Trans i18nKey="vsl.exit_modal.bullet3" components={{ strong: <strong /> }} /></span>
                      </li>
                    </ul>
                  </div>

                  <button
                    className={styles.ctaButton}
                    onClick={() => {
                      setModalState('success');
                      setTimeout(() => {
                        setShowExitModal(false);
                        setExitModalDismissed(true);
                      }, 1800);
                    }}>
                    {t('vsl.exit_modal.cta_button')}
                  </button>
                </>
              ) : (
                <div className={styles.successStateContainer}>
                  <svg className={styles.successIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
                    <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                  <h2 className={styles.successTitle}>{t('vsl.exit_modal.success_title')}</h2>
                  <p className={styles.successText}>{t('vsl.exit_modal.success_text')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {isMindfulnessTransitioning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className={styles.mindfulnessOverlay}
            >
               {/* Círculo de Respiração Quântica (Luxury Clinical) */}
               <motion.div
                 className={styles.quantumCircle}
                 animate={{ 
                   scale: [1, 1.2, 1], 
                   opacity: [0.3, 0.6, 0.3],
                   boxShadow: [
                     '0 0 40px rgba(242, 201, 76, 0.1)',
                     '0 0 100px rgba(242, 201, 76, 0.3)',
                     '0 0 40px rgba(242, 201, 76, 0.1)'
                   ]
                 }}
                 transition={{ 
                   duration: 5, // Ritmo de respiração lenta para 50-65+ anos
                   repeat: Infinity, 
                   ease: "easeInOut" 
                 }}
               />

               <motion.p 
                  key={transitionText}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 1.02 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className={styles.mindfulText}
                  style={{ position: 'relative', zIndex: 1 }}
                  dangerouslySetInnerHTML={{ __html: transitionText }}
               />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VSL;
