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

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { asset } from '@/lib/asset';

// ── Lazy load do chat (não carrega no bundle inicial) ──
const AliceChat = lazy(() => import('@/components/AliceChat/AliceChat'));

const DEBUG = import.meta.env.DEV;

const AlmaGemea: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'pt';

  // ── Estados do fluxo ──
  const [chatReady, setChatReady] = useState(false);
  const [showTransition, setShowTransition] = useState(true); // Começa direto na transição
  const [showChat, setShowChat] = useState(false);
  const [transitionText, setTransitionText] = useState('');

  // ── Sequência de transição cinematográfica ──
  const startTransition = useCallback(() => {
    // Frases vindas do i18n (ou fallback PT)
    const phrases = [
      t('alma_gemea.transition.phrase1', 'A Artista Astróloga está\n<strong>Preparando o Desenho</strong>\nda sua Alma Gêmea...'),
      t('alma_gemea.transition.phrase2', '✨ <strong>Conectando</strong> com sua\nfrequência astral...'),
      t('alma_gemea.transition.phrase3', '🌙 <strong>Canalizando</strong> a energia\ndas estrelas...'),
    ];

    let idx = 0;

    const showNextPhrase = () => {
      if (idx < phrases.length) {
        setTransitionText(phrases[idx]);
        idx++;
        setTimeout(showNextPhrase, 3000); // 3s por frase para dar tempo de carregar assets
      } else {
        setShowTransition(false);
        setShowChat(true);
        if (DEBUG) console.log('[AlmaGemea] Chat aberto após transição de carregamento');
      }
    };

    showNextPhrase();
  }, [t]);

  // ── Lifecycle ──
  useEffect(() => {
    // Injetar fontes Cinzel e Montserrat se não existirem
    if (!document.getElementById('fonts-alma-gemea')) {
      const link = document.createElement('link');
      link.id = 'fonts-alma-gemea';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@400;500&display=swap';
      document.head.appendChild(link);
    }

    // Preload do vídeo de fundo do chat (carregamento inteligente)
    if (!document.getElementById('preload-alice-bg')) {
      const preload = document.createElement('link');
      preload.id = 'preload-alice-bg';
      preload.rel = 'preload';
      preload.as = 'video';
      preload.href = asset("/videos/alice-chat-bg.webm");
      document.head.appendChild(preload);
    }

    // Bloquear scroll global na página (POV Game experience)
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Preload do chat em memória quase imediato (após 500ms)
    const preloadTimer = setTimeout(() => {
      setChatReady(true);
    }, 500);

    // Iniciar sequência de frases
    startTransition();

    return () => {
      clearTimeout(preloadTimer);
      // Restaurar scroll ao sair (boa prática)
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [startTransition]);

  // ── Fechar chat (volta para a página normal) ──
  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    if (DEBUG) console.log('[AlmaGemea] Chat fechado');
  }, []);

  return (
    <div style={styles.body}>

      {/* ═══ TRANSIÇÃO CINEMATOGRÁFICA (Serve como Loading Screen) ═══ */}
      <AnimatePresence>
        {showTransition && (
          <motion.div
            initial={{ opacity: 1 }} // Já começa visível
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={styles.transitionOverlay}
          >
            {/* Círculo quântico cósmico (pulsante) */}
            <motion.div
              style={styles.cosmicCircle}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                boxShadow: [
                  '0 0 40px rgba(155, 89, 255, 0.1)',
                  '0 0 100px rgba(155, 89, 255, 0.3)',
                  '0 0 40px rgba(155, 89, 255, 0.1)',
                ],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Texto animado da transição */}
            <AnimatePresence mode="wait">
              <motion.p
                key={transitionText}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 1.03 }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                style={styles.transitionText}
                dangerouslySetInnerHTML={{ __html: transitionText }}
              />
            </AnimatePresence>
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
    height: '100dvh', // Altura dinâmica para mobile
    fontFamily: "'Montserrat', sans-serif",
    color: '#f0f0f0',
    background: `url(${asset('/img/Imagem-fundo-almagemea.webp')}) no-repeat center center`,
    backgroundSize: 'cover',
    backgroundColor: '#0c0a09',
    overflow: 'hidden',
    position: 'relative',
  },
  // ── Estilos da Transição Cinematográfica ──
  transitionOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100dvh',
    zIndex: 99999,
    background: 'rgba(13, 11, 46, 1)', // Opaco para esconder o fundo enquanto carrega
    backdropFilter: 'blur(24px) saturate(200%)',
    WebkitBackdropFilter: 'blur(24px) saturate(200%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '32px',
    overflow: 'hidden',
  },
  cosmicCircle: {
    position: 'absolute',
    width: 'min(80vw, 380px)',
    height: 'min(80vw, 380px)',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(155, 89, 255, 0.1) 0%, rgba(13, 11, 46, 0) 70%)',
    border: '1px solid rgba(155, 89, 255, 0.08)',
  },
  transitionText: {
    color: '#E0C3FC',
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(20px, 6vw, 30px)',
    fontWeight: 400,
    textAlign: 'center',
    maxWidth: '600px',
    lineHeight: 1.5,
    zIndex: 2,
    filter: 'drop-shadow(0 0 12px rgba(155, 89, 255, 0.25))',
    whiteSpace: 'pre-line',
    position: 'relative',
  },
};

export default AlmaGemea;
