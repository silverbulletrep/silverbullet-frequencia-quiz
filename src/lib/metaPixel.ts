const PIXEL_ID_FALLBACK = '1365856334837391'

function resolvePixelIdFromEnv(): string {
  const raw = String(
    (import.meta.env.VITE_META_PIXEL_ID as string | undefined) ||
      (import.meta.env.NEXT_PUBLIC_META_PIXEL_ID as string | undefined) ||
      (import.meta.env.VITE_PIXEL_ID as string | undefined) ||
      (import.meta.env.NEXT_PUBLIC_PIXEL_ID as string | undefined) ||
      '',
  ).trim()

  return raw || PIXEL_ID_FALLBACK
}

export function getMetaPixelId(): string {
  return resolvePixelIdFromEnv()
}

const DEBUG = import.meta.env.DEV

const META_PIXEL_PAUSED_PATHS = new Set([])

export const isMetaPixelPaused = (pathname?: string): boolean => {
  try {
    if (typeof window === 'undefined') return false
    let path = String(pathname || window.location?.pathname || '').trim()
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1)
    }
    return META_PIXEL_PAUSED_PATHS.has(path)
  } catch {
    return false
  }
}

let lastInitPixelId: string | null = null

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue?: unknown[]
  loaded?: boolean
  version?: string
  push?: unknown
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
    __metaPixelLastInitiateCheckout?: { key: string; time: number }
  }
}

const ensureLink = (rel: string, href: string, attrs: Record<string, string> = {}) => {
  try {
    if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return
    const l = document.createElement('link')
    l.rel = rel
    l.href = href
    Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, String(v)))
    document.head.appendChild(l)
  } catch (error) {
    if (DEBUG) console.error('[PIXEL] ensureLink error', { rel, href, error })
  }
}

const loadScriptOnce = (src: string) => new Promise<'exists' | 'loaded'>((resolve, reject) => {
  try {
    const existing = Array.from(document.scripts).find((s) => s.src === src)
    if (existing) return resolve('exists')
    const s = document.createElement('script')
    s.async = true
    s.src = src
    s.onload = () => resolve('loaded')
    s.onerror = (e) => {
      if (DEBUG) console.error('[PIXEL] loadScriptOnce error', { src, error: e })
      reject(e)
    }
    document.head.insertBefore(s, document.head.firstChild)
  } catch (e) {
    if (DEBUG) console.error('[PIXEL] loadScriptOnce exception', { src, error: e })
    reject(e)
  }
})

const schedule = (fn: () => void, timeoutMs = 1800) => {
  try {
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(fn, { timeout: timeoutMs })
      return
    }
  } catch (error) {
    void error
  }
  setTimeout(fn, Math.min(timeoutMs, 1200))
}

const bootstrapFbq = () => {
  try {
    if (window.fbq && window.fbq.loaded) return
    const n: Fbq = function(this: unknown, ...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod(...(args as unknown[]))
      } else {
        ;(n.queue as unknown[]).push(args)
      }
    } as unknown as Fbq
    window.fbq = n
    if (!window._fbq) window._fbq = n
    n.push = n as unknown
    n.loaded = true
    n.version = '2.0'
    n.queue = []
  } catch (error) {
    if (DEBUG) console.error('[PIXEL] bootstrapFbq error', { error })
  }
}

export const initMetaPixel = async (pixelId?: string) => {
  const operacao = 'meta_pixel_init'
  const dados_entrada = { pixelId: pixelId || resolvePixelIdFromEnv() }
  if (DEBUG) console.log(`[PIXEL] Iniciando operação: ${operacao}`, { dados_entrada })
  try {
    if (isMetaPixelPaused()) return false
    ensureLink('preconnect', 'https://connect.facebook.net')
    ensureLink('dns-prefetch', 'https://connect.facebook.net')
    bootstrapFbq()
    const fbq = window.fbq
    if (fbq) fbq('init', dados_entrada.pixelId)
    lastInitPixelId = dados_entrada.pixelId
    schedule(() => {
      loadScriptOnce('https://connect.facebook.net/en_US/fbevents.js').catch(() => undefined)
    })
    if (DEBUG) {
      console.log('[PIXEL] Operação concluída com sucesso:', {
        id_resultado: dados_entrada.pixelId,
        timestamp: new Date().toISOString()
      })
    }
    return true
  } catch (error) {
    if (DEBUG) {
      console.error('[PIXEL] Erro na operação', {
        dados_entrada,
        error,
        timestamp: new Date().toISOString()
      })
    }
    throw error
  }
}

export const trackPageView = () => {
  const operacao = 'meta_pixel_pageview'
  const dados_entrada = {}
  if (DEBUG) console.log(`[PIXEL] Iniciando operação: ${operacao}`, { dados_entrada })
  try {
    if (isMetaPixelPaused()) return false
    if (!window.fbq) bootstrapFbq()
    if (!window.fbq) return false
    const fbq = window.fbq
    if (fbq) fbq('track', 'PageView')
    if (DEBUG) {
      console.log('[PIXEL] Operação concluída com sucesso:', {
        id_resultado: 'PageView',
        timestamp: new Date().toISOString()
      })
    }
    return true
  } catch (error) {
    if (DEBUG) {
      console.error('[PIXEL] Erro na operação', {
        dados_entrada,
        error,
        timestamp: new Date().toISOString()
      })
    }
    return false
  }
}

export const trackPurchase = (value: number, currency: string, eventId?: string) => {
  const operacao = 'meta_pixel_purchase'
  const dados_entrada = { value, currency, eventId }
  if (DEBUG) console.log(`[PIXEL] Iniciando operação: ${operacao}`, { dados_entrada })
  try {
    if (isMetaPixelPaused()) return false
    if (!window.fbq) bootstrapFbq()
    if (!window.fbq) return false
    const fbq = window.fbq
    const id = lastInitPixelId || resolvePixelIdFromEnv()
    fbq('init', id)
    schedule(() => {
      loadScriptOnce('https://connect.facebook.net/en_US/fbevents.js').catch(() => undefined)
    })
    if (eventId) {
      fbq('track', 'Purchase', { value, currency }, { eventID: eventId })
    } else {
      fbq('track', 'Purchase', { value, currency })
    }
    if (DEBUG) {
      console.log('[PIXEL] Operação concluída com sucesso:', {
        id_resultado: eventId || 'sem_event_id',
        timestamp: new Date().toISOString()
      })
    }
    return true
  } catch (error) {
    if (DEBUG) {
      console.error('[PIXEL] Erro na operação', {
        dados_entrada,
        error,
        timestamp: new Date().toISOString()
      })
    }
    return false
  }
}

export const trackInitiateCheckout = (value: number, currency: string) => {
  const operacao = 'meta_pixel_initiate_checkout'
  const normalizedCurrency = String(currency || '').trim().toUpperCase() || 'EUR'
  const normalizedValue = Number.isFinite(value) ? value : 0
  const dados_entrada = { value: normalizedValue, currency: normalizedCurrency }
  if (DEBUG) console.log(`[PIXEL] Iniciando operação: ${operacao}`, { dados_entrada })
  try {
    if (isMetaPixelPaused()) return false
    const key = `${normalizedCurrency}:${normalizedValue}`
    const now = Date.now()
    const last = window.__metaPixelLastInitiateCheckout
    if (last && last.key === key && now - last.time < 1200) return false
    window.__metaPixelLastInitiateCheckout = { key, time: now }

    if (!window.fbq) bootstrapFbq()
    if (!window.fbq) return false
    const fbq = window.fbq
    const id = lastInitPixelId || resolvePixelIdFromEnv()
    fbq('init', id)
    schedule(() => {
      loadScriptOnce('https://connect.facebook.net/en_US/fbevents.js').catch(() => undefined)
    })
    fbq('track', 'InitiateCheckout', { value: normalizedValue, currency: normalizedCurrency })
    if (DEBUG) {
      console.log('[PIXEL] Operação concluída com sucesso:', {
        id_resultado: key,
        timestamp: new Date().toISOString(),
      })
    }
    return true
  } catch (error) {
    if (DEBUG) {
      console.error('[PIXEL] Erro na operação', {
        dados_entrada,
        error,
        timestamp: new Date().toISOString(),
      })
    }
    return false
  }
}
