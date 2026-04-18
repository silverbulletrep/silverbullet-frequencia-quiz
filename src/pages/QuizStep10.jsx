import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './QuizStep10.module.scss';
import { leadCache } from '../lib/leadCache';
import { logQuizProgress } from '../lib/leadTracker';
import { asset } from '@/lib/asset'
import { useQuizPrefetch } from '../hooks/useQuizPrefetch';

const QuizStep10 = () => {
  useQuizPrefetch('/quiz-step-10');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedOption = searchParams.get('option') || 'default';
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  React.useEffect(() => {
    console.log('[QUIZ_STEP10] Componente montado. Opção selecionada:', selectedOption);
  }, [selectedOption]);

  // Perguntas específicas para cada problema selecionado
  const questionSets = {
    'manifest': [
      {
        id: 'manifestation_vision',
        title: t('quiz.step10.manifest.title'),
        subtitle: t('quiz.step10.manifest.subtitle'),
        options: [
          { key: 'effortless_flow', emoji: '🌊', text: t('quiz.step10.manifest.options.effortless_flow') },
          { key: 'abundant_everything', emoji: '✨', text: t('quiz.step10.manifest.options.abundant_everything') },
          { key: 'perfect_timing', emoji: '⏰', text: t('quiz.step10.manifest.options.perfect_timing') },
          { key: 'magical_synchronicities', emoji: '🎭', text: t('quiz.step10.manifest.options.magical_synchronicities') }
        ]
      }
    ],
    'attract': [
      {
        id: 'attraction_vision',
        title: t('quiz.step10.attract.title'),
        subtitle: t('quiz.step10.attract.subtitle'),
        options: [
          { key: 'deep_connection', emoji: '💕', text: t('quiz.step10.attract.options.deep_connection') },
          { key: 'mutual_respect', emoji: '🤝', text: t('quiz.step10.attract.options.mutual_respect') },
          { key: 'authentic_self', emoji: '🌟', text: t('quiz.step10.attract.options.authentic_self') },
          { key: 'supportive_circle', emoji: '👥', text: t('quiz.step10.attract.options.supportive_circle') }
        ]
      }
    ],
    'abundance': [
      {
        id: 'abundance_vision',
        title: t('quiz.step10.abundance.title'),
        subtitle: t('quiz.step10.abundance.subtitle'),
        options: [
          { key: 'financial_freedom', emoji: '🏖️', text: t('quiz.step10.abundance.options.financial_freedom') },
          { key: 'generous_giving', emoji: '🎁', text: t('quiz.step10.abundance.options.generous_giving') },
          { key: 'dream_lifestyle', emoji: '🏰', text: t('quiz.step10.abundance.options.dream_lifestyle') },
          { key: 'impact_others', emoji: '🌍', text: t('quiz.step10.abundance.options.impact_others') }
        ]
      }
    ],
    'healing': [
      {
        id: 'healing_vision',
        title: t('quiz.step10.healing.title'),
        subtitle: t('quiz.step10.healing.subtitle'),
        options: [
          { key: 'pain_free', emoji: '🌈', text: t('quiz.step10.healing.options.pain_free') },
          { key: 'inner_peace', emoji: '☮️', text: t('quiz.step10.healing.options.inner_peace') },
          { key: 'vibrant_health', emoji: '💪', text: t('quiz.step10.healing.options.vibrant_health') },
          { key: 'helping_others', emoji: '🤲', text: t('quiz.step10.healing.options.helping_others') }
        ]
      }
    ],
    'energy': [
      {
        id: 'energy_vision',
        title: t('quiz.step10.energy.title'),
        subtitle: t('quiz.step10.energy.subtitle'),
        options: [
          { key: 'unstoppable_force', emoji: '🚀', text: t('quiz.step10.energy.options.unstoppable_force') },
          { key: 'inspiring_others', emoji: '✨', text: t('quiz.step10.energy.options.inspiring_others') },
          { key: 'achieving_dreams', emoji: '🎯', text: t('quiz.step10.energy.options.achieving_dreams') },
          { key: 'radiating_joy', emoji: '😊', text: t('quiz.step10.energy.options.radiating_joy') }
        ]
      }
    ],
    'other': [
      {
        id: 'general_vision',
        title: t('quiz.step10.other.title'),
        subtitle: t('quiz.step10.other.subtitle'),
        options: [
          { key: 'purposeful_life', emoji: '🎯', text: t('quiz.step10.other.options.purposeful_life') },
          { key: 'balanced_harmony', emoji: '⚖️', text: t('quiz.step10.other.options.balanced_harmony') },
          { key: 'authentic_expression', emoji: '🌟', text: t('quiz.step10.other.options.authentic_expression') },
          { key: 'fulfilled_happy', emoji: '😊', text: t('quiz.step10.other.options.fulfilled_happy') }
        ]
      }
    ]
  };

  // Usar perguntas específicas ou fallback para perguntas gerais
  const questions = questionSets[selectedOption] || questionSets['other'];

  const handleOptionClick = (optionKey) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: optionKey };
    setAnswers(newAnswers);

    console.log(`[QUIZ_STEP10] Pergunta ${currentQuestion + 1} respondida:`, optionKey, 'para problema:', selectedOption);

    if (currentQuestion < questions.length - 1) {
      // Próxima pergunta
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Última pergunta, ir para processing
      console.log('[QUIZ_STEP10] Etapa 10 concluída, redirecionando para processing');
      try {
        // Armazena respostas "raw" e Q&A detalhado
        leadCache.setEtapa('CP03 - Quiz');
        leadCache.mergeQuizAnswers(newAnswers);
        leadCache.saveQAsForStep('quiz_step_10', questions, newAnswers);
        logQuizProgress();
      } catch (e) {
        console.warn('[QUIZ_STEP10] Falha ao salvar no leadCache:', e);
      }
      
      // Combinar respostas anteriores com as atuais
      const allAnswers = {};
      searchParams.forEach((value, key) => {
        allAnswers[key] = value;
      });
      Object.assign(allAnswers, newAnswers);
      
      const queryParams = new URLSearchParams(allAnswers).toString();
      navigate(`/processing?${queryParams}`);
    }
  };

  const handleBackClick = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigate(-1);
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
              <div className={styles.container} onClick={handleBackClick}>
                <ArrowLeft className={styles.component1} />
              </div>
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
            <p className={styles.a224}>{currentQuestion + 10}/24</p>
          </div>
          <div className={styles.horizontalDivider2}>
            <div className={styles.horizontalDivider} />
          </div>
        </div>
        
          <div className={styles.container8}>
            <div className={styles.container6}>
              <p className={styles.comoVocSeSenteAoAcor}>
                {currentQ.title}
              </p>
              <p className={styles.selecioneOMaisReleva}>
                {currentQ.subtitle}
              </p>
            </div>
            <div className={styles.container7}>
              {currentQ.options.map((option) => (
                <div 
                  key={option.key} 
                  className={styles.component2} 
                  onClick={() => handleOptionClick(option.key)}
                >
                  <p className={styles.a}>{option.emoji}</p>
                  <p className={styles.cansadoOuPesado}>{option.text}</p>
                </div>
              ))}
            </div>
          </div>
        
      </div>
    </div>
  );
};

export default QuizStep10;
