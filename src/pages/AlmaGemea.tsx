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

import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
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
            <div style={styles.gateContent}>
              <div style={styles.gateBadge}>✦ TAROT ENERGÉTICO ✦</div>
              <h1
                style={styles.gateTitle}
                dangerouslySetInnerHTML={{ __html: t('alma_gemea.gate.title') }}
              />
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
                {t('alma_gemea.gate.button')}
              </button>
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
    fontSize: 'clamp(28px, 8vw, 42px)',
    color: '#FFFFFF',
    fontWeight: 500,
    lineHeight: 1.2,
    marginBottom: '40px',
    textShadow: '0 4px 20px rgba(155, 89, 255, 0.4)',
  },
  gateButton: {
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
