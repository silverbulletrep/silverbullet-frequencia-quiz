/**
 * ═══════════════════════════════════════════════════════════
 * 🎴 TarotSpread — Experiência de Tiragem de Tarot
 * ═══════════════════════════════════════════════════════════
 *
 * COMPONENTE: Mini-ritual de tiragem de carta dentro do chat
 * INTEGRAÇÃO: Renderizado via type === "tarot" no AliceChat
 *
 * FLUXO DE ESTADOS:
 *   1. "shuffle"  → Cartas empilhadas embaralhando (2s)
 *   2. "spread"   → 3 cartas abertas lado a lado (clique para escolher)
 *   3. "selected" → Carta escolhida ampliada + flip revelando a frente
 *
 * ANIMAÇÕES (framer-motion):
 *   - Embaralhar:  x + rotate oscillation em loop
 *   - Distribuir:  opacity + translateY stagger
 *   - Selecionar:  scale + centralização
 *   - Flip:        react-card-flip após 500ms do clique
 *
 * CALLBACK:
 *   onSelect(card) → disparado após flip, para o chat continuar
 *
 * CARTAS (mock — expansível):
 *   5 cartas com nome simbólico + símbolo unicode
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCardFlip from 'react-card-flip';
import styles from './TarotSpread.module.scss';

// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────

export interface TarotCard {
  id: number;
  /** Nome simbólico para uso no chat após seleção */
  name: string;
  /** Nome do arquivo de imagem (ex: m01.jpg) */
  img: string;
  /** Cor de destaque da carta */
  color: string;
  /** Mensagem que Alice enviará depois que essa carta for revelada */
  aliceReaction: string;
}

export type TarotStage = 'shuffle' | 'spread' | 'selected';

interface TarotSpreadProps {
  /** Callback disparado depois que a carta é virada — chat continua */
  onSelect: (card: TarotCard) => void;
}

// ─────────────────────────────────────────────────────────
// DADOS — Baralho místico (expansível)
// ─────────────────────────────────────────────────────────

const TAROT_CARDS: TarotCard[] = [
  {
    id: 1,
    name: 'A Estrela',
    img: 'm17.jpg',
    color: '#FFD700',
    aliceReaction:
      'Interessante... A Estrela revela que essa conexão traz renovação e esperança. Existe uma luz que guia os dois corações...',
  },
  {
    id: 2,
    name: 'A Lua',
    img: 'm18.jpg',
    color: '#C084FC',
    aliceReaction:
      'A Lua... ela fala de mistérios não ditos. Há sentimentos escondidos nessa conexão, esperando o momento certo para florescer.',
  },
  {
    id: 3,
    name: 'O Sol',
    img: 'm19.jpg',
    color: '#FF9F43',
    aliceReaction:
      'O Sol brilha sobre vocês dois! Essa carta traz uma mensagem de alegria e clareza. A energia entre as suas almas é luminosa e real.',
  },
  {
    id: 4,
    name: 'O Mundo',
    img: 'm21.jpg',
    color: '#4ADE80',
    aliceReaction:
      'O Mundo... uma carta de completude. Sinto que essa conexão é parte do seu destino. O universo já traçou o caminho.',
  },
  {
    id: 5,
    name: 'Os Amantes',
    img: 'm06.jpg',
    color: '#F43F5E',
    aliceReaction:
      'Os Amantes... não poderia ser mais claro. Essa carta é a mais poderosa para conexões amorosas. Existe uma escolha do coração à sua frente.',
  },
];

// Shuffla o array de cartas (Fisher-Yates)
function shuffleCards(arr: TarotCard[]): TarotCard[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────────────────
// SUBCOMPONENTE: CardBack (verso da carta)
// ─────────────────────────────────────────────────────────

const CardBack: React.FC = () => (
  <div className={styles.cardBack}>
    <div className={styles.cardBackInner}>
      <div className={styles.cardBackPattern}>
        <span className={styles.cardBackIcon}>🔮</span>
      </div>
      <div className={styles.cardBackFrame}></div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// SUBCOMPONENTE: CardFront (frente revelada)
// ─────────────────────────────────────────────────────────

const CardFront: React.FC<{ card: TarotCard }> = ({ card }) => (
  <div className={styles.cardFront} style={{ borderColor: card.color }}>
    <div className={styles.cardFrontGlow} style={{ background: `radial-gradient(circle, ${card.color}33 0%, transparent 70%)` }} />
    <img 
      src={`/img/tarot-deck/${card.img}`} 
      alt={card.name} 
      className={styles.cardImage} 
    />
    <div className={styles.cardFrontOverlay}>
      <span className={styles.cardFrontName} style={{ color: card.color }}>{card.name}</span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────

const TarotSpread: React.FC<TarotSpreadProps> = ({ onSelect }) => {

  // ── Estado da animação ──
  const [stage, setStage] = useState<TarotStage>('shuffle');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [alreadySelected, setAlreadySelected] = useState(false);

  // ── Cartas embaralhadas (fixo por render) ──
  const [spreadCards] = useState(() => shuffleCards(TAROT_CARDS).slice(0, 3));

  // ── Timer: embaralhar 2s → distribuir ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('spread');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // ── Clique em uma carta ──
  const handleCardClick = useCallback((index: number) => {
    if (stage !== 'spread' || alreadySelected) return;

    setAlreadySelected(true);
    setSelectedIndex(index);
    setStage('selected');

    // Flip após 500ms (AnimatePresence + react-card-flip)
    setTimeout(() => {
      setIsFlipped(true);
    }, 500);

    // Callback para o chat continuar após 1.8s (flip visível + wowing)
    setTimeout(() => {
      onSelect(spreadCards[index]);
    }, 1800);
  }, [stage, alreadySelected, spreadCards, onSelect]);

  // ─────────────────────────────────────────────────────────
  // RENDER — FASE EMBARALHAR
  // ─────────────────────────────────────────────────────────

  if (stage === 'shuffle') {
    return (
      <div className={styles.tarotContainer} aria-label="Embaralhando as cartas">
        <p className={styles.tarotHint}>🔮 Canalizando a energia...</p>

        {/* Pilha de cartas embaralhando */}
        <div className={styles.shufflePile}>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.shuffleCard}
              style={{ zIndex: 5 - i }}
              animate={{
                x: [0, -18 + i * 3, 18 - i * 3, -10, 10, 0],
                rotate: [0, -6 + i, 6 - i, -3, 3, 0],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.08,
              }}
            >
              <CardBack />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // RENDER — FASE DISTRIBUIR / SELEÇÃO
  // ─────────────────────────────────────────────────────────

  return (
    <div className={styles.tarotContainer}>

      {/* Instrução — desaparece quando carta for selecionada */}
      <AnimatePresence>
        {stage === 'spread' && (
          <motion.p
            className={styles.tarotHint}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            🌙 Concentre-se... e escolha sua carta
          </motion.p>
        )}
      </AnimatePresence>

      {/* Grade de cartas */}
      <div className={styles.spreadRow}>
        {spreadCards.map((card, index) => {
          const isSelected = selectedIndex === index;
          const isDimmed = selectedIndex !== null && !isSelected;

          return (
            <motion.div
              key={card.id}
              className={styles.cardWrapper}
              // Entrada com stagger (uma por vez)
              initial={{ opacity: 0, y: 40 }}
              animate={{
                opacity: isDimmed ? 0.2 : 1,
                y: 0,
                scale: isSelected ? 1 : isDimmed ? 0.92 : 1,
              }}
              transition={{
                opacity: { duration: 0.6, delay: index * 0.18 },
                y: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.18 },
                scale: { duration: 0.4, ease: 'easeOut' },
              }}
              onClick={() => handleCardClick(index)}
              whileHover={stage === 'spread' ? { scale: 1.06, y: -6 } : {}}
              style={{ cursor: stage === 'spread' ? 'pointer' : 'default' }}
              aria-label={stage === 'selected' ? undefined : `Escolher carta ${index + 1}`}
            >
              {/* Efeito de glow ao hover (apenas no spread) */}
              {stage === 'spread' && (
                <div className={styles.cardHoverGlow} />
              )}

              {/* Flip animado — verso/frente */}
              <motion.div
                className={styles.cardInner}
                animate={isSelected ? { scale: 1.55 } : { scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ReactCardFlip isFlipped={isFlipped && isSelected} flipDirection="horizontal">
                  {/* VERSO */}
                  <CardBack />
                  {/* FRENTE */}
                  <CardFront card={card} />
                </ReactCardFlip>
              </motion.div>

              {/* Número da carta */}
              {stage === 'spread' && (
                <span className={styles.cardNumber}>{index + 1}</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Mensagem após seleção */}
      <AnimatePresence>
        {stage === 'selected' && (
          <motion.p
            className={styles.tarotHint}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ color: '#FFD700' }}
          >
            ✨ Revelando sua carta...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TarotSpread;
