import React, { useEffect, useMemo, useRef, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useElements, useStripe, CardNumberElement, CardExpiryElement, CardCvcElement, PaymentRequestButtonElement } from '@stripe/react-stripe-js'
import { createPortal } from 'react-dom'
import styles from './CheckoutModal.module.scss'
import { createPaymentIntent, API_BASE_URL, createPayPalOrder, capturePayPalOrder, finalizePayPalEmail } from '@/lib/api'
import { leadCache } from '@/lib/leadCache'
import { leadSyncService } from '@/lib/leadSyncService'
import { useTranslation } from 'react-i18next'
import { asset } from '@/lib/asset'
import { useLocation } from 'react-router-dom'
import { initMetaPixel, trackInitiateCheckout } from '@/lib/metaPixel'
import { createFunnelTracker, QUIZ_FUNNEL_ID, getDefaultBaseUrl, readStoredCountry, buildRouteStep } from '../lib/funnelTracker'

const PUBLISHABLE_KEY = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
const PAYPAL_CLIENT_ID = (import.meta.env.VITE_PAYPAL_CLIENT_ID || import.meta.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '')

function formatCurrency(amountCents, currency) {
  const value = Number(amountCents || 0) / 100
  const cur = String(currency || '').trim().toUpperCase() || 'EUR'
  const locale = cur === 'BRL' ? 'pt-BR' : cur === 'EUR' ? 'de-DE' : 'en-US'
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  } catch {
    return `${value.toFixed(2)} ${cur}`
  }
}

function normalizeAmountCents(amountCents, currency) {
  const raw = Number(amountCents || 0)
  const cur = String(currency || '').toLowerCase()
  const allowed = cur === 'brl' ? [100, 990, 1470, 1980] : cur === 'eur' ? [3700, 3300, 2400, 4700] : []
  if (!Number.isFinite(raw)) return 0
  if (allowed.length) {
    if (allowed.includes(raw)) return raw
    const scaled = Math.round(raw * 100)
    if (allowed.includes(scaled)) return scaled
  }
  return raw
}

function InnerCheckout({
  clientSecret,
  onClose,
  amount_cents,
  currency,
  email,
  metadata,
  onSuccess,
  setClientSecret,
  setPaymentIntentDiag,
  onIdle,
  giftThemeActive,
  discountThemeActive
}) {
  const { t, i18n } = useTranslation()
  const stripe = useStripe()
  const elements = useElements()
  const location = useLocation()
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [paypalReady, setPaypalReady] = useState(false)
  const [paypalActive, setPaypalActive] = useState(false)
  const paypalActiveRef = useRef(false)
  
  useEffect(() => {
    paypalActiveRef.current = paypalActive
  }, [paypalActive])
  const [cardholderName, setCardholderName] = useState('')
  const [cardholderTouched, setCardholderTouched] = useState(false)
  const [contactEmail, setContactEmail] = useState(String(email || ''))
  const [contactEmailTouched, setContactEmailTouched] = useState(false)
  const [contactPhone, setContactPhone] = useState('')
  const [contactPhoneTouched, setContactPhoneTouched] = useState(false)
  const [showPaypalEmailModal, setShowPaypalEmailModal] = useState(false)
  const [paypalFinalizeEmail, setPaypalFinalizeEmail] = useState('')
  const [paypalFinalizePhone, setPaypalFinalizePhone] = useState('')
  const [paypalFinalizeTouched, setPaypalFinalizeTouched] = useState(false)
  const [paypalFinalizeLoading, setPaypalFinalizeLoading] = useState(false)
  const [paypalFinalizeError, setPaypalFinalizeError] = useState('')
  const [paypalFinalizeOrderId, setPaypalFinalizeOrderId] = useState('')
  const [paypalFinalizeContext, setPaypalFinalizeContext] = useState(null)
  const [cardNumComplete, setCardNumComplete] = useState(false)
  const [cardCvcComplete, setCardCvcComplete] = useState(false)
  const [cardExpComplete, setCardExpComplete] = useState(false)
  const [cardNumFocused, setCardNumFocused] = useState(false)
  const [cardCvcFocused, setCardCvcFocused] = useState(false)
  const [cardExpFocused, setCardExpFocused] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState(null)
  const [applePayAvailable, setApplePayAvailable] = useState(false)
  const [paypalRateLimited, setPaypalRateLimited] = useState(false)
  const paypalCurrency = String(currency || 'EUR').toUpperCase()
  const normalizedAmountCents = Number(amount_cents || 0)
  const paypalValue = (Number.isFinite(normalizedAmountCents) && normalizedAmountCents > 0)
    ? (normalizedAmountCents / 100).toFixed(2)
    : '0.00'
  const paypalOrderIdRef = useRef('')
  const paypalCreatePromiseRef = useRef(null)
  const paypalCapturePromiseRef = useRef(null)
  const lastIntentConfigRef = useRef({ amount_cents: null, currency: null })
  const isAudioUpsell = String(metadata?.variant || '').toLowerCase() === 'audio_upsell'
  const productName = String(metadata?.product_name || (isAudioUpsell ? t('checkout_modal.product_name', 'Personalisierter Plan 2.0') : t('checkout_modal.product_name_default', 'Personalisierter Plan'))).trim()
  const contentId = isAudioUpsell ? 'audio_upsell' : 'plan_personalizado'

  useEffect(() => {
    try {
      const data = leadCache.getAll() || {}
      const preference = data?.contact_preference || null
      const cachedEmail = String(data?.email || '').trim()
      const cachedPhone = String(data?.whatsapp || '').trim()
      const emailEmpty = !String(contactEmail || '').trim()
      const phoneEmpty = !String(contactPhone || '').trim()

      if (preference === 'email' && cachedEmail && emailEmpty) {
        setContactEmail(cachedEmail)
        return
      }
      if (preference === 'whatsapp' && cachedPhone && phoneEmpty) {
        setContactPhone(cachedPhone)
        return
      }
      if (cachedEmail && emailEmpty) setContactEmail(cachedEmail)
      if (cachedPhone && phoneEmpty) setContactPhone(cachedPhone)
    } catch { }
  }, [contactEmail, contactPhone])

  const onCloseRef = useRef(onClose);
  const onIdleRef = useRef(onIdle);
  const idleDebugEnabled = (import.meta.env && import.meta.env.DEV)
    || (typeof window !== 'undefined' && /(?:\?|&)idle_debug=1(?:&|$)/.test(String(window.location?.search || '')))

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  // ── Retention: 15s Idle Detection (Desktop + Mobile Touch) ──
  useEffect(() => {
    const isPtRoute = window.location.pathname.includes('/pt/') || window.location.pathname.endsWith('/pt') || window.location.pathname === '/pt';

    // Só em rotas alemãs e se o desconto não estiver ativo
    if (isPtRoute || discountThemeActive) {
      if (idleDebugEnabled) {
        console.log('[IDLE] Disabled for this route/theme active state', {
          isPtRoute,
          discountThemeActive
        });
      }
      return;
    }

    let idleTimer;
    const IDLE_THRESHOLD = 15000; // 15 segundos

    const resetIdleTimer = (event) => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      if (idleDebugEnabled) {
        console.log('[IDLE] Timer reset', {
          eventType: event?.type || 'initial',
          path: window.location.pathname
        });
      }
      idleTimer = setTimeout(() => {
        if (paypalActiveRef.current) {
          if (idleDebugEnabled) {
            console.log('[IDLE] Ignored. PayPal checkout is currently active.');
          }
          return;
        }
        if (idleDebugEnabled) {
          console.warn('[IDLE] Threshold reached. Requesting retention takeover.', {
            path: window.location.pathname,
            thresholdMs: IDLE_THRESHOLD
          });
        }
        if (onIdleRef.current) {
          onIdleRef.current();
        } else {
          onCloseRef.current && onCloseRef.current();
        }
      }, IDLE_THRESHOLD);
    };

    // Listen globally for ANY interaction
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => window.addEventListener(evt, resetIdleTimer, { passive: true }));

    if (idleDebugEnabled) {
      console.log('[IDLE] System started (15s)', {
        path: window.location.pathname,
        thresholdMs: IDLE_THRESHOLD
      });
    }
    resetIdleTimer();

    return () => {
      if (idleDebugEnabled) {
        console.log('[IDLE] System paused');
      }
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [discountThemeActive, idleDebugEnabled]); // 🟢 Removido onClose do dep array (estabilizado via useRef)

  async function ensureClientSecret(normalizedEmail) {
    const initOperacao = 'payment_element.init'
    const allowedBRL = [100, 990, 1470, 1980]
    const allowedEUR = [2400, 3300, 3700, 4700]
    const cur = String(currency || '').toLowerCase() || 'brl'
    let amt = Number(amount_cents || 0)
    const existingSecret = String(clientSecret || '').trim()
    if (cur === 'brl' && !allowedBRL.includes(amt)) {
      const scaled = Math.round(amt * 100)
      amt = allowedBRL.includes(scaled) ? scaled : 100
    } else if (cur === 'eur' && !allowedEUR.includes(amt)) {
      const scaled = Math.round(amt * 100)
      amt = allowedEUR.includes(scaled) ? scaled : allowedEUR[0]
    }
    const matchesCachedIntent = !!existingSecret
      && lastIntentConfigRef.current.amount_cents === amt
      && lastIntentConfigRef.current.currency === cur
    if (matchesCachedIntent) return existingSecret
    const initDadosEntrada = { amount_cents: amt, currency: cur, email: normalizedEmail }
    try {
      console.log(`[CHECKOUT] Iniciando operação: ${initOperacao}`, { dados_entrada: initDadosEntrada })
      const cachedLeadId = typeof window !== 'undefined' ? (window.localStorage.getItem('lead_id') || leadCache.getAll()?.lead_id) : '';
      const combinedMetadata = { ...(metadata || {}), lead_id: cachedLeadId };
      const data = await createPaymentIntent({ amount_cents: amt, currency: cur, email: normalizedEmail, metadata: combinedMetadata })
      const secret = String(data?.client_secret || '')
      setClientSecret(secret)
      lastIntentConfigRef.current = {
        amount_cents: amt,
        currency: cur
      }
      setPaymentIntentDiag({
        livemode: data?.livemode,
        payment_method_types: data?.payment_method_types,
        currency: data?.currency,
        amount: data?.amount,
        status: data?.status,
      })
      console.log('[CHECKOUT] Operação concluída com sucesso:', {
        id_resultado: data?.id,
        timestamp: new Date().toISOString(),
      })
      return secret
    } catch (error) {
      console.error(`[CHECKOUT] Erro na operação: ${error.message}`, {
        dados_entrada: initDadosEntrada,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
      const apiMsg = (error && error.response && error.response.data && error.response.data.error) ? String(error.response.data.error) : ''
      if (apiMsg) {
        const raw = apiMsg.toLowerCase()
        const isDe = i18n.language && i18n.language.startsWith('de')
        if (raw.includes('stripe não configurado')) {
          setErrorMsg(isDe ? 'Stripe nicht konfiguriert. Bitte wählen Sie eine andere Zahlungsart (z. B. PayPal).' : 'Stripe não configurado. Por favor, escolha outra forma de pagamento (ex.: PayPal).')
        } else if (raw.includes('valor selecionado inválido')) {
          setErrorMsg(isDe ? 'Wert ungültig. Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.' : 'Valor inválido. Atualize a página e tente novamente.')
        } else {
          setErrorMsg(apiMsg)
        }
      } else {
        setErrorMsg(t('checkout_modal.error_unexpected'))
      }
      return ''
    }
  }

  async function handleStripeSuccess(paymentIntent, emailToSend, phoneToSend) {
    console.log('[CHECKOUT] Operação concluída com sucesso:', {
      id_resultado: paymentIntent?.id,
      status: paymentIntent?.status,
      amount: paymentIntent?.amount,
      currency: paymentIntent?.currency,
      timestamp: new Date().toISOString(),
    })
    const pi = paymentIntent?.id || ''
    const status = paymentIntent?.status || ''
    const emailResolved = String(emailToSend || '').trim()
    const phoneResolved = String(phoneToSend || '').trim()
    console.log('[CHECKOUT] Chamando onSuccess com dados', {
      provider: 'stripe',
      referenceId: pi,
      status,
      email: emailResolved,
      phone: phoneResolved,
      hasEmail: !!emailResolved
    })

    try {
      onSuccess && onSuccess({ provider: 'stripe', referenceId: pi, status, amount_cents, currency, email: emailResolved, phone: phoneResolved })
    } catch { }
    try { leadCache.setEmail(String(emailResolved || '').trim()) } catch { }
    try { onClose && onClose() } catch { }
  }

  async function dispatchPayPalFinalize(payload) {
    try {
      const result = await finalizePayPalEmail(payload)
      if (!result?.success) {
        throw new Error(result?.error || 'Falha ao finalizar compra PayPal')
      }
      return result
    } catch (error) {
      const message = error?.message || 'Falha ao finalizar compra PayPal'
      console.error('[CHECKOUT] Erro ao disparar finalize-email do PayPal', {
        message,
        orderID: payload?.orderID,
      })
      throw new Error(message)
    }
  }

  async function onConfirm() {
    const operacao = 'payment_element.confirm'
    const dados_entrada = { clientSecret }
    try {
      console.log(`[CHECKOUT] Iniciando operação: ${operacao}`, { dados_entrada })
      if (!stripe || !elements) {
        setErrorMsg(t('checkout_modal.stripe_not_loaded'))
        return
      }
      const cardFieldsComplete = !!(cardNumComplete && cardCvcComplete && cardExpComplete)
      if (!cardFieldsComplete) {
        setErrorMsg((i18n.language && i18n.language.startsWith('de')) ? 'Bitte füllen Sie die Zahlungsdaten aus.' : 'Preencha os dados de pagamento.')
        return
      }
      if (!String(cardholderName || '').trim()) {
        setCardholderTouched(true)
        setErrorMsg((i18n.language && i18n.language.startsWith('de')) ? 'Bitte geben Sie Ihren Namen ein.' : 'Informe seu nome.')
        return
      }
      if (!String(contactEmail || '').trim()) {
        setContactEmailTouched(true)
        setErrorMsg((i18n.language && i18n.language.startsWith('de')) ? 'Bitte geben Sie Ihre E-Mail ein.' : 'Informe seu email.')
        return
      }
      const normalizedEmail = String(contactEmail || '').trim()
      try { leadCache.setEmail(normalizedEmail) } catch { }
      setLoading(true)
      const secret = await ensureClientSecret(normalizedEmail)
      if (!secret) {
        setLoading(false)
        return
      }
      const baseUrl = (typeof window !== 'undefined' && window.location && window.location.origin)
        ? String(window.location.origin)
        : 'https://example.com'
      const rawBasePath = String(import.meta.env.BASE_URL || '/').trim() || '/'
      const basePathWithSlash = rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`
      const basePath = basePathWithSlash === '/' ? '' : basePathWithSlash
      const returnUrl = `${baseUrl.replace(/\/$/, '')}${basePath || '/'}checkout-success`
      const cardElement = elements.getElement(CardNumberElement)
      console.log('[CHECKOUT] Enviando confirmação para Stripe', {
        amount_cents,
        currency,
        cardholderName: String(cardholderName || '').trim(),
        email: normalizedEmail,
        phone: String(contactPhone || '').trim(),
        hasClientSecret: !!secret,
        metadataKeys: metadata ? Object.keys(metadata) : [],
        returnUrl,
      })
      const result = await stripe.confirmCardPayment(secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: String(cardholderName || '').trim(),
            email: normalizedEmail,
            phone: String(contactPhone || '').trim(),
          },
        },
        return_url: returnUrl,
      })
      const error = result.error
      const paymentIntent = result.paymentIntent
      setLoading(false)
      if (error) {
        console.error('[CHECKOUT] Erro na confirmação:', {
          message: error?.message,
          code: error?.code,
          decline_code: error?.decline_code,
          type: error?.type,
        })
        const declineCode = String(error?.decline_code || '')
        const isNotSupported = declineCode === 'card_not_supported'
        const msg = (i18n.language && i18n.language.startsWith('de'))
          ? (isNotSupported
            ? 'Dieser Kartentyp wird nicht akzeptiert. Bitte wählen Sie eine andere Zahlungsart (z.B. SEPA/Bank) im Checkout.'
            : (error?.message || 'Zahlung fehlgeschlagen. Bitte versuchen Sie eine andere Methode (z.B. PayPal).'))
          : (isNotSupported
            ? 'Este tipo de cartão não é aceito. Selecione outra forma de pagamento (ex.: SEPA/banco) no checkout.'
            : (error?.message || 'Falha no pagamento. Tente outro método (ex.: PayPal).'))
        setErrorMsg(msg)
        return
      }
      await handleStripeSuccess(paymentIntent, normalizedEmail, String(contactPhone || '').trim())
    } catch (error) {
      console.error(`[CHECKOUT] Erro na operação: ${error.message}`, {
        dados_entrada,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
      setErrorMsg(t('checkout_modal.error_unexpected'))
    }
  }


  React.useEffect(() => {
    if (!String(contactEmail || '').trim() && String(email || '').trim()) {
      setContactEmail(String(email || '').trim())
    }
  }, [email])

  React.useEffect(() => {
    if (!PAYPAL_CLIENT_ID) return
    const existing = document.querySelector('script[src*="paypal.com/sdk/js"]')
    if (existing) {
      if (window.paypal) {
        setPaypalReady(true)
      } else {
        existing.addEventListener('load', () => setPaypalReady(true), { once: true })
      }
      return
    }
    const script = document.createElement('script')
    const paypalLocale = (i18n.language && i18n.language.startsWith('pt')) ? 'pt_BR' : (i18n.language && i18n.language.startsWith('de')) ? 'de_DE' : 'en_US'
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${paypalCurrency}&components=buttons&intent=capture&locale=${paypalLocale}`
    script.async = true
    script.onload = () => setPaypalReady(true)
    script.onerror = () => setErrorMsg('Falha ao carregar SDK do PayPal')
    document.head.appendChild(script)
  }, [])

  React.useEffect(() => {
    if (!stripe) return
    const currencyLower = String(currency || 'eur').toLowerCase()
    if (!Number.isFinite(normalizedAmountCents) || normalizedAmountCents <= 0) return
    const request = stripe.paymentRequest({
      country: currencyLower === 'brl' ? 'BR' : 'DE',
      currency: currencyLower,
      total: { label: productName, amount: Math.round(normalizedAmountCents) },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
    })
    const handlePaymentMethod = async (event) => {
      setErrorMsg('')
      setLoading(true)
      try {
        const payerEmail = String(event?.payerEmail || contactEmail || '').trim()
        const payerPhone = String(event?.payerPhone || contactPhone || '').trim()
        if (payerEmail) {
          try { leadCache.setEmail(payerEmail) } catch { }
        }
        const secret = await ensureClientSecret(payerEmail)
        if (!secret) {
          event.complete('fail')
          setLoading(false)
          return
        }
        const result = await stripe.confirmCardPayment(
          secret,
          {
            payment_method: {
              card: event.paymentMethod.id,
              billing_details: {
                name: String(event?.payerName || '').trim() || undefined,
                email: payerEmail || undefined,
                phone: payerPhone || undefined,
              },
            },
          },
          { handleActions: false }
        )
        if (result?.error) {
          event.complete('fail')
          setErrorMsg(result.error.message || t('checkout_modal.error_confirming'))
          setLoading(false)
          return
        }
        let paymentIntent = result?.paymentIntent
        if (paymentIntent?.status === 'requires_action') {
          const actionResult = await stripe.confirmCardPayment(secret)
          if (actionResult?.error) {
            event.complete('fail')
            setErrorMsg(actionResult.error.message || t('checkout_modal.error_confirming'))
            setLoading(false)
            return
          }
          paymentIntent = actionResult?.paymentIntent
        }
        if (!paymentIntent) {
          event.complete('fail')
          setErrorMsg(t('checkout_modal.error_unexpected'))
          setLoading(false)
          return
        }
        event.complete('success')
        setLoading(false)
        await handleStripeSuccess(paymentIntent, payerEmail || contactEmail || '', payerPhone || contactPhone || '')
      } catch (e) {
        event.complete('fail')
        setLoading(false)
        setErrorMsg(e?.message || t('checkout_modal.error_unexpected'))
      }
    }
    const applePaySessionAvailable = (typeof window !== 'undefined'
      && typeof window.ApplePaySession !== 'undefined'
      && typeof window.ApplePaySession.canMakePayments === 'function'
      && window.ApplePaySession.canMakePayments())
    const isLocalhost = typeof window !== 'undefined'
      && ['localhost', '127.0.0.1', '::1'].includes(String(window.location?.hostname || ''))
    const shouldForceApplePay = !!import.meta.env?.DEV && isLocalhost && applePaySessionAvailable
    if (shouldForceApplePay) {
      setApplePayAvailable(true)
      setPaymentRequest(request)
    } else {
      request.canMakePayment().then((result) => {
        const applePayEnabled = !!result?.applePay || (applePaySessionAvailable && result !== null)
        if (applePayEnabled) {
          setApplePayAvailable(true)
          setPaymentRequest(request)
        } else {
          setApplePayAvailable(false)
          setPaymentRequest(null)
        }
      }).catch(() => {
        setApplePayAvailable(false)
        setPaymentRequest(null)
      })
    }
    request.on('paymentmethod', handlePaymentMethod)
    return () => {
      try { request.off('paymentmethod', handlePaymentMethod) } catch { }
    }
  }, [stripe, normalizedAmountCents, currency, productName, contactEmail, contactPhone, clientSecret])

  React.useEffect(() => {
    if (!paypalReady) return
    const paypal = window.paypal
    if (!paypal) return
    const containerId = '#paypal-button-container'
    const container = document.querySelector(containerId)
    if (!container || container.childElementCount > 0) return
    try {
      const isNarrowViewport = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(max-width: 420px)').matches
        : false
      paypal.Buttons({
        fundingSource: paypal.FUNDING.PAYPAL,
        style: { layout: isNarrowViewport ? 'vertical' : 'horizontal', color: 'gold', shape: 'rect', label: 'buynow' },
        onClick: (data, actions) => {
          setPaypalActive(true);
          return actions.resolve ? actions.resolve() : undefined;
        },
        createOrder: async (dataArg, actions) => {
          if (paypalOrderIdRef.current) return paypalOrderIdRef.current
          if (paypalCreatePromiseRef.current) return await paypalCreatePromiseRef.current
          const runCreate = async () => {
            if (paypalRateLimited) return null
            try {
              const val = paypalValue
              const cachedLeadId = typeof window !== 'undefined' ? (window.localStorage.getItem('lead_id') || leadCache.getAll()?.lead_id) : '';
              const data = await createPayPalOrder({
                value: val,
                currency: paypalCurrency,
                metadata: { ...(metadata || {}), origin: (metadata && metadata.origin) ? metadata.origin : 'fim', lead_id: cachedLeadId },
              })
              if (data?.id) {
                paypalOrderIdRef.current = data.id
                return data.id
              }
            } catch (e) {
              if (String(e?.name || '') === 'RATE_LIMIT_REACHED') {
                setPaypalRateLimited(true)
              }
              setErrorMsg('Falha ao criar pedido via API. Aplicando fallback.')
            }
            return null
          }
          paypalCreatePromiseRef.current = runCreate().finally(() => {
            paypalCreatePromiseRef.current = null
          })
          const orderId = await paypalCreatePromiseRef.current
          if (orderId) return orderId
          return actions.order.create({
            purchase_units: [{ amount: { value: paypalValue, currency_code: paypalCurrency } }],
            application_context: { shipping_preference: 'NO_SHIPPING' },
          })
        },
        onApprove: async (data, actions) => {
          setPaypalActive(false);
          if (paypalCapturePromiseRef.current) return await paypalCapturePromiseRef.current
          const runCapture = async () => {
            try {
              const fromMetadataFbp = (metadata && typeof metadata.fbp === 'string') ? metadata.fbp : undefined
              const fromMetadataFbc = (metadata && typeof metadata.fbc === 'string') ? metadata.fbc : undefined
              const cookies = document.cookie || ''
              const fbpMatch = /_fbp=([^;]+)/.exec(cookies)
              const fbcMatch = /_fbc=([^;]+)/.exec(cookies)
              const fbp = fromMetadataFbp || (fbpMatch ? decodeURIComponent(fbpMatch[1]) : undefined)
              const fbc = fromMetadataFbc || (fbcMatch ? decodeURIComponent(fbcMatch[1]) : undefined)
              const clientUuid = (metadata && typeof metadata.client_uuid === 'string') ? metadata.client_uuid : undefined
              const eventSourceUrl = (typeof window !== 'undefined' && window.location && window.location.href)
                ? window.location.href
                : undefined
              let capture
              try {
                const emailPayload = String(contactEmail || '').trim()
                const phonePayload = String(contactPhone || '').trim()
                capture = await capturePayPalOrder(String(data?.orderID || ''), { fbp, fbc, client_uuid: clientUuid, event_source_url: eventSourceUrl, email: emailPayload || undefined, phone: phonePayload || undefined })
              } catch (e) {
                capture = await actions.order.capture()
              }
              const id = capture?.data?.id || capture?.id || String(data?.orderID || '')
              const status = capture?.data?.status || capture?.status || 'CAPTURED'
              const captureData = capture?.data || capture || {}
              const emailFromCapture = captureData?.payer?.email_address
                || captureData?.payment_source?.paypal?.email_address
                || captureData?.email_address
              const emailResolved = String(emailFromCapture || '').trim()
              if (!emailResolved) {
                setPaypalFinalizeOrderId(String(id || data?.orderID || ''))
                setPaypalFinalizeContext({ fbp, fbc, client_uuid: clientUuid, event_source_url: eventSourceUrl })
                setShowPaypalEmailModal(true)
                return
              }
              const orderID = String(id || data?.orderID || '').trim()
              if (!orderID) {
                setErrorMsg('Pedido PayPal inválido. Recarregue a página.')
                return
              }
              const finalizePayload = {
                orderID,
                email: emailResolved,
                phone: phonePayload || undefined,
                client_uuid: clientUuid,
                event_source_url: eventSourceUrl,
                fbp,
                fbc,
              }
              await dispatchPayPalFinalize(finalizePayload)

              try {
                const tracker = createFunnelTracker({
                  baseUrl: getDefaultBaseUrl(),
                  funnelId: QUIZ_FUNNEL_ID,
                  getCountry: () => readStoredCountry() || undefined,
                  debug: import.meta.env.DEV
                })
                const step = buildRouteStep('/fim', { id: 'fim', index: 15 }, 'Coleta de Email para envio do produto')
                await tracker.leadIdentifiedCustom(step, { local_entrega: emailResolved })
              } catch { }
              try { leadCache.setEmail(emailResolved) } catch { }
              try {
                onSuccess && onSuccess({ provider: 'paypal', referenceId: id, status, amount_cents, currency, email: emailResolved, phone: String(contactPhone || '').trim() })
              } catch { }
              try { onClose && onClose() } catch { }
            } catch (e) {
              setErrorMsg(e?.message || 'Falha ao capturar pagamento PayPal')
            }
          }
          paypalCapturePromiseRef.current = runCapture().finally(() => {
            paypalCapturePromiseRef.current = null
          })
          return await paypalCapturePromiseRef.current
        },
        onCancel: (data) => {
          setPaypalActive(false);
        },
        onError: (err) => {
          setPaypalActive(false);
          if (String(err?.name || '') === 'RATE_LIMIT_REACHED') {
            setPaypalRateLimited(true)
          }
          setErrorMsg(err?.message || 'Falha no PayPal')
        },
      }).render(containerId)
    } catch (e) {
      setErrorMsg('Falha ao inicializar botão PayPal')
    }
  }, [paypalReady])




  const showContactFields = (cardNumComplete && cardCvcComplete && cardExpComplete && String(cardholderName || '').trim())

  React.useEffect(() => {
    if (!showPaypalEmailModal) return
    if (String(contactEmail || '').trim() && !String(paypalFinalizeEmail || '').trim()) {
      setPaypalFinalizeEmail(String(contactEmail || '').trim())
    }
  }, [showPaypalEmailModal, contactEmail, paypalFinalizeEmail])

  async function onFinalizePaypalEmail() {
    if (!String(paypalFinalizeEmail || '').trim()) {
      setPaypalFinalizeTouched(true)
      return
    }
    if (!paypalFinalizeOrderId) {
      setPaypalFinalizeError('Pedido PayPal inválido. Recarregue a página.')
      return
    }
    setPaypalFinalizeLoading(true)
    setPaypalFinalizeError('')
    const payload = {
      orderID: paypalFinalizeOrderId,
      email: String(paypalFinalizeEmail || '').trim(),
      phone: String(paypalFinalizePhone || '').trim() || undefined,
      client_uuid: paypalFinalizeContext?.client_uuid,
      event_source_url: paypalFinalizeContext?.event_source_url,
      fbp: paypalFinalizeContext?.fbp,
      fbc: paypalFinalizeContext?.fbc,
    }
    try {
      await dispatchPayPalFinalize(payload)
    } catch (error) {
      setPaypalFinalizeLoading(false)
      setPaypalFinalizeError(error?.message || 'Falha ao finalizar compra PayPal')
      return
    }

    setPaypalFinalizeLoading(false)
    setShowPaypalEmailModal(false)
    try {
      try {
        const tracker = createFunnelTracker({
          baseUrl: getDefaultBaseUrl(),
          funnelId: QUIZ_FUNNEL_ID,
          getCountry: () => readStoredCountry() || undefined,
          debug: import.meta.env.DEV
        })
        const step = buildRouteStep('/fim', { id: 'fim', index: 15 }, 'Coleta de Email para envio do produto')
        await tracker.leadIdentifiedCustom(step, { local_entrega: String(paypalFinalizeEmail || '').trim() })
      } catch { }
      try { leadCache.setEmail(String(paypalFinalizeEmail || '').trim()) } catch { }
      onSuccess && onSuccess({ provider: 'paypal', referenceId: paypalFinalizeOrderId, status: 'COMPLETED', amount_cents, currency, email: String(paypalFinalizeEmail || '').trim(), phone: String(paypalFinalizePhone || '').trim() })
    } catch { }
    try { onClose && onClose() } catch { }
  }

  return (
    <>
      <div className={styles.formContainer}>
        {applePayAvailable && paymentRequest && (
          <div className={styles.applePayContainer}>
            <div className={styles.applePayButtonWrapper}>
              <PaymentRequestButtonElement
                options={{
                  paymentRequest,
                  style: {
                    paymentRequestButton: {
                      type: 'applePay',
                      theme: 'dark',
                      height: '44px',
                    },
                  },
                }}
              />
            </div>
            <div className={styles.applePaySlogan}>
              {(i18n.language && i18n.language.startsWith('pt'))
                ? 'Pague com Apple Pay em um toque'
                : (i18n.language && i18n.language.startsWith('de'))
                  ? 'Mit Apple Pay in einem Tipp bezahlen'
                  : 'Pay with Apple Pay in one tap'}
            </div>
          </div>
        )}
        {PAYPAL_CLIENT_ID && (
          <div className={styles.paypalContainer}>
            <div id="paypal-button-container" className={styles.paypalButtonWrapper} />
            <div className={styles.paypalSlogan}>
              {(i18n.language && i18n.language.startsWith('pt'))
                ? 'Pague com rapidez e segurança com PayPal'
                : (i18n.language && i18n.language.startsWith('de'))
                  ? 'Schnell und sicher mit PayPal bezahlen'
                  : 'Pay quickly and securely with PayPal'}
            </div>
          </div>
        )}
        <div className={styles.cardGroup}>
          <div className={`${styles.cardFieldSlot} ${styles.cardFieldSlotTop} ${cardNumFocused ? styles.slotFocusGreen : ''}`}>
            <p className={styles.cardFieldLabelTop}>Kartennummer</p>
            <div className={styles.cardElementShell}>
              <CardNumberElement
                options={{
                  showIcon: true,
                  placeholder: 'XXXX XXXX XXXX XXXX',
                  style: {
                    base: {
                      color: '#333a49',
                      fontFamily: 'Poppins, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimHei, Arial, Helvetica, sans-serif',
                      fontSize: '16px',
                      lineHeight: '30px',
                      '::placeholder': { color: '#333a49', opacity: 0.6 },
                    },
                    invalid: { color: '#ff6b6b' },
                  },
                }}
                onChange={(e) => {
                  setCardNumComplete(!!e?.complete)
                  if (e?.complete) {
                    try { elements.getElement(CardCvcElement)?.focus() } catch { }
                  }
                }}
                onFocus={() => setCardNumFocused(true)}
                onBlur={() => setCardNumFocused(false)}
              />
            </div>
          </div>
          <div className={styles.cardRowBottom}>
            <div className={`${styles.cardFieldSlot} ${styles.cardFieldSlotBottomLeft} ${cardExpFocused ? styles.slotFocusGreen : ''}`}>
              <p className={styles.cardFieldLabelBottom}>Ablaufdatum</p>
              <div className={styles.cardElementShell}>
                <CardExpiryElement
                  options={{
                    style: {
                      base: {
                        color: '#333a49',
                        fontFamily: 'Poppins, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimHei, Arial, Helvetica, sans-serif',
                        fontSize: '16px',
                        lineHeight: '30px',
                        '::placeholder': { color: '#333a49', opacity: 0.6 },
                      },
                      invalid: { color: '#ff6b6b' },
                    },
                  }}
                  onChange={(e) => setCardExpComplete(!!e?.complete)}
                  onFocus={() => setCardExpFocused(true)}
                  onBlur={() => setCardExpFocused(false)}
                />
              </div>
            </div>
            <div className={`${styles.cardFieldSlot} ${styles.cardFieldSlotBottomRight} ${cardCvcFocused ? styles.slotFocusGreen : ''}`}>
              <p className={styles.cardFieldLabelBottom}>CVV/CVC</p>
              <div className={styles.cardElementShell}>
                <CardCvcElement
                  options={{
                    placeholder: 'XXX',
                    style: {
                      base: {
                        color: '#333a49',
                        fontFamily: 'Poppins, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimHei, Arial, Helvetica, sans-serif',
                        fontSize: '16px',
                        lineHeight: '30px',
                        '::placeholder': { color: '#333a49', opacity: 0.6 },
                      },
                      invalid: { color: '#ff6b6b' },
                    },
                  }}
                  onChange={(e) => {
                    setCardCvcComplete(!!e?.complete)
                    if (e?.complete) {
                      try { elements.getElement(CardExpiryElement)?.focus() } catch { }
                    }
                  }}
                  onFocus={() => setCardCvcFocused(true)}
                  onBlur={() => setCardCvcFocused(false)}
                />
              </div>
            </div>
          </div>
        </div>

        {(cardNumComplete && cardCvcComplete && cardExpComplete) && (
          <div className={styles.cardholderFieldRow}>
            <label className={styles.cardholderLabel} htmlFor="cardholderName">
              {(i18n.language && i18n.language.startsWith('pt')) ? 'Nome*' : (i18n.language && i18n.language.startsWith('de')) ? 'Name*' : 'Name*'}
            </label>
            <input
              id="cardholderName"
              className={`${styles.cardholderInput} ${(cardholderTouched && !String(cardholderName || '').trim()) ? styles.cardholderInputInvalid : ''}`}
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              onBlur={() => setCardholderTouched(true)}
              placeholder={(i18n.language && i18n.language.startsWith('de')) ? 'Name auf der Karte' : 'Nome no cartão'}
              autoComplete="cc-name"
            />
          </div>
        )}
        {showContactFields && (
          <>
            <div className={styles.cardholderFieldRow}>
              <label className={styles.cardholderLabel} htmlFor="contactEmail">
                {(i18n.language && i18n.language.startsWith('pt')) ? 'Email*' : (i18n.language && i18n.language.startsWith('de')) ? 'E-Mail*' : 'Email*'}
              </label>
              <input
                id="contactEmail"
                className={`${styles.cardholderInput} ${(contactEmailTouched && !String(contactEmail || '').trim()) ? styles.cardholderInputInvalid : ''}`}
                type="email"
                value={contactEmail}
                onChange={(e) => {
                  const next = e.target.value
                  setContactEmail(next)
                  try { leadCache.setEmail(String(next || '').trim()) } catch { }
                }}
                onBlur={() => setContactEmailTouched(true)}
                placeholder={(i18n.language && i18n.language.startsWith('de')) ? 'ihreemail@gmail.com' : 'Seu email'}
                autoComplete="email"
              />
            </div>
            <div className={styles.cardholderFieldRow}>
              <label className={styles.cardholderLabel} htmlFor="contactPhone">
                {(i18n.language && i18n.language.startsWith('pt')) ? 'Telefone*' : (i18n.language && i18n.language.startsWith('de')) ? 'Telefon*' : 'Phone*'}
              </label>
              <input
                id="contactPhone"
                className={`${styles.cardholderInput} ${(contactPhoneTouched && !String(contactPhone || '').trim()) ? styles.cardholderInputInvalid : ''}`}
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                onBlur={() => setContactPhoneTouched(true)}
                placeholder={(i18n.language && i18n.language.startsWith('de')) ? 'Ihre Telefonnummer' : 'Seu telefone'}
                autoComplete="tel"
              />
            </div>
          </>
        )}
        <button className={styles.proceedButton} onClick={onConfirm} disabled={loading} aria-label="Zum Checkout fortfahren">
          <img src={asset('/.figma/image/mjfl5hb5-kbnw4k9.svg')} className={styles.proceedButtonIcon} alt="" aria-hidden="true" />
          {loading ? t('checkout_modal.processing') : 'ZUM CHECKOUT FORTFAHREN'}
        </button>
        {errorMsg && <div className={styles.error}>{errorMsg}</div>}
        <div className={styles.divider} />
        <div className={styles.safeBanner}>
          <span className={styles.safeText}>Sichere und geschützte Zahlung</span>
        </div>
        <div className={styles.cardsRow} aria-hidden="true">
          <img src={asset('/.figma/image/mjfl5hb5-mjolx8b.svg')} className={styles.cardIcon} alt="" />
          <img src={asset('/.figma/image/mjfl5hb5-i290ftr.svg')} className={styles.cardIcon} alt="" />
          <img src={asset('/.figma/image/mjfl5hb5-ey7zpll.svg')} className={styles.cardIcon} alt="" />
          <img src={asset('/.figma/image/mjfl5hb5-d2hccg2.svg')} className={styles.cardIcon} alt="" />
          <img src={asset('/.figma/image/mjfl5hb5-u2ohg40.svg')} className={styles.cardIcon} alt="" />
          <img src={asset('/.figma/image/mjfl5hb5-t58luv1.svg')} className={styles.cardIconSmall} alt="" />
          <img src={asset('/.figma/image/mjfl5hb5-tczp8f6.svg')} className={styles.cardIconSmall} alt="" />
        </div>
      </div>
      {showPaypalEmailModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.topBar}>
              <p className={styles.checkoutSecure}>
                Em qual email deseja receber suas frequencias Vibracionais Personalizadas?
              </p>
              <button className={`${styles.closeButton} ${styles.closeButtonRight}`} onClick={() => { setShowPaypalEmailModal(false); try { onClose && onClose() } catch { } }} aria-label="Fechar">×</button>
            </div>
            <div className={styles.cardholderFieldRow}>
              <label className={styles.cardholderLabel} htmlFor="paypalFinalizeEmail">
                {(i18n.language && i18n.language.startsWith('pt')) ? 'Email*' : (i18n.language && i18n.language.startsWith('de')) ? 'E-Mail*' : 'Email*'}
              </label>
              <input
                id="paypalFinalizeEmail"
                className={`${styles.cardholderInput} ${(paypalFinalizeTouched && !String(paypalFinalizeEmail || '').trim()) ? styles.cardholderInputInvalid : ''}`}
                type="email"
                value={paypalFinalizeEmail}
                onChange={(e) => setPaypalFinalizeEmail(e.target.value)}
                onBlur={() => setPaypalFinalizeTouched(true)}
                placeholder={(i18n.language && i18n.language.startsWith('de')) ? 'ihreemail@gmail.com' : 'Seu email'}
                autoComplete="email"
              />
            </div>
            <div className={styles.cardholderFieldRow}>
              <label className={styles.cardholderLabel} htmlFor="paypalFinalizePhone">
                {(i18n.language && i18n.language.startsWith('pt')) ? 'Telefone' : (i18n.language && i18n.language.startsWith('de')) ? 'Telefon' : 'Phone'}
              </label>
              <input
                id="paypalFinalizePhone"
                className={styles.cardholderInput}
                type="tel"
                value={paypalFinalizePhone}
                onChange={(e) => setPaypalFinalizePhone(e.target.value)}
                placeholder={(i18n.language && i18n.language.startsWith('de')) ? 'Ihre Telefonnummer' : 'Seu telefone'}
                autoComplete="tel"
              />
            </div>
            <button className={styles.proceedButton} onClick={onFinalizePaypalEmail} disabled={paypalFinalizeLoading}>
              {paypalFinalizeLoading
                ? t('checkout_modal.processing')
                : (i18n.language && i18n.language.startsWith('pt'))
                  ? 'Continuar'
                  : (i18n.language && i18n.language.startsWith('de'))
                    ? 'Weiter'
                    : 'Continue'}
            </button>
            {paypalFinalizeError && <div className={styles.error}>{paypalFinalizeError}</div>}
          </div>
        </div>
      )}
    </>
  )
}

export default function CheckoutModal({
  amount_cents,
  currency = 'eur',
  email,
  metadata,
  onClose,
  onSuccess,
  onIdle,
  giftThemeActive = false,
  discountThemeActive = false
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const isFimRoute = location?.pathname === '/fim'
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentDiag, setPaymentIntentDiag] = useState(null)
  const isAudioUpsell = String(metadata?.variant || '').toLowerCase() === 'audio_upsell'
  const normalizedAmountCents = useMemo(() => normalizeAmountCents(amount_cents, currency), [amount_cents, currency])

  React.useEffect(() => {
    setClientSecret('')
    setPaymentIntentDiag(null)
  }, [normalizedAmountCents, currency])

  React.useEffect(() => {
    const v = Number(normalizedAmountCents || 0) / 100
    const cache = leadCache.getAll() || {}
    const userData = {
      email: String(email || cache.email || '').trim(),
      phone_number: String(cache.whatsapp || '').trim(),
      external_id: String(cache.id_lead || cache.client_uuid || '').trim(),
    }
    const isAudioUpsellLocal = String(metadata?.variant || '').toLowerCase() === 'audio_upsell'
    const productNameLocal = String(metadata?.product_name || (isAudioUpsellLocal ? 'Personalisierter Plan 2.0' : 'Personalisierter Plan')).trim()
    const contentData = {
      content_id: isAudioUpsellLocal ? 'audio_upsell' : 'plan_personalizado',
      content_name: productNameLocal,
      content_type: 'product',
      quantity: 1,
      price: v
    }
    void initMetaPixel()
      .catch(() => undefined)
      .finally(() => {
        trackInitiateCheckout(v, currency)
      })
  }, [])
  const stripePromise = useMemo(() => {
    if (!PUBLISHABLE_KEY) {
      console.error('[CHECKOUT] VITE_STRIPE_PUBLISHABLE_KEY não configurada')
      return null
    }
    return loadStripe(PUBLISHABLE_KEY)
  }, [])

  React.useEffect(() => {
    leadSyncService.setStatus('pendente')
  }, [])

  const options = useMemo(() => ({
    locale: 'de',
  }), [])

  const promoBadgeText = React.useMemo(() => {
    const mois = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
    return `Spezial_${mois[new Date().getMonth()]}_nobel`
  }, [])

  const productName = isAudioUpsell ? 'Personalisierter Plan 2.0' : 'Personalisierter Plan'
  const publishableMode = String(PUBLISHABLE_KEY || '').trim().startsWith('pk_live')
    ? 'live'
    : String(PUBLISHABLE_KEY || '').trim().startsWith('pk_test')
      ? 'test'
      : 'unknown'
  const debugEnabled = (import.meta.env && import.meta.env.DEV)
    || (typeof window !== 'undefined' && /(?:\?|&)stripe_debug=1(?:&|$)/.test(String(window.location?.search || '')))

  if (!PUBLISHABLE_KEY) {
    return createPortal(
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <span className={styles.title}>Configuração necessária</span>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
          <div className={styles.body}>
            <div className={styles.error}>
              Defina VITE_STRIPE_PUBLISHABLE_KEY no .env para habilitar o checkout.
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${isAudioUpsell ? styles.audioUpsellAura : ''}`}>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            position: 'absolute',
            right: '15px',
            top: '15px',
            lineHeight: '1',
            zIndex: 10
          }}
          aria-label="Fechar checkout"
        >×</button>
        <div className={styles.topBar}>
          <p className={styles.checkoutSecure}>{(isFimRoute || isAudioUpsell) ? 'SICHERER CHECKOUT' : 'CHECKOUT SEGURO'}</p>
        </div>

        <div className={styles.headingWrap}>
          {isAudioUpsell ? (
            <>
              <p className={styles.headingTitle}>
                <span>Beschleunigen Sie Ihre Ergebnisse&nbsp;</span>
                <span className={styles.headingHighlight}>indem Sie Zeit sparen</span>
                <span>&nbsp;Wenn Sie Ihren Anziehungsprozess beschleunigen möchten, ist dies unsere Empfehlung.</span>
              </p>
              <div className={styles.offerChip}>Ergebnisbeschleuniger</div>
            </>
          ) : (
            <p className={styles.headingTitle}>
              <span>Schließe dich&nbsp;</span>
              <span className={styles.headingHighlight}>über 19.000 Nutzern</span>
              <span>&nbsp;an, die bereits ihre Ziele erreicht haben</span>
            </p>
          )}
        </div>

        <div className={`${styles.summaryCard} ${isAudioUpsell ? styles.electricEdge : ''}`}>
          {(giftThemeActive || discountThemeActive) && (
            <div className={styles.retentionBadgesRow}>
              {giftThemeActive && (
                <div className={styles.giftBadgeCheckout}>
                  {t('checkout_modal_badges.gift_badge')}
                </div>
              )}
              {discountThemeActive && (
                <div className={styles.discountBadgeCheckout}>
                  {t('checkout_modal_badges.discount_badge')}
                </div>
              )}
            </div>
          )}
          <div className={styles.summaryRowFirst}>
            <p className={styles.planLabel}>{productName}</p>
            {isFimRoute && <p className={styles.oldPrice}>330€</p>}
          </div>
          {isAudioUpsell && (
            <div className={styles.discountRow}>
              <p className={styles.discountText}>Preis</p>
              <p className={styles.discountValue}>47€</p>
            </div>
          )}
          <div className={styles.horizontalDivider} />
          <div className={styles.summaryRowSecond}>
            <p className={styles.totalLabel}>Gesamt</p>
            <p className={styles.totalValue}>{formatCurrency(normalizedAmountCents, currency)}</p>
          </div>
          {isAudioUpsell ? (
            <div className={styles.promoRow}>
              <span className={styles.slotsBadge}>Nur 17 Plätze • schnell vergriffen...</span>
            </div>
          ) : (
            <>
              <p className={styles.note}>Ersparnis: 293€</p>
              <div className={styles.promoRow}>
                <p className={styles.promoCodeLabel}>Gutschein</p>
                <span className={styles.promoBadge}>{promoBadgeText}</span>
              </div>
            </>
          )}
          <Elements stripe={stripePromise} options={options}>
            <InnerCheckout
              clientSecret={clientSecret}
              onClose={onClose}
              amount_cents={normalizedAmountCents}
              currency={currency}
              email={email}
              metadata={metadata}
              onSuccess={onSuccess}
              setClientSecret={setClientSecret}
              setPaymentIntentDiag={setPaymentIntentDiag}
              onIdle={onIdle}
              giftThemeActive={giftThemeActive}
              discountThemeActive={discountThemeActive}
            />
          </Elements>
          {debugEnabled && (
            <div className={styles.stripeDebug}>
              Stripe front: {publishableMode} | PI: {paymentIntentDiag?.livemode === true ? 'live' : paymentIntentDiag?.livemode === false ? 'test' : 'unknown'}
              {Array.isArray(paymentIntentDiag?.payment_method_types) ? ` | PMs: ${paymentIntentDiag.payment_method_types.join(',')}` : ''}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
