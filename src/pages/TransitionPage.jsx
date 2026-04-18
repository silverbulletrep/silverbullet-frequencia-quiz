import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import styles from './TransitionPage.module.scss';
import '../../Pressel - Wl - Vidal/assets/css/style.css'
import tumb from '../../img/tumbweb.webp'
import { buildRouteStep, buildRouteStepIndex, createFunnelTracker, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, readStoredCountry, getDefaultBaseUrl, shouldSendEvent } from '../lib/funnelTracker';
import { useExitIntent } from '../hooks/useExitIntent';
import { usePrefetch } from '../hooks/usePrefetch';

const DEBUG = import.meta.env.DEV

const TransitionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const prefetchPath = usePrefetch();
  const [searchParams] = useSearchParams();
  const selectedOption = searchParams.get('option') || 'default';

  useExitIntent();

  React.useEffect(() => {
    const tracker = createFunnelTracker({
      baseUrl: getDefaultBaseUrl(),
      funnelId: QUIZ_FUNNEL_ID,
      getCountry: () => readStoredCountry() || undefined,
      debug: DEBUG
    });

    const from_step = buildRouteStepIndex('/morning-feeling', QUIZ_PROGRESS_STEPS.morningFeeling)
    const to_step = buildRouteStepIndex('/transition', QUIZ_PROGRESS_STEPS.transition);
    const step = buildRouteStep('/transition', QUIZ_PROGRESS_STEPS.transition, 'Transição');

    if (shouldSendEvent('step_progress:/morning-feeling->/transition')) {
      tracker.stepProgress(from_step, to_step).catch((err) => {
        console.error('[TRANSITION] Erro ao enviar step_progress:', err);
      });
    }

    if (shouldSendEvent('step_view:/transition')) {
      tracker.stepView(step).catch((err) => {
        console.error('[TRANSITION] Erro ao enviar step_view:', err);
      });
    }
  }, []);

  // Story 3.2 — Preload conservativo de recursos da VSL (AC: 5, 8)
  // Preloads scripts, DNS, HLS manifest, and VSL chunk while user reads this page.
  // No component mounting = no tracking events (stepView, stepProgress) fire.
  React.useEffect(() => {
    const cleanup = []

    const ensureLink = (rel, href, attrs = {}) => {
      if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return
      const l = document.createElement('link')
      l.rel = rel
      l.href = href
      Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, String(v)))
      document.head.appendChild(l)
      cleanup.push(() => { try { document.head.removeChild(l) } catch { } })
    }

    // 1. Preconnect & DNS prefetch for vturb domains
    try {
      ensureLink('preconnect', 'https://scripts.converteai.net')
      ensureLink('preconnect', 'https://cdn.converteai.net')
      ensureLink('dns-prefetch', 'https://images.converteai.net')
      ensureLink('dns-prefetch', 'https://api.vturb.com.br')
    } catch { }

    // 2. Preload critical scripts
    const run = () => {
      try {
        ensureLink('preload', 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js', { as: 'script' })
        ensureLink('preload', 'https://scripts.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/players/692f6c547fbe07d9ce40cfe5/v4/player.js', { as: 'script' })
      } catch { }

      // 3. Preload HLS master playlist
      try {
        ensureLink('preload', 'https://cdn.converteai.net/d32462b4-f7ab-4d7a-85c0-5da5596657e1/692f6c1be5f771ce8694b5ae/main.m3u8', { as: 'fetch', crossorigin: 'anonymous' })
      } catch { }

      // 4. Prefetch the VSL page chunk (download JS without executing)
      import('./VSL').catch(() => undefined)
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 2000 })
      cleanup.push(() => { try { window.cancelIdleCallback(id) } catch { } })
    } else {
      const t = window.setTimeout(run, 800)
      cleanup.push(() => { try { clearTimeout(t) } catch { } })
    }

    return () => {
      cleanup.forEach(fn => fn());
      try {
        // Only run destructive cleanup if we are NOT navigating to a VSL route
        if (!window.location.pathname.includes('/vsl')) {
          document.querySelectorAll('vturb-smartplayer').forEach(el => el.remove());
          document.querySelectorAll('script[src*="converteai"]').forEach(el => el.remove());
        }
      } catch (e) { }
    }
  }, [])

  React.useEffect(() => {
    document.body.classList.add('transition-page-body')
    return () => {
      document.body.classList.remove('transition-page-body')
    }
  }, [])

  // Conteúdos personalizados para cada opção
  const contentMap = {
    'manifest': {
      title: t('transition_page.content.manifest.title'),
      description: t('transition_page.content.manifest.description'),
      subDescription: t('transition_page.content.manifest.subDescription')
    },
    'attract': {
      title: t('transition_page.content.attract.title'),
      description: t('transition_page.content.attract.description'),
      subDescription: t('transition_page.content.attract.subDescription')
    },
    'abundance': {
      title: t('transition_page.content.abundance.title'),
      description: t('transition_page.content.abundance.description'),
      subDescription: t('transition_page.content.abundance.subDescription')
    },
    'healing': {
      title: t('transition_page.content.healing.title'),
      description: t('transition_page.content.healing.description'),
      subDescription: t('transition_page.content.healing.subDescription')
    },
    'energy': {
      title: t('transition_page.content.energy.title'),
      description: t('transition_page.content.energy.description'),
      subDescription: t('transition_page.content.energy.subDescription')
    },
    'other': {
      title: t('transition_page.content.other.title'),
      description: t('transition_page.content.other.description'),
      subDescription: t('transition_page.content.other.subDescription')
    },
    'default': {
      title: t('transition_page.content.default.title'),
      description: t('transition_page.content.default.description'),
      subDescription: t('transition_page.content.default.subDescription')
    }
  };

  const currentContent = contentMap[selectedOption] || contentMap['default'];
  const rawOptions = (searchParams.get('options') || '').trim();
  const vslUrl = rawOptions ? `/vsl?option=${selectedOption}&options=${encodeURIComponent(rawOptions)}` : `/vsl?option=${selectedOption}`

  const handleBackClick = () => {
    console.log('[TRANSITION_PAGE] Botão voltar clicado');
    navigate(-1);
  };

  const handleContinueClick = () => {
    console.log('[TRANSITION_PAGE] Botão continuar clicado, redirecionando para VSL com opção:', selectedOption);
    // Passando a escolha do usuário para a VSL
    if (rawOptions) {
      navigate(`/vsl?option=${selectedOption}&options=${encodeURIComponent(rawOptions)}`);
    } else {
      navigate(`/vsl?option=${selectedOption}`);
    }
  };

  return (
    <div className={styles.transitionPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.backButton} onClick={handleBackClick}>
            <ArrowLeft className={styles.backIcon} />
          </div>
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <span className={styles.logoText}>Spirio</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.quizText}>QUIZ</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.inner}>
          <div className="vsl-section">
            {(() => {
              const raw = (searchParams.get('options') || '').trim()
              let keys = raw ? raw.split(',').map((k) => k.trim()).filter(Boolean) : []
              if (keys.length === 0 && selectedOption && selectedOption !== 'default') keys = [selectedOption]

              const primary = keys[0]
              const isOnlyOther = keys.length === 1 && primary === 'other'
              const hasOther = keys.includes('other')
              const stableOrder = ['attract', 'abundance', 'healing', 'energy']
              const nonOtherKeys = keys.filter((k) => k !== 'other')
              const orderedNonOtherKeys = [
                ...stableOrder.filter((k) => nonOtherKeys.includes(k)),
                ...nonOtherKeys.filter((k) => !stableOrder.includes(k)),
              ]
              const subtitlePrimary = orderedNonOtherKeys[0] || primary

              if (isOnlyOther) {
                return <>
                  <h2 className="lead-headline">{t('transition_page.headlines.only_other_title')}</h2>
                  <p className="lead-subheadline">
                    {t('transition_page.headlines.only_other_subtitle')}
                  </p>
                </>
              }

              if (hasOther) {
                if (orderedNonOtherKeys.length === 1) {
                  const onlyKey = orderedNonOtherKeys[0]
                  const otherHeadlineKey = `transition_page.headlines.other_combo_${onlyKey}`
                  const otherHeadline = t(otherHeadlineKey)
                  if (otherHeadline && otherHeadline !== otherHeadlineKey) {
                    const benefitKey = `transition_page.headlines.benefits_map.${subtitlePrimary}`
                    const benefitText = t(benefitKey)
                    const primaryBenefit = benefitText && benefitText !== benefitKey
                      ? benefitText
                      : t('transition_page.headlines.benefits_map.other')

                    return <>
                      <h2 className="lead-headline">{otherHeadline}</h2>
                      <p className="lead-subheadline">
                        <Trans
                          i18nKey="transition_page.headlines.subtitle_template"
                          values={{ benefit: primaryBenefit }}
                          components={{ 0: <strong /> }}
                        />
                      </p>
                    </>
                  }
                }

                if (orderedNonOtherKeys.length >= 2) {
                  const labels = orderedNonOtherKeys
                    .map((k) => {
                      const labelKey = `transition_page.headlines.other_labels.${k}`
                      const label = t(labelKey)
                      return label && label !== labelKey ? label : null
                    })
                    .filter(Boolean)
                  const joined = labels.join(' + ')

                  if (joined) {
                    const benefitKey = `transition_page.headlines.benefits_map.${subtitlePrimary}`
                    const benefitText = t(benefitKey)
                    const primaryBenefit = benefitText && benefitText !== benefitKey
                      ? benefitText
                      : t('transition_page.headlines.benefits_map.other')

                    return <>
                      <h2 className="lead-headline"><span className="lead-highlight">{joined}</span></h2>
                      <p className="lead-subheadline">
                        <Trans
                          i18nKey="transition_page.headlines.subtitle_template"
                          values={{ benefit: primaryBenefit }}
                          components={{ 0: <strong /> }}
                        />
                      </p>
                    </>
                  }
                }
              }

              const headlineKey = `transition_page.headlines.base_${primary || 'default'}`;

              const base = (
                <Trans
                  i18nKey={headlineKey}
                  components={{ 1: <strong />, 3: <span className="lead-highlight" /> }}
                />
              );

              const extras = keys.slice(1).map((k) => t(`transition_page.headlines.benefits_map.${k}`)).filter(Boolean).slice(0, 2)

              const suffix = extras.length > 0 ? (
                <Trans
                  i18nKey="transition_page.headlines.suffix_pattern"
                  values={{ extras: extras.join(' + ') }}
                  components={{ 1: <span className="lead-highlight" /> }}
                />
              ) : null

              const primaryBenefit = t(`transition_page.headlines.benefits_map.${primary}`) || t('transition_page.headlines.benefits_map.other')

              return <>
                <h2 className="lead-headline">{base}{suffix}</h2>
                <p className="lead-subheadline">
                  <Trans
                    i18nKey="transition_page.headlines.subtitle_template"
                    values={{ benefit: primaryBenefit }}
                    components={{ 0: <strong /> }}
                  />
                </p>
              </>
            })()}
            <a href={vslUrl} className="vsl-link" onPointerDown={() => prefetchPath('/vsl')} onClick={(e) => { e.preventDefault(); handleContinueClick(); }}>
              <div className="vsl-thumbnail">
                <img src={tumb} alt={t('transition_page.video_thumbnail_alt')} width="1344" height="768" fetchpriority="high" loading="eager" />
                <div className="play-button"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg></div>
              </div>
            </a>
          </div>
          <div className="cta-section">
            <div className="cta-wrapper">
              <button className={styles.ctaButtonGold} onClick={handleContinueClick} onPointerDown={() => prefetchPath('/vsl')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                <span>{t('transition_page.cta.button')}</span>
              </button>
            </div>
            <p className="cta-subtext">{t('transition_page.cta.subtext')}</p>
          </div>
          <div className="bullet-points-wrapper">
            <h3 className="bullet-title">{t('transition_page.bullets.title')}</h3>
            <div className="bullet-item">
              <span className="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
              <p>
                <Trans
                  i18nKey="transition_page.bullets.item1"
                  components={{ 1: <strong />, 3: <span style={{ textTransform: 'uppercase' }} />, 5: <strong /> }}
                />
              </p>
            </div>
            <div className="bullet-item">
              <span className="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
              <p>
                <Trans
                  i18nKey="transition_page.bullets.item2"
                  components={{ 1: <strong /> }}
                />
              </p>
            </div>
            <div className="bullet-item">
              <span className="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
              <p>
                <Trans
                  i18nKey="transition_page.bullets.item3"
                  components={{ 1: <strong />, 3: <span style={{ textTransform: 'uppercase' }} />, 5: <strong />, 7: <strong /> }}
                />
              </p>
            </div>
          </div>
          {/* Widget de ondas removido conforme solicitado */}
        </div>
      </div>

      {/* Continue Button removido para evitar CTA duplicada */}
    </div>
  );
};

export default TransitionPage;
