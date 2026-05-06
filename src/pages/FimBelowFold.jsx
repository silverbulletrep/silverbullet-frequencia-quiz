import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ShieldCheck, Star } from 'lucide-react'
import { leadCache } from '@/lib/leadCache'
import { buildCheckoutJourneyContext, buildHotmartCheckoutUrl, makeLeadIdShort, normalizeHotmartPaymentMethod } from '@/lib/hotmartCheckout'
import { buildRouteStep, createFunnelTracker, getDefaultBaseUrl, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, readStoredCountry } from '@/lib/funnelTracker'
import { useLocation, useNavigate } from 'react-router-dom'

import styles from './FimBelowFold.module.scss'

import imgI01 from '../../img/I01.webp'
import imgI03 from '../../img/I03.webp'
import imgI04 from '../../img/I04.webp'


const ComparisonCard = React.lazy(() => import('@/components/ComparisonCard'))
const DiscountBottomSheet = React.lazy(() => import('@/components/DiscountBottomSheet'))
const PaymentMethodModal = React.lazy(() => import('@/components/PaymentMethodModal'))
const CheckoutModal = React.lazy(() => import('@/components/CheckoutModal'))

const HOTMART_MAIN_CHECKOUT_URL = 'https://pay.hotmart.com/N105101154W?checkoutMode=10'
const HOTMART_BANNER_URL = 'https://static-media.hotmart.com/YSQVlHHKs3nV1EiNhuXYKOBuh98=/1024x338/filters:quality(100)/hotmart/checkout_custom/2b1a1971-e4c1-455e-b3a6-11c757c31277/pmojd9f69.png'

export default function FimBelowFold({
    isOfferVisible,
    displayedHeaderPct = 0,
    onCheckoutSuccess,
    DEBUG,
    giftThemeActive = false,
    discountThemeActive = false,
    showDiscountModal = false,
    checkoutResumeMode = null,
    onCheckoutOpen,
    onCheckoutResumeHandled,
    onDiscountActivated
}) {
    const { t } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    const isPtRoute = (() => {
        try {
            const p = String(window.location.pathname || '')
            if (p.includes('/pt/') || p.endsWith('/pt') || p === '/pt') return true
            return false
        } catch { return true }
    })()
    const isDeRoute = (() => {
        try {
            const p = String(window.location.pathname || '')
            if (p.includes('/de/') || p.endsWith('/de') || p === '/de') return true
            return false
        } catch { return false }
    })()
    const [showComparisonCard, setShowComparisonCard] = useState(false)

    // 🎬 Pré-carrega o vídeo com delay moderado após a montagem em background
    const [offerVideoSrc, setOfferVideoSrc] = useState(null)
    useEffect(() => {
        if (isDeRoute) return;

        const timer = setTimeout(() => {
            if (!offerVideoSrc) {
                setOfferVideoSrc('https://fundaris.space/mokup-video/app.webm')
            }
        }, 15000); // 15s após entrar na tela (não pesa no load inicial, e ainda dá tempo)
        return () => clearTimeout(timer);
    }, [offerVideoSrc, isDeRoute])

    // 🔥 Estratégia de Performance: Pre-load do Checkout Hotmart
    useEffect(() => {
        if (!isOfferVisible) return;

        // 1. Preconnect imediato (Ultra Leve): Resolve DNS e SSL antecipadamente
        const preconnect = () => {
            try {
                const domains = ['https://pay.hotmart.com', 'https://static.hotmart.com'];
                domains.forEach(domain => {
                    const pc = document.createElement('link');
                    pc.rel = 'preconnect';
                    pc.href = domain;
                    document.head.appendChild(pc);

                    const dns = document.createElement('link');
                    dns.rel = 'dns-prefetch';
                    dns.href = domain;
                    document.head.appendChild(dns);
                });
            } catch (e) { }
        };
        preconnect();

        // 2. Prefetch após 2 segundos: Baixa os recursos apenas quando o navegador estiver ocioso
        const TIMER_PREFETCH = 2000;
        const prefetchTimer = setTimeout(() => {
            const startPrefetch = () => {
                try {
                    const cache = leadCache.getAll();
                    const leadId = localStorage.getItem('lead_id') || cache?.lead_id || cache?.id_lead || '';
                    const email = cache?.email || '';
                    const leadIdShort = leadId ? makeLeadIdShort(leadId) : '';

                    // 🔥 Injeta Prefetch da Imagem do Banner (para evitar "pisca" branco no checkout)
                    if (!document.querySelector(`link[rel="prefetch"][href="${HOTMART_BANNER_URL}"]`)) {
                        const imgLink = document.createElement('link');
                        imgLink.rel = 'prefetch';
                        imgLink.as = 'image';
                        imgLink.href = HOTMART_BANNER_URL;
                        document.head.appendChild(imgLink);
                        if (DEBUG) console.log('[HOTMART] Prefetch do banner iniciado em idle');
                    }

                    const checkoutUrl = buildHotmartCheckoutUrl({
                        baseUrl: HOTMART_MAIN_CHECKOUT_URL,
                        leadIdShort: leadIdShort || undefined,
                        email: email || undefined
                    });

                    if (!document.querySelector(`link[rel="prefetch"][href="${checkoutUrl}"]`)) {
                        const link = document.createElement('link');
                        link.rel = 'prefetch';
                        link.href = checkoutUrl;
                        document.head.appendChild(link);
                        if (DEBUG) console.log('[HOTMART] Prefetch do checkout iniciado em idle:', checkoutUrl);
                    }
                } catch (e) { }
            };

            // Usa requestIdleCallback para garantir que o download não compita com tarefas críticas da UI
            if (typeof window.requestIdleCallback === 'function') {
                window.requestIdleCallback(() => startPrefetch(), { timeout: 2000 });
            } else {
                setTimeout(startPrefetch, 1000);
            }
        }, TIMER_PREFETCH);

        return () => clearTimeout(prefetchTimer);
    }, [isOfferVisible, DEBUG]);

    const [expandedIndex, setExpandedIndex] = useState(-1)
    const [expandedFaqIndex, setExpandedFaqIndex] = useState(null)
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)


    const [showDiscountSheet, setShowDiscountSheet] = useState(false)
    const [discountSheetVariant, setDiscountSheetVariant] = useState('standard')
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)
    const [showStripeCheckout, setShowStripeCheckout] = useState(false)

    const checkoutOriginRef = useRef('')
    const offerSectionRef = useRef(null)

    const tracker = createFunnelTracker({
        baseUrl: getDefaultBaseUrl(),
        funnelId: QUIZ_FUNNEL_ID,
        getCountry: () => readStoredCountry() || undefined,
        debug: Boolean(DEBUG)
    })

    const handleCheckoutTracking = async (methodId, origin) => {
        const cache = leadCache.getAll()
        const leadId = (() => {
            try {
                const storedLeadId = localStorage.getItem('lead_id')
                if (typeof storedLeadId === 'string' && storedLeadId.trim()) return storedLeadId.trim()
            } catch { }
            if (typeof cache?.lead_id === 'string' && cache.lead_id.trim()) return cache.lead_id.trim()
            if (typeof cache?.id_lead === 'string' && cache.id_lead.trim()) return cache.id_lead.trim()
            return ''
        })()
        const email = typeof cache?.email === 'string' ? cache.email.trim() : ''
        const leadIdShort = leadId ? makeLeadIdShort(leadId) : ''
        const paymentMethod = methodId ? normalizeHotmartPaymentMethod(methodId) : undefined
        const step = buildRouteStep('/fim', QUIZ_PROGRESS_STEPS.fim, 'Página de Oferta')
        const checkoutValue = discountThemeActive ? 33 : 37

        if (leadIdShort) {
            try { leadCache.setLeadIdShort(leadIdShort) } catch { }
        }

        try {
            await tracker.checkoutStart(
                step,
                { value: checkoutValue, currency: 'EUR' },
                {
                    ...buildCheckoutJourneyContext({
                        flow: 'front',
                        origin: origin || 'fim',
                        paymentMethod: paymentMethod || undefined,
                        emailPresent: Boolean(email),
                        leadIdShort: leadIdShort || undefined,
                    }),
                    discount_active: discountThemeActive,
                    gift_active: giftThemeActive
                }
            )
        } catch (error) {
            console.error('[FIM] Erro ao enviar checkout_start', { message: error?.message })
        }

        return { leadIdShort, email, paymentMethod, checkoutValue }
    }

    const redirectToMainCheckout = async (methodId) => {
        const { leadIdShort, email, paymentMethod } = await handleCheckoutTracking(methodId, checkoutOriginRef.current)

        // Anti-Race Condition Buffer: Garante que a promessa de tracking tenha
        // 80ms de processamento dentro do event loop antes da pagina ser destruida
        await new Promise(resolve => setTimeout(resolve, 80))

        const checkoutUrl = buildHotmartCheckoutUrl({
            baseUrl: HOTMART_MAIN_CHECKOUT_URL,
            paymentMethod: paymentMethod || undefined,
            leadIdShort: leadIdShort || undefined,
            email: email || undefined
        })

        window.location.href = checkoutUrl
    }

    const handleCheckoutClose = useCallback(() => {
        if (DEBUG) {
            console.log('[CHECKOUT] Closing Stripe checkout modal', {
                route: window.location.pathname,
                discountThemeActive,
                showDiscountModal
            });
        }
        setShowStripeCheckout(false);
    }, [DEBUG, discountThemeActive, showDiscountModal]);

    const handleCheckoutIdle = useCallback(() => {
        if (DEBUG) {
            console.warn('[RETENTION] Checkout idle detected; preparing discount modal takeover', {
                route: window.location.pathname,
                discountThemeActive,
                showDiscountModal
            });
        }
        if (!isPtRoute && !discountThemeActive && onDiscountActivated) {
            const targetTime = Date.now() + (300 * 1000);
            setShowStripeCheckout(false);
            onDiscountActivated(targetTime);
            return;
        }
        setShowStripeCheckout(false);
    }, [DEBUG, isPtRoute, discountThemeActive, onDiscountActivated, showDiscountModal]);

    const checkoutEmail = useMemo(() => {
        try {
            return leadCache.getAll()?.email || '';
        } catch {
            return '';
        }
    }, []);

    const checkoutMetadata = useMemo(() => ({
        origin: checkoutOriginRef.current || 'fim',
        product_name: t('checkout_modal.product_name', 'Personalisierter Plan'),
        discount_active: discountThemeActive,
        gift_active: giftThemeActive
    }), [discountThemeActive, giftThemeActive, t]);

    useEffect(() => {
        if (checkoutResumeMode !== 'discount') return
        if (DEBUG) {
            console.log('[RETENTION] Reopening checkout in discount mode', {
                route: window.location.pathname,
                discountThemeActive
            })
        }
        setShowStripeCheckout(true)
        onCheckoutResumeHandled && onCheckoutResumeHandled()
    }, [DEBUG, checkoutResumeMode, discountThemeActive, onCheckoutResumeHandled])

    return (
        <>
            <section
                ref={offerSectionRef}
                className={`${styles.offerSection} ${styles.offerAppear} ${isOfferVisible ? '' : 'esconder'}`}
                aria-label="O que você ganha"
            >
                {showComparisonCard && (
                    <React.Suspense fallback={null}><ComparisonCard /></React.Suspense>
                )}

                {/* 🎬 Vídeo de Oferta — removido COMPLETAMENTE do DOM em /de */}
                {!isDeRoute && (
                    <div className={styles.offerVideoWrap}>
                        {offerVideoSrc ? (
                            <video
                                className={styles.offerVideo}
                                src={offerVideoSrc}
                                playsInline
                                autoPlay
                                muted
                                loop
                                preload="auto"
                                aria-label="Apresentação do produto"
                            />
                        ) : (
                            <div className={styles.offerVideoPlaceholder} aria-hidden="true" />
                        )}
                    </div>
                )}

                <div id="plan-receipt-anchor" className={styles.anchorReceipt} aria-label="Resumo de valores">
                    <div className={styles.receiptHeader}>
                        <span className={styles.receiptTitle}>{t('fim.receipt.summary')}</span>
                    </div>
                    <div className={styles.receiptBody}>
                        {giftThemeActive && (
                            <div className={styles.summaryRowGift}>
                                <span>🎁 {t('fim_gift.title')}</span>
                                <span className={styles.giftPriceFree}>{t('surprise_modal.phase4.card_access_value')}</span>
                            </div>
                        )}
                        <div className={styles.receiptRow}>
                            <span>{t('fim.offer.items.geniality.title')}</span>
                            <span>97€</span>
                        </div>
                        <div className={styles.receiptRow}>
                            <span>{t('fim.offer.items.decoder.title')}</span>
                            <span>75€</span>
                        </div>
                        <div className={styles.receiptRow}>
                            <span>{t('fim.offer.items.regeneration.title')}</span>
                            <span>60€</span>
                        </div>
                        <div className={styles.receiptRow}>
                            <span>{t('fim.offer.items.shield.title')}</span>
                            <span>45€</span>
                        </div>
                        <div className={styles.receiptRow}>
                            <span>{t('fim.offer.items.guide.title')}</span>
                            <span>53€</span>
                        </div>
                        <div className={styles.receiptTotalRow}>
                            <span>{t('fim.receipt.total')}</span>
                            <span className={styles.strikeValue}>330€</span>
                        </div>
                    </div>
                    <div
                        className={styles.finalAnchor}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            checkoutOriginRef.current = 'fim_discount_direct'
                            setDiscountSheetVariant('standard')
                            setShowDiscountSheet(true)
                            if (onCheckoutOpen) onCheckoutOpen()
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                e.currentTarget.click()
                            }
                        }}
                    >
                        <span className={styles.finalPrice}>{t('fim.receipt.today')}</span>
                        <span className={styles.finalPrice}>€{discountThemeActive ? '33,00' : '37,00'}</span>
                    </div>
                </div>

                <div className={styles.guaranteeBox}>
                    <ShieldCheck className={styles.guaranteeIcon} />
                    <h4 className={styles.guaranteeTitle}>{t('fim.guarantee.title')}</h4>
                    <p className={styles.guaranteeText}>
                        {t('fim.guarantee.text')}
                    </p>
                </div>

                <h2 className={styles.offerTitle}>{t('fim.offer.title')}</h2>
                <div className={styles.offerGrid}>
                    {(() => {
                        const items = [
                            {
                                title: t('fim.offer.items.geniality.title'),
                                teaser: t('fim.offer.items.geniality.teaser'),
                                price: t('fim.offer.items.geniality.price'),
                                description: t('fim.offer.items.geniality.desc'),
                            },
                            {
                                title: t('fim.offer.items.decoder.title'),
                                teaser: t('fim.offer.items.decoder.teaser'),
                                price: t('fim.offer.items.decoder.price'),
                                description: t('fim.offer.items.decoder.desc'),
                            },
                            {
                                title: t('fim.offer.items.regeneration.title'),
                                teaser: t('fim.offer.items.regeneration.teaser'),
                                price: t('fim.offer.items.regeneration.price'),
                                description: t('fim.offer.items.regeneration.desc'),
                            },
                            {
                                title: t('fim.offer.items.shield.title'),
                                teaser: t('fim.offer.items.shield.teaser'),
                                price: t('fim.offer.items.shield.price'),
                                description: t('fim.offer.items.shield.desc'),
                            },
                            {
                                title: t('fim.offer.items.guide.title'),
                                teaser: t('fim.offer.items.guide.teaser'),
                                price: t('fim.offer.items.guide.price'),
                                description: t('fim.offer.items.guide.desc'),
                            },
                        ];

                        return items.map((item, idx) => (
                            <div
                                key={item.title}
                                className={styles.offerItem}
                            >
                                <div className={styles.offerHeader}>
                                    <div className={styles.offerTitleRow}>
                                        <span className={styles.offerIndex}>{idx + 1}.</span>
                                        <span className={styles.offerName}>{item.title}</span>
                                    </div>
                                    <span className={styles.offerPrice}>
                                        {item.price}
                                    </span>
                                </div>
                                <p className={styles.offerTeaser}>{item.teaser}</p>
                                <button
                                    type="button"
                                    className={styles.offerMore}
                                    onClick={() => setExpandedIndex((prev) => (prev === idx ? -1 : idx))}
                                    aria-expanded={expandedIndex === idx}
                                >
                                    {expandedIndex === idx ? t('fim.offer.view_less') : t('fim.offer.view_more')}
                                </button>
                                {expandedIndex === idx && (
                                    <p className={styles.offerDescription}>{item.description}</p>
                                )}
                            </div>
                        ));
                    })()}
                </div>

                <div className={styles.testimonialsSection}>
                    <h3 className={styles.testimonialsHeadline}>
                        {t('fim.testimonials.title')}
                    </h3>

                    <div className={styles.testimonialCard}>
                        <div className={styles.testimonialHeader}>
                            <div className={styles.testimonialAvatar}>
                                <img src={imgI04} alt="Laura S." width="40" height="40" loading="lazy" />
                            </div>
                            <div className={styles.testimonialInfo}>
                                <div className={styles.testimonialName}>Laura S.</div>
                                <div className={styles.testimonialStars}>
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#F2C94C" stroke="none" />)}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}></div>
                            <div className={styles.testimonialTime}>{t('fim.testimonials.laura.time')}</div>
                        </div>
                        <p className={styles.testimonialText}>
                            {t('fim.testimonials.laura.text')}
                        </p>
                    </div>

                    <div className={styles.testimonialCard}>
                        <div className={styles.testimonialHeader}>
                            <div className={styles.testimonialAvatar}>
                                <img src={imgI03} alt="Ann R." width="40" height="40" loading="lazy" />
                            </div>
                            <div className={styles.testimonialInfo}>
                                <div className={styles.testimonialName}>Ann R.</div>
                                <div className={styles.testimonialStars}>
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#F2C94C" stroke="none" />)}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}></div>
                            <div className={styles.testimonialTime}>{t('fim.testimonials.ann.time')}</div>
                        </div>
                        <p className={styles.testimonialText}>
                            {t('fim.testimonials.ann.text')}
                        </p>
                    </div>

                    <div className={styles.testimonialCard}>
                        <div className={styles.testimonialHeader}>
                            <div className={styles.testimonialAvatar}>
                                <img src={imgI01} alt="Scott G." width="40" height="40" loading="lazy" />
                            </div>
                            <div className={styles.testimonialInfo}>
                                <div className={styles.testimonialName}>Scott G.</div>
                                <div className={styles.testimonialStars}>
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#F2C94C" stroke="none" />)}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}></div>
                            <div className={styles.testimonialTime}>{t('fim.testimonials.scott.time')}</div>
                        </div>
                        <p className={styles.testimonialText}>
                            {t('fim.testimonials.scott.text')}
                        </p>
                    </div>
                </div>

                <h2 className={styles.customHeadline}>{t('fim.custom_headline')}</h2>

                <div className={styles.anchorReceipt} aria-label="Resumo de valores">
                    <div
                        className={`${styles.receiptHeader} ${styles.expandableHeader}`}
                        onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                        role="button"
                        tabIndex={0}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={styles.receiptTitle}>{t('fim.receipt.summary')}</span>
                            <ChevronDown
                                className={`${styles.arrowIcon} ${isSummaryExpanded ? styles.arrowRotated : ''}`}
                                size={20}
                            />
                        </div>
                        {!isSummaryExpanded && (
                            <div className={styles.collapsedSummary}>
                                <span className={styles.totalValue}>{t('fim.receipt.total')} (330€)</span>
                            </div>
                        )}
                    </div>
                    <div className={`${styles.summaryContent} ${isSummaryExpanded ? styles.expanded : ''}`}>
                        <div className={styles.receiptBody}>
                            {/* Simplified receipt rows for summary - duplicated/cleaner */}
                            <div className={styles.receiptRow}><span>{t('fim.offer.items.geniality.title')}</span><span>97€</span></div>
                            <div className={styles.receiptRow}><span>{t('fim.offer.items.decoder.title')}</span><span>75€</span></div>
                            <div className={styles.receiptRow}><span>{t('fim.offer.items.regeneration.title')}</span><span>60€</span></div>
                            <div className={styles.receiptRow}><span>{t('fim.offer.items.shield.title')}</span><span>45€</span></div>
                            <div className={styles.receiptRow}><span>{t('fim.offer.items.guide.title')}</span><span>53€</span></div>
                            <div className={styles.receiptTotalRow}><span>{t('fim.receipt.total')}</span><span className={styles.strikeValue}>330€</span></div>
                        </div>
                    </div>
                    <div
                        className={styles.finalAnchor}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                            checkoutOriginRef.current = 'fim_discount_bottom'
                            setDiscountSheetVariant('standard')
                            setShowDiscountSheet(true)
                        }}
                    >
                        <span className={styles.finalPrice}>{t('fim.receipt.today')}</span>
                        <span className={styles.finalPrice}>€{discountThemeActive ? '33,00' : '37,00'}</span>
                    </div>
                </div>

                <h2 className={styles.faqTitle}>{t('fim.faq.title')}</h2>
                <div className={styles.faqSection}>
                    {[
                        { q: t('fim.faq.q1.question'), a: t('fim.faq.q1.answer') },
                        { q: t('fim.faq.q2.question'), a: t('fim.faq.q2.answer') },
                        { q: t('fim.faq.q3.question'), a: t('fim.faq.q3.answer') },
                        { q: t('fim.faq.q4.question'), a: t('fim.faq.q4.answer') }
                    ].map((item, idx) => (
                        <div key={idx} className={styles.faqItem}>
                            <div
                                className={styles.faqHeader}
                                onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                            >
                                <span>{item.q}</span>
                                <ChevronDown
                                    className={`${styles.arrowIcon} ${expandedFaqIndex === idx ? styles.arrowRotated : ''}`}
                                    size={20}
                                />
                            </div>
                            {expandedFaqIndex === idx && (
                                <div className={styles.faqContent}>
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <React.Suspense fallback={null}>
                <DiscountBottomSheet
                    open={showDiscountSheet}
                    onClose={() => {
                        setShowDiscountSheet(false)
                        // Scroll to top or specific element logic
                        const el = document.getElementById('comparison-headline') // This ID was in Fim.jsx? Check.
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        else window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    onContinue={async () => {
                        setShowDiscountSheet(false)
                        if (isPtRoute) {
                            setShowPaymentMethodModal(true)
                        } else {
                            const origin = checkoutOriginRef.current || 'fim'
                            await handleCheckoutTracking('', origin)
                            setShowStripeCheckout(true)
                        }
                    }}
                    variant={discountSheetVariant}
                />
            </React.Suspense>

            <React.Suspense fallback={null}>
                <PaymentMethodModal
                    open={showPaymentMethodModal}
                    onClose={() => setShowPaymentMethodModal(false)}
                    onSelect={async (methodId) => {
                        const paymentMethod = normalizeHotmartPaymentMethod(methodId)
                        try { localStorage.setItem('metodo_pagamento', paymentMethod) } catch { }
                        setShowPaymentMethodModal(false)
                        await redirectToMainCheckout(paymentMethod)
                    }}
                />
            </React.Suspense>

            <React.Suspense fallback={null}>
                {showStripeCheckout && !showDiscountModal && (
                    <CheckoutModal
                        key={`stripe-checkout:${discountThemeActive ? 'discount' : 'standard'}:${discountThemeActive ? 3300 : 3700}`}
                        onClose={handleCheckoutClose}
                        onIdle={handleCheckoutIdle}
                        onSuccess={(data) => {
                            console.log('[FIM] De checkout sucess:', data)
                            setShowStripeCheckout(false)
                            navigate('/de/audio-upsell')
                        }}
                        amount_cents={discountThemeActive ? 3300 : 3700}
                        currency="eur"
                        email={checkoutEmail}
                        metadata={checkoutMetadata}
                        giftThemeActive={giftThemeActive}
                        discountThemeActive={discountThemeActive}
                    />
                )}
            </React.Suspense>


        </>
    )
}
