import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { leadCache } from '../lib/leadCache';
import resultadoPtImg from '../../img/resultado-atualizado.webp';
import resultadoDeImg from '../../img/resultado-de-cientific.webp';
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
  const [animateIndicator, setAnimateIndicator] = useState(true);
  const mainRef = useRef(null)
  const [leadData, setLeadData] = useState(null);
  const [showContactModal, setShowContactModal] = useState(true)
  const [contactPreference, setContactPreference] = useState(null)
  const [contactValue, setContactValue] = useState('')
  const [contactError, setContactError] = useState('')
  const [submittingContact, setSubmittingContact] = useState(false)
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [hzValue, setHzValue] = useState(1000)
  const [animatedGaugePos, setAnimatedGaugePos] = useState('78%')
  const [showCtaNudge, setShowCtaNudge] = useState(false)
  const [showFinalCta, setShowFinalCta] = useState(false)
  const [dismissedCtaBlur, setDismissedCtaBlur] = useState(false)

  useExitIntent();

  const routeContext = useMemo(() => {
    try {
      const pathname = String(window.location.pathname || '')
      if (pathname.includes('/pt/') || pathname.endsWith('/pt') || pathname === '/pt') return 'PT'
      if (pathname.includes('/de/') || pathname.endsWith('/de') || pathname === '/de') return 'DE'
      return 'BR'
    } catch {
      return 'BR'
    }
  }, [])

  const defaultDDI = useMemo(() => {
    if (routeContext === 'PT') return '+351'
    if (routeContext === 'DE') return '+49'
    return '+55'
  }, [routeContext])

  const isPtRoute = routeContext === 'PT'

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
  const [countryCode, setCountryCode] = useState(defaultDDI)

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
      let cachedValue = ''
      if (preference === 'whatsapp') {
        if (data?.whatsapp_raw) {
          cachedValue = data.whatsapp_raw
        } else if (data?.whatsapp) {
          // Fallback ultra-conservador: só remove se o número começar exatamente com o DDI padrão atual
          const digits = defaultDDI.replace(/\D/g, '')
          let cleaned = data.whatsapp.replace(/\D/g, '')
          if (cleaned.startsWith(digits)) {
            cleaned = cleaned.substring(digits.length)
          }
          cachedValue = cleaned
        }
      } else if (preference === 'email') {
        cachedValue = data?.email || ''
      }

      setContactPreference(preference)
      setContactValue(cachedValue)

      // Ajuste: Forçamos a exibição do modal para instigar curiosidade, 
      // mesmo que já tenhamos os dados (ajustado conforme pedido do Vinicius)
      setShowContactModal(true)

      if (cachedValue) setContactSubmitted(false) // Reset para mostrar o modal novamente se necessário

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
    // Bloqueia scroll APENAS se o modal de contato estiver ativo
    if (showContactModal) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
    }
    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
    }
  }, [showContactModal, showFinalCta])

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
    const scoreKeys = new Set([
      'sim_drenado', 'cabeca_nunca_desliga', 'ignoro_pausa',
      'sim_acontece_muito', 'algumas_vezes_afastar', 'as_vezes_sem_energia',
      'sim_mexe_demais', 'as_vezes_fujo', 'detesto_quando_acontece',
      'sim_sinto_na_pele', 'frequentemente_sensivel', 'as_vezes_tenso',
      'sim_magoa', 'varias_vezes', 'as_vezes_distancia',
      'sim_perdi_ritmo', 'muitas_vezes_limitado', 'as_vezes_desanimo'
    ]);

    const symptoms = [];

    Object.keys(qa).forEach((stepId) => {
      const items = qa[stepId] || [];
      for (const it of items) {
        const key = String(it?.answer_key || '').toLowerCase();
        const a = String(it?.answer || '').toLowerCase();
        const emoji = String(it?.emoji || '');

        if (negEmoji.has(emoji)) {
          score += 2;
        } else if (key && scoreKeys.has(key)) {
          score += 1;
        } else {
          const keyMap = ['cansaco', 'drenado', 'sem energia', 'ansiedade', 'peso', 'cabeca nunca desliga', 'ignoro', 'triste', 'pesado', 'baixa', 'falta', 'preocupado', 'insegura', 'inseguro'];
          for (const k of keyMap) {
            if (a.includes(k)) {
              score += 1;
              break;
            }
          }
        }

        if (it?.answer_key && scoreKeys.has(it.answer_key)) {
          symptoms.push(it.answer.toLowerCase());
        }
      }
    });

    const level = score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low';
    const segmentPluralKey = g === 'mulher' ? 'women' : 'men';
    const genderToneKey = g === 'mulher' ? 'feminine' : 'masculine';
    const ageVal = Number(leadData.idade || 0);
    const faixa = isNaN(ageVal) || ageVal <= 0
      ? null
      : (ageVal >= 65 ? '65+' : ageVal >= 50 ? '50-64' : ageVal >= 35 ? '35-49' : '18-34');

    const gaugePos = score <= 2 ? '18%' : score <= 5 ? '42%' : '78%';

    // Matriz de Copy via i18n (cada locale tem as suas próprias frases)
    const selectedCopy = {
      term: t(`result.dynamic_copy.${desireKey}.term`),
      desc: t(`result.dynamic_copy.${desireKey}.desc`),
      cons: t(`result.dynamic_copy.${desireKey}.cons`)
    };

    const genderTerm = t(`result.segment.${g === 'mulher' ? 'women' : 'men'}`);
    const ageSafeFaixa = faixa || t('result.segment.like_you');

    return {
      desireKey,
      genderToneKey,
      level,
      gaugePos,
      faixa: ageSafeFaixa,
      segmentPluralKey,
      adjectiveKey: 'light',
      symptoms: symptoms.slice(0, 2).join(', '),
      dynamicCopy: {
        title: t('result.alert.title_blocked'),
        diagnosis: `${selectedCopy.desc} <strong>${selectedCopy.term}</strong>.`,
        consequence: selectedCopy.cons,
        goodNews: t('result.dynamic_copy.good_news', { genderTerm, ageFaixa: ageSafeFaixa })
      }
    };
  }, [leadData, t]);

  const getSegmentLabel = () => {
    if (!translationData) return '';
    const { segmentPluralKey, faixa } = translationData;
    const terms = t('result.segment', { returnObjects: true });
    if (!terms || typeof terms !== 'object') return '';
    const plural = terms[segmentPluralKey] || terms.women;
    if (faixa) return `${plural} ${terms.between} ${faixa}`;
    return `${plural} ${terms.like_you}`;
  };

  const scheduleCards = useCallback((startMs = 2000) => {
    if (cardsScheduled.current) return
    cardsScheduled.current = true
    const add = (ms, fn) => {
      const id = setTimeout(fn, ms)
      cardsTimers.current.push(id)
    }
    add(startMs, () => setShowCard1(true))
    add(startMs + 2000, () => setShowCard2(true))
    add(startMs + 4000, () => setShowCard3(true))
    add(startMs + 6000, () => setShowCard4(true))
  }, [])

  useEffect(() => {
    if (!contactSubmitted) return

    // Animação acelerada para 3 segundos para uma experiência mais ágil e impactante
    const ANIMATION_DURATION = 3000

    const startAnimation = () => {
      setAnimateIndicator(true)

      const startTime = Date.now()
      const startHz = 1000
      const endHz = 28
      const minPos = 18 // Ponto crítico (esquerda)
      const maxPos = 78 // Ponto normal/alto (direita)

      // Curva easeOutSine: início claro e desaceleração suave no fim
      const easeOutSine = (t) => Math.sin((t * Math.PI) / 2);

      const animate = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1)
        const easedProgress = easeOutSine(progress)

        // SINCRO TOTAL: Hz e Posição mudam no mesmo instante matemático
        let currentHz = startHz - (easedProgress * (startHz - endHz))
        setHzValue(Math.round(currentHz))

        const currentPos = maxPos - (easedProgress * (maxPos - minPos))
        setAnimatedGaugePos(`${currentPos}%`)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setHzValue(endHz)
          setAnimatedGaugePos(`${minPos}%`)
          setAnimateIndicator(true)

          if (imageLoadedRef.current) {
            scheduleCards(500) // Delay curto após concluir para exibir os cards
          }
        }
      }
      requestAnimationFrame(animate)
    }

    // Disparo com 1.7 segundos de delay conforme pedido para garantir que o modal fechou e o lag de renderização passou
    const timer = setTimeout(() => {
      startAnimation()
    }, 1700)

    return () => {
      clearTimeout(timer)
      cardsTimers.current.forEach((id) => clearTimeout(id))
    }
  }, [contactSubmitted, scheduleCards])

  // Controle da aparição da barra de CTA final e do Nudge
  useEffect(() => {
    if (showCard4) {
      // 1. Atraso de 3.0 segundos para o CTA aparecer e Scroll para o fundo
      const ctaTimer = setTimeout(() => {
        setShowFinalCta(true)
      }, 3000)

      // 2. Nudge aparece JUNTO com o CTA
      const nudgeTimer = setTimeout(() => {
        setShowCtaNudge(true)
      }, 3000)

      return () => {
        clearTimeout(ctaTimer)
        clearTimeout(nudgeTimer)
      }
    }
  }, [showCard4])

  const onImageLoad = useCallback(() => {
    imageLoadedRef.current = true
    // Removido o disparo automático no load da imagem para evitar conflito com a animação
  }, [])

  useEffect(() => {
    const applyTopBlurHeight = () => {
      try {
        const progress = document.querySelector(`[aria-label="${t('authority_header.progress_label')}"]`)
        if (!progress || !topBlurRef.current) return
        const rect = progress.getBoundingClientRect()
        const h = Math.max(0, Math.round(rect.top))
        topBlurRef.current.style.height = `${h}px`
      } catch { }
    }
    applyTopBlurHeight()
    window.addEventListener('resize', applyTopBlurHeight)
    return () => window.removeEventListener('resize', applyTopBlurHeight)
  }, [t])

  const handleContinue = () => navigate('/fim')
  const normalizePhone = (value) => String(value || '').replace(/\D/g, '')
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

  const handleContactSubmit = () => {
    if (!contactPreference) return
    const rawValue = String(contactValue || '').trim()
    if (contactPreference === 'whatsapp') {
      const normalized = normalizePhone(rawValue)
      if (normalized.length < 6) {
        setContactError(t('result.contact_errors.invalid_phone'))
        return
      }
      setSubmittingContact(true)
      try {
        const fullNumber = countryCode.replace(/\+/g, '') + normalized
        leadCache.setWhatsApp(fullNumber)
        leadCache.setWhatsAppRaw(normalized)
        leadCache.setContactPreference('whatsapp')
        const tracker = createFunnelTracker({
          baseUrl: getDefaultBaseUrl(),
          funnelId: QUIZ_FUNNEL_ID,
          getCountry: () => readStoredCountry() || undefined,
          debug: DEBUG
        });
        tracker.leadIdentified(leadData?.name || '', leadData?.email || '', fullNumber, { id: '/resultado', index: 14, name: 'Coleta de Contato' });
        setContactSubmitted(true)
        setShowContactModal(false)
      } catch {
        setContactError(t('result.contact_errors.save_phone_failed'))
      } finally {
        setSubmittingContact(false)
      }
    } else {
      if (!isValidEmail(rawValue)) {
        setContactError(t('result.contact_errors.invalid_email'))
        return
      }
      setSubmittingContact(true)
      try {
        leadCache.setEmail(rawValue)
        leadCache.setContactPreference('email')
        const tracker = createFunnelTracker({
          baseUrl: getDefaultBaseUrl(),
          funnelId: QUIZ_FUNNEL_ID,
          getCountry: () => readStoredCountry() || undefined,
          debug: DEBUG
        });
        tracker.leadIdentified(leadData?.name || '', rawValue, leadData?.whatsapp || '', { id: '/resultado', index: 14, name: 'Coleta de Contato' });
        setContactSubmitted(true)
        setShowContactModal(false)
      } catch {
        setContactError(t('result.contact_errors.save_email_failed'))
      } finally {
        setSubmittingContact(false)
      }
    }
  }

  const getDesireMeta = () => {
    if (!translationData) return {};
    return t(`result.desire_meta.${translationData.desireKey}`, { returnObjects: true });
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
    <>
      <TransitionFadeWrapper>
        <div className={styles.background3}>
          <div className={`${styles.vibrationalAura} ${!showContactModal ? styles.active : ''}`} />
          <div ref={topBlurRef} className={styles.topBlur} aria-hidden="true" />
          <div ref={mainRef} className={`${styles.mainContent} ${(showContactModal || (showFinalCta && !dismissedCtaBlur)) ? styles.blurred : ''}`}>
            <div className={styles.container21}>
              <div className={styles.backgroundBorderShad}>
                <div className={styles.container5}>
                  <p className={styles.vibraEs}>{t('result.vibrations_label')}</p>
                  <div className={styles.container4}>
                    <p className={styles.normal325Hz}>{t('result.normal_hz_label')}</p>
                  </div>
                </div>
                <div className={styles.container10}>
                  <div className={styles.metricGauge}>
                    <div className={`${styles.background2} ${animateIndicator ? styles.animated : ''}`} style={{ '--gauge-pos': animatedGaugePos }}>
                      <div className={styles.background} />
                      <p className={styles.vocMoving}>
                        <Trans
                          i18nKey="result.you_score_label"
                          values={{ score: hzValue }}
                          components={{ 1: <span className={styles.vocScoreNeg} /> }}
                        >
                          Você <span className={styles.vocScoreNeg}>{hzValue}Hz</span>
                        </Trans>
                      </p>
                    </div>
                  </div>
                  <div className={styles.container9}>
                    <p>{t('result.levels.low')}</p>
                    <p>{t('result.levels.normal')}</p>
                    <p>{t('result.levels.medium')}</p>
                    <p>{t('result.levels.high')}</p>
                  </div>
                </div>
                <div className={styles.container13} data-alert-text={t('result.alert_badge', 'ALERTA')}>
                  <div className={styles.container12}>
                    <p className={styles.mAnifestaobloqueada}>{translationData?.dynamicCopy?.title || t('result.alert.title_blocked')}</p>
                    <p className={styles.suaBaixaVibraOEstAtr}>
                      <Trans
                        defaults={translationData?.dynamicCopy?.diagnosis}
                        components={{ strong: <strong /> }}
                      />
                    </p>
                    <p className={styles.suaBaixaVibraOEstAtr}>
                      {translationData?.dynamicCopy?.consequence}
                    </p>
                    <p className={styles.suaBaixaVibraOEstAtr}>
                      <Trans
                        defaults={translationData?.dynamicCopy?.goodNews}
                        components={{ strong: <strong /> }}
                      />
                    </p>
                  </div>
                </div>
                <div className={styles.container20}>
                  <div className={styles.container19}>
                    <div className={`${styles.container16} ${showCard1 ? styles.seqVisible : styles.seqItem}`}>
                      <div className={styles.container14}>
                        <p>⛔</p>
                      </div>
                      <div className={styles.container15}>
                        <p className={styles.bloqueadorPrincipal}>{t('result.cards.main_blocker')}</p>
                        <p className={styles.mAnifestaobloqueada}>{meta.blocker}</p>
                      </div>
                    </div>
                    <div className={`${styles.container17} ${showCard2 ? styles.seqVisible : styles.seqItem}`}>
                      <div className={styles.overlay}>
                        <img src={asset('/.figma/image/mg2zmbvd-23ll8yh.svg')} className={styles.component16} loading="lazy" decoding="async" />
                      </div>
                      <div className={styles.container15}>
                        <p className={styles.bloqueadorPrincipal}>{t('result.cards.attract')}</p>
                        <p className={styles.mAnifestaobloqueada}>{meta.attract}</p>
                      </div>
                    </div>
                    <div className={`${styles.container18} ${showCard3 ? styles.seqVisible : styles.seqItem}`}>
                      <div className={styles.overlay2}>
                        <img src={asset('/.figma/image/mg2zmbvd-iuxzjl5.svg')} className={styles.component17} loading="lazy" decoding="async" />
                      </div>
                      <div className={styles.container15}>
                        <p className={styles.bloqueadorPrincipal}>{t('result.cards.best_solution')}</p>
                        <p className={styles.mAnifestaobloqueada}>{meta.solution}</p>
                      </div>
                    </div>
                    <div className={`${styles.container17} ${showCard4 ? styles.seqVisible : styles.seqItem}`}>
                      <div className={styles.overlay}>
                        <img src={asset('/.figma/image/mg2zmbvd-it7x730.svg')} className={styles.component16} loading="lazy" decoding="async" />
                      </div>
                      <div className={styles.container15}>
                        <p className={styles.bloqueadorPrincipal}>{t('result.cards.potential')}</p>
                        <p className={styles.mAnifestaobloqueada}>{meta.potential}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.modelViewerWrapper}>
                  <img src={isPtRoute ? resultadoPtImg : resultadoDeImg} alt={t('result.visual_result_alt')} onLoad={onImageLoad} style={{ width: '100%', height: '360px', objectFit: 'cover', objectPosition: 'top center' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TransitionFadeWrapper>
      {showFinalCta && (
        <div
          className={`${styles.stickyCtaBar} ${(showCtaNudge && !dismissedCtaBlur) ? styles.urgent : ''}`}
          onClick={() => setDismissedCtaBlur(true)}
        >
          <div className={styles.stickyCtaPanel} onClick={(e) => e.stopPropagation()}>
            {showCtaNudge && (
              <div className={styles.nudgeContainer}>
                <div className={styles.nudgeBubble}>
                  <p>
                    <span>{t('result.cta.nudge_prefix', 'VEJA NO BOTÃO ABAIXO:') || 'VEJA NO BOTÃO ABAIXO:'}</span>
                    <strong>{t('result.cta.nudge_main', 'Começamos A Preparar Seu Plano Vibracional!') || 'Começamos A Preparar Seu Plano Vibracional!'}</strong>
                  </p>
                </div>
                <div className={styles.nudgeAvatar}>
                  <img src={isPtRoute ? expertPtImg : expertImg} alt="Expert" />
                </div>
              </div>
            )}
            <div className={styles.ctaCaption}><Trans i18nKey="result.cta.caption" components={{ 1: <span className={styles.goldGlow} /> }} /></div>
            <button type="button" className={styles.ctaAction} onPointerDown={() => prefetchPath('/fim')} onClick={handleContinue}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              <span>{t('result.cta.button')}</span>
            </button>
          </div>
        </div>
      )}
      {showContactModal && (
        <div className={styles.phoneModalOverlay} role="dialog" aria-modal="true" aria-label={t('result.contact_modal.aria_label')}>
          <div className={styles.phoneModal}>
            <div className={styles.expertDialog}>
              <div className={styles.expertAvatar}><img src={isPtRoute ? expertPtImg : expertImg} alt="Expert" /></div>
              <div className={styles.expertBubble}><p className={styles.expertTextMain}>{contactPreference === 'whatsapp' ? t('result.contact_modal.expert_main_whatsapp') : t('result.contact_modal.expert_main_email')}</p></div>
            </div>
            <div className={styles.phoneModalContent}>
              <label className={styles.phoneInputLabel} htmlFor="contactInput">{contactPreference === 'email' ? t('result.contact_modal.label_email') : t('result.contact_modal.label_whatsapp')}</label>
              <div className={styles.phoneInputWrapper}>
                {contactPreference === 'email' ? (
                  <input id="contactInput" className={styles.phoneInput} type="email" inputMode="email" autoComplete="email" placeholder={t('result.contact_modal.placeholder_email')} value={contactValue} onChange={(e) => setContactValue(e.target.value)} disabled={submittingContact} />
                ) : (
                  <>
                    <select className={styles.countrySelect} value={countryCode} onChange={(e) => setCountryCode(e.target.value)} disabled={submittingContact} aria-label={t('result.contact_modal.aria_country_code')}>
                      {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                    <input id="contactInput" className={styles.phoneInputWithCountry} type="tel" inputMode="tel" autoComplete="tel" placeholder={t('result.contact_modal.placeholder_phone')} value={contactValue} onChange={(e) => setContactValue(e.target.value)} disabled={submittingContact} />
                  </>
                )}
              </div>
              {contactError && <p className={styles.phoneError} role="alert">{contactError}</p>}
              <div className={styles.phoneModalButton}>
                <button type="button" className={`${styles.continueButton} ${contactValue ? styles.active : styles.inactive}`} onClick={handleContactSubmit} disabled={!contactValue || submittingContact}>
                  <span>{t('result.contact_modal.button_continue')}</span>
                </button>
              </div>
              <p className={styles.privacyNote}>{t('result.contact_modal.privacy_note')}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Resultado;

