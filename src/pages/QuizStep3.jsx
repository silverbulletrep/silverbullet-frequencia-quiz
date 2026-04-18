import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './QuizStep3.module.scss';
import ui from '@/styles/QuizUI.module.scss';
import { leadCache } from '../lib/leadCache';
import { logQuizProgress } from '../lib/leadTracker';
import { asset } from '@/lib/asset';
import { buildRouteStep, createFunnelTracker, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, getDefaultBaseUrl, readStoredCountry, shouldSendEvent } from '../lib/funnelTracker';
import { useExitIntent } from '../hooks/useExitIntent';

const DEBUG = import.meta.env.DEV

const QuizStep3 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const freqIndex = 3;
  const freqTotal = 7;

  useExitIntent();

  useEffect(() => {
    const run = () => {
      Promise.allSettled([
        import('./QuizStep4'),
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
  }, []);

  useEffect(() => {
    const tracker = createFunnelTracker({
      baseUrl: getDefaultBaseUrl(),
      funnelId: QUIZ_FUNNEL_ID,
      getCountry: () => readStoredCountry() || undefined,
      debug: DEBUG
    });

    const step = buildRouteStep('/quiz-step-3', QUIZ_PROGRESS_STEPS.quizStep3);
    if (shouldSendEvent('step_view:/quiz-step-3')) {
      tracker.stepView(step).catch((err) => {
        console.error('[QUIZ_STEP3] Erro ao enviar step_view:', err);
      });
    }
  }, []);

  const questions = [
    {
      id: 'q3_evitar_encontros_financas',
      title: t('quiz.step3.q3_evitar_encontros_financas.title'),
      subtitle: '',
      options: [
        { key: 'sim_mexe_demais', emoji: '😬', text: t('quiz.step3.q3_evitar_encontros_financas.options.sim_mexe_demais') },
        { key: 'as_vezes_fujo', emoji: '😓', text: t('quiz.step3.q3_evitar_encontros_financas.options.as_vezes_fujo') },
        { key: 'detesto_quando_acontece', emoji: '🥺', text: t('quiz.step3.q3_evitar_encontros_financas.options.detesto_quando_acontece') },
        { key: 'nao_costumo', emoji: '🤷', text: t('quiz.step3.q3_evitar_encontros_financas.options.nao_costumo') }
      ]
    }
  ];

  const handleOptionClick = (optionKey) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: optionKey };
    setAnswers(newAnswers);

    if (DEBUG) console.log(`[QUIZ_STEP3] Pergunta respondida`, { qid: questions[currentQuestion].id, optionKey });

    const currentQ = questions[currentQuestion];
    const selectedOption = currentQ.options.find(opt => opt.key === optionKey);
    
    if (currentQ.title && selectedOption) {
      const tracker = createFunnelTracker({
        baseUrl: getDefaultBaseUrl(),
        funnelId: QUIZ_FUNNEL_ID,
        getCountry: () => readStoredCountry() || undefined,
        debug: DEBUG
      });
      const step = { id: '/quiz-step-3', index: 9, name: 'questionario 3' };
      tracker.desireSelectedWithStep(step, {
        desire: selectedOption.text,
        question: currentQ.title,
        response: [selectedOption.text]
      }).catch((err) => {
        console.error('[QUIZ_STEP3] Erro ao enviar desire_selected:', err);
      });
    }

    if (currentQuestion < questions.length - 1) {
      // Próxima pergunta
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Última pergunta, ir para próxima etapa
      if (DEBUG) console.log('[QUIZ_STEP3] Etapa 3 concluída, redirecionando para etapa 4');
      try {
        // Salva respostas brutas e Q&A detalhado (pergunta + resposta)
        leadCache.setEtapa('CP03 - Quiz');
        leadCache.mergeQuizAnswers(newAnswers);
        leadCache.saveQAsForStep('quiz_step_3', questions, newAnswers);
        logQuizProgress();
      } catch (e) {
        console.warn('[QUIZ_STEP3] Falha ao salvar no leadCache:', e);
      }
      
      // Combinar respostas anteriores com as atuais
      const allAnswers = {};
      searchParams.forEach((value, key) => {
        allAnswers[key] = value;
      });
      Object.assign(allAnswers, newAnswers);
      
      const queryParams = new URLSearchParams(allAnswers).toString();
      navigate(`/quiz-step-4?${queryParams}`);
    }
  };

  

  const currentQ = questions[currentQuestion];

  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  return (
    <div className={`${styles.httpsSignupSpiriohub} ${isAndroid ? styles.android : ''}`}>
      <div className={styles.background}>
        <div className={styles.container5}>
          <div className={styles.container4}>
            <div className={styles.container3}>
              <div className={styles.container2}>
                <img
                  src={asset('/.figma/image/mg2if5h6-xtt8jhz.svg')}
                  className={styles.component12}
                  alt="Spirio"
                />
                <div className={styles.verticalDivider} />
                <img
                  src={asset('/.figma/image/mg2if5h6-n93vrl1.svg')}
                  className={styles.component13}
                  alt="Quiz"
                />
              </div>
            </div>
            <p className={styles.a224}>{freqIndex}/{freqTotal}</p>
          </div>
          <div className={styles.horizontalDivider2}>
            <div className={styles.horizontalDivider} />
          </div>
        </div>
        
          <div className={`${ui.content} ${ui.contentTop}`}>
            <h2 className={ui.question}>{currentQ.title}</h2>
            {currentQ.subtitle && <p className={ui.subtitle}>{currentQ.subtitle}</p>}
            <div className={ui.options}>
              {currentQ.options.map((option) => (
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

export default QuizStep3;
