import { appendTrackingParamsToUrl } from './trackingParams'

type BuildCheckoutParams = {
  baseUrl: string
  paymentMethod?: string
  leadIdShort?: string
  email?: string
}

type CheckoutJourneyFlow = 'front' | 'upsell'

type CheckoutJourneyParams = {
  flow: CheckoutJourneyFlow
  origin: string
  paymentMethod?: string
  emailPresent: boolean
  leadIdShort?: string
}

const PAYMENT_METHOD_MAP: Record<string, string> = {
  card: 'credit_card',
  credit_card: 'credit_card',
  multibanco: 'billet',
  billet: 'billet',
  mbway: 'mbway',
}

export const makeLeadIdShort = (leadId: string): string => {
  if (!leadId) return ''
  return leadId
    .replace(/^lead_/, '')
    .replace(/[-_]/g, '')
    .toLowerCase()
    .substring(0, 12)
}

export const normalizeHotmartPaymentMethod = (paymentMethod?: string): string => {
  if (!paymentMethod) return ''
  return PAYMENT_METHOD_MAP[paymentMethod] || paymentMethod
}

export const buildHotmartCheckoutUrl = ({
  baseUrl,
  paymentMethod,
  leadIdShort,
  email,
}: BuildCheckoutParams): string => {
  try {
    const url = new URL(baseUrl)

    if (paymentMethod) {
      url.searchParams.set('paymentMethod', normalizeHotmartPaymentMethod(paymentMethod))
    }

    if (leadIdShort) {
      url.searchParams.set('sck', leadIdShort.substring(0, 30).replace(/_/g, ''))
    }

    if (email) {
      url.searchParams.set('email', email.trim())
    }

    // UTMs são adicionadas por appendTrackingParamsToUrl via storage
    const finalUrl = appendTrackingParamsToUrl(url.toString())

    // DEBUG TEMPORÁRIO — remover após confirmar que UTMs aparecem corretamente na UTMify
    if (typeof console !== 'undefined') {
      try {
        const debugUrl = new URL(finalUrl)
        const params: Record<string, string> = {}
        debugUrl.searchParams.forEach((v, k) => { params[k] = v })
        console.group('[HOTMART] 🔍 URL do Checkout')
        console.log('URL completa:', finalUrl)
        console.log('Parâmetros:', params)
        console.log('Storage tracking:', (() => { try { return JSON.parse(sessionStorage.getItem('persisted_query_tracking') || '{}') } catch { return {} } })())
        console.groupEnd()
      } catch { void 0 }
    }

    return finalUrl
  } catch (error) {
    console.error('[HOTMART] Erro ao construir URL do checkout', { baseUrl, message: error instanceof Error ? error.message : String(error) })
    return baseUrl
  }
}

export const buildCheckoutJourneyContext = ({
  flow,
  origin,
  paymentMethod,
  emailPresent,
  leadIdShort,
}: CheckoutJourneyParams): Record<string, string | boolean> => {
  const isUpsell = flow === 'upsell'

  return {
    journey_type: isUpsell ? 'upsell' : 'front',
    purchase_kind: isUpsell ? 'upsell' : 'main',
    product_id: isUpsell ? 'elevate_up01' : 'elevate_front',
    checkout_origin: origin,
    payment_method: paymentMethod || '',
    email_present: emailPresent,
    ...(leadIdShort ? { lead_id_short: leadIdShort } : {}),
  }
}
