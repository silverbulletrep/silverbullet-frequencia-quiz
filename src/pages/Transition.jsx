import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Transition.module.scss';
import { createFunnelTracker, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, readStoredCountry, getDefaultBaseUrl } from '../lib/funnelTracker';

const Transition = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const option = searchParams.get('option');

  useEffect(() => {
    console.log('[TRANSITION] Opção selecionada:', option);
    
    const tracker = createFunnelTracker({
      baseUrl: getDefaultBaseUrl(),
      funnelId: QUIZ_FUNNEL_ID,
      getCountry: readStoredCountry
    });

    const from_step = { id: "prova_social", index: 4 };
    const to_step = QUIZ_PROGRESS_STEPS.transition;

    tracker.stepProgress(from_step, to_step).catch((err) => {
      console.error('[TRANSITION] Erro ao enviar step_progress:', err);
    });
    
    const timer = setTimeout(() => {
      navigate('/quiz');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, option]);

  const getOptionText = () => {
    switch (option) {
      case 'manifest':
        return t('transition_loader.options.manifest');
      case 'attract':
        return t('transition_loader.options.attract');
      case 'abundance':
        return t('transition_loader.options.abundance');
      case 'healing':
        return t('transition_loader.options.healing');
      case 'energy':
        return t('transition_loader.options.energy');
      default:
        return t('transition_loader.options.default');
    }
  };

  return (
    
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>{t('transition_loader.title')}</h1>
          <p className={styles.selectedOption}>{getOptionText()}</p>
          <div className={styles.loadingIndicator}>
            <div className={styles.spinner}></div>
          </div>
          <p className={styles.message}>
            {t('transition_loader.message')}
          </p>
        </div>
      </div>
    
  );
};

export default Transition;
