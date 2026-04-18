import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { leadCache } from '../lib/leadCache';
import resultadoImg from '../../img/resultado.webp';
import expertImg from '../../img/expert.webp';
import expertPtImg from '../../img/expert-pt.webp';

import { asset } from '@/lib/asset'
import {
  createFunnelTracker,
  QUIZ_FUNNEL_ID,
  QUIZ_PROGRESS_STEPS,
  getDefaultBaseUrl,
  readStoredCountry,
  buildRouteStep,
  shouldSendEvent
} from '../lib/funnelTracker';
import usePrefetch from '../hooks/usePrefetch';
import { useExitIntent } from '../hooks/useExitIntent';
import { TransitionFadeWrapper } from '../components/TransitionFadeWrapper';

import styles from './Resultado.module.scss';

const DEBUG = import.meta.env.DEV

const COUNTRY_CODES = [
  { code: '+49', flag: '🇩🇪', label: 'DE' },
  { code: '+43', flag: '🇦🇹', label: 'AT' },
  { code: '+41', flag: '🇨🇭', label: 'CH' },
  { code: '+423', flag: '🇱🇮', label: 'LI' },
  { code: '+352', flag: '🇱🇺', label: 'LU' },
  { code: '+32', flag: '🇧🇪', label: 'BE' },
  { code: '+55', flag: '🇧🇷', label: 'BR' },
  { code: '+351', flag: '🇵🇹', label: 'PT' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'GB' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
  { code: '+34', flag: '🇪🇸', label: 'ES' },
  { code: '+39', flag: '🇮🇹', label: 'IT' },
  { code: '+31', flag: '🇳🇱', label: 'NL' },
  { code: '+48', flag: '🇵🇱', label: 'PL' },
  { code: '+90', flag: '🇹🇷', label: 'TR' },
  { code: '+91', flag: '🇮🇳', label: 'IN' },
]

const Resultado = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [animateIndicator, setAnimateIndicator] = useState(false);
  const mainRef = useRef(null)
  const [leadData, setLeadData] = useState(null);
  const [showContactModal, setShowContactModal] = useState(true)
  const [contactPreference, setContactPreference] = useState(null)
  const [contactValue, setContactValue] = useState('')
  const [contactError, setContactError] = useState('')
  const [submittingContact, setSubmittingContact] = useState(false)
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [countryCode, setCountryCode] = useState('+351')

  useExitIntent();

  const isPtRoute = (() => {
    try {
      const pathname = String(window.location.pathname || '')
      return pathname.includes('/pt/') || pathname === '/pt' || pathname.endsWith('/pt')
    } catch {
      return false
    }
  })()

  // Estados de controle visual
  const [showCard1, setShowCard1] = useState(false)
  const [showCard2, setShowCard2] = useState(false)
  const [showCard3, setShowCard3] = useState(false)
  const [showCard4, setShowCard4] = useState(false)
  const anyCardVisible = showCard1 || showCard2 || showCard3 || showCard4
  const cardsTimers = useRef([])
  const cardsScheduled = useRef(false)
  const imageLoadedRef = useRef(false)
  const topBlurRef = useRef(null)
  const prefetchPath = usePrefetch();

  // Carregar dados do cache
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    try {
      const data = leadCache.getAll() || {};
      setLeadData(data);
      let preference = data?.contact_preference || null
      if (!preference) {
        if (data?.whatsapp) preference = 'whatsapp'
        else if (data?.email) preference = 'email'
        else preference = 'whatsapp'
      }
      const cachedValue = preference === 'whatsapp' ? (data?.whatsapp || '') : (preference === 'email' ? (data?.email || '') : '')
      setContactPreference(preference)
      setContactValue(cachedValue)
      setShowContactModal(true) // Força a exibir sempre que carregar
      if (cachedValue) setContactSubmitted(true)
      if (DEBUG) console.log('[RESULTADO] Dados carregados do cache', data);

      const tracker = createFunnelTracker({
        baseUrl: getDefaultBaseUrl(),
        funnelId: QUIZ_FUNNEL_ID,
        getCountry: () => readStoredCountry() || undefined,
        debug: DEBUG
      });

      const step = buildRouteStep('/resultado', QUIZ_PROGRESS_STEPS.resultado);
      if (shouldSendEvent('step_view:/resultado')) {
        tracker.stepView(step).catch((err) => {
          console.error('[RESULTADO] Erro ao enviar step_view:', err);
        });
      }

    } catch (e) {
      console.error('[RESULTADO] Erro ao ler cache', e);
    }
  }, []);

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    if (showContactModal) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
    }
  }, [showContactModal])

  // Derivar dados para tradução
  const translationData = useMemo(() => {
    if (!leadData) return null;

    const g = leadData.genero || null;
    const rawOpt = leadData.selected_option || leadData.problema_principal || 'other';
    const opt = (Array.isArray(rawOpt) ? (rawOpt[0] || 'other') : String(rawOpt)).toLowerCase();

    // Mapeamento de chaves para desireMeta
    const desireKey = ['abundance', 'attract', 'healing', 'energy'].includes(opt) ? opt : 'other';

    // Lógica de Score
    const qa = (leadData.respostas_quiz?.qa_by_step || {});
    let score = 0;
    const negEmoji = new Set(['😔', '😭', '😡', '😶‍🌫️', '🫨', '🤕']);

    // Lista de chaves de resposta que indicam bloqueios/problemas (pontuam +1)
    // Isso substitui a verificação por string em PT, permitindo suporte a múltiplos idiomas
    const scoreKeys = new Set([
      // Step 1
      'sim_drenado', 'cabeca_nunca_desliga', 'ignoro_pausa',
      // Step 2
      'sim_acontece_muito', 'algumas_vezes_afastar', 'as_vezes_sem_energia',
      // Step 3
      'sim_mexe_demais', 'as_vezes_fujo', 'detesto_quando_acontece',
      // Step 4
      'sim_sinto_na_pele', 'frequentemente_sensivel', 'as_vezes_tenso',
      // Step 5
      'sim_magoa', 'varias_vezes', 'as_vezes_distancia',
      // Step 6
      'sim_perdi_ritmo', 'muitas_vezes_limitado', 'as_vezes_desanimo'
    ]);

    Object.keys(qa).forEach((stepId) => {
      const items = qa[stepId] || [];
      for (const it of items) {
        // Usa answer_key se disponível (mais seguro), fallback para answer text (legado)
        const key = String(it?.answer_key || '').toLowerCase();
        const a = String(it?.answer || '').toLowerCase();
        const emoji = String(it?.emoji || '');

        if (negEmoji.has(emoji)) {
          score += 2;
        } else if (key && scoreKeys.has(key)) {
          score += 1;
        } else {
          // Fallback legado para strings PT (caso answer_key não exista em caches antigos)
          const keyMap = [
            'cansaço', 'drenado', 'sem energia', 'ansiedade', 'peso', 'cabeça nunca desliga', 'ignoro', 'triste', 'pesado', 'baixa', 'falta', 'preocupado', 'insegura', 'inseguro'
          ];
          for (const k of keyMap) {
            if (a.includes(k)) {
              score += 1;
              break;
            }
          }
        }
      }
    });

    const level = score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low'; // chaves para tradução
    const genderToneKey = g === 'mulher' ? 'feminine' : 'masculine'

    // Segment label logic
    const segmentPluralKey = g === 'mulher' ? 'women' : 'men';

    const ageVal = Number(leadData.idade || 0);
    const faixa = isNaN(ageVal) || ageVal <= 0
      ? null
      : (ageVal >= 65 ? '65+' : ageVal >= 50 ? '50-64' : ageVal >= 35 ? '35-49' : '18-34');

    return {
      desireKey,
      genderToneKey,
      level,
      faixa,
      segmentPluralKey,
      adjectiveKey: 'light',
    };
  }, [leadData]);

  // Função auxiliar para obter label de segmento traduzido
  const getSegmentLabel = () => {
    if (!translationData) return '';
    const { segmentPluralKey, faixa } = translationData;

    // Obtendo termos traduzidos do i18n
    const terms = t('result.segment', { returnObjects: true });

    // Fallback seguro caso terms não venha como objeto (ex: se chave não existir)
    if (!terms || typeof terms !== 'object') return '';

    const plural = terms[segmentPluralKey] || terms.women;

    if (faixa) {
      return `${plural} ${terms.between} ${faixa}`;
    }
    return `${plural} ${terms.like_you}`;
  };

  const scheduleCards = useCallback((startMs = 2000) => {
    if (cardsScheduled.current) return
    cardsScheduled.current = true
    const add = (ms, fn) => {
      const id = setTimeout(fn, ms)
      cardsTimers.current.push(id)
    }
    add(startMs, () => {
      setShowCard1(true)
      if (DEBUG) console.log('[RESULTADO] Card1 exibido')
    })
    add(startMs + 1700, () => {
      setShowCard2(true)
      if (DEBUG) console.log('[RESULTADO] Card2 exibido')
    })
    add(startMs + 3400, () => {
      setShowCard3(true)
      if (DEBUG) console.log('[RESULTADO] Card3 exibido')
    })
    add(startMs + 5100, () => {
      setShowCard4(true)
      if (DEBUG) console.log('[RESULTADO] Card4 exibido')
    })
  }, [])


  useEffect(() => {
    if (!contactSubmitted) return
    const timer = setTimeout(() => {
      setAnimateIndicator(true)
    }, 150)

    return () => {
      clearTimeout(timer)
      cardsTimers.current.forEach((id) => clearTimeout(id))
    }
  }, [contactSubmitted])

  useEffect(() => {
    try {
      const el = mainRef.current
      const cs = el ? window.getComputedStyle(el) : null
      const body = document.body
      const bs = body ? window.getComputedStyle(body) : null
      if (DEBUG) {
        console.log('[RESULTADO] main render snapshot', {
          main: cs && { filter: cs.filter, visibility: cs.visibility, opacity: cs.opacity },
          body: bs && { bg: bs.backgroundColor, color: bs.color }
        })
      }
    } catch { }
  }, [])

  const onImageLoad = useCallback(() => {
    if (DEBUG) console.log('[RESULTADO] Imagem resultado carregada')
    imageLoadedRef.current = true
    if (contactSubmitted) scheduleCards(2000)
  }, [scheduleCards, contactSubmitted])

  useEffect(() => {
    if (!contactSubmitted) return
    const fb = setTimeout(() => {
      if (!cardsScheduled.current) {
        if (DEBUG) console.log('[RESULTADO] Fallback: agendamento após 2s sem imagem load')
        scheduleCards(2000)
      }
    }, 2000)
    return () => clearTimeout(fb)
  }, [scheduleCards, contactSubmitted])

  useEffect(() => {
    if (!contactSubmitted) return
    if (imageLoadedRef.current) scheduleCards(2000)
  }, [contactSubmitted, scheduleCards])


  useEffect(() => {
    const applyTopBlurHeight = () => {
      try {
        const progress = document.querySelector(`[aria-label="${t('result.progress_aria')}"]`)
        if (!progress || !topBlurRef.current) return
        const rect = progress.getBoundingClientRect()
        const h = Math.max(0, Math.round(rect.top))
        topBlurRef.current.style.height = `${h}px`
      } catch { }
    }
    applyTopBlurHeight()
    window.addEventListener('resize', applyTopBlurHeight)
    return () => window.removeEventListener('resize', applyTopBlurHeight)
  }, [])

  // Efeito de debug de estilos removido/simplificado para limpeza, ou mantido se necessário.
  // Vou manter apenas o essencial para não poluir.

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    if (DEBUG) console.log('[RESULTADO] CTA continuar clicado, indo para /fim')
    navigate('/fim')
  }

  const normalizePhone = (value) => String(value || '').replace(/\D/g, '')

  const isValidEmail = (value) => {
    const v = String(value || '').trim()
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  const handleContactSubmit = () => {
    if (!contactPreference) {
      setContactError('Preferência de contato não definida.')
      return
    }
    const rawValue = String(contactValue || '').trim()
    if (contactPreference === 'whatsapp') {
      const normalized = normalizePhone(rawValue)
      if (normalized.length < 6) {
        setContactError(t('result.contact_errors.invalid_phone'))
        return
      }
      setSubmittingContact(true)
      setContactError('')
      try {
        const fullNumber = countryCode.replace(/\+/g, '') + normalized
        leadCache.setWhatsApp(fullNumber)
        leadCache.setContactPreference('whatsapp')

        const tracker = createFunnelTracker({
          baseUrl: getDefaultBaseUrl(),
          funnelId: QUIZ_FUNNEL_ID,
          getCountry: () => readStoredCountry() || undefined,
          debug: DEBUG
        });
        const step = { id: '/resultado', index: 14, name: 'Coleta de Contato' };
        tracker.leadIdentified(
          leadData?.name || '',
          leadData?.email || '',
          fullNumber,
          step
        ).catch((err) => console.error('[RESULTADO] Erro track leadIdentified:', err));

        setContactSubmitted(true)
        setShowContactModal(false)
      } catch {
        setContactError(t('result.contact_errors.save_phone_failed'))
      } finally {
        setSubmittingContact(false)
      }
      return
    }

    if (!isValidEmail(rawValue)) {
      setContactError(t('result.contact_errors.invalid_email'))
      return
    }
    setSubmittingContact(true)
    setContactError('')
    try {
      leadCache.setEmail(rawValue)
      leadCache.setContactPreference('email')

      const tracker = createFunnelTracker({
        baseUrl: getDefaultBaseUrl(),
        funnelId: QUIZ_FUNNEL_ID,
        getCountry: () => readStoredCountry() || undefined,
        debug: DEBUG
      });
      const step = { id: '/resultado', index: 14, name: 'Coleta de Contato' };
      tracker.leadIdentified(
        leadData?.name || '',
        rawValue,
        leadData?.whatsapp || '',
        step
      ).catch((err) => console.error('[RESULTADO] Erro track leadIdentified:', err));

      setContactSubmitted(true)
      setShowContactModal(false)
    } catch {
      setContactError(t('result.contact_errors.save_email_failed'))
    } finally {
      setSubmittingContact(false)
    }
  }

  // Helper para acessar desireMeta traduzido
  const getDesireMeta = () => {
    if (!translationData) return {};
    const key = translationData.desireKey;
    // Retorna objeto traduzido
    return t(`result.desire_meta.${key}`, { returnObjects: true });
  };

  const meta = getDesireMeta();
  const alertSubtitle = translationData ? t('result.alert.subtitle_template', {
    genderTone: t(`result.gender_tone.${translationData.genderToneKey}`),
    adjetivo: t(`result.adjectives.${translationData.adjectiveKey}`),
    desire: meta.attract || '...',
  }) : '';

  const alertBenefits = translationData ? t('result.alert.benefits_template', {
    segmentLabel: getSegmentLabel()
  }) : '';

  return (
    <TransitionFadeWrapper>
    <div className={styles.background3}>
      <div ref={topBlurRef} className={styles.topBlur} aria-hidden="true" />
      <div ref={mainRef} className={`${styles.mainContent} ${showContactModal ? styles.blurred : ''}`}>
        <div className={styles.container21}>
          <div className={styles.backgroundBorderShad}>
            <div className={styles.container5}>
              <p className={styles.vibraEs}>{t('result.vibrations_label')}</p>
              <div className={styles.container4}>
                <p className={styles.normal325Hz}>{t('result.normal_hz_label')}</p>
              </div>
            </div>
            <div className={styles.container10}>
              <div className={styles.container7}>
                <div className={styles.container6}>
                </div>
                <img
                  src={asset('/.figma/image/mg2zmbvd-rv7s9nn.svg')}
                  className={styles.component14}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className={styles.metricGauge}>
                <div className={`${styles.background2} ${animateIndicator ? styles.animated : ''}`}>
                  <div className={styles.background} />
                  <p className={styles.vocMoving}>
                    <Trans i18nKey="result.you_score_label" components={{ 1: <span className={styles.vocScoreNeg} /> }} />
                  </p>
                </div>
              </div>
              <div className={styles.container9}>
                <p className={styles.bAixo}>{t('result.levels.low')}</p>
                <p className={styles.nOrmal}>{t('result.levels.normal')}</p>
                <p className={styles.nOrmal}>{t('result.levels.medium')}</p>
                <p className={styles.nOrmal}>{t('result.levels.high')}</p>
              </div>
            </div>
            <div className={styles.container13}>
              <div className={styles.container11}>
                <img
                  src={asset('/.figma/image/mg2zmbvd-08e800q.svg')}
                  className={styles.component15}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className={styles.container12}>
                <p className={styles.mAnifestaobloqueada}>{t('result.alert.title_blocked')}</p>
                <p className={`${styles.suaBaixaVibraOEstAtr} ${styles.forceWhiteText} ${styles.fastRead}`}>{alertSubtitle}</p>
                <p className={`${styles.suaBaixaVibraOEstAtr} ${styles.forceWhiteText} ${styles.fastRead}`}>{alertBenefits}</p>

              </div>
            </div>
            <div className={styles.container20} style={{ marginTop: anyCardVisible ? 0 : '-12px', marginBottom: anyCardVisible ? 0 : '-12px' }}>
              <div className={styles.container19} style={{ paddingTop: anyCardVisible ? '8px' : '0px', paddingBottom: anyCardVisible ? '16px' : '0px' }}>
                <div className={`${styles.container16} ${showCard1 ? styles.seqVisible : styles.seqItem}`} style={{ '--delay': '0s' }}>
                  <div className={styles.container14}>
                    <p className={styles.a}>⛔</p>
                  </div>
                  <div className={styles.container15}>
                    <p className={`${styles.bloqueadorPrincipal} ${styles.forceWhiteText}`} style={{ color: '#ffffff' }}>{t('result.cards.main_blocker')}</p>
                    <p className={`${styles.mAnifestaobloqueada} ${styles.forceWhiteText}`} style={{ color: '#ffffff' }}>{meta.blocker}</p>
                  </div>
                </div>
                <div className={`${styles.container17} ${showCard2 ? styles.seqVisible : styles.seqItem}`} style={{ '--delay': '0s' }}>
                  <div className={styles.overlay}>
                    <img
                      src={asset('/.figma/image/mg2zmbvd-23ll8yh.svg')}
                      className={styles.component16}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className={styles.container15}>
                    <p className={`${styles.bloqueadorPrincipal} ${styles.forceWhiteText}`} style={{ color: '#ffffff' }}>{t('result.cards.attract')}</p>
                    <p className={`${styles.mAnifestaobloqueada} ${styles.forceWhiteText}`} style={{ color: '#ffffff' }}>{meta.attract}</p>
                  </div>
                </div>
                <div className={`${styles.container18} ${showCard3 ? styles.seqVisible : styles.seqItem}`} style={{ '--delay': '0s' }}>
                  <div className={styles.overlay2}>
                    <img
                      src={asset('/.figma/image/mg2zmbvd-iuxzjl5.svg')}
                      className={styles.component17}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className={styles.container15}>
                    <p className={`${styles.bloqueadorPrincipal} ${styles.forceWhiteText}`} style={{ color: '#ffffff' }}>{t('result.cards.best_solution')}</p>
                    <p className={`${styles.mAnifestaobloqueada} ${styles.forceWhiteText}`} style={{ color: '#ffffff' }}>{meta.solution}</p>
                  </div>
                </div>
                <div className={`${styles.container17} ${showCard4 ? styles.seqVisible : styles.seqItem}`} style={{ '--delay': '0s' }}>
                  <div className={styles.overlay}>
                    <img
                      src={asset('/.figma/image/mg2zmbvd-it7x730.svg')}
                      className={styles.component16}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className={styles.container15}>
                    <p className={`${styles.bloqueadorPrincipal} ${styles.forceWhiteText}`} style={{ color: '#ffffff' }}>{t('result.cards.potential')}</p>
                    <p className={`${styles.mAnifestaobloqueada} ${styles.forceWhiteText}`} style={{ color: '#ffffff' }}>{meta.potential}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${styles.modelViewerWrapper} ${styles.mvVisible}`}>
              <img
                src={resultadoImg}
                alt={t('result.visual_result_alt')}
                onLoad={onImageLoad}
                style={{ width: '100%', height: '360px', objectFit: 'cover', objectPosition: 'top center' }}
                width="800"
                height="1192"
                fetchpriority="high"
                loading="eager"
              />
            </div>
          </div>
          {showCard4 && (
            <div className={styles.stickyCtaBar}>
              <div
                className={styles.ctaAction}
                onPointerDown={() => prefetchPath('/fim')}
                onClick={handleContinue}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#111"><path d="M8 5v14l11-7z"></path></svg>
                <span>{t('result.cta.button')}</span>
              </div>
              <div className={styles.ctaCaption}>
                <Trans i18nKey="result.cta.caption" components={{ 1: <span className={styles.goldGlow} /> }} />
              </div>
            </div>
          )}
        </div>
      </div>
      {showContactModal && (
        <div className={styles.phoneModalOverlay} role="dialog" aria-modal="true" aria-label={t('result.contact_modal.aria_label')}>
          <div className={styles.phoneModal}>
            <div className={styles.phoneModalContent}>
              <div className={styles.expertDialog}>
                <div className={styles.expertAvatar}>
                  <img src={isPtRoute ? expertPtImg : expertImg} alt={t('result.contact_modal.expert_alt')} loading="lazy" decoding="async" />
                </div>
                <div className={styles.expertBubble}>
                  <p className={styles.expertTextMain}>
                    {contactPreference === 'whatsapp'
                      ? t('result.contact_modal.expert_main_whatsapp')
                      : t('result.contact_modal.expert_main_email')}
                  </p>
                </div>
              </div>
              <p className={styles.socialProof}>{t('result.contact_modal.social_proof')}</p>
              <div className={styles.phoneInputContainer}>
                <label className={styles.phoneInputLabel} htmlFor="contactInput">
                  {contactPreference === 'email'
                    ? t('result.contact_modal.label_email')
                    : t('result.contact_modal.label_whatsapp')}
                </label>
                <div className={styles.phoneInputWrapper}>
                  {contactPreference === 'email' ? (
                    <>
                      <svg className={styles.inputIcon} viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.2l9 5.6 9-5.6V7H3Zm18 10V9.4l-8.47 5.27a1 1 0 0 1-1.06 0L3 9.4V17h18Z" />
                      </svg>
                      <input
                        id="contactInput"
                        className={styles.phoneInput}
                        type="email"
                        inputMode="email"
                        placeholder={t('result.contact_modal.placeholder_email')}
                        value={contactValue}
                        onChange={(event) => setContactValue(event.target.value)}
                        disabled={!contactPreference || submittingContact}
                      />
                    </>
                  ) : (
                    <>
                      <select
                        className={styles.countrySelect}
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        disabled={submittingContact}
                        aria-label={t('result.contact_modal.aria_country_code')}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        id="contactInput"
                        className={styles.phoneInputWithCountry}
                        type="tel"
                        inputMode="tel"
                        placeholder={t('result.contact_modal.placeholder_phone')}
                        value={contactValue}
                        onChange={(event) => setContactValue(event.target.value)}
                        disabled={!contactPreference || submittingContact}
                      />
                    </>
                  )}
                </div>
                {contactError && (
                  <div className={styles.phoneErrorContainer} role="alert">
                    <p className={styles.phoneError}>{contactError}</p>
                  </div>
                )}
              </div>
              <div className={styles.phoneModalButton}>
                <button
                  type="button"
                  className={`${styles.continueButton} ${contactPreference && contactValue ? styles.active : styles.inactive}`}
                  onClick={handleContactSubmit}
                  disabled={!contactPreference || !contactValue || submittingContact}
                >
                  <span className={styles.continueText}>{t('result.contact_modal.button_continue')}</span>
                </button>
              </div>
              <p className={styles.privacyNote}>{t('result.contact_modal.privacy_note')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </TransitionFadeWrapper>
  );
}

export default Resultado;
