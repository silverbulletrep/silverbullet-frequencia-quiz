import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProcessingPage.module.scss';
import { asset } from '@/lib/asset';

// Componentes Core
import { TransitionFadeWrapper } from '../components/TransitionFadeWrapper';
import QuantumLoader from '../components/scanning/QuantumLoader';
import ProcessingSteps from '../components/scanning/ProcessingSteps';
import InsightFeed from '../components/scanning/InsightFeed';
import EnergyBars from '../components/scanning/EnergyBars';
import QuantumParticles from '../components/scanning/QuantumParticles';

// Libs e Dados
import { leadCache } from '../lib/leadCache';
import { PROCESSING_THEMES } from '../components/scanning/processingData';
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
import { withTrackingParams } from '../lib/trackingParams';

const DEBUG = import.meta.env.DEV;

// Constantes de assets baseadas no VSL
const isPtRoute = window.location.pathname.startsWith('/pt');
const expertImg = isPtRoute ? asset('/img/expert-pt.webp') : asset('/img/expert.webp');

const ProcessingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useExitIntent();

  // 1. Extração de Dados e Definição de Tema
  const leadData = useMemo(() => leadCache.getAll(), []);
  const rawThemeKey = leadData.selected_option || 'default';
  const themeKey = ['abundance', 'attract', 'healing', 'energy'].includes(rawThemeKey) ? rawThemeKey : 'default';
  const theme = PROCESSING_THEMES[themeKey] || PROCESSING_THEMES.default;

  const translatedInsights = useMemo(() => {
    return t(`processing.themes.${themeKey}.insights`, { returnObjects: true }) || theme.insights;
  }, [t, themeKey, theme.insights]);

  const translatedBars = useMemo(() => {
    const barsDict = t(`processing.themes.${themeKey}.energyBars`, { returnObjects: true });
    const configBars = { ...theme.energyBars };
    if (barsDict && typeof barsDict === 'object') {
      Object.keys(configBars).forEach(k => {
        if (barsDict[k]) {
          configBars[k] = { ...configBars[k], label: barsDict[k] };
        }
      });
    }
    return configBars;
  }, [t, themeKey, theme.energyBars]);

  // 2. Estados de Progressão
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [allGoalsCompleted, setAllGoalsCompleted] = useState(false);
  const [contactPromptClosed, setContactPromptClosed] = useState(false);
  const [showClickIndicator, setShowClickIndicator] = useState(false);

  // 3. Lógica de Tempo e Análise
  useEffect(() => {
    // Checkpoint 04: PréOffer
    leadCache.setEtapa('CP04 - PréOffer');

    const tracker = createFunnelTracker({
      baseUrl: getDefaultBaseUrl(),
      funnelId: QUIZ_FUNNEL_ID,
      getCountry: () => readStoredCountry() || undefined,
      debug: DEBUG
    });

    const step = buildRouteStep('/processing', QUIZ_PROGRESS_STEPS.processing);
    if (shouldSendEvent('step_view:/processing')) {
      tracker.stepView(step).catch((err) => console.error('[PROCESSING] Error step_view:', err));
    }

    // Override manual do botão voltar
    window.__br_interceptor = () => {
      return '/processing';
    };

    return () => { window.__br_interceptor = null; };
  }, [navigate]);

  useEffect(() => {
    if (allGoalsCompleted) return;

    // Pausa o progresso para o modal de contato aos 95% (se não fechado)
    if (currentProgress >= 95 && !contactPromptClosed) return;

    let animationFrameId;
    let startTime = null;
    const TOTAL_DURATION = 22000; // 22 segundos para uma análise profunda e legível
    const startFromProgress = currentProgress;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Calcula o progresso a partir de onde parou (importante para quando o modal fecha)
      const progressIncrement = (elapsed / TOTAL_DURATION) * 100;
      const newProgress = Math.min(startFromProgress + progressIncrement, 100);

      setCurrentProgress(newProgress);

      const stepIndex = Math.min(Math.floor((newProgress / 100) * theme.steps.length), theme.steps.length - 1);
      setCurrentGoalIndex(stepIndex);

      if (newProgress < 100) {
        // Se chegarmos no trigger do modal, paramos o loop para o re-render disparar a pausa
        if (newProgress >= 95 && !contactPromptClosed) {
           cancelAnimationFrame(animationFrameId);
           return;
        }
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setAllGoalsCompleted(true);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, [allGoalsCompleted, contactPromptClosed, theme.steps.length]);

  // Lógica para o indicador de clique (2s delay)
  useEffect(() => {
    if (allGoalsCompleted) {
      const timer = setTimeout(() => {
        setShowClickIndicator(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allGoalsCompleted]);

  const handleContinue = () => {
    setShowClickIndicator(false);
    
    // Feedback tátil leve para mobile (Clinical Luxury vibe)
    if (typeof window !== 'undefined' && 'navigator' in window && window.navigator.vibrate) {
      window.navigator.vibrate([10, 30, 10]);
    }
    
    navigate(withTrackingParams('/resultado'));
  };

  const showContactCard = currentProgress >= 95 && !contactPromptClosed && !allGoalsCompleted;
  const isHumanValidating = currentProgress >= 65 && currentProgress <= 80;

  return (
    <TransitionFadeWrapper>
      <div className={styles.processingPage}>
        <QuantumParticles />
        
        {/* Modal de Escolha de Resultado - Novo Design Limpo */}
        <AnimatePresence>
          {showContactCard && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.contactOverlay}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={styles.contactCard}
              >
                <div className={styles.contactTextContent}>
                  <h3 className={styles.contactTitle}>
                    {t('processing.contact_card.title')}
                  </h3>
                  <p className={styles.contactSubtext}>
                    {t('processing.contact_card.subtitle')}
                  </p>
                </div>
                
                <div className={styles.contactOptions}>
                  <button
                    type="button"
                    className={`${styles.contactOptionButton} ${styles.btnGmail}`}
                    onClick={() => {
                      leadCache.setContactPreference('email');
                      setContactPromptClosed(true);
                    }}
                  >
                    <svg className={styles.contactOptionIcon} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#FFFFFF" d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/>
                    </svg>
                    Gmail
                  </button>

                  <button
                    type="button"
                    className={`${styles.contactOptionButton} ${styles.btnWhatsapp}`}
                    onClick={() => {
                      leadCache.setContactPreference('whatsapp');
                      setContactPromptClosed(true);
                    }}
                  >
                    <svg className={styles.contactOptionIcon} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#25D366" d="M16 .396C7.163.396 0 7.559 0 16.396c0 2.889.756 5.602 2.072 7.948L.192 31.807l7.672-1.83a15.94 15.94 0 0 0 8.136 2.208c8.837 0 16-7.163 16-16S24.837.396 16 .396zm0 29.266a13.1 13.1 0 0 1-6.688-1.833l-.478-.284-4.551 1.085 1.216-4.437-.311-.459A13.1 13.1 0 0 1 2.9 16.396c0-7.226 5.874-13.1 13.1-13.1s13.1 5.874 13.1 13.1-5.874 13.1-13.1 13.1zm7.188-9.794c-.393-.197-2.324-1.146-2.684-1.277-.36-.131-.622-.197-.885.197s-1.016 1.277-1.246 1.539c-.229.262-.459.295-.852.098-.393-.197-1.66-.612-3.162-1.95-1.169-1.042-1.958-2.328-2.187-2.721-.229-.393-.024-.605.173-.802.177-.177.393-.459.59-.688.197-.229.262-.393.393-.655.131-.262.066-.492-.033-.688-.098-.197-.885-2.131-1.213-2.918-.32-.771-.645-.666-.885-.678l-.754-.013c-.262 0-.688.098-1.049.492s-1.377 1.344-1.377 3.277 1.41 3.802 1.606 4.065c.197.262 2.773 4.233 6.719 5.933.939.404 1.671.646 2.242.827.942.299 1.799.257 2.476.156.755-.113 2.324-.949 2.652-1.866.328-.918.328-1.705.229-1.866-.098-.164-.36-.262-.754-.459z"/>
                    </svg>
                    WhatsApp
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.container}>
          <div className={styles.mainContent}>
            
            {/* 1. Loader Central */}
            <div className="flex flex-col items-center">
              <QuantumLoader progress={currentProgress} />
              
              {/* 5. Estado Final (Botão abaixo do circulo) */}
              <AnimatePresence>
                {allGoalsCompleted && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.continueSection}
                  >
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
                        scale: [1, 1, 1.05, 1, 1], // Expande quando o dedo "pressiona" (time 0.6)
                      } : {}}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.4, 0.6, 0.8, 1]
                      }}
                    >
                      {t('processing.continue_button')}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Etapas de Análise (Removido visualmente a pedido do usuário) */}

            {/* 3. Validação Humana (Efeito de Equipe) */}
            <AnimatePresence>
              {isHumanValidating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="mt-2 flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-2 rounded-full"
                >
                  <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
                    {t('processing.human_validation')}
                  </span>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full bg-gray-500 border border-black/20 overflow-hidden">
                        <img src={`https://i.pravatar.cc/50?u=${i+10}`} alt="Equipe" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. Feed de Insights e Barras de Energia */}
            <div className="w-full flex flex-col items-center">
              <InsightFeed insights={translatedInsights} currentProgress={currentProgress} />
              <EnergyBars bars={translatedBars} progress={currentProgress} />
            </div>

            {/* Rodapé Sutil */}
            <div className="mt-8 [@media(max-height:700px)]:mt-4 opacity-30 text-white text-[10px] uppercase tracking-[0.2em] text-center">
              {t('processing.footer_line1')}<br/>
              {t('processing.footer_line2')}
            </div>

          </div>
        </div>
      </div>
    </TransitionFadeWrapper>
  );
};

export default ProcessingPage;
