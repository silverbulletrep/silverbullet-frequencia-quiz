type BuildCheckoutParams = {
  baseUrl: string
  paymentMethod?: string
  leadIdShort?: string
  email?: string
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

    return url.toString()
  } catch (error) {
    console.error('[HOTMART] Erro ao construir URL do checkout', { baseUrl, message: error instanceof Error ? error.message : String(error) })
    return baseUrl
  }
}
