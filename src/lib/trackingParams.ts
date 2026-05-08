/**
 * Persists and reapplies paid-traffic tracking parameters across fast funnel
 * transitions and checkout redirects.
 */

const STORAGE_KEY = 'persisted_query_tracking'

const CLICK_ID_KEYS = new Set([
  'fbclid',
  'gclid',
  'ttclid',
  'msclkid',
  'wbraid',
  'gbraid',
])

const ATTRIBUTION_PARAM_KEYS = new Set([
  'xcod',
])

export function isTrackingParam(key: string): boolean {
  const normalized = String(key || '').trim().toLowerCase()
  if (!normalized) return false
  if (normalized.startsWith('utm_')) return true
  if (CLICK_ID_KEYS.has(normalized)) return true
  if (ATTRIBUTION_PARAM_KEYS.has(normalized)) return true
  return false
}

export function readStoredTrackingParams(): Record<string, string> {
  const read = (storage: Storage | undefined): Record<string, string> => {
    if (!storage) return {}
    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? parsed as Record<string, string> : {}
    } catch {
      return {}
    }
  }

  const local = typeof localStorage !== 'undefined' ? read(localStorage) : {}
  const session = typeof sessionStorage !== 'undefined' ? read(sessionStorage) : {}
  return { ...local, ...session }
}

function writeStoredTrackingParams(params: Record<string, string>) {
  const payload = JSON.stringify(params)
  try { sessionStorage.setItem(STORAGE_KEY, payload) } catch { void 0 }
  try { localStorage.setItem(STORAGE_KEY, payload) } catch { void 0 }
}

export function captureTrackingParams(search?: string): Record<string, string> {
  const stored = readStoredTrackingParams()
  const params = new URLSearchParams(
    typeof search === 'string'
      ? search.replace(/^\?/, '')
      : (typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '')
  )
  let changed = false

  params.forEach((value, key) => {
    if (!isTrackingParam(key)) return
    const normalizedKey = key.toLowerCase()
    const normalizedValue = String(value || '').trim()
    if (!normalizedValue) return
    if (stored[normalizedKey] !== normalizedValue) {
      stored[normalizedKey] = normalizedValue
      changed = true
    }
  })

  if (changed) writeStoredTrackingParams(stored)
  return stored
}

export function getTrackingParams(): Record<string, string> {
  return captureTrackingParams()
}

export function mergeTrackingParamsIntoSearch(
  search?: string,
  extraParams?: Record<string, string | number | boolean | null | undefined>
): string {
  const params = new URLSearchParams(String(search || '').replace(/^\?/, ''))
  const trackingParams = getTrackingParams()

  Object.entries(trackingParams).forEach(([key, value]) => {
    if (!value || params.has(key)) return
    params.set(key, value)
  })

  Object.entries(extraParams || {}).forEach(([key, value]) => {
    if (typeof value === 'undefined' || value === null || value === '') return
    params.set(key, String(value))
  })

  return params.toString()
}

export function withTrackingParams(
  path: string,
  extraParams?: Record<string, string | number | boolean | null | undefined>
): string {
  const raw = String(path || '')
  const hashIndex = raw.indexOf('#')
  const withoutHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw
  const hash = hashIndex >= 0 ? raw.slice(hashIndex) : ''
  const queryIndex = withoutHash.indexOf('?')
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash
  const search = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : ''
  const nextSearch = mergeTrackingParamsIntoSearch(search, extraParams)

  return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${hash}`
}

export function appendTrackingParamsToUrl(
  rawUrl: string,
  extraParams?: Record<string, string | number | boolean | null | undefined>
): string {
  const value = String(rawUrl || '')
  try {
    const url = new URL(value)
    const nextSearch = mergeTrackingParamsIntoSearch(url.search, extraParams)
    url.search = nextSearch ? `?${nextSearch}` : ''
    return url.toString()
  } catch {
    return withTrackingParams(value, extraParams)
  }
}
