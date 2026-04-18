import axios from 'axios'
import type { AxiosResponse } from 'axios'

function normalizeApiBase(raw: string): string {
  let base = String(raw || '').trim()
  if (!base) return ''
  base = base.replace(/\/+$/, '')
  base = base.replace(/\/api\/routes$/i, '')
  base = base.replace(/\/api$/i, '')
  return base
}

function resolveApiBase(): string {
  const remoteBase = 'https://api.fundaris.space'
  const envBaseRaw = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_API_BASE_URL : undefined
  const envBase = typeof envBaseRaw === 'string' ? normalizeApiBase(envBaseRaw) : ''

  if (typeof console !== 'undefined') {
    console.log('[API_DEBUG] resolveApiBase', {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'ssr'
    })
  }

  if (envBase) return envBase
  return normalizeApiBase(remoteBase)
}

export const API_BASE_URL: string = resolveApiBase()
if (typeof console !== 'undefined' && typeof console.log === 'function') {
  console.log('[FRONT] API base resolvida', { base: API_BASE_URL })
}

export const LEADS_ENABLED: boolean = typeof import.meta.env.PROD !== 'undefined' ? import.meta.env.PROD === true : true

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

async function requestWithFallback<T = unknown>(
  method: 'get' | 'post',
  url: string,
  data?: unknown,
): Promise<AxiosResponse<T>> {
  const res = method === 'get' ? await api.get<T>(url) : await api.post<T>(url, data)
  return res
}



export async function upsertLead(payload: {
  genero?: string
  idade?: number
  problema_principal?: string
  respostas_quiz?: Record<string, unknown>
  whatsapp: string
  estado_lead?: 'aguardando_recuperacao' | 'compra_concluida'
  etapa_funil?: string
}): Promise<{ data?: { id_lead?: string; id?: string; uuid?: string } }> {
  if (!LEADS_ENABLED) {
    const operacao = 'leads.upsert.disabled'
    const dados_entrada = payload
    try {
      console.log(`[FRONT] Iniciando operação: ${operacao}`, { dados_entrada })
      console.log(`[FRONT] Operação concluída com sucesso: ${operacao}`, {
        id_resultado: 'skipped',
        timestamp: new Date().toISOString(),
      })
    } catch (e) {
      try { console.warn('[FRONT] Falha ao registrar logs (leads desativado)', e) } catch { console.warn('[FRONT] Falha ao emitir aviso (leads)') }
    }
    return {}
  }
  const operacao = 'leads.upsert'
  const dados_entrada = payload
  try {
    console.log(`[FRONT] Iniciando operação: ${operacao}`, { dados_entrada })
    const { data } = await requestWithFallback<{ data?: { id_lead?: string; id?: string; uuid?: string } }>('post', '/api/leads', payload)
    console.log(`[FRONT] Operação concluída com sucesso: ${operacao}`, {
      id_resultado: data?.data?.id_lead || data?.data?.id || data?.data?.uuid,
      timestamp: new Date().toISOString(),
    })
    return data
  } catch (err: unknown) {
    const error = err as Error & { stack?: string; message?: string }
    console.error(`[FRONT] Erro na operação: ${operacao}: ${error.message}`, {
      dados_entrada,
      stack: error.stack,
    })
    throw err
  }
}



export async function getApiHealth(): Promise<{ success: boolean; ready?: boolean; message?: string }> {
  const operacao = 'api.health'
  try {
    const { data } = await requestWithFallback<{ success: boolean; ready?: boolean; message?: string }>('get', '/api/health')
    return data
  } catch (err: unknown) {
    const error = err as Error & { message?: string }
    console.error(`[FRONT] Erro na operação: ${operacao}: ${error.message}`)
    return { success: false, message: error.message || 'Falha na health da API' }
  }
}

export async function getPayPalHealth(): Promise<{ success: boolean; configured?: boolean; env?: string; frontend_url?: string; error?: string }> {
  const operacao = 'paypal.health'
  try {
    const { data } = await requestWithFallback<{ success: boolean; configured?: boolean; env?: string; frontend_url?: string; error?: string }>('get', '/api/paypal/health')
    return data
  } catch (err: unknown) {
    const error = err as Error & { message?: string }
    console.error(`[FRONT] Erro na operação: ${operacao}: ${error.message}`)
    return { success: false, error: error.message || 'Falha na health do PayPal' }
  }
}

export async function createPayPalOrder(payload: { value?: string | number; currency?: 'EUR' | 'BRL' | 'USD'; metadata?: Record<string, string | number | boolean> }): Promise<{ success: boolean; id?: string; approve_url?: string }> {
  const operacao = 'paypal.create_order'
  const dados_entrada = { ...payload }
  try {
    console.log('[PAYMENT_DEBUG] createPayPalOrder payload:', {
      value: payload?.value,
      currency: payload?.currency,
      origin: payload?.metadata?.origin
    })
    console.log(`[FRONT] Iniciando operação: ${operacao}`, { dados_entrada })
    const { data } = await requestWithFallback<{ success: boolean; id?: string; approve_url?: string }>('post', '/api/paypal/create-order', dados_entrada)
    console.log(`[FRONT] Operação concluída com sucesso: ${operacao}`, {
      id_resultado: data?.id,
      timestamp: new Date().toISOString(),
    })
    return data
  } catch (err: unknown) {
    const error = err as Error & { stack?: string; message?: string }
    console.error(`[FRONT] Erro na operação: ${operacao}: ${error.message}`, {
      dados_entrada,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })
    throw err
  }
}

export async function capturePayPalOrder(orderID: string, extras?: { fbp?: string; fbc?: string; client_uuid?: string; event_source_url?: string; email?: string; phone?: string }): Promise<{ success: boolean; data?: { id?: string; status?: string } }> {
  const operacao = 'paypal.capture_order'
  const dados_entrada = { orderID, fbp: extras?.fbp, fbc: extras?.fbc, client_uuid: extras?.client_uuid, event_source_url: extras?.event_source_url, email: extras?.email, phone: extras?.phone }
  try {
    console.log(`[FRONT] Iniciando operação: ${operacao}`, { dados_entrada })
    const { data } = await requestWithFallback<{ success: boolean; data?: { id?: string; status?: string } }>('post', '/api/paypal/capture-order', { orderID, fbp: extras?.fbp, fbc: extras?.fbc, client_uuid: extras?.client_uuid, event_source_url: extras?.event_source_url, email: extras?.email, phone: extras?.phone })
    console.log(`[FRONT] Operação concluída com sucesso: ${operacao}`, {
      id_resultado: data?.data?.id || orderID,
      timestamp: new Date().toISOString(),
    })
    return data
  } catch (err: unknown) {
    const error = err as Error & { stack?: string; message?: string }
    console.error(`[FRONT] Erro na operação: ${operacao}: ${error.message}`, {
      dados_entrada,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })
    throw err
  }
}

export async function finalizePayPalEmail(payload: { orderID: string; email: string; phone?: string; client_uuid?: string; event_source_url?: string; fbp?: string; fbc?: string }): Promise<{ success: boolean; error?: string }> {
  const operacao = 'paypal.finalize_email'
  const dados_entrada = { orderID: payload.orderID }
  try {
    console.log(`[FRONT] Iniciando operação: ${operacao}`, { dados_entrada })
    const { data } = await requestWithFallback<{ success: boolean; error?: string }>('post', '/api/paypal/finalize-email', payload)
    console.log(`[FRONT] Operação concluída com sucesso: ${operacao}`, {
      id_resultado: data?.success ? 'ok' : 'fail',
      timestamp: new Date().toISOString(),
    })
    return data
  } catch (err: unknown) {
    const error = err as Error & { stack?: string; message?: string }
    console.error(`[FRONT] Erro na operação: ${operacao}: ${error.message}`, {
      dados_entrada,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: error.message || 'Falha ao enviar email do PayPal' }
  }
}



export async function updateLeadPurchase(payload: {
  id_lead?: string
  whatsapp?: string
  dados_compra?: Record<string, unknown>
}): Promise<{ id_lead?: string }> {
  if (!LEADS_ENABLED) {
    const operacao = 'leads.update_purchase.disabled'
    const dados_entrada = payload
    try {
      console.log(`[FRONT] Iniciando operação: ${operacao}`, { dados_entrada })
      console.log(`[FRONT] Operação concluída com sucesso: ${operacao}`, {
        id_resultado: 'skipped',
        timestamp: new Date().toISOString(),
      })
    } catch (e) {
      try { console.warn('[FRONT] Falha ao registrar logs (update purchase desativado)', e) } catch { console.warn('[FRONT] Falha ao emitir aviso (update purchase)') }
    }
    return { id_lead: typeof payload.id_lead === 'string' ? payload.id_lead : undefined }
  }
  const operacao = 'leads.update_purchase'
  const dados_entrada = payload
  try {
    console.log(`[FRONT] Iniciando operação: ${operacao}`, { dados_entrada })
    const { data } = await requestWithFallback<{ id_lead?: string }>('post', '/api/leads/purchase', payload)
    console.log(`[FRONT] Operação concluída com sucesso: ${operacao}`, {
      id_resultado: data?.id_lead || 'sem_id',
      timestamp: new Date().toISOString(),
    })
    return data
  } catch (err: unknown) {
    const error = err as Error & { stack?: string; message?: string }
    console.error(`[FRONT] Erro na operação: ${operacao}: ${error.message}`, {
      dados_entrada,
      stack: error.stack,
    })
    throw err
  }
}


