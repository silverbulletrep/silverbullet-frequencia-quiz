import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './QuizStep5.module.scss';
import ui from '@/styles/QuizUI.module.scss';
import { leadCache } from '../lib/leadCache';
import { logQuizProgress } from '../lib/leadTracker';
import { buildRouteStep, createFunnelTracker, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, getDefaultBaseUrl, readStoredCountry, shouldSendEvent } from '../lib/funnelTracker';
import { useExitIntent } from '../hooks/useExitIntent';

const DEBUG = import.meta.env.DEV

const QuizStep5 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const freqIndex = 5;
  const freqTotal = 7;

  useExitIntent();

  useEffect(() => {
    const run = () => {
      Promise.allSettled([
        import('./QuizStep6'),
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

    const step = buildRouteStep('/quiz-step-5', QUIZ_PROGRESS_STEPS.quizStep5);
    if (shouldSendEvent('step_view:/quiz-step-5')) {
      tracker.stepView(step).catch((err) => {
        console.error('[QUIZ_STEP5] Erro ao enviar step_view:', err);
      });
    }
  }, [])

  const questions = [
    {
      id: 'q5_sozinho_sem_apoio',
      title: t('quiz.step5.q5_sozinho_sem_apoio.title'),
      subtitle: '',
      options: [
        { key: 'sim_magoa', emoji: '💔', text: t('quiz.step5.q5_sozinho_sem_apoio.options.sim_magoa') },
        { key: 'varias_vezes', emoji: '😞', text: t('quiz.step5.q5_sozinho_sem_apoio.options.varias_vezes') },
        { key: 'as_vezes_distancia', emoji: '🫠', text: t('quiz.step5.q5_sozinho_sem_apoio.options.as_vezes_distancia') },
        { key: 'pouco_doi', emoji: '😐', text: t('quiz.step5.q5_sozinho_sem_apoio.options.pouco_doi') }
      ]
    }
  ];

  const handleOptionClick = (optionKey) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: optionKey };
    setAnswers(newAnswers);

    if (DEBUG) console.log(`[QUIZ_STEP5] Pergunta respondida`, { qid: questions[currentQuestion].id, optionKey });

    const currentQ = questions[currentQuestion];
    const selectedOption = currentQ.options.find(opt => opt.key === optionKey);
    
    if (currentQ.title && selectedOption) {
      const tracker = createFunnelTracker({
        baseUrl: getDefaultBaseUrl(),
        funnelId: QUIZ_FUNNEL_ID,
        getCountry: () => readStoredCountry() || undefined,
        debug: DEBUG
      });
      const step = { id: '/quiz-step-5', index: 11, name: 'questionario 5' };
      tracker.desireSelectedWithStep(step, {
        desire: selectedOption.text,
        question: currentQ.title,
        response: [selectedOption.text]
      }).catch((err) => {
        console.error('[QUIZ_STEP5] Erro ao enviar desire_selected:', err);
      });
    }

    if (currentQuestion < questions.length - 1) {
      // Próxima pergunta
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Última pergunta, ir para próxima etapa
      if (DEBUG) console.log('[QUIZ_STEP5] Etapa 5 concluída, redirecionando para etapa 6');
      try {
        // Armazena respostas "raw" e Q&A detalhado
        leadCache.setEtapa('CP03 - Quiz');
        leadCache.mergeQuizAnswers(newAnswers);
        leadCache.saveQAsForStep('quiz_step_5', questions, newAnswers);
        logQuizProgress();
      } catch (e) {
        console.warn('[QUIZ_STEP5] Falha ao salvar no leadCache:', e);
      }
      
      // Combinar respostas anteriores com as atuais
      const allAnswers = {};
      searchParams.forEach((value, key) => {
        allAnswers[key] = value;
      });
      Object.assign(allAnswers, newAnswers);
      
      const queryParams = new URLSearchParams(allAnswers).toString();
      navigate(`/quiz-step-6?${queryParams}`);
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
            </div>
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

export default QuizStep5;
