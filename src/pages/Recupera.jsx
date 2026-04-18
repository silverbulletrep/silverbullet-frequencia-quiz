import React from 'react'
import styles from './Recupera.module.scss'
import mulherTriste from '../../img/MulherTriste.webp'
import mulherFeliz from '../../img/Mulherfeliz.webp'
import massaruImg from '../../img/CMassaru.webp'
import prayerImg from '../../img/Prayer.webp'
import odioImg from '../../img/Odio.webp'
import usuarioImg from '../../img/Usuario.webp'
import garantiaImg from '../../img/GARANTIA.webp'
import { leadCache } from '@/lib/leadCache'

import { useRecuperaTimer } from '@/hooks/useRecuperaTimer'
import { useTranslation } from 'react-i18next'
import RecuperaTimer from '@/components/RecuperaTimer'
import RecuperaStickyHeader from '@/components/RecuperaStickyHeader'
import AlertReportCard from '@/components/AlertReportCard'
import TwoPathsLayout from '@/components/TwoPathsLayout'
import FaqAccordion from '@/components/FaqAccordion'

import testimonial1 from '../../img/testimonial-1.webp'
import testimonial2 from '../../img/testimonial-2.webp'
import testimonial3 from '../../img/testimonial-3.webp'


const DiscountBottomSheet = React.lazy(() => import('@/components/DiscountBottomSheet'))

export default function Recupera() {
  const { t, i18n } = useTranslation()

  const getList = (key) => {
    const res = t(key, { returnObjects: true })
    return Array.isArray(res) ? res : []
  }

  // FAQ items using existing 'fim' keys
  const faqItems = ['q1', 'q2', 'q3', 'q4'].map(q => ({
    question: t(`fim.faq.${q}.question`),
    answer: t(`fim.faq.${q}.answer`)
  }))

  const carouselRef = React.useRef(null)
  const rafRef = React.useRef(0)
  const playersRef = React.useRef([])
  const iframeRefs = React.useRef([])
  const activeIndexRef = React.useRef(0)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [playingIndex, setPlayingIndex] = React.useState(null)
  const [showCheckout, setShowCheckout] = React.useState(false)
  const [loadingCheckout, setLoadingCheckout] = React.useState(false)
  const [showDiscountSheet, setShowDiscountSheet] = React.useState(false)
  const [discountSheetVariant, setDiscountSheetVariant] = React.useState('standard')
  const checkoutOriginRef = React.useRef('')

  const testimonialImages = [testimonial1, testimonial2, testimonial3]

  // ── Timer (Story 2.1) ──
  const heroTimerRef = React.useRef(null)
  const { display: timerDisplay } = useRecuperaTimer({ initialMinutes: 15 })

  // ── Sticky Header / Progress Bar Logic (Story 2.1) ──
  const [isStickyVisible, setIsStickyVisible] = React.useState(false)
  const handleStickyVisibility = React.useCallback((visible) => {
    setIsStickyVisible(visible)
  }, [])

  // ── Reading Progress Bar (Story 2.1) ──
  const [scrollPct, setScrollPct] = React.useState(0)
  React.useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (scrollHeight > 0) {
        setScrollPct(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)))
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Scroll to offer (Story 2.1) ──
  const scrollToOffer = React.useCallback(() => {
    const el = document.getElementById('plan-receipt-anchor')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  React.useEffect(() => {
    const scriptSrc = 'https://player.vimeo.com/api/player.js'
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`)
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = scriptSrc
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const videoSlides = React.useMemo(() => ([
    {
      src: 'https://player.vimeo.com/video/1165540448?background=1&autopause=0&muted=1&playsinline=1&dnt=1',
      title: t('recupera.offer.videoTitles.0'),
    },
    {
      src: 'https://player.vimeo.com/video/1165539923?background=1&autopause=0&muted=1&playsinline=1&dnt=1',
      title: t('recupera.offer.videoTitles.1'),
    },
    {
      src: 'https://player.vimeo.com/video/1165539074?background=1&autopause=0&muted=1&playsinline=1&dnt=1',
      title: t('recupera.offer.videoTitles.2'),
    },
  ]), [i18n.language, t])

  const goToSlide = React.useCallback((index) => {
    const container = carouselRef.current
    if (!container) return
    const total = videoSlides.length
    const clampedIndex = ((index % total) + total) % total
    if (clampedIndex !== activeIndexRef.current) {
      setPlayingIndex(null)
    }
    const slideWidth = container.clientWidth
    container.scrollTo({ left: slideWidth * clampedIndex, behavior: 'smooth' })
    setActiveIndex(clampedIndex)
    activeIndexRef.current = clampedIndex
  }, [videoSlides.length])

  const restartSlide = React.useCallback((index, shouldPlay = true) => {
    const player = playersRef.current[index]
    if (!player) return
    player.setCurrentTime(0).catch(() => null)
    if (shouldPlay) {
      player.play().catch(() => null)
    }
  }, [])

  const handlePlayClick = React.useCallback((index) => {
    const player = playersRef.current[index]
    if (!player) return
    goToSlide(index)
    setPlayingIndex(index)
    player.setCurrentTime(0).catch(() => null)
    player.setMuted(false).catch(() => null)
    player.play().catch(() => null)
  }, [goToSlide])

  const handleNextClick = React.useCallback(() => {
    const currentIndex = activeIndexRef.current
    const nextIndex = (currentIndex + 1) % videoSlides.length
    const currentPlayer = playersRef.current[currentIndex]
    if (currentPlayer) {
      currentPlayer.pause().catch(() => null)
    }
    goToSlide(nextIndex)
    restartSlide(nextIndex, false)
    setPlayingIndex(null)
  }, [goToSlide, restartSlide, videoSlides.length])

  const handleCarouselScroll = React.useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      const container = carouselRef.current
      if (container) {
        const slideWidth = container.clientWidth || 1
        const nextIndex = Math.round(container.scrollLeft / slideWidth)
        if (nextIndex !== activeIndexRef.current) {
          setPlayingIndex(null)
        }
        setActiveIndex(nextIndex)
        activeIndexRef.current = nextIndex
      }
      rafRef.current = 0
    })
  }, [])

  React.useEffect(() => {
    let cancelled = false
    let timer = 0

    const setupPlayers = () => {
      if (cancelled) return
      const Vimeo = window.Vimeo
      if (!Vimeo || !Vimeo.Player) {
        timer = window.setTimeout(setupPlayers, 300)
        return
      }

      playersRef.current = videoSlides.map((video, index) => {
        const iframe = iframeRefs.current[index]
        if (!iframe) return null
        const existing = playersRef.current[index]
        if (existing) return existing
        const player = new Vimeo.Player(iframe)
        player.ready().then(() => {
          player.pause().catch(() => null)
          player.setCurrentTime(0).catch(() => null)
        }).catch(() => null)
        const handleTimeUpdate = (data) => {
          if (index !== activeIndexRef.current) return
          const remaining = data.duration - data.seconds
          if (remaining > 4) return
          if (playersRef.current[index]?.__advancing) return
          playersRef.current[index].__advancing = true
          const nextIndex = (index + 1) % videoSlides.length
          goToSlide(nextIndex)
          player.pause().catch(() => null)
          const nextPlayer = playersRef.current[nextIndex]
          if (nextPlayer) {
            nextPlayer.setCurrentTime(0).catch(() => null)
          }
          setPlayingIndex(null)
          window.setTimeout(() => {
            if (playersRef.current[index]) {
              playersRef.current[index].__advancing = false
            }
          }, 1200)
        }
        const handlePlay = () => {
          setPlayingIndex(index)
        }
        const handlePause = () => {
          setPlayingIndex(null)
        }
        const handleEnded = () => {
          if (playersRef.current[index]) {
            playersRef.current[index].__advancing = false
          }
          setPlayingIndex(null)
        }
        player.__handlers = {
          timeupdate: handleTimeUpdate,
          play: handlePlay,
          pause: handlePause,
          ended: handleEnded,
        }
        player.on('timeupdate', handleTimeUpdate)
        player.on('play', handlePlay)
        player.on('pause', handlePause)
        player.on('ended', handleEnded)
        return player
      })
    }

    setupPlayers()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
      playersRef.current.forEach((player) => {
        if (!player) return
        const handlers = player.__handlers || {}
        if (handlers.timeupdate) player.off('timeupdate', handlers.timeupdate)
        if (handlers.play) player.off('play', handlers.play)
        if (handlers.pause) player.off('pause', handlers.pause)
        if (handlers.ended) player.off('ended', handlers.ended)
      })
    }
  }, [goToSlide, videoSlides.length])

  const openDiscountSheet = React.useCallback((origin) => {
    checkoutOriginRef.current = origin
    setDiscountSheetVariant('standard')
    setShowDiscountSheet(true)
  }, [])

  const openCheckoutDirect = React.useCallback(async (origin) => {
    checkoutOriginRef.current = origin || 'recupera_direct'
    setShowCheckout(true)
  }, [])

  return (
    <div className={styles.page}>
      {/* ── Reading Progress Bar ── */}
      <div className={`${styles.progressBarTrack} ${isStickyVisible ? styles.shifted : ''}`}>
        <div className={styles.progressBarFill} style={{ width: `${scrollPct}%` }} />
      </div>

      {/* ── Sticky Header ── */}
      <RecuperaStickyHeader
        heroTimerRef={heroTimerRef}
        timerDisplay={timerDisplay}
        onVisibilityChange={handleStickyVisibility}
      />

      {/* ═══════════════════════════════════════════════════
          SECTION 1: HERO
      ═══════════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.kicker}>{t('recupera.hero.kicker')}</span>
          <h1 className={styles.headline}>
            {t('recupera.hero.headline')}
          </h1>
          <p className={styles.subheadline}>
            {t('recupera.hero.subheadline')}
          </p>
          <img src={usuarioImg} alt="" className={styles.heroImage} width="940" height="788" fetchpriority="high" loading="eager" />
          <ul className={styles.bulletList}>
            {getList('recupera.hero.bullets').map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          {/* ── Inline Timer (hero) ── */}
          <div className={styles.heroTimer} ref={heroTimerRef}>
            <span className={styles.heroTimerLabel}>{t('recupera.hero.timerLabel')}</span>
            <RecuperaTimer display={timerDisplay} />
          </div>
          <div className={styles.ctaBlock}>
            <button className={styles.ctaPrimary} type="button" onClick={scrollToOffer}>
              {t('recupera.hero.cta')}
            </button>
            <p className={styles.microcopy}>{t('recupera.hero.microcopy')}</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 2: SINAIS DE ALERTA
      ═══════════════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionText}>
            <h2 className={styles.sectionTitle}>{t('recupera.alert.title')}</h2>
            <p className={styles.longText}>{getList('recupera.alert.paragraphs')[0]}</p>
            <ul className={styles.bulletList}>
              <li>{getList('recupera.alert.paragraphs')[1]}</li>
              <li>{getList('recupera.alert.paragraphs')[2]}</li>
            </ul>
            <p className={styles.longText}>{getList('recupera.alert.paragraphs')[3]}</p>
            <h3 className={styles.sectionTitle} style={{ fontSize: '22px', marginTop: '16px' }}>
              {t('recupera.alert.cardTitle')}
            </h3>
            <AlertReportCard
              signs={getList('recupera.alert.cardSigns')}
            />
          </div>
          <div className={styles.sectionVisual} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 3: CIENTISTA (MASSARU EMOTO)
      ═══════════════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionText}>
            <h2 className={styles.sectionTitle}>{t('recupera.scientist.title')}</h2>
            <p className={styles.longText}>{t('recupera.scientist.text1')}</p>
          </div>
          <div className={styles.sectionVisual}>
            <img src={massaruImg} alt="Massaru Emoto" className={styles.sectionImage} loading="lazy" decoding="async" />
          </div>
        </div>
        <div className={styles.sectionText} style={{ marginTop: '24px' }}>
          <p className={styles.longText}>{t('recupera.scientist.text2')}</p>
          <p className={styles.shortText}><strong>{t('recupera.scientist.text3')}</strong></p>
        </div>
        {/* ── Water molecule comparison ── */}
        <div className={styles.moleculeComparison}>
          <div className={styles.moleculeCol}>
            <img src={prayerImg} alt={t('recupera.scientist.labelAbundance')} className={styles.moleculeImage} loading="lazy" decoding="async" />
            <span className={styles.moleculeLabelPos}>{t('recupera.scientist.labelAbundance')}</span>
          </div>
          <div className={styles.moleculeCol}>
            <img src={odioImg} alt={t('recupera.scientist.labelScarcity')} className={styles.moleculeImage} loading="lazy" decoding="async" />
            <span className={styles.moleculeLabelNeg}>{t('recupera.scientist.labelScarcity')}</span>
          </div>
        </div>
        <div className={styles.highlightCard}>
          <p className={styles.longText}>{t('recupera.scientist.moleculeHighlight')}</p>
        </div>
        <p className={styles.longText} style={{ marginTop: '16px' }}>{t('recupera.scientist.text4')}</p>
        {/* ── Consequence mini-cards ── */}
        <div className={styles.consequenceCards}>
          <div className={styles.consequenceNeg}>
            <span>❌</span>
            <p>{t('recupera.scientist.consequenceNeg')}</p>
          </div>
          <div className={styles.consequencePos}>
            <span>✅</span>
            <p>{t('recupera.scientist.consequencePos')}</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 4: FREQUÊNCIAS (PRODUTO)
      ═══════════════════════════════════════════════════ */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionText}>
          <h2 className={styles.sectionTitle}>{t('recupera.frequencies.title')}</h2>
          <p className={styles.longText}>{getList('recupera.frequencies.paragraphs')[0]}</p>
          <ul className={styles.bulletList}>
            <li>{getList('recupera.frequencies.paragraphs')[1]}</li>
            <li>{getList('recupera.frequencies.paragraphs')[2]}</li>
          </ul>
          <p className={styles.longText}>{getList('recupera.frequencies.paragraphs')[3]}</p>
          <div className={styles.planCard}>
            <h3>{t('recupera.frequencies.planLabel')}</h3>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 5: RESULTADOS ESPERADOS
      ═══════════════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className={styles.sectionText}>
          <h2 className={styles.sectionTitle}>{t('recupera.results.title')}</h2>
          <div className={styles.beforeAfter}>
            <div className={styles.beforeBlock}>
              <h3 className={styles.blockTitle}>{t('recupera.results.beforeTitle')}</h3>
              <ul className={styles.bulletList}>
                {getList('recupera.results.beforeItems').map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.afterBlock}>
              <h3 className={styles.blockTitle}>{t('recupera.results.afterTitle')}</h3>
              <ul className={styles.bulletList}>
                {getList('recupera.results.afterItems').map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 6: DEPOIMENTOS
      ═══════════════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className={styles.testimonialsCard}>
          <h2 className={styles.sectionTitle}>{t('recupera.testimonials.sectionTitle')}</h2>
          <div className={styles.testimonials}>
            {getList('recupera.testimonials.list').map((item, i) => (
              <div key={i} className={styles.testimonialCard}>
                <img
                  src={testimonialImages[i]}
                  alt={item.name}
                  className={styles.avatarPlaceholder}
                  style={{ objectFit: 'cover', padding: 0 }}
                  loading="lazy"
                  decoding="async"
                />
                <p className={styles.testimonialText}>{item.text}</p>
                <p className={styles.testimonialName}>— {item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 7: OFERTA (with video testimonials)
      ═══════════════════════════════════════════════════ */}
      <section className={styles.sectionAlt} id="plan-receipt-anchor">
        <div className={styles.sectionInner}>
          <div className={styles.sectionText}>
            <h2 className={styles.sectionTitle}>{t('recupera.offer.title')}</h2>
            <ul className={styles.checklist}>
              {getList('recupera.offer.items').map((item, i) => (
                <li key={i}>
                  {item.name}
                  {item.price && <span className={styles.itemPrice}> — {item.price}</span>}
                </li>
              ))}
            </ul>
            <div className={styles.pricing}>
              <div className={styles.priceRow}>
                <span>{t('recupera.offer.totalLabel')}</span>
                <span className={styles.priceValue}>{t('recupera.offer.totalPrice')}</span>
              </div>
              <div className={styles.priceRow}>
                <span>{t('recupera.offer.todayLabel')}</span>
                <span className={styles.priceToday}>{t('recupera.offer.todayPrice')}</span>
              </div>
            </div>
            <div className={styles.ctaBlock}>
              <button className={styles.ctaPrimary} type="button" onClick={() => openDiscountSheet('recupera_protocol')}>
                {t('recupera.offer.cta')}
              </button>
              <p className={styles.microcopy}>{t('recupera.offer.microcopy')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerSingle}`}>
          <div className={styles.videoCardWrapper}>
            <div className={styles.videoCard}>
              <h3 className={styles.videoHeadline}>
                {t('recupera.offer.videoHeadline')}
              </h3>
              <div className={styles.videoCarouselWrapper}>
                <div
                  className={styles.videoCarousel}
                  ref={carouselRef}
                  onScroll={handleCarouselScroll}
                >
                  {videoSlides.map((video, index) => (
                    <div className={styles.videoSlide} key={video.src}>
                      <iframe
                        src={video.src}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        title={video.title}
                        className={styles.videoFrame}
                        allowFullScreen
                        ref={(el) => {
                          iframeRefs.current[index] = el
                        }}
                      />
                      {playingIndex !== index && (
                        <button
                          className={styles.videoOverlay}
                          type="button"
                          onClick={() => handlePlayClick(index)}
                        >
                          <span className={styles.playIcon} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className={styles.carouselControls}>
                  <div className={styles.carouselDots}>
                    {videoSlides.map((video, index) => (
                      <button
                        key={video.src}
                        type="button"
                        className={`${styles.carouselDot} ${index === activeIndex ? styles.carouselDotActive : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={t('recupera.offer.videoAria', { index: index + 1 })}
                      />
                    ))}
                  </div>
                  <button
                    className={styles.carouselButton}
                    type="button"
                    onClick={handleNextClick}
                  >{t('recupera.offer.nextButton')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 8: GARANTIA
      ═══════════════════════════════════════════════════ */}
      <section className={styles.sectionAlt}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerSingle}`}>
          <div className={styles.sectionText}>
            <h2 className={styles.sectionTitle}>{t('recupera.guarantee.title')}</h2>
            <p className={styles.longText}>{t('recupera.guarantee.text')}</p>
            <img src={garantiaImg} alt="" className={styles.sectionImage} loading="lazy" decoding="async" />
            <ol className={styles.guaranteeSteps}>
              {getList('recupera.guarantee.steps').map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 9: APLICAÇÃO SIMPLES
      ═══════════════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className={styles.sectionText}>
          <h2 className={styles.sectionTitle}>{t('recupera.application.title')}</h2>
          <div className={styles.applicationSteps}>
            {getList('recupera.application.steps').map((step, i) => (
              <div key={i} className={styles.applicationStep}>
                <span className={styles.stepNumber}>{step.label}</span>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 10: FINAL CTA + TWO PATHS
      ═══════════════════════════════════════════════════ */}
      <section className={styles.finalCta}>
        <div className={styles.sectionText}>
          <h2 className={styles.sectionTitle}>{t('recupera.finalCta.title')}</h2>
        </div>
        <TwoPathsLayout path1Image={mulherTriste} path2Image={mulherFeliz} />
        <div className={styles.ctaBlock}>
          <button className={styles.ctaPrimary} type="button" onClick={() => openDiscountSheet('recupera_final')}>
            {t('recupera.finalCta.cta')}
          </button>
          <p className={styles.microcopy}>{t('recupera.finalCta.microcopy')}</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 11: FOMO
      ═══════════════════════════════════════════════════ */}
      <section className={styles.fomoSection}>
        <h2 className={styles.sectionTitle}>{t('recupera.fomo.title')}</h2>
        {getList('recupera.fomo.paragraphs').map((p, i) => (
          <p key={i} className={styles.longText}>{p}</p>
        ))}
        <div className={styles.heroTimer} style={{ justifyContent: 'center', marginTop: '16px' }}>
          <RecuperaTimer display={timerDisplay} />
        </div>
        <div className={styles.ctaBlock} style={{ marginTop: '16px' }}>
          <button className={styles.ctaPrimary} type="button" onClick={() => openDiscountSheet('recupera_fomo')}>
            {t('recupera.fomo.cta')}
          </button>
          <p className={styles.microcopy}>{t('recupera.fomo.microcopy')}</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 12: FAQ
      ═══════════════════════════════════════════════════ */}
      <section className={styles.section}>
        <FaqAccordion title={t('recupera.faq.title')} items={faqItems} />
      </section>

      {/* ── Checkout Modals ── */}
      <React.Suspense fallback={null}>
        <DiscountBottomSheet
          open={showDiscountSheet}
          onClose={() => setShowDiscountSheet(false)}
          onContinue={async () => {
            setShowDiscountSheet(false)
            setShowCheckout(true)
          }}
          variant={discountSheetVariant}
          spotsLeft={17}
        />
      </React.Suspense>

    </div>
  )
}
