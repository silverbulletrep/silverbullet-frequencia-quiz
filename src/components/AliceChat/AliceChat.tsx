/**
 * 🔮 AliceChat — Jornada Presell Alma Gêmea
 * ═══════════════════════════════════════════
 * 6 Estados: Nome → Tiragem 1 → Tiragem 2 → Tiragem 3 → Celular → CTA
 *
 * ZONAS (mantidas do design original):
 *   - Zona 2: Diálogo (Balão da vidente — 18% altura)
 *   - Zona 3: Jogada (Centro da mesa — cartas + celular)
 *   - Zona 4: Painel de Comando (75%-100% — inputs, botões, cartas selecionáveis)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { DeviceFrameset } from 'react-device-frameset';
import 'react-device-frameset/styles/marvel-devices.min.css';
import { useTranslation } from 'react-i18next';
import { asset } from '@/lib/asset';
import styles from './AliceChat.module.scss';
import { leadCache } from '@/lib/leadCache';
import { withTrackingParams } from '@/lib/trackingParams';
import {
  createFunnelTracker,
  getDefaultBaseUrl,
  readStoredCountry,
  ALMA_GEMEA_FUNNEL_ID,
  ALMA_GEMEA_STEPS
} from '@/lib/funnelTracker';

// ══════════════════════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════════════════════

type GameState = 0 | 1 | 2 | 3 | 4 | 5;
type Gender = 'F' | 'M';

interface RevealedCardInfo {
  img: string;
  name: string;
  color: string;
}

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

function getGenderFromURL(): Gender {
  const params = new URLSearchParams(window.location.search);
  return (params.get('genero')?.toUpperCase() === 'M') ? 'M' : 'F';
}

function getTypingDelay(text: string): number {
  return Math.min(800 + text.length * 18, 2800);
}

/** Substitui {nome} no copy */
function personalize(text: string, name: string): string {
  return text.replace(/\{nome\}/g, name);
}

// ── CardBack Mini ──
const CardBackMini: React.FC<{ index: number; layoutId?: string }> = ({ index, layoutId }) => (
  <motion.div
    layoutId={layoutId}
    className={styles.cardBackMini}
    style={{ transform: `rotate(${(index - 1) * 3}deg)` }}
  >
    <img
      src={asset("/img/tarot-deck/verso-card.webp")}
      className={styles.cardBackImage}
      alt="Verso da Carta"
    />
  </motion.div>
);

// ── Maço de Cartas (Deck) ──
const TarotDeck: React.FC = () => (
  <div className={styles.tarotDeckWrapper}>
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={`deck-card-${i}`}
        className={styles.deckCard}
        style={{
          transform: `translateY(-${i * 2}px) rotateZ(-${i * 0.5}deg)`,
          opacity: 1 - (i * 0.15)
        }}
      >
        <img src={asset("/img/tarot-deck/verso-card.webp")} alt="Deck" />
      </div>
    ))}
    <div className={styles.deckAura} />
  </div>
);

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════

interface AliceChatProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'pt' | 'de';
}

const AliceChat: React.FC<AliceChatProps> = ({ isOpen, onClose, lang = 'pt' }) => {
  const { t } = useTranslation();

  // ── Configuração Localizada ──

  const TIRAGEM_1: Record<Gender, RevealedCardInfo> = {
    F: { img: 'm04.jpg', name: t('alma_gemea.cards.emperor', 'O Imperador'), color: '#FFD700' },
    M: { img: 'm02.jpg', name: t('alma_gemea.cards.highpriestess', 'A Sacerdotisa'), color: '#C084FC' },
  };

  const TIRAGEM_2: RevealedCardInfo = {
    img: 'm06.jpg', name: t('alma_gemea.cards.lovers', 'Os Amantes'), color: '#F43F5E',
  };

  const TIRAGEM_3: RevealedCardInfo = {
    img: 'm18.jpg', name: t('alma_gemea.cards.moon', 'A Lua'), color: '#C084FC',
  };

  const COPIES = {
    askName: t('alma_gemea.chat.askName'),
    tiragem1Intro: t('alma_gemea.chat.tiragem1Intro'),
    tiragem1RevealF: t('alma_gemea.chat.tiragem1RevealF'),
    tiragem1RevealM: t('alma_gemea.chat.tiragem1RevealM'),
    tiragem1Btn: t('alma_gemea.chat.tiragem1Btn'),
    tiragem2Intro: t('alma_gemea.chat.tiragem2Intro'),
    tiragem2Reveal: t('alma_gemea.chat.tiragem2Reveal'),
    tiragem2Btn: t('alma_gemea.chat.tiragem2Btn'),
    tiragem3Intro: t('alma_gemea.chat.tiragem3Intro'),
    tiragem3Reveal: t('alma_gemea.chat.tiragem3Reveal'),
    phone: t('alma_gemea.chat.phone'),
    final: t('alma_gemea.chat.final'),
    ctaBtn: t('alma_gemea.chat.ctaBtn'),
  };

  // ── Estado da máquina ──
  const [gameState, setGameState] = useState<GameState>(0);
  const [userName, setUserName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [gender] = useState<Gender>(getGenderFromURL);

  const deckX = "-32vw";
  const deckY = "10vh";

  // ── Diálogo ──
  const [activeMessage, setActiveMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // ── Cartas ──
  const [revealedCards, setRevealedCards] = useState<RevealedCardInfo[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  // ── Painel ──
  type PanelState = 'hidden' | 'cards' | 'buttons' | 'input' | 'cta';
  const [panelState, setPanelState] = useState<PanelState>('hidden');
  const [buttonLabel, setButtonLabel] = useState('');
  const [buttonAction, setButtonAction] = useState<(() => void) | null>(null);

  // ── Celular ──
  const [isPhoneOn, setIsPhoneOn] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  type PhoneImage = 'off' | 'on' | 'exame';
  const [phoneImage, setPhoneImage] = useState<PhoneImage>('off');

  // ── Vibração (STATE 3) ──
  const [isVibrating, setIsVibrating] = useState(false);

  // ── Exibir todas as cartas no centro (revelar antes do celular) ──
  const [showAllCards, setShowAllCards] = useState(false);

  // ── Toast: áudio em andamento ──
  const [showAudioWaitToast, setShowAudioWaitToast] = useState(false);
  const isEtapaAudioPlayingRef = useRef(false);

  // ── Progresso do Vídeo ──
  const [videoProgress, setVideoProgress] = useState(0);

  // ── Refs ──
  const isProcessingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const videoBgRef = useRef<HTMLVideoElement>(null);

  // ── Áudio ──
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((basePath: string) => {
    // Se for alemão, busca na subpasta /de/
    const rawSrc = lang === 'de' ? basePath.replace('/alice/', '/alice/de/') : basePath;
    const src = asset(rawSrc);

    // Sequestra o áudio que foi destrancado pelo clique no AlmaGemea.tsx
    let audioEl = document.getElementById('voice-audio') as HTMLAudioElement;

    if (audioEl) {
      if (audioRef.current && audioRef.current !== audioEl) {
        audioRef.current.pause();
      }
      audioEl.pause();
      audioEl.onended = null;
      audioEl.loop = false;
      audioEl.src = src;
      audioEl.play().catch(e => console.log("Audio voice play blocked:", e));
      audioRef.current = audioEl;
    } else {
      // Fallback caso não encontre
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.loop = false;
        audioRef.current.src = src;
        audioRef.current.play().catch(e => console.log("Audio play blocked:", e));
      } else {
        const audio = new Audio(src);
        audioRef.current = audio;
        audio.play().catch(e => console.log("Audio play blocked:", e));
      }
    }
    return audioRef.current;
  }, [lang]);

  const playBackgroundMusic = useCallback(() => {
    const src = asset('/Audio/musica-fundo.mp3');

    // Tenta reutilizar o áudio fantasma destravado no Portão de Interação (AlmaGemea.tsx)
    let audioEl = document.getElementById('bg-music-audio') as HTMLAudioElement;

    if (audioEl) {
      bgAudioRef.current = audioEl;
      audioEl.loop = true;
      audioEl.volume = 0.25;
    } else if (!bgAudioRef.current) {
      // Fallback
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0.25;
      bgAudioRef.current = audio;
    } else if (bgAudioRef.current.src.indexOf('/Audio/musica-fundo.mp3') === -1) {
      bgAudioRef.current.src = src;
    }

    bgAudioRef.current.play().catch(e => console.log("Bg music blocked:", e));
  }, []);

  const showMessage = useCallback(async (text: string) => {
    setIsTyping(true);
    setActiveMessage('');
    await new Promise(r => setTimeout(r, getTypingDelay(text)));
    setIsTyping(false);
    setActiveMessage(text);
    // Pausa equilibrada para leitura fluida
    await new Promise(r => setTimeout(r, 500));
  }, []);

  const startTiragem = useCallback(async (tiragemNum: 1 | 2 | 3, name?: string) => {
    const currentName = name || userName;
    isProcessingRef.current = true;
    setPanelState('hidden');
    if (tiragemNum === 1) setRevealedCards([]);
    setSelectedCardIndex(null);
    setIsFlipping(false);
    setIsVibrating(false);

    await new Promise(r => setTimeout(r, 400));

    const intros: Record<number, string> = {
      1: personalize(COPIES.tiragem1Intro, currentName),
      2: personalize(COPIES.tiragem2Intro, currentName),
      3: personalize(COPIES.tiragem3Intro, currentName),
    };

    const audioMap: Record<number, string> = {
      1: '/Audio/alice/etapa_2.mp3',
      2: '/Audio/alice/etapa_4.mp3',
      3: '/Audio/alice/etapa_6.mp3',
    };

    if (audioMap[tiragemNum]) {
      const etapaAudio = playAudio(audioMap[tiragemNum]);
      isEtapaAudioPlayingRef.current = true;
      if (etapaAudio) {
        etapaAudio.onended = () => {
          isEtapaAudioPlayingRef.current = false;
        };
      }
    }

    await showMessage(intros[tiragemNum]);
    setPanelState('cards');
    isProcessingRef.current = false;
  }, [userName, showMessage, playAudio, COPIES]);

  const startState4 = useCallback(async () => {
    isProcessingRef.current = true;
    setPanelState('hidden');
    setSelectedCardIndex(null);

    await new Promise(r => setTimeout(r, 400));

    const etapa8Audio = playAudio('/Audio/alice/etapa_8.mp3');

    // Inicia "Digitando..." para criar expectativa nos primeiros 6 segundos
    setIsTyping(true);
    setActiveMessage('');

    if (etapa8Audio) {
      // Evento para disparar a ficha exata e precisamente aos 6 segundos
      const onTimeEtapa8 = () => {
        if (etapa8Audio.currentTime >= 6 && !etapa8Audio.dataset.portaRetratoDone) {
          etapa8Audio.dataset.portaRetratoDone = '1';
          setIsTyping(false);
          setActiveMessage('__PORTA_RETRATO__');
        }
      };
      etapa8Audio.addEventListener('timeupdate', onTimeEtapa8);

      await new Promise<void>(resolve => {
        const onEnded = () => {
          etapa8Audio.removeEventListener('timeupdate', onTimeEtapa8);
          resolve();
        };
        etapa8Audio.onended = onEnded;
        setTimeout(() => {
          etapa8Audio.removeEventListener('timeupdate', onTimeEtapa8);
          resolve();
        }, 120000);
      });
    } else {
      // Fallback seguro caso o áudio falhe
      setTimeout(() => {
        setIsTyping(false);
        setActiveMessage('__PORTA_RETRATO__');
      }, 6000);
      await new Promise(r => setTimeout(r, 12000));
    }

    await showMessage(personalize(COPIES.phone, userName));
    await new Promise(r => setTimeout(r, 600));
    setIsPhoneOn(true);
    setPhoneImage('on');
    setShowTapHint(true);
    isProcessingRef.current = false;
  }, [userName, showMessage, playAudio, COPIES]);

  const startState0 = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setPanelState('hidden');
    setRevealedCards([]);

    const audio = playAudio('/Audio/alice/etapa_1.mp3');

    setIsTyping(true);
    setActiveMessage('');

    if (audio) {
      await new Promise(resolve => {
        audio.onended = resolve;
        // Fallback maior caso o áudio em alemão seja longo
        setTimeout(resolve, 15000);
      });
    } else {
      await new Promise(r => setTimeout(r, 6000));
    }

    setIsTyping(false);
    setActiveMessage(COPIES.askName);
    setPanelState('input');
    isProcessingRef.current = false;
  }, [playAudio, COPIES]);

  const handleNameSubmit = useCallback(async () => {
    if (!nameInput.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;

    const name = nameInput.trim();
    const formattedName = `${name}-Tarot`;
    setUserName(name);

    // ── Tracking e Cache (Sync com /quiz) ──
    leadCache.setNome(formattedName);

    const tracker = createFunnelTracker({
      baseUrl: getDefaultBaseUrl(),
      funnelId: ALMA_GEMEA_FUNNEL_ID,
      getCountry: () => readStoredCountry() || undefined,
      debug: import.meta.env.DEV
    });

    // Sincroniza o ID entre funnelTracker e leadCache para garantir reuso em outras páginas
    const currentLeadId = tracker.getLeadId();
    leadCache.setLeadId(currentLeadId);

    // Envia o payload com nome, id único, idioma e origem do funil
    tracker.leadIdentifiedCustom(ALMA_GEMEA_STEPS.coleta_nome, {
      name: formattedName,
      lead_id: currentLeadId,
      lang,
      funnel_origin: `alma-gemea-${lang}`,
    }).catch(err => {
      console.error('[AliceChat] Erro ao enviar lead_identified:', err);
    });

    setPanelState('hidden');
    setActiveMessage('');
    setGameState(1);

    // Tentar tocar a música de fundo novamente (agora temos uma interação real do usuário)
    playBackgroundMusic();

    await startTiragem(1, name);
  }, [nameInput, startTiragem, playBackgroundMusic]);

  const abrirVSL = useCallback(() => {
    if (!isPhoneOn) return;
    setIsPhoneModalOpen(true);
    setShowTapHint(false);
  }, [isPhoneOn]);

  const handleClosePhoneModal = useCallback(() => {
    setIsPhoneModalOpen(false);
    setActiveMessage('__PORTA_RETRATO__');
    setIsPhoneOn(false);
    setPhoneImage('off');

    const etapa9Audio = playAudio('/Audio/alice/etapa_9.mp3');

    const onEtapa9End = () => {
      const etapa10Audio = playAudio('/Audio/alice/etapa_10.mp3');
      setTimeout(() => {
        setIsPhoneOn(true);
        setPhoneImage('exame');
        setShowTapHint(false);
        setPanelState('cta');
      }, 5000);
    };

    if (etapa9Audio) {
      let fallbackFired = false;
      const fallbackTimer = setTimeout(() => {
        if (!fallbackFired) { fallbackFired = true; onEtapa9End(); }
      }, 120000);
      etapa9Audio.onended = () => {
        fallbackFired = true;
        clearTimeout(fallbackTimer);
        onEtapa9End();
      };
    } else {
      onEtapa9End();
    }
  }, [playAudio]);

  const handleCTA = useCallback(() => {
    window.location.href = withTrackingParams(asset(`/${lang}/quiz`));
  }, [lang]);

  const handleCardSelect = useCallback(async (cardIndex: number) => {
    if (isEtapaAudioPlayingRef.current) {
      setShowAudioWaitToast(true);
      setTimeout(() => setShowAudioWaitToast(false), 2800);
      return;
    }
    if (isProcessingRef.current || selectedCardIndex !== null) return;
    isProcessingRef.current = true;

    setSelectedCardIndex(cardIndex);
    setIsFlipping(true);

    let card: RevealedCardInfo;
    let revealText: string;
    let nextStage: GameState;

    if (gameState === 1) {
      card = TIRAGEM_1[gender];
      revealText = gender === 'F' ? personalize(COPIES.tiragem1RevealF, userName) : personalize(COPIES.tiragem1RevealM, userName);
      nextStage = 2;
    } else if (gameState === 2) {
      card = TIRAGEM_2;
      revealText = personalize(COPIES.tiragem2Reveal, userName);
      nextStage = 3;
    } else {
      card = TIRAGEM_3;
      revealText = personalize(COPIES.tiragem3Reveal, userName);
      nextStage = 4;
    }

    await new Promise(r => setTimeout(r, 1200));
    setPanelState('hidden');
    setRevealedCards(prev => [...prev, card]);
    setIsFlipping(false);

    const revealAudioMap: Record<number, string> = {
      1: '/Audio/alice/etapa_3.mp3',
      2: '/Audio/alice/etapa_5.mp3',
      3: '/Audio/alice/etapa_7.mp3',
    };

    let audio: HTMLAudioElement | null = null;
    if (revealAudioMap[gameState]) {
      audio = playAudio(revealAudioMap[gameState]);
    }

    await new Promise(r => setTimeout(r, 600));
    await showMessage(revealText);

    // ── Tiragem 3 (A Lua): cronometria precisa pelo áudio da Etapa 7 ──
    if (gameState === 3) {
      // PREFETCH: Inicia o carregamento das próximas rotas em background para transição instantânea
      try {
        import('@/pages/InitialQuestions').catch(() => {});
        import('@/pages/AgeSelectionWomen').catch(() => {});
        import('@/pages/AgeSelectionMen').catch(() => {});
        if (import.meta.env.DEV) console.log('[AliceChat] Prefetch das rotas do Quiz iniciado 🚀');
      } catch (e) {
        void 0;
      }

      if (audio) {
        // Pega os timestamps da tradução (com fallback seguro)
        const tLuaDeck = Number(t('alma_gemea.animation.lua_to_deck', { defaultValue: 29 }));
        const tLuaFan = Number(t('alma_gemea.animation.lua_fan_reveal', { defaultValue: 39 }));

        await new Promise<void>(resolve => {
          const onTime = () => {
            if (!audio) return;
            const t = audio.currentTime;
            // Usa as variáveis da tradução em vez de valores fixos
            if (t >= tLuaDeck && !audio.dataset.lua29Done) {
              audio.dataset.lua29Done = '1';
              setGameState(4);
            }
            if (t >= tLuaFan && !audio.dataset.lua39Done) {
              audio.dataset.lua39Done = '1';
              setShowAllCards(true);
            }
          };
          audio.addEventListener('timeupdate', onTime);

          const cleanup = () => {
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('ended', onEndedWrapper);
          };

          const onEndedWrapper = () => {
            cleanup();
            setShowAllCards(false);
            resolve();
          };

          audio.addEventListener('ended', onEndedWrapper);

          setTimeout(() => {
            cleanup();
            resolve();
          }, 120000); // Aumentado para 120s para áudios longos
        });
      }

      const etapa8Audio = playAudio('/Audio/alice/etapa_8.mp3');
      if (etapa8Audio) {
        const targetTime = lang === 'de' ? 11 : 5;
        const onTimeEtapa8 = () => {
          if (etapa8Audio.currentTime >= targetTime && !etapa8Audio.dataset.portaRetratoDone) {
            etapa8Audio.dataset.portaRetratoDone = '1';
            setActiveMessage('__PORTA_RETRATO__');
          }
        };
        etapa8Audio.addEventListener('timeupdate', onTimeEtapa8);

        await new Promise<void>(resolve => {
          const onEnded = () => {
            etapa8Audio.removeEventListener('timeupdate', onTimeEtapa8);
            etapa8Audio.removeEventListener('ended', onEnded);
            resolve();
          };
          etapa8Audio.addEventListener('ended', onEnded);
          setTimeout(() => {
            etapa8Audio.removeEventListener('timeupdate', onTimeEtapa8);
            etapa8Audio.removeEventListener('ended', onEnded);
            resolve();
          }, 120000);
        });
      } else {
        const targetTimeMs = lang === 'de' ? 11000 : 5000;
        setTimeout(() => {
          setActiveMessage('__PORTA_RETRATO__');
        }, targetTimeMs);
        await new Promise(r => setTimeout(r, 15000));
      }

      await showMessage(personalize(COPIES.phone, userName));
      await new Promise(r => setTimeout(r, 600));
      setIsPhoneOn(true);
      setPhoneImage('on');
      setShowTapHint(true);

    } else {
      if (audio) {
        await new Promise<void>(resolve => {
          audio.onended = () => resolve();
          setTimeout(resolve, 60000);
        });
      }

      const btnLabel = gameState === 1 ? COPIES.tiragem1Btn : COPIES.tiragem2Btn;
      setButtonLabel(btnLabel);

      const nextStep = () => {
        setGameState(nextStage as GameState);
        startTiragem(nextStage as 1 | 2 | 3);
      };
      setButtonAction(() => nextStep);
      setPanelState('buttons');
    }

    isProcessingRef.current = false;
  }, [gameState, gender, userName, showMessage, startTiragem, playAudio, COPIES, TIRAGEM_1, TIRAGEM_2, TIRAGEM_3]);

  useEffect(() => {
    if (isOpen && !hasStartedRef.current) {
      hasStartedRef.current = true;
      playBackgroundMusic();
      startState0();

      // Pré-carregar próximos áudios para evitar lag entre etapas
      const futureAudios = [
        '/Audio/alice/etapa_2.mp3', '/Audio/alice/etapa_3.mp3',
        '/Audio/alice/etapa_4.mp3', '/Audio/alice/etapa_5.mp3',
        '/Audio/alice/etapa_6.mp3', '/Audio/alice/etapa_7.mp3',
        '/Audio/alice/etapa_8.mp3', '/Audio/alice/etapa_9.mp3',
        '/Audio/alice/etapa_10.mp3'
      ];
      futureAudios.forEach(path => {
        const img = new Image(); // Truque para forçar cache de pequenos arquivos se Audio() falhar
        const a = new Audio();
        a.src = asset(lang === 'de' ? path.replace('/alice/', '/alice/de/') : path);
        a.preload = 'auto';
      });

      // O vídeo principal agora é gerenciado pelo AlmaGemea.tsx (pai)
      // Isso evita recarregamento e mantém o play em aparelhos de baixo processamento
    }

    // Cleanup: Para todos os áudios se o chat fechar
    if (!isOpen && hasStartedRef.current) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.src = "";
      }
      hasStartedRef.current = false;
    }
  }, [isOpen, startState0, playBackgroundMusic]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.chatOverlay} role="dialog" aria-label="Mesa de Tarot com Alice" style={{ touchAction: 'none' }}>

      <TarotDeck />

      <LayoutGroup>
        <div className={styles.dialogZone}>
          <AnimatePresence mode="wait">
            {isTyping ? (
              <motion.div
                key="typing"
                className={styles.typingIndicator}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span /><span /><span />
              </motion.div>
            ) : activeMessage && (
              <motion.div
                key={activeMessage}
                className={styles.speechBubble}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {activeMessage === '__PORTA_RETRATO__' ? (
                  <div className={styles.autorityCard}>
                    <img
                      src={asset("/img/porta-retrato.webp")}
                      alt={t('alma_gemea.authority.name')}
                      className={styles.autorityImg}
                    />
                    <div className={styles.autorityBody}>
                      <p className={styles.autorityName}>{t('alma_gemea.authority.name')}</p>
                      <p className={styles.autorityBadge}>{t('alma_gemea.authority.badge')}</p>
                      <p className={styles.autorityCopy} dangerouslySetInnerHTML={{ __html: t('alma_gemea.authority.copy') }} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.speechText}>{activeMessage}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.cardPlayZone}>
          {revealedCards.map((card, idx) => {
            const isInFocus = !showAllCards && (idx === gameState - 1);
            const fanAngles  = [-15, 0, 15];
            const fanX       = [-120, 0, 120];
            const fanY       = [10, -20, 10];
            const messyAngle = [8, -5, 12];
            const messyX     = [0, 4, -3];
            const messyY     = [0, -5, 3];

            let animateProps: object;

            if (showAllCards) {
              animateProps = {
                opacity: 1,
                x: fanX[idx] ?? 0,
                y: fanY[idx] ?? 0,
                scale: 0.9,
                rotateY: 0,
                rotateX: 0,
                rotateZ: fanAngles[idx] ?? 0,
                zIndex: 50 + idx,
              };
            } else if (isInFocus) {
              animateProps = {
                opacity: 1,
                x: 0,
                y: -60,
                scale: 1.15,
                rotateY: 0,
                rotateX: 0,
                rotateZ: 0,
                zIndex: 100,
              };
            } else {
              animateProps = {
                opacity: 1,
                x: deckX,
                y: deckY,
                scale: 0.45,
                rotateY: 0, /* Modificado: 0 para manter a face virada para cima (antes era 180) */
                rotateX: 55,
                rotateZ: 10 + (messyAngle[idx] ?? 0),
                zIndex: 5 + idx,
              };
            }

            return (
              <motion.div
                key={`card-slot-${idx}`}
                className={styles.revealedCardWrap}
                style={{ position: 'absolute' }}
                initial={false}
                animate={animateProps as import('framer-motion').TargetAndTransition}
                transition={{
                  type: 'tween',
                  duration: showAllCards ? 0.6 : 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: showAllCards ? idx * 0.12 : 0
                }}
              >
              <div
                className={styles.revealedCardImgWrap}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}>
                  <img
                    src={asset(`/img/tarot-deck/${card.img}`)}
                    alt={card.name}
                    className={styles.revealedCardImg}
                  />
                </div>
                <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}>
                  <div className={styles.revealedCardImg}>
                    <CardBackMini index={idx % 3} />
                  </div>
                </div>
              </div>
              {isInFocus && (
                <div className={styles.revealedCardLabel}>
                  <span className={styles.cardName}>{card.name}</span>
                  <div className={styles.labelUnderline} style={{ background: card.color }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

        <AnimatePresence>
          {panelState !== 'hidden' && (
            <motion.div
              className={styles.responsePanel}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >

              {panelState === 'input' && (
                <div className={styles.buttonZone}>
                  <p className={styles.panelHint}>{t('alma_gemea.chat.panelHint_name')}</p>
                  <div className={styles.nameInputWrap}>
                    <input
                      type="text"
                      className={styles.nameInput}
                      placeholder={t('alma_gemea.chat.placeholder_name')}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                      autoFocus
                      maxLength={30}
                    />
                    <motion.button
                      className={styles.mysticalBtn}
                      onClick={handleNameSubmit}
                      type="button"
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ opacity: nameInput.trim() ? 1 : 0.5 }}
                    >
                      <span className={styles.btnIcon}>🔮</span>
                      {t('alma_gemea.chat.startBtn')}
                    </motion.button>
                  </div>
                </div>
              )}

              {panelState === 'cards' && (
                <>
                  <div className={styles.cardSelectionZone}>
                    <div className={styles.cardPicker}>
                      <AnimatePresence mode="wait">
                        {showAudioWaitToast ? (
                          <motion.p
                            key="toast-error"
                            className={`${styles.panelHint} ${styles.toastHint}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            {t('alma_gemea.chat.audioWaitToast')}
                          </motion.p>
                        ) : (
                          <motion.p
                            key="normal-hint"
                            className={styles.panelHint}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            {t('alma_gemea.chat.panelHint_cards')}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <div className={styles.cardPickRow}>
                        {[0, 1, 2].map((i) => (
                          <motion.button
                            key={`picker-${gameState}-${i}`}
                            className={`${styles.pickableCard} ${selectedCardIndex === i ? styles.selectedPick : ''}`}
                            onClick={() => handleCardSelect(i)}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{
                              opacity: 1,
                              scale: selectedCardIndex === i && isFlipping ? 1.1 : 1,
                              x: (i - 1) * 110,
                              rotate: (i - 1) * 8,
                            }}
                            whileHover={selectedCardIndex === null ? { y: -20, scale: 1.1, rotate: 0, zIndex: 50 } : {}}
                            whileTap={selectedCardIndex === null ? { scale: 0.95 } : {}}
                            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                            aria-label={`${t('alma_gemea.chat.card_aria')} ${i + 1}`}
                            disabled={selectedCardIndex !== null}
                          >
                            <div className={`${styles.cardFlipInner} ${
                              selectedCardIndex === i && isFlipping ? styles.cardFlipped : ''
                            }`}>
                              <div className={styles.cardFlipFront}>
                                <CardBackMini index={i} />
                              </div>
                              <div className={styles.cardFlipBack}>
                                <div className={styles.cardFaceInPicker}>
                                  <img
                                    src={asset(`/img/tarot-deck/${
                                      gameState === 1 ? TIRAGEM_1[gender].img
                                      : gameState === 2 ? TIRAGEM_2.img
                                      : TIRAGEM_3.img
                                    }`)}
                                    alt="Revelada"
                                  />
                                </div>
                              </div>
                            </div>
                            <span className={styles.cardNum}>{i + 1}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                </>
              )}


              {panelState === 'buttons' && buttonLabel && (
                <div className={styles.buttonZone}>
                  <div className={styles.buttonList}>
                    <motion.button
                      className={styles.mysticalBtn}
                      onClick={() => {
                        if (buttonAction) buttonAction();
                      }}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className={styles.btnIcon}>✨</span>
                      {buttonLabel}
                    </motion.button>
                  </div>
                </div>
              )}

              {panelState === 'cta' && (
                <div className={styles.buttonZone}>
                  <div className={styles.buttonList}>
                    <motion.button
                      className={`${styles.mysticalBtn} ${styles.ctaBtn}`}
                      onClick={handleCTA}
                      type="button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className={styles.ctaBtnText}>{t('alma_gemea.chat.ctaBtn')}</span>
                      <svg className={styles.ctaArrow} width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.button>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

      <button
        className={`${styles.phoneTableWrapper} ${styles.wrapperVerticalPhone}`}
        onClick={abrirVSL}
        type="button"
        aria-label="Ver vídeo no celular"
        style={{
          cursor: isPhoneOn ? 'pointer' : 'default',
          opacity: gameState === 0 ? 0 : 1,
          pointerEvents: gameState === 0 ? 'none' : 'auto',
          display: isPhoneModalOpen ? 'none' : 'block',
        }}
      >
        {isPhoneOn && <div className={styles.phoneAura} />}

        {showTapHint && (
          <motion.div
            className={styles.clickIndicator}
            initial={{ opacity: 0, x: 40 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: [40, -10, -10, -10],
              scale: [1, 1, 0.8, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.4, 0.6, 0.8, 1]
            }}
          >
            <svg width="40" height="40" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.handIcon}>
              <path d="M200 112V160C200 204.183 164.183 240 120 240C75.8172 240 40 204.183 40 160V112C40 101.5 48.5 93 59 93C69.5 93 78 101.5 78 112V136" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M78 112V56C78 45.5 86.5 37 97 37C107.5 37 116 45.5 116 56V112" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M116 112V96C116 85.5 124.5 77 135 77C145.5 77 154 85.5 154 96V112" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M154 112V104C154 93.5 162.5 85 173 85C183.5 85 192 93.5 192 104V112" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}

        <img
          src={asset(
            phoneImage === 'exame' ? '/img/exame-celular.webp' :
            phoneImage === 'on'    ? '/img/celular-video.webp' :
                                     '/img/celular-apagado.webp'
          )}
          className={styles.verticalPhoneImg}
          alt="Celular na mesa"
        />
      </button>

      <AnimatePresence>
        {isPhoneModalOpen && (
          <motion.div
            className={styles.videoModalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.deviceWrapper}
              initial={{ scale: 0.4, y: 100, rotateX: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0, y: 50, rotateX: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 150 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.deviceScaler}>
                <DeviceFrameset device="iPhone X" color="black" landscape={false}>
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video
                      src={asset(lang === 'de' ? "/videos/AD-10-DE.webm" : "/videos/AD-10.webm")}
                      className={styles.videoInPhone}
                      autoPlay
                      playsInline
                      onTimeUpdate={(e) => {
                        const video = e.currentTarget;
                        const realProg = video.currentTime / video.duration;
                        const fakeProg = Math.sqrt(realProg) * 100;
                        setVideoProgress(fakeProg);
                      }}
                      onEnded={handleClosePhoneModal}
                    />

                    <div className={styles.progressBox}>
                      <div className={styles.progressStatus}>
                        <span>{t('alma_gemea.chat.progressLabel')}</span>
                        <span className={styles.progressPercent}>{Math.round(videoProgress)}%</span>
                      </div>
                      <div className={styles.progressContainer}>
                        <div
                          className={styles.progressBar}
                          style={{ width: `${videoProgress}%` }}
                        >
                          <div className={styles.progressGlow} />
                        </div>
                      </div>
                    </div>
                  </div>
                </DeviceFrameset>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default AliceChat;
