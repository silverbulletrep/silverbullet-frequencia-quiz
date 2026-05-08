import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './WomenSuccess.module.scss';
import { asset } from '@/lib/asset'
import { withTrackingParams } from '@/lib/trackingParams'
import { buildRouteStep, createFunnelTracker, getDefaultBaseUrl, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, readStoredCountry } from '../lib/funnelTracker';
import { usePrefetch } from '../hooks/usePrefetch';

const DEBUG = import.meta.env.DEV

const tracker = createFunnelTracker({
  baseUrl: getDefaultBaseUrl(),
  funnelId: QUIZ_FUNNEL_ID,
  getCountry: () => readStoredCountry() || undefined,
  debug: import.meta.env.DEV
})

const WomenSuccess = () => {
  const { t } = useTranslation();
  const [showPhoneModal, setShowPhoneModal] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  if (DEBUG) {
    console.log('[WOMEN_SUCCESS] Componente renderizado:', {
      timestamp: new Date().toISOString(),
      location: window.location.href
    });
  }

  const navigate = useNavigate();
  const prefetchPath = usePrefetch();
  if (DEBUG) console.log('[WOMEN_SUCCESS] useNavigate inicializado:', { navigate: !!navigate });
  const stepViewSentRef = useRef(false)

  useEffect(() => {
    if (stepViewSentRef.current) return
    stepViewSentRef.current = true
    void tracker.stepView(buildRouteStep('/women-success', QUIZ_PROGRESS_STEPS.proofWomen, 'Prova Social Mulher'))
  }, [])

  useEffect(() => {
    const operacao = 'women_success.hide_phone_modal_on_entry';
    const dados_entrada = { pathname: window.location.pathname };
    try {
      if (DEBUG) console.log(`[WOMEN_SUCCESS] Iniciando operação: ${operacao}`, { dados_entrada });
      setShowPhoneModal(false);
      if (DEBUG) {
        console.log('[WOMEN_SUCCESS] Operação concluída com sucesso:', {
          id_resultado: 'phone_modal_hidden',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`[WOMEN_SUCCESS] Erro na operação: ${error.message}`, {
        dados_entrada,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const handleBack = () => {
    if (DEBUG) console.log('[WOMEN_SUCCESS] handleBack chamado');
    navigate(withTrackingParams('/age-selection-women'));
  };

  const handleContinue = () => {
    if (DEBUG) {
      console.log('[WOMEN_SUCCESS] handleContinue INICIADO:', {
        timestamp: new Date().toISOString(),
        targetRoute: '/morning-feeling'
      });
    }

    try {
      // Navegar para a página de sentimentos matinais
      navigate(withTrackingParams('/morning-feeling'));
      if (DEBUG) console.log('[WOMEN_SUCCESS] navigate() executado com sucesso');

      // Fallback caso o navigate não funcione
      setTimeout(() => {
        if (window.location.pathname === '/women-success') {
          if (DEBUG) console.log('[WOMEN_SUCCESS] Fallback: usando window.location.href');
          window.location.href = withTrackingParams(asset('/morning-feeling'));
        }
      }, 100);

    } catch (error) {
      console.error('[WOMEN_SUCCESS] ERRO ao executar navigate():', error);
      // Fallback em caso de erro
      if (DEBUG) console.log('[WOMEN_SUCCESS] Usando fallback window.location.href devido ao erro');
      window.location.href = withTrackingParams(asset('/morning-feeling'));
    }
  };

  // Benefícios compactos com animação em ticker (sem prefixo repetitivo)
  const benefits = [
    // Fortes: conexão, manifestação e atração primeiro
    { emoji: '❤️', text: t('quiz.success_page.benefits.connection'), type: 'conexao' },
    { emoji: '⚡', text: t('quiz.success_page.benefits.manifestation'), type: 'manifestacao' },
    { emoji: '✨', text: t('quiz.success_page.benefits.magnetism'), type: 'atracao' },
    // Demais benefícios
    { emoji: '💶', text: t('quiz.success_page.benefits.finance'), type: 'abundancia' },
    { emoji: '💶', text: t('quiz.success_page.benefits.abundance'), type: 'abundancia' },
    { emoji: '🕊️', text: t('quiz.success_page.benefits.calm'), type: 'calma' },
    { emoji: '🕊️', text: t('quiz.success_page.benefits.cycles'), type: 'ciclos' },
    { emoji: '🤕', text: t('quiz.success_page.benefits.anxiety'), type: 'saude' },
    { emoji: '🤕', text: t('quiz.success_page.benefits.body'), type: 'saude' },
  ];
  const [benefitIndex, setBenefitIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setBenefitIndex((i) => (i + 1) % benefits.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const handlePhoneSubmit = () => {
    const operacao = 'women_success.modal_continue';
    const dados_entrada = { benefitIndex };
    try {
      if (DEBUG) console.log(`[WOMEN_SUCCESS] Iniciando operação: ${operacao}`, { dados_entrada });
      setSubmitting(true);
      setShowPhoneModal(false);
      if (DEBUG) {
        console.log('[WOMEN_SUCCESS] Operação concluída com sucesso:', {
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(`[WOMEN_SUCCESS] Erro na operação: ${err?.message}`, {
        dados_entrada,
        stack: err?.stack,
        timestamp: new Date().toISOString(),
      });
      throw err;
    }
  };

  return (
    
      <div className={styles.signupSpiriohubComEn}>
        <div className={styles.background}>
          <div className={`${styles.mainContent} ${showPhoneModal ? styles.blurred : ''}`}>
            <div className={styles.container3}>
              <div className={styles.container2}>
              </div>
            </div>
            <div className={styles.container5}>
              <div className={styles.container4}>
                <p className={styles.a12MilhEsDeMulheres3}>
                  <span className={styles.a12MilhEsDeMulheres}><span>{t('quiz.success_page.women_title_part1')} {t('quiz.success_page.women_title_part2')}</span></span>
                  <span className={styles.a12MilhEsDeMulheres}><span>&nbsp;{t('quiz.success_page.subtitle')}</span></span>
                </p>
                <p className={styles.vibraEsElevadasComSp}>{t('quiz.success_page.benefits_intro')}</p>

                <div className={styles.benefitsContainer}>
                  {(() => {
                    const current = benefits[benefitIndex];
                    const isStrong = ['conexao', 'manifestacao', 'atracao'].includes(current.type);
                    return (
                      <div
                        key={benefitIndex}
                        className={`${styles.benefitItem} ${isStrong ? styles.benefitItemStrong : ''}`}
                      >
                        <span className={styles.benefitEmoji}>{current.emoji}</span>
                        <span className={styles.benefitText}>{current.text}</span>
                      </div>
                    );
                  })()}
                  <div className={styles.benefitsDots}>
                    {benefits.map((b, idx) => {
                      const isActive = idx === benefitIndex;
                      const isStrong = ['conexao', 'manifestacao', 'atracao'].includes(b.type);
                      const activeClass = isActive ? (isStrong ? styles.activeDotStrong : styles.activeDot) : '';
                      return (
                        <span key={idx} className={`${styles.dot} ${activeClass}`} />
                      );
                    })}
                  </div>
                </div>
              </div>
              <img
                src={asset('/.figma/image/mg0a7uxw-5wc7hzw.webp')}
                className={styles.womenImage}
                alt={t('quiz.success_page_alt.women_image')}
                width="593"
                height="788"
                fetchpriority="high"
                loading="eager"
              />

            </div>
            <div className={styles.container7}>
              <div className={styles.horizontalDivider} />
              <div className={styles.container6}></div>
            </div>
          </div>

          <div className={styles.ctaSpacer} />
          <div className={styles.stickyCtaBar}>
            <button
              className={styles.ctaAction}
              onClick={handleContinue}
              onPointerDown={() => prefetchPath('/morning-feeling')}
              aria-label={t('quiz.success_page.button_continue')}
            >
              {t('quiz.success_page.button_continue')}
            </button>
          </div>

          {showPhoneModal && (
            <div className={styles.phoneModalOverlay}>
              <div className={styles.phoneModal}>
                <div className={styles.phoneModalHeader}>
                  <p className={styles.phoneModalTitle}>
                    <span className={styles.titleLead}>{t('quiz.success_page.modal.title_lead')}</span> {t('quiz.success_page.modal.title_suffix')}
                  </p>
                </div>
                <div className={styles.phoneModalContent}>
                  <div className={styles.benefitsContainer}>
                    <div className={styles.benefitLead}>{t('quiz.success_page.modal.lead')}</div>
                    {(() => {
                      const current = benefits[benefitIndex];
                      const isStrong = ['conexao', 'manifestacao', 'atracao'].includes(current.type);
                      return (
                        <div
                          key={benefitIndex}
                          className={`${styles.benefitItem} ${isStrong ? styles.benefitItemStrong : ''}`}
                        >
                          <span className={styles.benefitEmoji}>{current.emoji}</span>
                          <span className={styles.benefitText}>{current.text}</span>
                        </div>
                      );
                    })()}
                    <div className={styles.benefitsDots}>
                      {benefits.map((b, idx) => {
                        const isActive = idx === benefitIndex;
                        const isStrong = ['conexao', 'manifestacao', 'atracao'].includes(b.type);
                        const activeClass = isActive ? (isStrong ? styles.activeDotStrong : styles.activeDot) : '';
                        return (
                          <span key={idx} className={`${styles.dot} ${activeClass}`} />
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className={styles.phoneModalButton}>
                  <div
                    className={`${styles.continueButton} ${styles.active}`}
                    onClick={handleContinue}
                    onPointerDown={() => prefetchPath('/morning-feeling')}
                  >
                    <p className={styles.continueText}>{submitting ? t('quiz.success_page.button_sending') : t('quiz.success_page.button_continue')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    
  );
};

export default WomenSuccess;
