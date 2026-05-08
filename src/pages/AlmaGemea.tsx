/**
 * ═══════════════════════════════════════════════════════════
 * 🔮 AlmaGemea — Página /alma-gemea  |  /de/alma-gemea
 * ═══════════════════════════════════════════════════════════
 *
 * FLUXO DA PÁGINA (OTIMIZADO):
 *   1. Usuário chega → Inicia IMEDIATAMENTE a transição cinematográfica.
 *   2. Enquanto as frases passam, o AliceChat é carregado em background.
 *   3. Isso serve como um "loading elegante" para aparelhos mais fracos.
 *   4. Após a transição, o chat Alice abre em fullscreen com todos os assets prontos.
 */

import React, { useState, useEffect, useCallback, lazy, Suspense, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { asset } from '@/lib/asset';
import { leadCache } from '@/lib/leadCache';

// ── Lazy load do chat (não carrega no bundle inicial) ──
const AliceChat = lazy(() => import('@/components/AliceChat/AliceChat'));

const DEBUG = import.meta.env.DEV;
const TIMINGS = [5500, 5000, 4500];
const PRESALE_TAROT_FUNNEL_VARIANT = 'presell_tarot';

const AlmaGemea: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'pt';

  // ── IDs Únicos para SVG (Prevenção de conflitos) ──
  const svgId = useId();
  const purpleGradientId = `${svgId}-purpleGradient`;
  const glowId = `${svgId}-glow`;
  const goldGlowId = `${svgId}-goldGlow`;
  const mysticGradientId = `${svgId}-mysticGradient`;

  // ── Estados do fluxo ──
  const [hasStarted, setHasStarted] = useState(false); // NOVO: Controla o Interaction Gate
  const [chatReady, setChatReady] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [transitionText, setTransitionText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    leadCache.setFunnelVariant(PRESALE_TAROT_FUNNEL_VARIANT);
  }, []);

  // ── Sequência de transição cinematográfica ──
  const startTransition = useCallback(() => {
    const phrases = [
      t('alma_gemea.transition.phrase1', 'O Tarot tem mais de 600 anos de registos documentados. O que vais ver não é ficção.'),
      t('alma_gemea.transition.phrase2', 'Cada carta revelada aqui foi sentida de forma real por quem passou pelo mesmo que tu.'),
      t('alma_gemea.transition.phrase3', 'A tua leitura começa. O que as cartas encontrarem em ti — não é coincidência.'),
    ];

    let idx = 0;
    setShowTransition(true);

    const showNextPhrase = () => {
      if (idx < phrases.length) {
        setTransitionText(phrases[idx]);
        setCurrentPhraseIndex(idx);
        const delay = TIMINGS[idx];
        idx++;
        setTimeout(showNextPhrase, delay);
      } else {
        setTransitionText('');
        setTimeout(() => {
          setShowTransition(false);
          setShowChat(true);
          if (DEBUG) console.log('[AlmaGemea] Chat aberto após transição de carregamento');
        }, 800);
      }
    };

    showNextPhrase();
  }, [t]);

  // ── Screen Wake Lock (Manter tela ligada) ──
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        if (DEBUG) console.log('[WakeLock] Tela travada acesa ✨');

        wakeLockRef.current.addEventListener('release', () => {
          if (DEBUG) console.log('[WakeLock] Lock liberado');
          wakeLockRef.current = null;
        });
      } catch (err: any) {
        console.error(`[WakeLock] Erro: ${err.name}, ${err.message}`);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);

  // ── Handlers de Interação ──
  const handleStartExperience = useCallback(() => {
    // 1. Ganha o Token de Interação do Navegador
    setHasStarted(true);

    // Destrava música de fundo
    const bgAudio = document.getElementById('bg-music-audio') as HTMLAudioElement;
    if (bgAudio) {
      bgAudio.volume = 0;
      bgAudio.play().then(() => {
        bgAudio.pause();
        bgAudio.volume = 0.25;
      }).catch(e => console.log('Audio bg unlock falhou:', e));
    }

    // Destrava áudio de voz (Alice)
    const voiceAudio = document.getElementById('voice-audio') as HTMLAudioElement;
    if (voiceAudio) {
      voiceAudio.volume = 0;
      voiceAudio.play().then(() => {
        voiceAudio.pause();
        voiceAudio.volume = 1; // Restaura o volume pro chat usar
      }).catch(e => console.log('Audio voice unlock falhou:', e));
    }

    // 3. Inicia a transição
    requestWakeLock();
    startTransition();
  }, [startTransition, requestWakeLock]);

  // ── Lifecycle ──
  useEffect(() => {
    // Preload de áudios críticos
    const criticalAudios = [
      asset('/Audio/musica-fundo.mp3'),
      asset('/Audio/alice/etapa_1.mp3'),
    ];
    criticalAudios.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'audio';
      link.href = src;
      document.head.appendChild(link);
    });

    // Bloquear scroll global
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    const preloadTimer = setTimeout(() => {
      setChatReady(true);
    }, 100);

    // Recupera o vídeo de tela preta ao voltar de inatividade (background/sleep)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Re-solicita Wake Lock se estivermos na experiência
        if (hasStarted) {
          requestWakeLock();
        }
      } else {
        // Libera o lock se sair da aba (economiza bateria)
        releaseWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(preloadTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
      // Restaurar scroll
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [startTransition, hasStarted]); // hasStarted agora é dependência para o Wake Lock

  // ── Fechar chat (volta para a página normal) ──
  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    if (DEBUG) console.log('[AlmaGemea] Chat fechado');
  }, []);

  return (
    <div style={styles.body}>
      {/* ═══ ASSETS FANTASMAS PARA DESTRAVAMENTO (iOS Hack) ═══ */}
      <audio id="bg-music-audio" src={asset('/Audio/musica-fundo.mp3')} preload="auto" />
      <audio id="voice-audio" src={asset('/Audio/alice/etapa_1.mp3')} preload="auto" />

      {/* Usando o arquivo .gif via background-image (costuma ter um motor de loop mais suave no Webkit/Blink do que a tag <img>) */}
      <div
        id="main-bg-video"
        style={{
          ...styles.globalVideoBg,
          opacity: 1,
          backgroundImage: `url(${asset("/videos/backgroud-gif.gif")})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* ═══ PORTÃO DE INTERAÇÃO (Interaction Gate) ═══ */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            style={styles.gateOverlay}
          >
            <style>{`
              @keyframes blinkBadge {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 1; }
              }
              .gate-badge-blink {
                animation: blinkBadge 2.5s ease-in-out infinite;
              }
            `}</style>
            <div style={styles.gateContent}>
              <div style={styles.gateBadge} className="gate-badge-blink">
                {t('alma_gemea.gate.badge')}
              </div>
              <h1
                style={{
                  ...styles.gateTitle,
                  ...(lang === 'de' ? { fontSize: 'clamp(14px, 4.2vw, 22px)' } : {})
                }}
              >
                {t('alma_gemea.gate.title')}
              </h1>

              <button
                onClick={handleStartExperience}
                style={styles.gateButton}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(155, 89, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(155, 89, 255, 0.15)';
                }}
              >
                <svg
                  width="21.6"
                  height="26.4"
                  viewBox="0 0 400 500"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id={goldGlowId} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id={mysticGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#2d1454', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#0f051a', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <g transform="rotate(-8 200 250)">
                    <rect x="85" y="55" width="230" height="390" rx="15" fill="rgba(0,0,0,0.6)" />
                    <rect x="80" y="50" width="230" height="390" rx="15" fill={`url(#${mysticGradientId})`} stroke="#d4af37" strokeWidth="3" />
                    <rect x="92" y="62" width="206" height="366" rx="10" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.4" />
                    <rect x="98" y="68" width="194" height="354" rx="8" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.6" />
                    <g stroke="#d4af37" fill="none" strokeWidth="1.5" opacity="0.8">
                      <path d="M110 90 L110 75 L125 75" />
                      <path d="M275 75 L290 75 L290 90" />
                      <path d="M110 410 L110 425 L125 425" />
                      <path d="M275 425 L290 425 L290 410" />
                    </g>
                    <g transform="translate(200, 245)" filter={`url(#${goldGlowId})`}>
                      <circle cx="0" cy="0" r="60" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.3" />
                      <g stroke="#d4af37" strokeWidth="1.2" fill="none">
                        <circle cx="0" cy="0" r="45" opacity="0.8" />
                        <circle cx="0" cy="-20" r="25" opacity="0.5" />
                        <circle cx="0" cy="20" r="25" opacity="0.5" />
                        <circle cx="-18" cy="0" r="25" opacity="0.5" />
                        <circle cx="18" cy="0" r="25" opacity="0.5" />
                      </g>
                      <path d="M0 -35 L8 -8 L35 0 L8 8 L0 35 L-8 8 L-35 0 L-8 -8 Z" fill="#d4af37" />
                      <circle cx="0" cy="0" r="4" fill="#2d1454" />
                    </g>
                    <g fill="#d4af37" opacity="0.6">
                      <circle cx="130" cy="110" r="1.5" />
                      <circle cx="270" cy="110" r="1.5" />
                      <circle cx="130" cy="380" r="1.5" />
                      <circle cx="270" cy="380" r="1.5" />
                      <circle cx="200" cy="100" r="2" />
                      <circle cx="200" cy="390" r="2" />
                      <rect x="197" y="140" width="6" height="6" transform="rotate(45 200 143)" />
                      <rect x="197" y="340" width="6" height="6" transform="rotate(45 200 343)" />
                    </g>
                    <ellipse cx="200" cy="55" rx="50" ry="5" fill="#d4af37" opacity="0.15" filter={`url(#${goldGlowId})`} />
                    <ellipse cx="200" cy="435" rx="50" ry="5" fill="#d4af37" opacity="0.15" filter={`url(#${goldGlowId})`} />
                  </g>
                </svg>
                <span>{t('alma_gemea.gate.button')}</span>
              </button>
            </div>

            {/* ═══ TEXTO DE LEITURA (FUNDO) ═══ */}
            <div style={styles.gateMiniCard}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={purpleGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#4C1D95" />
                  </linearGradient>
                  <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <g filter={`url(#${glowId})`}>
                  <path d="M6 17L12 23L24 11"
                    stroke={`url(#${purpleGradientId})`}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
                  <path d="M24 11L25.5 6L27 11L32 12.5L27 14L25.5 19L24 14L19 12.5L24 11Z"
                    fill={`url(#${purpleGradientId})`} />
                </g>
              </svg>
              <span style={styles.gateMiniCardText}>{t('alma_gemea.gate.reading_time')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TRANSIÇÃO CINEMATOGRÁFICA (Serve como Loading Screen) ═══ */}
      <AnimatePresence>
        {showTransition && (
          <motion.div
            style={styles.transitionOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <style>{`
              @keyframes fadePhrase {
                0%   { opacity: 0; transform: scale(0.95); }
                15%  { opacity: 1; transform: scale(1.0); }
                80%  { opacity: 1; transform: scale(1.02); }
                100% { opacity: 0; transform: scale(1.05); }
              }
              .transition-text strong {
                color: #D4AF37;
                font-weight: 500;
                text-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
              }
            `}</style>
            {transitionText && (
              <p
                key={transitionText}
                className="transition-text"
                style={{
                  ...styles.transitionText,
                  animation: `fadePhrase ${TIMINGS[currentPhraseIndex] / 1000}s ease-in-out forwards`
                }}
              >
                <span dangerouslySetInnerHTML={{ __html: transitionText }} />
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CHAT ALICE (Lazy Loaded) ═══ */}
      {chatReady && (
        <Suspense fallback={null}>
          <AliceChat isOpen={showChat} onClose={handleCloseChat} lang={lang} />
        </Suspense>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ESTILOS INLINE
// ═══════════════════════════════════════════════════════════

const styles: { [key: string]: React.CSSProperties } = {
  body: {
    margin: 0,
    padding: 0,
    width: '100%',
    minHeight: '100vh',
    height: '100dvh',
    fontFamily: "'Montserrat', sans-serif",
    color: '#f0f0f0',
    backgroundColor: '#0c0a09', // Fundo preto puro (a imagem foi deletada para aliviar o celular)
    overflow: 'hidden',
    position: 'relative',
  },
  globalVideoBg: {
    position: 'fixed', // Travado exatamente na janela visual, como o chatOverlay
    inset: 0,
    width: '100vw',
    height: '100dvh', // Força a altura dinâmica do navegador
    objectFit: 'cover', // Mantém a proporção sem distorcer
    objectPosition: 'center center', // Garante que fique centralizado
    zIndex: 0,
    transition: 'opacity 1.5s ease-in-out',
    // transform e will-change de transform removidos para evitar bugs de Zoom na GPU
    willChange: 'opacity',
  },
  // ── Estilos da Transição Cinematográfica ──
  transitionOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100dvh',
    zIndex: 99990,
    background: 'radial-gradient(circle at center, #0B0B1A 0%, #030308 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '32px',
    overflow: 'hidden',
  },
  transitionText: {
    color: '#E8D5A3',
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(22px, 6vw, 32px)',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
    textAlign: 'center',
    padding: '0 1.5rem',
    maxWidth: '700px',
    zIndex: 2,
    whiteSpace: 'pre-line',
    position: 'relative',
    willChange: 'transform, opacity', // OTIMIZAÇÃO
  },
  // ── Estilos do Interaction Gate (Novo) ──
  gateOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100dvh',
    zIndex: 99999, // Fica acima de tudo
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, rgba(10, 8, 35, 0.7) 0%, rgba(5, 4, 20, 0.95) 100%)',
    /* Blur (vidro) removido! Deixa o vídeo de trás aparecer limpo e poupa o processador */
  },
  gateContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    maxWidth: '500px',
  },
  gateBadge: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '11px',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#D4AF37', // Dourado
    marginBottom: '16px',
    fontWeight: 600,
  },
  gateTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(18px, 5.3vw, 28px)',
    color: '#FFFFFF',
    fontWeight: 500,
    lineHeight: 1.2,
    marginBottom: '40px',
    textShadow: '0 4px 20px rgba(155, 89, 255, 0.4)',
  },
  gateMiniCard: {
    position: 'absolute',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'max-content',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  },
  gateMiniCardText: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '13px',
    color: '#E0E0E0',
    fontWeight: 400,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  gateButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(155, 89, 255, 0.2) 0%, rgba(90, 40, 200, 0.4) 100%)',
    border: '1px solid rgba(155, 89, 255, 0.5)',
    borderRadius: '30px',
    padding: '16px 36px',
    color: '#FFFFFF',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 8px 32px rgba(155, 89, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  },
};

export default AlmaGemea;
