import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './QuizStep9.module.scss';
import ui from '@/styles/QuizUI.module.scss';
import { leadCache } from '../lib/leadCache';
import { logQuizProgress } from '../lib/leadTracker';
import { asset } from '@/lib/asset'
import { useQuizPrefetch } from '../hooks/useQuizPrefetch';

const QuizStep9 = () => {
  useQuizPrefetch('/quiz-step-9');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [answers, setAnswers] = useState({});
  const freqIndex = 7;
  const freqTotal = 7;
  
  const question = {
    id: 'q9_vida_sem_bloqueios',
    title: t('quiz.q9.title'),
    subtitle: '',
    options: [
      { key: 'libertador_respirar', emoji: '🌅', text: t('quiz.q9.options.libertador') },
      { key: 'voltaria_a_viver', emoji: '🌈', text: t('quiz.q9.options.viver') },
      { key: 'mudaria_energia', emoji: '✨', text: t('quiz.q9.options.energia') },
      { key: 'preciso_urgente', emoji: '🤍', text: t('quiz.q9.options.urgente') }
    ]
  };

  const handleOptionClick = (optionKey) => {
    const newAnswers = { ...answers, [question.id]: optionKey };
    setAnswers(newAnswers);

    console.log(`[QUIZ_STEP9] Pergunta respondida`, { qid: question.id, optionKey });
    try {
      // Armazena respostas "raw" e Q&A detalhado
      leadCache.setEtapa('CP03 - Quiz');
      leadCache.mergeQuizAnswers(newAnswers);
      leadCache.saveQAsForStep('quiz_step_9', [question], newAnswers);
      logQuizProgress();
    } catch (e) {
      console.warn('[QUIZ_STEP9] Falha ao salvar no leadCache:', e);
    }
    
    // Combinar respostas anteriores com as atuais
    const allAnswers = {};
    searchParams.forEach((value, key) => {
      allAnswers[key] = value;
    });
    Object.assign(allAnswers, newAnswers);
    
    const queryParams = new URLSearchParams(allAnswers).toString();
    navigate(`/quiz-step-10?${queryParams}`);
  };

  

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

export default QuizStep9;
