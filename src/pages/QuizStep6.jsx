import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './QuizStep6.module.scss';
import ui from '@/styles/QuizUI.module.scss';
import { leadCache } from '../lib/leadCache';
import { logQuizProgress } from '../lib/leadTracker';
import { buildRouteStep, createFunnelTracker, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, getDefaultBaseUrl, readStoredCountry, shouldSendEvent } from '../lib/funnelTracker';
import { useExitIntent } from '../hooks/useExitIntent';

const DEBUG = import.meta.env.DEV

const QuizStep6 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [answers, setAnswers] = useState({});
  const freqIndex = 6;
  const freqTotal = 7;

  useExitIntent();

  useEffect(() => {
    const run = () => {
      Promise.allSettled([
        import('./ProcessingPage'),
      ]).catch(() => undefined)
    }

    try {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(run, { timeout: 1200 })
        return
      }
    } catch {
      void 0
    }

    const t = window.setTimeout(run, 400)
    return () => {
      try { clearTimeout(t) } catch { void 0 }
    }
  }, [])

  useEffect(() => {
    const tracker = createFunnelTracker({
      baseUrl: getDefaultBaseUrl(),
      funnelId: QUIZ_FUNNEL_ID,
      getCountry: () => readStoredCountry() || undefined,
      debug: DEBUG
    });

    const step = buildRouteStep('/quiz-step-6', QUIZ_PROGRESS_STEPS.quizStep6);
    if (shouldSendEvent('step_view:/quiz-step-6')) {
      tracker.stepView(step).catch((err) => {
        console.error('[QUIZ_STEP6] Erro ao enviar step_view:', err);
      });
    }
  }, [])

  // Perguntas específicas para cada problema selecionado
  const question = {
    id: 'q6_corpo_humor_impede',
    title: t('quiz.step6.q6_corpo_humor_impede.title'),
    subtitle: '',
    options: [
      { key: 'sim_perdi_ritmo', emoji: '😣', text: t('quiz.step6.q6_corpo_humor_impede.options.sim_perdi_ritmo') },
      { key: 'muitas_vezes_limitado', emoji: '🍃', text: t('quiz.step6.q6_corpo_humor_impede.options.muitas_vezes_limitado') },
      { key: 'as_vezes_desanimo', emoji: '🧩', text: t('quiz.step6.q6_corpo_humor_impede.options.as_vezes_desanimo') },
      { key: 'raramente_afeta_muito', emoji: '🫥', text: t('quiz.step6.q6_corpo_humor_impede.options.raramente_afeta_muito') }
    ]
  };

  const handleOptionClick = (optionKey) => {
    const newAnswers = { ...answers, [question.id]: optionKey };
    setAnswers(newAnswers);

    if (DEBUG) console.log(`[QUIZ_STEP6] Pergunta respondida`, { qid: question.id, optionKey });
    try {
      // Armazena respostas "raw" e Q&A detalhado
      leadCache.setEtapa('CP03 - Quiz');
      leadCache.mergeQuizAnswers(newAnswers);
      leadCache.saveQAsForStep('quiz_step_6', [question], newAnswers);
      logQuizProgress();
      
      const selectedOption = question.options.find(opt => opt.key === optionKey)
      if (selectedOption) {
        const tracker = createFunnelTracker({
          baseUrl: getDefaultBaseUrl(),
          funnelId: QUIZ_FUNNEL_ID,
          getCountry: () => readStoredCountry() || undefined,
          debug: DEBUG
        });
        const step = { id: '/quiz-step-6', index: 12, name: 'questionario 6' };
        tracker.desireSelectedWithStep(step, {
          desire: selectedOption.text,
          question: question.title,
          response: [selectedOption.text]
        }).catch((err) => {
          console.error('[QUIZ_STEP6] Erro ao enviar desire_selected:', err);
        });
      }
    } catch (e) {
      console.warn('[QUIZ_STEP6] Falha ao salvar no leadCache:', e);
    }
    
    // Combinar respostas anteriores com as atuais
    const allAnswers = {};
    searchParams.forEach((value, key) => {
      allAnswers[key] = value;
    });
    Object.assign(allAnswers, newAnswers);
    
    const queryParams = new URLSearchParams(allAnswers).toString();
    navigate(`/processing?${queryParams}`);
  };

  

  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  return (
    <div className={`${styles.httpsSignupSpiriohub} ${isAndroid ? styles.android : ''}`}>
      <div className={styles.background}>
        <div className={styles.container5}>
          <div className={styles.container4}>
            <div className={styles.container3}>
            </div>
          </div>
          
        </div>
        
          <div className={`${ui.content} ${ui.contentTop}`}>
            <h2 className={ui.question}>{question.title}</h2>
            {question.subtitle && <p className={ui.subtitle}>{question.subtitle}</p>}
            <div className={ui.options}>
              {question.options.map((option) => (
                <button
                  type="button"
                  key={option.key}
                  className={ui.optionButton}
                  onClick={() => handleOptionClick(option.key)}
                  aria-label={option.text}
                >
                  <span className={ui.optionEmoji}>{option.emoji}</span>
                  <span className={ui.optionText}>{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        
      </div>
    </div>
  );
};

export default QuizStep6;
