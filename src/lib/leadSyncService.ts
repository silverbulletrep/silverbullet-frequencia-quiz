import { getSupabase } from './supabaseClient'
import type { SupabaseClient } from '@supabase/supabase-js'
import { leadCache } from './leadCache'

// Tipagem baseada na tabela criada na migration
export type LeadPayload = {
  client_uuid: string
  whatsapp?: string | null
  email?: string | null
  lead_id_short?: string | null
  genero?: string | null
  idade_range?: string | null
  problema_principal?: string | null
  etapa_funil?: string
  status?: 'nao_convertido' | 'pendente' | 'convertido' | 'recuperado'
  respostas_quiz?: Record<string, unknown>
  attributes?: Record<string, unknown>
}

/**
 * Serviço responsável por sincronizar dados do lead com o Supabase.
 * Utiliza o client_uuid como chave de idempotência.
 */
export const leadSyncService = {
  
  /**
   * Sincroniza o estado atual do cache local para o Supabase.
   * Deve ser chamado em pontos chave (Checkpoints).
   * @param forceStatus Opcional: Força um status específico (ex: 'pendente' ao abrir checkout)
   */
  async sync(forceStatus?: LeadPayload['status']) {
    try {
      const cache = leadCache.getAll()
      
      if (!cache.client_uuid) {
        console.warn('[LEAD_SYNC] Tentativa de sync sem client_uuid. Ignorando.')
        return
      }
      let supabase: SupabaseClient | null = null
      try {
        supabase = getSupabase()
      } catch (e: unknown) {
        const msg = (e as Error)?.message || 'erro'
        console.error('[LEAD_SYNC] Supabase não configurado', { message: msg })
        return
      }

      // Determina o status com base na lógica de negócio e hierarquia
      const statusToSave: LeadPayload['status'] = forceStatus || 'nao_convertido'

      // Se não foi forçado, tentamos inferir, mas respeitando o histórico
      if (!forceStatus) {
        // Se já tem whats, provavelmente já converteu ou está pendente, 
        // mas o ideal é que o componente chame explicitamente com o status correto.
        // Por padrão, mantemos 'nao_convertido' se estiver apenas navegando.
        if (cache.whatsapp) {
            // Se tem whats mas não foi forçado 'convertido', assumimos que pode ser 'pendente' ou manter o que estava
            // Para simplificar: sync() sem argumentos apenas atualiza dados, sem mudar status crítico
            // A menos que seja a primeira sync
        }
      }

      const payload: LeadPayload = {
        client_uuid: cache.client_uuid,
        whatsapp: cache.whatsapp || null,
        email: cache.email || null,
        lead_id_short: cache.lead_id_short || null,
        genero: cache.genero || null,
        idade_range: cache.idade ? String(cache.idade) : null,
        problema_principal: Array.isArray(cache.problema_principal) 
          ? cache.problema_principal.join(', ') 
          : (cache.problema_principal || null),
        etapa_funil: cache.etapa_atual_do_funil || 'unknown',
        respostas_quiz: cache.respostas_quiz || {},
        attributes: {
          email: cache.email || null,
          whatsapp: cache.whatsapp || null,
          lead_id_short: cache.lead_id_short || null,
        },
        status: statusToSave
      }

      // Remove status do payload se for undefined (para não sobrescrever com null/default se não quisermos)
      if (!forceStatus) {
        delete payload.status
      }

      // Upsert: Atualiza se o client_uuid existir, cria se não existir
      const { error } = await supabase
        .from('leads')
        .upsert(payload, { onConflict: 'client_uuid' })

      if (error) throw error

      console.log(`[LEAD_SYNC] Sincronizado (${forceStatus || 'auto'}):`, { 
        uuid: payload.client_uuid, 
        etapa: payload.etapa_funil 
      })

    } catch (err) {
      console.error('[LEAD_SYNC] Erro ao sincronizar:', err)
    }
  },

  /**
   * Atalho específico para mudar status (Checkpoint explícito)
   */
  async setStatus(status: LeadPayload['status']) {
    console.log(`[LEAD_SYNC] Mudando status para: ${status}`)
    return this.sync(status)
  }
}
