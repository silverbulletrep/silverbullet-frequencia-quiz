import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './WomenSuccess.module.scss';
import { asset } from '@/lib/asset';
import { buildRouteStep, createFunnelTracker, getDefaultBaseUrl, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, readStoredCountry } from '../lib/funnelTracker';
import { usePrefetch } from '../hooks/usePrefetch';

const DEBUG = import.meta.env.DEV

const tracker = createFunnelTracker({
  baseUrl: getDefaultBaseUrl(),
  funnelId: QUIZ_FUNNEL_ID,
  getCountry: () => readStoredCountry() || undefined,
  debug: import.meta.env.DEV
})

const MenSuccess = () => {
  const { t } = useTranslation();
  const [showPhoneModal, setShowPhoneModal] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const prefetchPath = usePrefetch();
  const stepViewSentRef = useRef(false)

  useEffect(() => {
    if (stepViewSentRef.current) return
    stepViewSentRef.current = true
    void tracker.stepView(buildRouteStep('/men-success', QUIZ_PROGRESS_STEPS.proofMen, 'Prova Social Homem'))
  }, [])

  useEffect(() => {
    const operacao = 'men_success.hide_phone_modal_on_entry';
    const dados_entrada = { pathname: window.location.pathname };
    try {
      if (DEBUG) console.log(`[MEN_SUCCESS] Iniciando operação: ${operacao}`, { dados_entrada });
      setShowPhoneModal(false);
      if (DEBUG) {
        console.log('[MEN_SUCCESS] Operação concluída com sucesso:', {
          id_resultado: 'phone_modal_hidden',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`[MEN_SUCCESS] Erro na operação: ${error.message}`, {
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

  const handleContinue = () => {
    const operacao = 'men_success.handle_continue';
    const dados_entrada = { targetRoute: '/morning-feeling' };
    try {
      if (DEBUG) console.log(`[MEN_SUCCESS] Iniciando operação: ${operacao}`, { dados_entrada });
      navigate('/morning-feeling');
      if (DEBUG) console.log('[MEN_SUCCESS] navigate() executado com sucesso');
      setTimeout(() => {
        if (window.location.pathname === '/men-success') {
          if (DEBUG) console.log('[MEN_SUCCESS] Fallback: usando window.location.href');
          window.location.href = asset('/morning-feeling');
        }
      }, 100);
    } catch (error) {
      console.error(`[MEN_SUCCESS] Erro na operação: ${error?.message}`, {
        dados_entrada,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      });
      window.location.href = asset('/morning-feeling');
    }
  };

  const benefits = [
    { emoji: '❤️', text: t('quiz.success_page.benefits.connection'), type: 'conexao' },
    { emoji: '⚡', text: t('quiz.success_page.benefits.manifestation'), type: 'manifestacao' },
    { emoji: '✨', text: t('quiz.success_page.benefits.magnetism'), type: 'atracao' },
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
                  <span className={styles.a12MilhEsDeMulheres}><span>{t('quiz.success_page.men_title_part1')} {t('quiz.success_page.men_title_part2')}</span></span>
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
                src={asset('/img/homens-reunidos.webp')}
                className={styles.womenImage}
                alt={t('quiz.success_page_alt.men_image')}
                width="640"
                height="1054"
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

export default MenSuccess;
