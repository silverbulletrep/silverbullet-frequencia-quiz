import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { createFunnelTracker, QUIZ_FUNNEL_ID, getDefaultBaseUrl, readStoredCountry, buildRouteStep, QUIZ_PROGRESS_STEPS, shouldSendEvent } from '../../lib/funnelTracker';
import styles from './SurpriseGiftModal.module.scss';

const SURPRISE_MODAL_PHASES = {
  IDENTIFICATION: 1,
  ACCELERATION: 2,
  STEPS: 3,
  GIFT_ANIMATION: 3.5,
  OFFER: 4
};

const ProgressStepper = ({ currentPhase }) => {
  const visualPhase = currentPhase === SURPRISE_MODAL_PHASES.GIFT_ANIMATION ? 4 : currentPhase;
  const progressPercentage = ((Math.max(1, visualPhase) - 1) / 3) * 100;
  
  return (
    <div className={styles.stepperContainer}>
      <div className={styles.progressBarBg}>
        <motion.div 
          className={styles.progressBarFill}
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
      <div className={styles.stepperNodes}>
        {[1, 2, 3, 4].map(num => {
          const isActive = visualPhase >= num;
          const isGift = num === 4;
          return (
            <div key={num} className={`${styles.stepNodeContainer} ${isActive ? styles.activeNode : ''}`}>
              {isGift ? (
                <div className={`${styles.giftNode} ${isActive ? styles.giftActive : ''}`}>
                  <svg viewBox="0 0 24 24" className={styles.giftIcon} fill="currentColor">
                    <path d="M22 6h-4.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C11.96 2.54 11.05 2 10 2 8.34 2 7 3.34 7 5c0 .35.07.69.18 1H3c-1.11 0-1.99.89-1.99 2L1 19c0 1.11.89 2 2 2h18c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-7-2c.55 0 1 .45 1 1s-.45 1-1 1h-5v-2h5zM10 4c.55 0 1 .45 1 1h-5c0-.55.45-1 1-1zm12 15H3v-2h19v2zm0-5H3V8h6.08L7 10.83 8.62 12 12 8.76 13 7.4l1 1.36L16.38 12 18 10.83 15.92 8H22v6z" />
                  </svg>
                </div>
              ) : (
                <div className={styles.normalNode}>
                  {isActive && <div className={styles.innerDot} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.8,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const DUAL_CURVE_CHART_HEIGHT = 150;
const DUAL_CURVE_CHART_WIDTH = 300;

const DualCurveChart = () => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.chartContainer}>
      <svg 
        viewBox={`0 0 ${DUAL_CURVE_CHART_WIDTH} ${DUAL_CURVE_CHART_HEIGHT}`} 
        className={styles.chartSvg}
      >
        {/* Y Axis */}
        <line x1="40" y1="10" x2="40" y2="130" stroke="#4a5568" strokeWidth="1" />
        <text x="5" y="20" className={styles.chartAxisLabel}>800</text>
        <text x="5" y="55" className={styles.chartAxisLabel}>600</text>
        <text x="5" y="90" className={styles.chartAxisLabel}>400</text>
        <text x="5" y="125" className={styles.chartAxisLabel}>200</text>
        
        {/* X Axis */}
        <line x1="40" y1="130" x2="280" y2="130" stroke="#4a5568" strokeWidth="1" />
        <text x="40" y="145" className={styles.chartAxisLabel}>0</text>
        <text x="110" y="145" className={styles.chartAxisLabel}>10</text>
        <text x="180" y="145" className={styles.chartAxisLabel}>20</text>
        <text x="250" y="145" className={styles.chartAxisLabel}>30 {t('surprise_modal.phase2.chart_x_label').split('(')[1]?.replace(')', '') || 'd'}</text>

        {/* Normal Curve (Blue) - Flat/Low */}
        <motion.path
          d="M 40 120 Q 150 115 280 118"
          fill="transparent"
          stroke="#3b82f6"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <text x="180" y="110" className={styles.curveLabelBlue}>{t('surprise_modal.phase2.chart_label_normal')}</text>

        {/* Gift Curve (Green) - Exponential */}
        <motion.path
          d="M 40 120 Q 150 100 280 20"
          fill="transparent"
          stroke="#10b981"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        />
        <text x="160" y="45" className={styles.curveLabelGreen}>{t('surprise_modal.phase2.chart_label_gift')}</text>
      </svg>
    </div>
  );
};

const MiniCard = ({ label, value, iconType, isUrgency = false, variant = '' }) => {
  return (
    <motion.div 
      className={`${styles.miniCard} ${isUrgency ? styles.miniCardUrgency : ''} ${variant ? styles[variant] : ''}`} 
      variants={cardVariants}
    >
      <div className={`${styles.iconBox} ${styles[iconType]}`}>
        {iconType === 'age' && <span className={styles.emoji}>🎂</span>}
        {iconType === 'gender' && <span className={styles.emoji}>👤</span>}
        {iconType === 'goal' && <span className={styles.emoji}>🎯</span>}
        {iconType === 'participants' && <span className={styles.emoji}>👥</span>}
        {iconType === 'slots' && <span className={styles.emoji}>⚠️</span>}
        {iconType === 'access' && <span className={styles.emoji}>⚡</span>}
      </div>
      <div className={styles.cardContent}>
        <span className={styles.cardLabel}>{label}</span>
        <span className={styles.cardValue}>{value}</span>
      </div>
    </motion.div>
  );
};

const SurpriseGiftModal = ({ 
  open, 
  onClose, 
  onRedirectChat, 
  leadData = {}, 
  isPtRoute = false 
}) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState(SURPRISE_MODAL_PHASES.IDENTIFICATION);
  
  // Estados dinâmicos conforme notas.md
  const [participants, setParticipants] = useState(109);
  const [slots, setSlots] = useState(9);

  // Lógica de simulação "viva"
  useEffect(() => {
    if (!open) {
      setParticipants(109);
      setSlots(9);
      return;
    }

    // 1. Participantes oscilam (Simula tráfego real com altos e baixos)
    const partInterval = setInterval(() => {
      setParticipants(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        // Mantém entre 105 e 118 para manter a urgência
        return (next > 118 || next < 105) ? prev : next;
      });
    }, 3000);

    // 2. Vagas diminuem em tempos fixos (Urgência Real)
    const slotTimer1 = setTimeout(() => setSlots(8), 30000); // 30s
    const slotTimer2 = setTimeout(() => setSlots(7), 90000); // 1:30m (30s + 60s)

    return () => {
      clearInterval(partInterval);
      clearTimeout(slotTimer1);
      clearTimeout(slotTimer2);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPhase(SURPRISE_MODAL_PHASES.IDENTIFICATION);
    } else {
      try {
        if (shouldSendEvent('surprise_opened_event')) {
          const tracker = createFunnelTracker({
            baseUrl: getDefaultBaseUrl(),
            funnelId: QUIZ_FUNNEL_ID,
            getCountry: () => readStoredCountry() || undefined
          });
          const step = buildRouteStep('/fim', QUIZ_PROGRESS_STEPS.fim);
          tracker.customEvent('surprise_opened', step);
        }
      } catch(e) { console.error(e) }
    }
  }, [open]);

  // Lógica de tempo apenas para a animação do presente
  useEffect(() => {
    if (phase === SURPRISE_MODAL_PHASES.GIFT_ANIMATION) {
      const timer = setTimeout(() => setPhase(SURPRISE_MODAL_PHASES.OFFER), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const extractedData = useMemo(() => {
    const data = leadData || {};
    const g = data.genero || 'mulher';
    const rawOpt = data.selected_option || data.problema_principal || 'other';
    const opt = (Array.isArray(rawOpt) ? (rawOpt[0] || 'other') : String(rawOpt)).toLowerCase();
    const desireKey = ['abundance', 'attract', 'healing', 'energy'].includes(opt) ? opt : 'other';
    const ageVal = Number(data.idade || 0);

    return {
      age: ageVal ? `${ageVal} ${isPtRoute ? 'anos' : 'Jahre'}` : '---',
      gender: t(`surprise_modal.phase1.gender_map.${g}`),
      goal: t(`surprise_modal.phase1.goal_map.${desireKey}`)
    };
  }, [leadData, t]);

  const nextPhase = () => {
    if (phase === SURPRISE_MODAL_PHASES.STEPS) {
      setPhase(SURPRISE_MODAL_PHASES.GIFT_ANIMATION);
    } else if (phase < SURPRISE_MODAL_PHASES.STEPS) {
      setPhase(prev => prev + 1);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={() => onClose()}>
      <motion.div 
        className={styles.modalBox}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <ProgressStepper currentPhase={phase} />
        {phase < SURPRISE_MODAL_PHASES.OFFER && (
          <header className={styles.modalHeader}>
            <h2 className={styles.persistentHeadline}>
              <span className={styles.highlight}>{t('surprise_modal.headline')}</span> {t('surprise_modal.subheadline')}
            </h2>
          </header>
        )}

        <div className={styles.contentArea}>
          <AnimatePresence mode="wait">
            {phase === SURPRISE_MODAL_PHASES.IDENTIFICATION && (
              <motion.div 
                key="phase1"
                className={styles.phaseContainer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className={styles.phaseText}>{t('surprise_modal.phase1.subhead')}</p>
                
                <motion.div 
                  className={styles.miniCardsGrid}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <MiniCard label={t('surprise_modal.phase1.card_age')} value={extractedData.age} iconType="age" />
                  <MiniCard label={t('surprise_modal.phase1.card_gender')} value={extractedData.gender} iconType="gender" />
                  <MiniCard label={t('surprise_modal.phase1.card_goal')} value={extractedData.goal} iconType="goal" />
                </motion.div>
              </motion.div>
            )}

            {phase === SURPRISE_MODAL_PHASES.ACCELERATION && (
              <motion.div 
                key="phase2"
                className={styles.phaseContainer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className={styles.phaseText}>
                  {t('surprise_modal.phase2.subhead', { slots: slots })}
                </p>

                <div className={styles.badgeRow}>
                  <span className={styles.redBadge}>
                    {t('surprise_modal.phase2.badge_participants', { count: participants })}
                  </span>
                </div>
                
                <DualCurveChart />
              </motion.div>
            )}

            {phase === SURPRISE_MODAL_PHASES.STEPS && (
              <motion.div 
                key="phase3"
                className={styles.phaseContainer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className={styles.localSubhead}>{t('surprise_modal.phase3.subhead')}</h3>
                
                <motion.div 
                  className={styles.stepsList}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[1, 2, 3].map((num) => (
                    <motion.div 
                      key={num} 
                      className={styles.stepItem}
                      variants={cardVariants}
                    >
                      <div className={styles.stepNumber}>{num}</div>
                      <p dangerouslySetInnerHTML={{ __html: t(`surprise_modal.phase3.step${num}`) }} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {phase === SURPRISE_MODAL_PHASES.GIFT_ANIMATION && (
              <motion.div
                key="phase-gift-anim"
                className={styles.giftAnimationContainer}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={styles.confettiWrapper}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className={styles.confettiL}>🎉</span>
                  <svg viewBox="0 0 24 24" className={styles.bigGiftIcon} fill="currentColor">
                    <path d="M22 6h-4.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C11.96 2.54 11.05 2 10 2 8.34 2 7 3.34 7 5c0 .35.07.69.18 1H3c-1.11 0-1.99.89-1.99 2L1 19c0 1.11.89 2 2 2h18c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-7-2c.55 0 1 .45 1 1s-.45 1-1 1h-5v-2h5zM10 4c.55 0 1 .45 1 1h-5c0-.55.45-1 1-1zm12 15H3v-2h19v2zm0-5H3V8h6.08L7 10.83 8.62 12 12 8.76 13 7.4l1 1.36L16.38 12 18 10.83 15.92 8H22v6z" />
                  </svg>
                  <span className={styles.confettiR}>🎊</span>
                </motion.div>
              </motion.div>
            )}

            {phase === SURPRISE_MODAL_PHASES.OFFER && (
              <motion.div 
                key="phase4"
                className={styles.phaseContainer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className={styles.localSubhead}>{t('surprise_modal.phase4.subhead')}</h3>
                
                <motion.div 
                  className={styles.miniCardsGrid}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <MiniCard label={t('surprise_modal.phase4.card_participants')} value={participants.toLocaleString(isPtRoute ? 'pt-BR' : 'de-DE')} iconType="participants" isUrgency variant="red" />
                  <MiniCard label={t('surprise_modal.phase4.card_slots')} value={slots} iconType="slots" isUrgency variant="red" />
                  <MiniCard label={t('surprise_modal.phase4.card_access')} value={t('surprise_modal.phase4.card_access_value')} iconType="access" isUrgency variant="green" />
                </motion.div>

                <div className={styles.actions}>
                  <button 
                    className={styles.ctaPrimary}
                    onClick={() => {
                      onClose();
                    }}
                  >
                    {t('surprise_modal.phase4.cta_primary')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className={styles.modalFooter}>
          {phase < SURPRISE_MODAL_PHASES.GIFT_ANIMATION && (
            <button 
              className={styles.ctaContinue}
              onClick={(e) => {
                e.stopPropagation();
                nextPhase();
              }}
            >
              {isPtRoute ? "Continuar" : "Weiter"} ➔
            </button>
          )}
        </footer>
      </motion.div>
    </div>
  );
};

export default SurpriseGiftModal;
