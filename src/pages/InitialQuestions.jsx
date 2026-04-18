import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './InitialQuestions.module.scss';
import headerStyles from '@/components/AuthorityHeader.module.scss';
import { leadCache } from '../lib/leadCache';
import { asset } from '@/lib/asset';
import { buildRouteStep, createFunnelTracker, COUNTRY_KEY, getDefaultBaseUrl, readStoredCountry, QUIZ_FUNNEL_ID, QUIZ_STEPS } from '../lib/funnelTracker';
import { isMetaPixelPaused, initMetaPixel } from '../lib/metaPixel';
import usePrefetch from '../hooks/usePrefetch';

const DEBUG = import.meta.env.DEV
const META_PIXEL_ID = '1365856334837391'
const normalizeCountryCode = (value) => {
  const code = String(value || '').trim()
  if (!code) return ''
  return code.toUpperCase()
}

const getCountryFromLocale = () => {
  try {
    const lang = navigator.language || ''
    const match = lang.match(/-([A-Za-z]{2})\b/)
    if (!match) return ''
    return normalizeCountryCode(match[1])
  } catch {
    return ''
  }
}

const storeCountry = (country) => {
  if (!country) return
  try {
    sessionStorage.setItem(COUNTRY_KEY, country)
  } catch {
    void 0
  }
  try {
    localStorage.setItem(COUNTRY_KEY, country)
  } catch {
    void 0
  }
}

const fetchCountryFromIp = async () => {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const resp = await fetch('https://ipapi.co/json/', { signal: controller.signal })
    clearTimeout(t)
    if (!resp.ok) return ''
    const data = await resp.json()
    const country = normalizeCountryCode(data?.country_code || data?.country)
    if (country) storeCountry(country)
    return country
  } catch {
    return ''
  }
}

const resolveCountry = async () => {
  const cached = readStoredCountry()
  if (cached) return cached
  const fromIp = await fetchCountryFromIp()
  if (fromIp) return fromIp
  const fromLocale = getCountryFromLocale()
  if (fromLocale) storeCountry(fromLocale)
  return fromLocale || 'UN'
}

const tracker = createFunnelTracker({
  baseUrl: getDefaultBaseUrl(),
  funnelId: QUIZ_FUNNEL_ID,
  getCountry: () => readStoredCountry() || undefined,
  debug: import.meta.env.DEV
})

const InitialQuestions = () => {
  const { t } = useTranslation();
  const TOTAL_PAGES_FUNIL = 17
  const [selectedGender, setSelectedGender] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const womanImgRef = useRef(null);
  const manImgRef = useRef(null);
  const womanBgRef = useRef(null);
  const manBgRef = useRef(null);
  const STAR_SVG = asset('/.figma/image/mg03ny0l-7v0e27z.svg')
  const pageViewSentRef = useRef(false)
  const prefetchPath = usePrefetch();

  useEffect(() => {
    const run = () => {
      // Preload de chunks
      Promise.allSettled([
        import('./AgeSelectionWomen'),
        import('./AgeSelectionMen'),
      ]).catch(() => undefined)

      // Preload de imagens críticas das etapas 2 e 3
      const imgs = [
        asset('/img/women-50-64.webp'), // Persona principal
        asset('/img/men-50-64.webp'),   // Persona principal
        asset('/img/homens-reunidos.webp'),
        asset('/.figma/image/mg0a7uxw-5wc7hzw.webp')
      ]
      imgs.forEach(src => {
        const i = new Image()
        i.src = src
      })
    }

    try {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(run, { timeout: 1200 })
        return
      }
    } catch {
      void 0
    }

    const t = window.setTimeout(run, 500)
    return () => {
      try { clearTimeout(t) } catch { void 0 }
    }
  }, [])

  useEffect(() => {
    if (pageViewSentRef.current) return
    pageViewSentRef.current = true
    const send = async () => {
      await resolveCountry()
      void tracker.pageView(buildRouteStep('/quiz', QUIZ_STEPS.quiz, QUIZ_STEPS.quiz.name))
    }
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => send(), { timeout: 2000 })
    } else {
      setTimeout(send, 500)
    }
  }, [])

  useEffect(() => {
    if (isMetaPixelPaused('/quiz')) return
    const operacao = 'quiz.meta_pixel_setup'
    const dados_entrada = { route: '/quiz', pixelId: META_PIXEL_ID }
    const w = window
    const startedRef = { current: false }

    const start = () => {
      if (startedRef.current) return
      startedRef.current = true

      try {
        const g = w
        if (g.__quizMetaPixelBootstrapped) return
        g.__quizMetaPixelBootstrapped = true

        if (DEBUG) console.log(`[QUIZ] Iniciando operação: ${operacao}`, { dados_entrada })
        !function (f, b, e, v, n, t, s) {
          if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ?
              n.callMethod.apply(n, arguments) : n.queue.push(arguments)
          };
          if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
          n.queue = []; t = b.createElement(e); t.async = !0;
          t.src = v; s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s)
        }(w, document, 'script',
          'https://connect.facebook.net/en_US/fbevents.js')
        fbq('init', '1365856334837391')
        fbq('track', 'PageView')
        if (DEBUG) {
          console.log('[QUIZ] Operação concluída com sucesso:', {
            id_resultado: 'MetaPixel:PageView:/quiz',
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        if (DEBUG) {
          console.error(`[QUIZ] Erro na operação: ${error?.message || String(error)}`, {
            dados_entrada,
            stack: error?.stack,
            timestamp: new Date().toISOString()
          })
        }
      }
    }

    const onInteract = () => start()
    const opts = { passive: true }

    try {
      w.addEventListener('pointerdown', onInteract, opts)
      w.addEventListener('touchstart', onInteract, opts)
      w.addEventListener('keydown', onInteract)
    } catch {
      void 0
    }

    let idleId
    let t
    try {
      if (typeof w.requestIdleCallback === 'function') {
        idleId = w.requestIdleCallback(start, { timeout: 2500 })
      } else {
        t = w.setTimeout(start, 1800)
      }
    } catch {
      t = w.setTimeout(start, 1800)
    }

    return () => {
      try {
        w.removeEventListener('pointerdown', onInteract, opts)
        w.removeEventListener('touchstart', onInteract, opts)
        w.removeEventListener('keydown', onInteract)
      } catch {
        void 0
      }
      try {
        if (idleId && typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleId)
      } catch {
        void 0
      }
      try {
        if (t) w.clearTimeout(t)
      } catch {
        void 0
      }
    }
  }, [])


  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    try {
      if (gender === 'mulher' || gender === 'homem') {
        leadCache.setGenero(gender)
      }
      leadCache.setEtapa('CP01 - Gênero&Idade')
    } catch (e) {
      if (DEBUG) console.warn('[INITIAL_QUESTIONS] Falha ao salvar gênero no cache:', e)
    }

    const qs = location.search || ''
    if (gender === 'mulher') {
      navigate(`/age-selection-women${qs}`);
    } else if (gender === 'homem') {
      navigate(`/age-selection-men${qs}`);
    }
  };

  return (
    <div className={styles.signupSpiriohubComEn}>
      <div className={styles.background2}>
        <div className={styles.container6}>
          <p className={styles.torneSeUmaPessoaDeAl3}>
            <span className={styles.torneSeUmaPessoaDeAl}>{t('quiz.initial.headline_part1')} </span>{' '}
            <span className={styles.torneSeUmaPessoaDeAl2}>{t('quiz.initial.headline_part2')}</span>
          </p>
          <p className={styles.porFavorEscolhaAOpOp}>{t('quiz.initial.subtitle')}</p>
          <div className={styles.container5} role="group" aria-label="Seleção de Gênero">
            <div
              className={`${styles.component2} ${selectedGender === 'homem' ? styles.selected : ''}`}
              onPointerDown={() => prefetchPath('/age-selection-men')}
              onClick={() => handleGenderSelect('homem')}
              role="button"
              tabIndex={0}
              aria-pressed={selectedGender === 'homem'}
              aria-label={t('quiz.initial.gender_male')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGenderSelect('homem'); } }}
            >
              <div className={styles.background} ref={manBgRef}>
                <img src={asset('/img/homem.webp')} className={styles.man} alt="" aria-hidden="true" ref={manImgRef} width="198" height="181" fetchpriority="high" loading="eager" decoding="async" />
              </div>
              <div className={styles.container4}>
                <p className={styles.text}>{t('quiz.initial.gender_male')}</p>
                <svg
                  className={styles.component14}
                  width="12"
                  height="20"
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
              className={`${styles.component22} ${selectedGender === 'mulher' ? styles.selected : ''}`}
              onPointerDown={() => prefetchPath('/age-selection-women')}
              onClick={() => handleGenderSelect('mulher')}
              role="button"
              tabIndex={0}
              aria-pressed={selectedGender === 'mulher'}
              aria-label={t('quiz.initial.gender_female')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGenderSelect('mulher'); } }}
            >
              <div className={styles.background} ref={womanBgRef}>
                <img src={asset('/img/mulher.webp')} className={styles.man} alt={t('quiz.initial.gender_female')} ref={womanImgRef} width="198" height="181" fetchpriority="high" loading="eager" decoding="async" />
              </div>
              <div className={styles.container4}>
                <p className={styles.text}>{t('quiz.initial.gender_female')}</p>
                <svg
                  className={styles.component14}
                  width="12"
                  height="20"
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
          <p className={styles.tEstede1Minuto}>{t('quiz.initial.test_duration')}</p>
          <div className={`${headerStyles.ratingArea} ${headerStyles.ratingAreaCompact}`} aria-label={t('quiz.initial.rating_aria')} style={{ gap: 8 }}>
            <img src={STAR_SVG} className={headerStyles.ratingStar} alt="Star" style={{ width: 18, height: 18 }} />
            <p className={headerStyles.ratingText} style={{ fontSize: 13 }}>
              <span className={headerStyles.ratingNumber}>4.8</span>
              <span className={headerStyles.ratingSlash}>&nbsp;/&nbsp;</span>
              <span className={headerStyles.ratingTotal}>5</span>
            </p>
          </div>
          <p className={styles.aoClicarEmHomemOuMul3}>
            <span className={styles.aoClicarEmHomemOuMul}>
              {t('quiz.initial.legal_text_part1')}&nbsp;
            </span>
            <span className={styles.aoClicarEmHomemOuMul2}>{t('quiz.initial.terms')}</span>
            <span className={styles.aoClicarEmHomemOuMul}>,&nbsp;</span>
            <span className={styles.aoClicarEmHomemOuMul2}>
              {t('quiz.initial.privacy')}
            </span>
            <span className={styles.aoClicarEmHomemOuMul}>,&nbsp;</span>
            <span className={styles.aoClicarEmHomemOuMul2}>
              {t('quiz.initial.cookies')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InitialQuestions;
