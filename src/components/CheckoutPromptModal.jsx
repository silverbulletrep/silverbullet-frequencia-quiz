import React, { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import styles from './CheckoutModal.module.scss'
import CheckoutModal from './CheckoutModal'
import { createCheckoutSession } from '@/lib/api'

export default function CheckoutPromptModal({ amount_cents = 3700, currency = 'eur', metadata = {}, onClose }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const PUBLISHABLE_KEY = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).toLowerCase())
  }

  async function onConfirm() {
    const operacao = 'popup.begin_embedded_checkout'
    const dados_entrada = { amount_cents, currency, email, metadata }
    const opId = `${Date.now()}_${Math.random().toString(36).slice(2)}`
    try {
      setErrorMsg('')
      if (!isValidEmail(email)) {
        setErrorMsg(t('checkout_prompt.error_invalid_email'))
        return
      }
      if (email !== confirmEmail) {
        setErrorMsg(t('checkout_prompt.error_email_mismatch'))
        return
      }
      if (!password || password.length < 6) {
        setErrorMsg(t('checkout_prompt.error_password_length'))
        return
      }

      console.log(`[POPUP] Iniciando operação: ${operacao}`, { opId, dados_entrada, publishable_present: !!PUBLISHABLE_KEY })
      setLoading(true)
      setLoading(false)
      console.log('[POPUP] Abrindo checkout embutido (Payment Element)', { opId })
      if (PUBLISHABLE_KEY) {
        setShowCheckout(true)
      } else {
        console.log('[POPUP] Publishable ausente, iniciando Checkout Session (redirect)', { opId })
        const cookies = document.cookie || ''
        const fbpMatch = /_fbp=([^;]+)/.exec(cookies)
        const fbcMatch = /_fbc=([^;]+)/.exec(cookies)
        const fbp = fbpMatch ? decodeURIComponent(fbpMatch[1]) : undefined
        const fbc = fbcMatch ? decodeURIComponent(fbcMatch[1]) : undefined
        const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : ''
        const sessionData = await createCheckoutSession({ amount_cents, currency, email, metadata: { ...metadata, origin: 'checkout_prompt_modal', fbp, fbc, ua } })
        const url = sessionData?.session?.url || sessionData?.url
        if (url) {
          console.log('[POPUP] Redirecionando para Stripe Checkout', { opId, url })
          window.location.href = url
          return
        } else {
          throw new Error('URL de checkout não retornada')
        }
      }
    } catch (error) {
      setLoading(false)
      console.error(`[POPUP] Erro na operação: ${operacao}: ${error.message}`, {
        opId,
        dados_entrada,
        response_status: error?.response?.status,
        response_data: error?.response?.data,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
      setErrorMsg(t('checkout_prompt.error_payment_init'))
    }
  }

  if (showCheckout) {
    return (
      <CheckoutModal
        amount_cents={amount_cents}
        currency={currency}
        email={email}
        metadata={(function () {
          const cookies = document.cookie || ''
          const fbpMatch = /_fbp=([^;]+)/.exec(cookies)
          const fbcMatch = /_fbc=([^;]+)/.exec(cookies)
          const fbp = fbpMatch ? decodeURIComponent(fbpMatch[1]) : undefined
          const fbc = fbcMatch ? decodeURIComponent(fbcMatch[1]) : undefined
          const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : ''
          return { ...metadata, origin: 'checkout_prompt_modal', fbp, fbc, ua }
        })()}
        onClose={onClose}
      />
    )
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={t('checkout_prompt.modal_label')}>
        <div className={styles.header}>
          <span className={`${styles.title} ${styles.titleGold}`}>{t('checkout_prompt.title')}</span>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.body}>
          <div className={styles.headline}>
            <Trans i18nKey="checkout_prompt.headline">
              <strong>Crie sua conta</strong> e receba acesso à plataforma + Plano Vibracional por email.
            </Trans>
          </div>
          <div className={styles.inputRow}>
            <label className={styles.label} htmlFor="email">{t('checkout_prompt.label_email')}</label>
            <input id="email" className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('checkout_prompt.placeholder_email')} autoComplete="email" />
          </div>
          <div className={styles.inputRow}>
            <label className={styles.label} htmlFor="confirmEmail">{t('checkout_prompt.label_confirm_email')}</label>
            <input id="confirmEmail" className={styles.input} type="email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} placeholder={t('checkout_prompt.placeholder_confirm_email')} autoComplete="email" />
          </div>
          <div className={styles.inputRow}>
            <label className={styles.label} htmlFor="password">{t('checkout_prompt.label_password')}</label>
            <input id="password" className={styles.input} type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('checkout_prompt.placeholder_password')} autoComplete="new-password" />
          </div>
          {errorMsg && <div className={styles.error}>{errorMsg}</div>}
          <button className={styles.confirmButton} onClick={onConfirm} disabled={loading}>{loading ? t('checkout_prompt.button_processing') : t('checkout_prompt.button_advance')}</button>
          <div className={styles.note}>{t('checkout_prompt.note')}</div>
        </div>
      </div>
    </div>
  )
}
