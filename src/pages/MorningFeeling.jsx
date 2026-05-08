import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './MorningFeeling.module.scss';
import { leadCache } from '../lib/leadCache';
import { logDesejoProgress } from '../lib/leadTracker';
import { asset } from '@/lib/asset'
import { withTrackingParams } from '@/lib/trackingParams'
import transitionThumbnail from '../../img/tumbweb.webp'
import { buildMorningFeelingPayload } from '../lib/morningFeelingPayload';
import { buildRouteStep, createFunnelTracker, getDefaultBaseUrl, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, readStoredCountry } from '../lib/funnelTracker';
import { useExitIntent } from '../hooks/useExitIntent';
import { usePrefetch } from '../hooks/usePrefetch';

const DEBUG = import.meta.env.DEV

const tracker = createFunnelTracker({
  baseUrl: getDefaultBaseUrl(),
  funnelId: QUIZ_FUNNEL_ID,
  getCountry: () => readStoredCountry() || undefined,
  debug: import.meta.env.DEV
})

const MorningFeeling = () => {
  const { t } = useTranslation();

  useExitIntent();
  const navigate = useNavigate();
  const prefetchPath = usePrefetch();
  const questionRef = useRef(null);

  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    const preload = () => {
      const img = new Image()
      img.src = transitionThumbnail
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const requestIdleCallback = window.requestIdleCallback
      const cancelIdleCallback = window.cancelIdleCallback
      const id = requestIdleCallback(preload)
      return () => {
        if (typeof cancelIdleCallback === 'function') cancelIdleCallback(id)
      }
    }

    const timeoutId = window.setTimeout(preload, 0)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  const handleToggleOption = (optionKey) => {
    const operacao = 'morning_feeling.toggle_option';
    const dados_entrada = { optionKey };
    try {
      if (DEBUG) console.log(`[MORNING_FEELING] Iniciando operação: ${operacao}`, { dados_entrada });
      setSelectedOptions((prev) => {
        const exists = prev.includes(optionKey);
        const next = exists ? prev.filter((k) => k !== optionKey) : [...prev, optionKey];
        if (DEBUG) {
          console.log(`[MORNING_FEELING] Operação concluída com sucesso:`, {
            id_resultado: optionKey,
            timestamp: new Date().toISOString(),
          });
        }
        return next;
      });
    } catch (error) {
      console.error(`[MORNING_FEELING] Erro na operação: ${error.message}`, {
        dados_entrada,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleContinue = () => {
    const operacao = 'morning_feeling.continue';
    const dados_entrada = { selectedOptions };
    try {
      if (DEBUG) console.log(`[MORNING_FEELING] Iniciando operação: ${operacao}`, { dados_entrada });
      const primary = selectedOptions[0];
      if (selectedOptions.length > 0) {
        const desireLabels = {
          abundance: 'Riqueza',
          attract: 'Relacionamentos',
          healing: 'Saúde',
          energy: 'Saúde Mental',
          other: 'Outros'
        };
        const questionText = questionRef.current?.textContent?.trim() || t('morning_feeling.title');
        
        // Offloading de persistência e tracking
        const runAnalytics = () => {
          try {
            leadCache.setEtapa('CP02 - Problema&MiniVSL');
            leadCache.setSelectedOption(primary);
            leadCache.setProblemaPrincipal(selectedOptions);
            const { payload, invalidKeys, missingLabelKeys, validKeys } = buildMorningFeelingPayload({
              question: questionText,
              selectedKeys: selectedOptions,
              labelsByKey: desireLabels
            });
            
            if (payload.attributes.question && validKeys.length > 0) {
              const step = buildRouteStep('/morning-feeling', QUIZ_PROGRESS_STEPS.morningFeeling, t('morning_feeling.title'))
              void tracker.stepView(step, payload.attributes).catch(() => {})
              const desireValue = payload.attributes.response.join(', ')
              if (desireValue) void tracker.desireSelected(desireValue).catch(() => {})
            }
            logDesejoProgress();
          } catch (e) {}
        }

        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(runAnalytics, { timeout: 1000 });
        } else {
          setTimeout(runAnalytics, 0);
        }
      }
      const optionsParam = encodeURIComponent(selectedOptions.join(','));
      navigate(withTrackingParams(`/transition?option=${primary || 'default'}&options=${optionsParam}`));
      if (DEBUG) {
        console.log(`[MORNING_FEELING] Operação concluída com sucesso:`, {
          id_resultado: primary || 'default',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`[MORNING_FEELING] Erro na operação: ${error.message}`, {
        dados_entrada,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      navigate(withTrackingParams('/transition'));
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    
      <div className={styles.httpsSignupSpiriohub}>
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
              <p className={styles.a224}>2/24</p>
            </div>
            <div className={styles.horizontalDivider2}>
              <div className={styles.horizontalDivider} />
            </div>
          </div>
          <div className={styles.container8}>
            <div className={styles.container6}>
              <p className={styles.comoVocSeSenteAoAcor} ref={questionRef}>
                {t('morning_feeling.title')}
              </p>
              <p className={styles.selecioneOMaisReleva}>
                {t('morning_feeling.subtitle_part1')} <span className={styles.goldText}>{t('morning_feeling.subtitle_highlight')}</span> {t('morning_feeling.subtitle_part2')}
              </p>
            </div>
            <div className={styles.container7}>
              <div
                className={`${styles.component2} ${selectedOptions.includes('abundance') ? styles.selected : ''}`}
                onClick={() => handleToggleOption('abundance')}
              >
                <p className={styles.a}>💵</p>
                <p className={styles.cansadoOuPesado}>{t('morning_feeling.options.abundance')}</p>
                <div className={`${styles.checkbox} ${selectedOptions.includes('abundance') ? styles.checked : ''}`} aria-checked={selectedOptions.includes('abundance')} role="checkbox">
                  <span className={styles.checkMark}>{selectedOptions.includes('abundance') ? '✓' : ''}</span>
                </div>
              </div>
              <div
                className={`${styles.component2} ${selectedOptions.includes('attract') ? styles.selected : ''}`}
                onClick={() => handleToggleOption('attract')}
              >
                <p className={styles.a}>❤️</p>
                <p className={styles.cansadoOuPesado}>{t('morning_feeling.options.attract')}</p>
                <div className={`${styles.checkbox} ${selectedOptions.includes('attract') ? styles.checked : ''}`} aria-checked={selectedOptions.includes('attract')} role="checkbox">
                  <span className={styles.checkMark}>{selectedOptions.includes('attract') ? '✓' : ''}</span>
                </div>
              </div>
              <div
                className={`${styles.component2} ${selectedOptions.includes('healing') ? styles.selected : ''}`}
                onClick={() => handleToggleOption('healing')}
              >
                <p className={styles.a}>🤕</p>
                <p className={styles.cansadoOuPesado}>{t('morning_feeling.options.healing')}</p>
                <div className={`${styles.checkbox} ${selectedOptions.includes('healing') ? styles.checked : ''}`} aria-checked={selectedOptions.includes('healing')} role="checkbox">
                  <span className={styles.checkMark}>{selectedOptions.includes('healing') ? '✓' : ''}</span>
                </div>
              </div>
              <div
                className={`${styles.component2} ${selectedOptions.includes('energy') ? styles.selected : ''}`}
                onClick={() => handleToggleOption('energy')}
              >
                <p className={styles.a}>🕊️</p>
                <p className={styles.cansadoOuPesado}>{t('morning_feeling.options.energy')}</p>
                <div className={`${styles.checkbox} ${selectedOptions.includes('energy') ? styles.checked : ''}`} aria-checked={selectedOptions.includes('energy')} role="checkbox">
                  <span className={styles.checkMark}>{selectedOptions.includes('energy') ? '✓' : ''}</span>
                </div>
              </div>
              <div
                className={`${styles.component2} ${selectedOptions.includes('other') ? styles.selected : ''}`}
                onClick={() => handleToggleOption('other')}
              >
                <p className={styles.a}>❓</p>
                <p className={styles.cansadoOuPesado}>{t('morning_feeling.options.other')}</p>
                <div className={`${styles.checkbox} ${selectedOptions.includes('other') ? styles.checked : ''}`} aria-checked={selectedOptions.includes('other')} role="checkbox">
                  <span className={styles.checkMark}>{selectedOptions.includes('other') ? '✓' : ''}</span>
                </div>
              </div>
              {selectedOptions.length > 0 && (
                <div className={styles.ctaSpacer} />
              )}
            </div>
          </div>
        </div>
        {selectedOptions.length > 0 && (
          <div className={styles.stickyCtaBar}>
            <button
              className={styles.ctaAction}
              onClick={handleContinue}
              onPointerDown={() => prefetchPath('/transition')}
            >
              {t('morning_feeling.button_continue')}
            </button>
          </div>
        )}
      </div>
    
  );
};

export default MorningFeeling;
