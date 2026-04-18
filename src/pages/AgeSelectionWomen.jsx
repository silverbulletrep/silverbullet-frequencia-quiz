import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './AgeSelectionWomen.module.scss';
import { leadCache } from '../lib/leadCache';
import { logGenderAndAge } from '../lib/leadTracker';
import { asset } from '@/lib/asset';
import { buildRouteStep, createFunnelTracker, getDefaultBaseUrl, readStoredCountry, QUIZ_FUNNEL_ID, QUIZ_STEPS } from '../lib/funnelTracker';
import usePrefetch from '../hooks/usePrefetch';
import useImagePreload from '../hooks/useImagePreload';
import { useExitIntent } from '../hooks/useExitIntent';

const tracker = createFunnelTracker({
  baseUrl: getDefaultBaseUrl(),
  funnelId: QUIZ_FUNNEL_ID,
  getCountry: () => readStoredCountry() || undefined,
  debug: import.meta.env.DEV
})

const AgeSelectionWomen = () => {
  const { t } = useTranslation();
  const [selectedAge, setSelectedAge] = useState(null);
  const navigate = useNavigate();
  const subtitleRef = useRef(null);
  const cardsWrapperRef = useRef(null);
  const stepViewSentRef = useRef(false);
  const mountLogSentRef = useRef(false);
  const prefetchPath = usePrefetch();

  useExitIntent();

  const imagesToPreload = useMemo(() => ['/.figma/image/mg0a7uxw-5wc7hzw.webp'], []);
  useImagePreload(imagesToPreload);

  useEffect(() => {
    if (!mountLogSentRef.current) {
      console.log('[PUSH] AgeSelectionWomen mount detection');
      console.log('[PUSH] Notification available:', typeof Notification !== 'undefined');
      mountLogSentRef.current = true;
    }

    if (stepViewSentRef.current) return
    stepViewSentRef.current = true
    void tracker.stepView(buildRouteStep('/age-selection-women', QUIZ_STEPS.age, QUIZ_STEPS.age.name))

    // Notificações desativadas
    return;
  }, [])

  const handleAgeSelect = (age) => {
    setSelectedAge(age);
    const qs = window.location.search || '';
    
    // Offloading de persistência e tracking
    const runAnalytics = () => {
      try {
        leadCache.setGenero('mulher')
        const idadeMinima = age === '18-34' ? 18 : age === '35-49' ? 35 : age === '50-64' ? 50 : 65
        leadCache.setIdade(idadeMinima)
        leadCache.setEtapa('CP01 - Gênero&Idade')
        void tracker.leadQualified(buildRouteStep('/age-selection-women', QUIZ_STEPS.age, QUIZ_STEPS.age.name), 'mulher', idadeMinima)
        logGenderAndAge()
      } catch (e) {}
    }

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(runAnalytics, { timeout: 1000 });
    } else {
      setTimeout(runAnalytics, 0);
    }

    // Próxima etapa instantânea
    navigate(`/women-success${qs}`);
  };

  useEffect(() => {
    const operacao = 'ui.spacing_debug';
    try {
      const subtitleBox = subtitleRef.current?.getBoundingClientRect();
      const cardsBox = cardsWrapperRef.current?.getBoundingClientRect();
      const distancia = subtitleBox && cardsBox ? cardsBox.top - subtitleBox.bottom : null;
      console.log('[DEBUG] Distância entre subtítulo e cards:', { distancia });
    } catch (error) { }
  }, []);

  return (
    <div className={styles.signupSpiriohubComEn}>
      <div className={styles.background2}>
        <div className={styles.container9}>
          <p className={styles.qualASuaIdade}>{t('quiz.age_selection.title')}</p>
          <p ref={subtitleRef} className={styles.usamosApenasParaPers}>
            {t('quiz.age_selection.subtitle')}
          </p>
          <div ref={cardsWrapperRef} className={styles.container8}>
            <div className={styles.container7}>
              <div
                className={`${styles.component2} ${selectedAge === '18-34' ? styles.selected : ''}`}
                onPointerDown={() => prefetchPath('/women-success')}
                onClick={() => handleAgeSelect('18-34')}
              >
                <div className={styles.background}>
                  <img
                    src={asset('/img/women-18-34.webp')}
                    className={styles.man1834YearsOld}
                    alt={t('quiz.age_selection.alt.women_18_34')}
                    width="500"
                    height="500"
                    fetchpriority="high"
                    loading="eager"
                  />
                </div>
                <div className={styles.container6}>
                  <p className={styles.text}>{t('quiz.age_selection.ranges.18-34')}</p>
                  <svg
                    className={styles.component14}
                    viewBox="0 0 9 16"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M1.418 16L7.756 9.65333C8.19209 9.21519 8.43691 8.62218 8.43691 8.004C8.43691 7.38582 8.19209 6.79281 7.756 6.35467L1.41067 0L0 1.414L6.34533 7.768C6.40782 7.83051 6.44293 7.91528 6.44293 8.00367C6.44293 8.09206 6.40782 8.17682 6.34533 8.23933L0.00666682 14.586L1.418 16Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
              <div
                className={`${styles.component2} ${selectedAge === '35-49' ? styles.selected : ''}`}
                onPointerDown={() => prefetchPath('/women-success')}
                onClick={() => handleAgeSelect('35-49')}
              >
                <div className={styles.background}>
                  <img
                    src={asset('/img/women-35-49.webp')}
                    className={styles.man1834YearsOld}
                    alt={t('quiz.age_selection.alt.women_35_49')}
                    width="500"
                    height="500"
                    fetchpriority="high"
                    loading="eager"
                  />
                </div>
                <div className={styles.container6}>
                  <p className={styles.text}>{t('quiz.age_selection.ranges.35-49')}</p>
                  <svg
                    className={styles.component14}
                    viewBox="0 0 9 16"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M1.418 16L7.756 9.65333C8.19209 9.21519 8.43691 8.62218 8.43691 8.004C8.43691 7.38582 8.19209 6.79281 7.756 6.35467L1.41067 0L0 1.414L6.34533 7.768C6.40782 7.83051 6.44293 7.91528 6.44293 8.00367C6.44293 8.09206 6.40782 8.17682 6.34533 8.23933L0.00666682 14.586L1.418 16Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className={styles.container7}>
              <div
                className={`${styles.component2} ${selectedAge === '50-64' ? styles.selected : ''}`}
                onPointerDown={() => prefetchPath('/women-success')}
                onClick={() => handleAgeSelect('50-64')}
              >
                <div className={styles.background}>
                  <img
                    src={asset('/img/women-50-64.webp')}
                    className={styles.man1834YearsOld}
                    alt={t('quiz.age_selection.alt.women_50_64')}
                    width="500"
                    height="500"
                    fetchpriority="high"
                    loading="eager"
                  />
                </div>
                <div className={styles.container6}>
                  <p className={styles.text}>{t('quiz.age_selection.ranges.50-64')}</p>
                  <svg
                    className={styles.component14}
                    viewBox="0 0 9 16"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M1.418 16L7.756 9.65333C8.19209 9.21519 8.43691 8.62218 8.43691 8.004C8.43691 7.38582 8.19209 6.79281 7.756 6.35467L1.41067 0L0 1.414L6.34533 7.768C6.40782 7.83051 6.44293 7.91528 6.44293 8.00367C6.44293 8.09206 6.40782 8.17682 6.34533 8.23933L0.00666682 14.586L1.418 16Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
              <div
                className={`${styles.component2} ${selectedAge === '65+' ? styles.selected : ''}`}
                onPointerDown={() => prefetchPath('/women-success')}
                onClick={() => handleAgeSelect('65+')}
              >
                <div className={styles.background}>
                  <img
                    src={asset('/img/women-65-plus.webp')}
                    className={styles.man1834YearsOld}
                    alt={t('quiz.age_selection.alt.women_65plus')}
                    width="500"
                    height="500"
                    fetchpriority="high"
                    loading="eager"
                  />
                </div>
                <div className={styles.container6}>
                  <p className={styles.text}>{t('quiz.age_selection.ranges.65plus')}</p>
                  <svg
                    className={styles.component14}
                    viewBox="0 0 9 16"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M1.418 16L7.756 9.65333C8.19209 9.21519 8.43691 8.62218 8.43691 8.004C8.43691 7.38582 8.19209 6.79281 7.756 6.35467L1.41067 0L0 1.414L6.34533 7.768C6.40782 7.83051 6.44293 7.91528 6.44293 8.00367C6.44293 8.09206 6.40782 8.17682 6.34533 8.23933L0.00666682 14.586L1.418 16Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeSelectionWomen;
