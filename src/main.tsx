import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/transitions.css'
import './i18n' // Importação da configuração de i18n

function normalizeBasePath(): { base: string; baseWithSlash: string } {
  const raw = String(import.meta.env.BASE_URL || '/').trim() || '/'
  const baseWithSlash = raw.endsWith('/') ? raw : `${raw}/`
  const noTrailing = baseWithSlash.endsWith('/') ? baseWithSlash.slice(0, -1) : baseWithSlash
  const base = (!noTrailing || noTrailing === '/') ? '/' : (noTrailing.startsWith('/') ? noTrailing : `/${noTrailing}`)
  return { base, baseWithSlash: base === '/' ? '/' : `${base}/` }
}

function enforceCanonicalBaseOnce(): boolean {
  if (!import.meta.env.PROD) return false
  const { base, baseWithSlash } = normalizeBasePath()
  const { pathname, search, hash } = window.location

  // Se o base for '/', o guard canonical normal não se aplica da mesma forma,
  // mas ainda precisamos permitir o prefixo /pt.

  // Verifica se o caminho atual já está dentro do base canonical ou do prefixo /pt
  const isPt = pathname === '/pt' || pathname.startsWith('/pt/') || pathname.includes('/pt/');
  const isInBase = base === '/' || pathname === base || pathname.startsWith(baseWithSlash)

  if (isInBase || isPt) return false

  const nextPath = `${base}${pathname.startsWith('/') ? '' : '/'}${pathname}`
  const next = `${nextPath}${search || ''}${hash || ''}`
  window.location.replace(next)
  return true
}

function installCanonicalGuards() {
  const w = window as unknown as {
    __appCanonicalGuardsInstalled?: boolean
  }
  if (w.__appCanonicalGuardsInstalled) return
  w.__appCanonicalGuardsInstalled = true

  const tryEnforce = () => {
    try { enforceCanonicalBaseOnce() } catch { void 0 }
  }

  tryEnforce()

  try {
    const origPush = window.history.pushState
    const origReplace = window.history.replaceState

    window.history.pushState = function (...args) {
      const r = origPush.apply(this, args as unknown as Parameters<History['pushState']>)
      try { window.dispatchEvent(new Event('app:locationchange')) } catch { void 0 }
      return r
    }

    window.history.replaceState = function (...args) {
      const r = origReplace.apply(this, args as unknown as Parameters<History['replaceState']>)
      try { window.dispatchEvent(new Event('app:locationchange')) } catch { void 0 }
      return r
    }
  } catch {
    void 0
  }

  try {
    window.addEventListener('popstate', tryEnforce)
    window.addEventListener('app:locationchange', tryEnforce)
  } catch {
    void 0
  }
}

function installChunkRecovery() {
  if (!import.meta.env.PROD) return

  const shouldRecover = (reason: unknown): boolean => {
    const msg = String((reason as { message?: string })?.message || reason || '')
    return (
      msg.includes('Loading chunk') ||
      msg.includes('ChunkLoadError') ||
      msg.includes('Failed to fetch dynamically imported module')
    )
  }

  const recover = () => {
    try {
      const key = `chunk_recover:${window.location.href}`
      const prev = sessionStorage.getItem(key)
      if (prev) return
      sessionStorage.setItem(key, '1')
    } catch {
      void 0
    }

    try {
      const { base } = normalizeBasePath()
      const { pathname, search, hash } = window.location
      const isInBase = base === '/' || pathname === base || pathname.startsWith(`${base}/`)
      if (!isInBase && base !== '/') {
        window.location.replace(`${base}${pathname}${search || ''}${hash || ''}`)
        return
      }
    } catch {
      void 0
    }

    try { window.location.reload() } catch { window.location.assign(window.location.href) }
  }

  window.addEventListener('unhandledrejection', (event) => {
    try {
      if (shouldRecover(event.reason)) recover()
    } catch {
      void 0
    }
  })
  window.addEventListener('error', (event) => {
    try {
      if (shouldRecover((event as unknown as { error?: unknown })?.error)) recover()
    } catch {
      void 0
    }
  })
}

installCanonicalGuards()
installChunkRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
