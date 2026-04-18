import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import styles from './VSL2.module.scss';
import { useProgressStore } from '@/lib/progressStore';

import PriceSelectorFigma from '@/components/PriceSelectorFigma';
import FigmaBackgroundBorder from '../../.figma/1_395/index.jsx';
import VSLComments from '@/components/VSLComments';
import FigmaGuaranteeContainer from '@/components/FigmaGuaranteeContainer';
import { leadCache } from '@/lib/leadCache';

const VSL2 = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const selectedOption = searchParams.get('option') || 'default';
  const playerContainerRef = useRef(null);
  const selectedOptionsParam = (searchParams.get('options') || '').trim();
  const selectedOptionsArr = selectedOptionsParam ? selectedOptionsParam.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const cache = leadCache.getAll();
  const primaryOption = (selectedOption && selectedOption !== 'default') ? selectedOption : (cache.selected_option || 'default');

  // Estado do progresso de preparação
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const setStageProgress = useProgressStore((s) => s.setStageProgress);
  const resetProgress = useProgressStore((s) => s.resetProgress);
  const setRemainingSeconds = useProgressStore((s) => s.setRemainingSeconds);

  // Mensagens de status dinâmicas baseadas no progresso
  const getProgressMessage = (p) => {
    if (p >= 100) return t('vsl2.progress.ready');
    if (p > 90) return t('vsl2.progress.finalizing');
    if (p > 70) return t('vsl2.progress.synchronizing');
    if (p > 40) return t('vsl2.progress.identifying');
    return t('vsl2.progress.analyzing');
  };

  // Configuração do tempo do pitch (em segundos)
  // Ajuste este valor para sincronizar com o momento exato do pitch no vídeo
  const PITCH_TIME_SECONDS = Number(import.meta.env.VITE_VSL2_PITCH_SECONDS || 10);

  useEffect(() => {
    if (isReady) return;

    const intervalMs = 100;
    const totalSteps = (PITCH_TIME_SECONDS * 1000) / intervalMs;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;

      // Curva de progresso logarítmica simulada
      // Acelera no início, desacelera no final
      // Começa rápido até 50%, depois desacelera
      let newProgress;
      const ratio = currentStep / totalSteps;

      if (ratio < 0.2) {
        // Primeiros 20% do tempo: avança até 50%
        newProgress = (ratio / 0.2) * 50;
      } else if (ratio < 0.8) {
        // Dos 20% aos 80% do tempo: avança de 50% até 90%
        newProgress = 50 + ((ratio - 0.2) / 0.6) * 40;
      } else {
        // Últimos 20% do tempo: avança de 90% até 99%
        newProgress = 90 + ((ratio - 0.8) / 0.2) * 9;
      }

      // Se chegou ao tempo limite, completa
      if (currentStep >= totalSteps) {
        newProgress = 100;
        setIsReady(true);
        clearInterval(timer);
      }

      setProgress(Math.min(newProgress, 100));
      try { setStageProgress(Math.min(newProgress, 100)); } catch { }
      try { setRemainingSeconds(((totalSteps - currentStep) * intervalMs) / 1000); } catch { }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isReady]);

  useEffect(() => {
    try { setStageProgress(progress); } catch { }
    return () => { try { resetProgress(); } catch { } };
  }, []);

  const labelMap = {
    manifest: t('vsl2.label_map.manifest'),
    attract: t('vsl2.label_map.attract'),
    abundance: t('vsl2.label_map.abundance'),
    healing: t('vsl2.label_map.healing'),
    energy: t('vsl2.label_map.energy'),
    other: t('vsl2.label_map.other'),
    default: t('vsl2.label_map.default')
  };
  const desejoLabel = cache.selected_option_description || labelMap[primaryOption] || labelMap.default;
  const operacao = 'vsl2.compose_headline';
  const dados_entrada = { option: selectedOption, options: selectedOptionsArr, cacheOption: cache.selected_option };
  try {
    console.log(`[VSL2] Iniciando operação: ${operacao}`, { dados_entrada });
  } catch { }
  const currentHeadline = getProgressMessage(progress);

  try {
    console.log(`[VSL2] Operação concluída com sucesso:`, { id_resultado: primaryOption, timestamp: new Date().toISOString() });
  } catch { }

  // Estado do plano selecionado (segue MOST POPULAR do design)
  const [selectedPlan, setSelectedPlan] = useState('one_month');

  // Modal Payment Element
  const [showModal, setShowModal] = useState(false)
  async function onCheckout() {
    const operacao = 'vsl2.checkout.cta'
    const dados_entrada = { selectedPlan }
    try {
      console.log(`[VSL2] Iniciando operação: ${operacao}`, { dados_entrada })
      setShowModal(true)
    } catch (error) {
      console.error(`[VSL2] Erro na operação: ${error.message}`, {
        dados_entrada,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
      alert('Erro ao abrir checkout. Tente novamente.')
    }
  }

  // Seção "O que você ganha" com itens e toggle "saiba mais"
  const [expandedIndex, setExpandedIndex] = useState(-1)
  const offers = [
    {
      title: t('vsl2.offers.items.financial.title'),
      teaser: t('vsl2.offers.items.financial.teaser'),
      value: '97€',
      price: `${t('vsl2.offers.valued_at')} $97€$`,
      description: t('vsl2.offers.items.financial.description'),
    },
    {
      title: t('vsl2.offers.items.neuro.title'),
      teaser: t('vsl2.offers.items.neuro.teaser'),
      value: '75€',
      price: `${t('vsl2.offers.valued_at')} $75€$`,
      description: t('vsl2.offers.items.neuro.description'),
    },
    {
      title: t('vsl2.offers.items.cellular.title'),
      teaser: t('vsl2.offers.items.cellular.teaser'),
      value: '60€',
      price: `${t('vsl2.offers.valued_at')} $60€$`,
      description: t('vsl2.offers.items.cellular.description'),
    },
    {
      title: t('vsl2.offers.items.peace.title'),
      teaser: t('vsl2.offers.items.peace.teaser'),
      value: '45€',
      price: `${t('vsl2.offers.valued_at')} $45€$`,
      description: t('vsl2.offers.items.peace.description'),
    },
    {
      title: t('vsl2.offers.items.guide.title'),
      teaser: t('vsl2.offers.items.guide.teaser'),
      value: '53€',
      price: `${t('vsl2.offers.valued_at')} $53€$`,
      description: t('vsl2.offers.items.guide.description'),
    },
  ]
  function toggleOffer(idx) {
    const operacao = 'vsl2.offer.toggle'
    const dados_entrada = { index: idx, currentlyExpanded: expandedIndex }
    try {
      console.log(`[VSL2] Iniciando operação: ${operacao}`, { dados_entrada })
      setExpandedIndex((prev) => (prev === idx ? -1 : idx))
      console.log(`[VSL2] Operação concluída com sucesso:`, {
        id_resultado: idx,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`[VSL2] Erro na operação: ${error.message}`, {
        dados_entrada,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }
  }

  useEffect(() => {
    let unmounted = false;
    const playerEl = playerContainerRef.current;

    const initVTurb = () => {
      if (unmounted) return;
      const operacao = 'vsl2.vturb.attach'
      const dados_entrada = { id: 'vid-693339842200385961f1f929' }
      try {
        if (playerEl) {
          playerEl.innerHTML = `<vturb-smartplayer id="vid-693339842200385961f1f929" style="display: block; margin: 0 auto; width: 100%; max-width: 400px;"></vturb-smartplayer>`;
        }
        console.log(`[VSL2] Iniciando operação: ${operacao}`, { dados_entrada })
        function ensureLink(rel, href, attrs = {}) {
          const exists = Array.from(document.querySelectorAll(`link[rel="${rel}"][href="${href}"]`)).length > 0
          if (exists) return
          const l = document.createElement('link')
          l.rel = rel
          l.href = href
          Object.entries(attrs).forEach(([k, v]) => { try { l.setAttribute(k, String(v)) } catch { } })
          document.head.appendChild(l)
        }
        ensureLink('preload', 'https://scripts.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/players/693339842200385961f1f929/v4/player.js', { as: 'script' })
        ensureLink('preload', 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js', { as: 'script' })
        ensureLink('preload', 'https://cdn.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/693338cdddbc5fa0dfc86610/main.m3u8', { as: 'fetch' })
        ensureLink('dns-prefetch', 'https://cdn.converteai.net')
        ensureLink('dns-prefetch', 'https://scripts.converteai.net')
        ensureLink('dns-prefetch', 'https://images.converteai.net')
        ensureLink('dns-prefetch', 'https://api.vturb.com.br')
          ; (function (i, n) { i._plt = i._plt || (n && n.timeOrigin ? n.timeOrigin + n.now() : Date.now()) })(window, performance)
        const existing = document.querySelector('script[data-vturb-player-id="vid-693339842200385961f1f929"]')
        if (!existing) {
          const s = document.createElement('script')
          s.src = 'https://scripts.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/players/693339842200385961f1f929/v4/player.js'
          s.async = true
          s.setAttribute('data-vturb-player-id', 'vid-693339842200385961f1f929')
          document.head.appendChild(s)
        }
      } catch (error) {
        console.warn(`[VSL2] Falha lazily: ${error.message}`)
      }
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          initVTurb();
          observer.disconnect();
        }
      }, { rootMargin: '400px 0px' });
      if (playerEl) observer.observe(playerEl);
    } else {
      setTimeout(initVTurb, 1000);
    }

    return () => {
      unmounted = true;
      try {
        document.querySelectorAll('script[data-vturb-player-id="vid-693339842200385961f1f929"]').forEach(el => el.remove());
        document.querySelectorAll('vturb-smartplayer').forEach(el => el.remove());
        document.querySelectorAll('script[src*="converteai"]').forEach(el => el.remove());
      } catch (e) { }
    };
  }, []);

  // Re-parent vturb-smartplayer if Vturb teleports it to <body>
  useEffect(() => {
    let done = false
    const observer = new MutationObserver(() => {
      if (done) return
      const player = document.querySelector('body > vturb-smartplayer')
      const container = document.querySelector(`.${styles.videoContainer}`)
      if (player && container) {
        done = true
        container.appendChild(player)
        observer.disconnect()
      }
    })
    observer.observe(document.body, { childList: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.vslContainer}>
      <div className={styles.background}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerProgress} role="status" aria-live="polite">
              {!isReady && <span className={styles.spinner} aria-hidden="true" />}
              <div
                className={styles.headerProgressFill}
                style={{ width: `${progress}%` }}
              />
              <div className={styles.progressContent}>
                <span className={styles.progressText}>
                  {isReady ? t('vsl2.header.ready') : `${t('vsl2.header.preparing')} ${Math.round(progress)}%`}
                </span>
                {!isReady && (
                  <span className={styles.progressSub}>{currentHeadline}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.headlineContainer}>
            <h1 className={styles.headline}>
              <span className={styles.upperBoldBlack}>{isReady ? t('vsl2.headline.success') : t('vsl2.headline.wait')}</span>
              <span className={styles.headlineAccent}> {currentHeadline}</span>
            </h1>
            <p className={styles.impactText}>
              <span className={styles.impactBox}>
                {isReady
                  ? t('vsl2.impact.ready')
                  : <>
                    <Trans i18nKey="vsl2.impact.not_ready_base" components={{ 1: <strong />, 3: <strong /> }} />
                    {cache.idade && <Trans i18nKey="vsl2.impact.not_ready_age_suffix" values={{ age: cache.idade }} />}
                  </>
                }
              </span>
            </p>
          </div>

          <div className={styles.videoContainer}>
            <div ref={playerContainerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
          </div>
          {isReady && (
            <section className={styles.offerSection} aria-label={t('vsl2.offers.title')}>
              <div className={styles.anchorReceipt} aria-label={t('vsl2.receipt.title')}>
                <div className={styles.receiptHeader}>
                  <span className={styles.receiptTitle}>{t('vsl2.receipt.title')}</span>
                  <span className={styles.receiptSub}>{t('vsl2.receipt.subtitle')}</span>
                </div>
                <div className={styles.receiptBody}>
                  {offers.map((item, idx) => (
                    <div key={idx} className={styles.receiptRow}>
                      <span>{item.title}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                  <div className={styles.receiptTotalRow}>
                    <span>{t('vsl2.receipt.total')}</span>
                    <span className={styles.strikeValue}>330€</span>
                  </div>
                </div>
                <div className={styles.finalAnchor} aria-live="polite">
                  <span className={styles.finalLabel}>{t('vsl2.receipt.today')}</span>
                  <span className={styles.finalPrice}>37€</span>
                </div>
                <div className={styles.urgencyNotice}>{t('vsl2.receipt.urgency')}</div>
                <div className={styles.vacancyBox} role="status" aria-live="polite">
                  <div className={styles.vacancyHeader}>
                    <span className={styles.vacancyText}>{t('vsl2.vacancy.text_parts.apenas')}</span>
                    <span className={styles.vacancyCount}>27</span>
                    <span className={styles.vacancyText}>{t('vsl2.vacancy.text_parts.vagas_restantes')}</span>
                  </div>
                  <div className={styles.vacancyProgress} aria-label="Progresso de vagas">
                    <div className={styles.vacancyFill} style={{ width: '27%' }} />
                  </div>
                </div>
              </div>

              <div className={styles.innerPlanWrapper}>
                <FigmaBackgroundBorder />
              </div>

              <h2 className={styles.offerTitle}>{t('vsl2.offers.title')}</h2>
              <div className={styles.offerGrid}>
                {offers.map((item, idx) => (
                  <div key={item.title} className={styles.offerItem}>
                    <div className={styles.offerHeader}>
                      <div className={styles.offerTitleRow}>
                        <span className={styles.offerIndex}>{idx + 1}.</span>
                        <span className={styles.offerName}>{item.title}</span>
                      </div>
                      <span className={styles.offerPrice}>{item.price}</span>
                    </div>
                    <p className={styles.offerTeaser}>{item.teaser}</p>
                    <button
                      type="button"
                      className={styles.offerMore}
                      onClick={() => toggleOffer(idx)}
                      aria-expanded={expandedIndex === idx}
                      aria-controls={`offer-desc-${idx}`}
                    >
                      {expandedIndex === idx ? t('vsl2.offers.toggle.less') : t('vsl2.offers.toggle.more')}
                    </button>
                    {expandedIndex === idx && (
                      <p id={`offer-desc-${idx}`} className={styles.offerDescription}>
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {isReady && (
            <div className={styles.priceSelector} style={{ animation: 'fadeIn 1s ease-in-out' }}>
              <PriceSelectorFigma
                selected={selectedPlan}
                onSelect={setSelectedPlan}
                onCheckout={onCheckout}
              />
            </div>
          )}

          {isReady && <FigmaGuaranteeContainer />}



          <VSLComments />

        </div>
      </div>
    </div>
  );
};

export default VSL2;
