function queueLeadSync() {
  void import('./leadSyncService')
    .then(({ leadSyncService }) => leadSyncService.sync())
    .catch(() => {})
}

type LeadCacheData = {
  genero?: 'homem' | 'mulher'
  idade?: number
  problema_principal?: string | string[]
  respostas_quiz?: Record<string, unknown>
  etapa_atual_do_funil?: string
  whatsapp?: string
  whatsapp_raw?: string
  email?: string
  contact_preference?: 'whatsapp' | 'email'
  lead_id?: string
  id_lead?: string
  lead_id_short?: string
  created_at?: string
  client_uuid?: string
  selected_option?: string
  selected_option_description?: string
  nome?: string
}

const MEMORY_STORE: { data: LeadCacheData } = { data: {} }
const STORAGE_KEY = 'lead_cache_app_espiritualidade'

// Sem janela de expiração: mantemos os dados até limpeza explícita
function generateUUID(): string {
  // UUID v4 Generator compatível com navegadores antigos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function ensureClientUUID(data: LeadCacheData): LeadCacheData {
  if (data.client_uuid && typeof data.client_uuid === 'string' && data.client_uuid.length > 0) return data
  
  let uuid: string
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
     try {
       uuid = (globalThis.crypto as unknown as { randomUUID: () => string }).randomUUID()
     } catch {
       uuid = generateUUID()
     }
  } else {
    uuid = generateUUID()
  }
  
  return { ...data, client_uuid: uuid }
}

function readStorage(): LeadCacheData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return MEMORY_STORE.data || {}
    const payload = JSON.parse(raw)
    return (payload?.data || {}) as LeadCacheData
  } catch {
    return MEMORY_STORE.data || {}
  }
}

function writeStorage(data: LeadCacheData) {
  const next = ensureClientUUID({ ...data })
  MEMORY_STORE.data = next
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data: MEMORY_STORE.data })
    )
    // Notificação no console com lista de dados armazenados (somente dev)
    console.info('[LEAD_CACHE] Dados salvos no cache:', MEMORY_STORE.data)
  } catch {
    console.warn('[LEAD_CACHE] Falha ao salvar no storage')
  }
}

export const leadCache = {
  getAll(): LeadCacheData {
    return readStorage()
  },
  clear() {
    MEMORY_STORE.data = {}
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      console.warn('[LEAD_CACHE] Falha ao limpar storage')
    }
  },
  setGenero(genero: 'homem' | 'mulher') {
    const current = readStorage()
    const next = { ...current, genero, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
    // Checkpoint: Dados básicos
    queueLeadSync()
  },
  setIdade(idade: number | string) {
    const intIdade = typeof idade === 'string' ? Number(idade.replace(/\D/g, '')) || undefined : idade
    const current = readStorage()
    const next = { ...current, idade: intIdade, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
    // Checkpoint: Dados básicos
    queueLeadSync()
  },
  setProblemaPrincipal(chave: string | string[]) {
    const current = readStorage()
    const next = { ...current, problema_principal: chave, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
    // Checkpoint: Problema principal
    queueLeadSync()
  },
  mergeQuizAnswers(answers: Record<string, unknown>) {
    const current = readStorage()
    const etapa = current.etapa_atual_do_funil || 'desconhecido'
    const opt = describeOption(current.selected_option)
    const prev = current.respostas_quiz || {}
    const prevSteps = (prev?.steps || {}) as Record<string, Record<string, unknown>>
    const nextSteps = {
      ...prevSteps,
      [etapa]: { ...(prevSteps[etapa] || {}), ...answers },
    }
    const organized = {
      selected_option: opt.key,
      selected_option_description: opt.description,
      steps: nextSteps,
    }
    const next = { ...current, respostas_quiz: organized, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
    // Checkpoint: Respostas do Quiz
    queueLeadSync()
  },
  /**
   * Salva Q&A detalhado (pergunta e resposta textual) para uma etapa específica.
   * Não remove o formato anterior (steps), apenas adiciona um novo índice qa_by_step.
   */
  saveQAsForStep(
    stepId: string,
    questions: Array<{ id: string; title: string; subtitle?: string; options?: Array<{ key: string; text: string; emoji?: string }> }>,
    answers: Record<string, unknown>
  ) {
    const current = readStorage()
    const opt = describeOption(current.selected_option)
    const prev = current.respostas_quiz || {}
    const prevQAByStep = (prev?.qa_by_step || {}) as Record<string, Array<{ question?: string; answer?: string; emoji?: string }>>

    // Index auxiliar para lookup de opções por id->key
    const optionsIndex: Record<string, Record<string, { text: string; emoji?: string }>> = {}
    for (const q of questions) {
      if (q.options && q.options.length) {
        optionsIndex[q.id] = {}
        for (const op of q.options) {
          optionsIndex[q.id][op.key] = { text: op.text, emoji: op.emoji }
        }
      }
    }

    const qaItems: Array<{ id: string; question: string; answer: string; answer_key?: string; emoji?: string }> = []
    for (const q of questions) {
      const answerVal = answers[q.id]
      if (typeof answerVal === 'undefined') continue

      // Se resposta corresponde a uma opção, usar o texto da opção; senão, usar texto livre
      const optMap = optionsIndex[q.id] || {}
      const optEntry = optMap[String(answerVal)]
      const answerText = optEntry?.text || String(answerVal)
      const emoji = optEntry?.emoji

      qaItems.push({
        id: q.id,
        question: q.title,
        answer: answerText,
        answer_key: optEntry ? String(answerVal) : undefined,
        emoji,
      })
    }

    const nextQAByStep = {
      ...prevQAByStep,
      [stepId]: qaItems,
    }

    const organized = {
      selected_option: opt.key,
      selected_option_description: opt.description,
      steps: (prev?.steps || {}), // preserva estrutura anterior
      qa_by_step: nextQAByStep,
    }

    const next = { ...current, respostas_quiz: organized, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
  },
  /**
   * Gera uma tabela plana de Q&A consolidada para exibição via console.table
   */
  getQATable(): Array<{ etapa: string; pergunta: string; resposta: string; emoji?: string }> {
    const current = readStorage()
    const qa = (current?.respostas_quiz?.qa_by_step || {}) as Record<string, Array<{ question?: string; answer?: string; emoji?: string }>>
    const rows: Array<{ etapa: string; pergunta: string; resposta: string; emoji?: string }> = []
    Object.keys(qa).forEach((stepId) => {
      const items = qa[stepId] || []
      for (const it of items) {
        rows.push({ etapa: stepId, pergunta: it.question || '', resposta: it.answer || '', emoji: it.emoji })
      }
    })
    return rows
  },
  setEtapa(etapa: string) {
    const current = readStorage()
    const next = { ...current, etapa_atual_do_funil: etapa, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
  },
  setSelectedOption(optionKey: string) {
    const current = readStorage()
    const opt = describeOption(optionKey)
    const next = {
      ...current,
      selected_option: opt.key,
      selected_option_description: opt.description,
      created_at: current.created_at || new Date().toISOString(),
    }
    writeStorage(next)
  },
  setWhatsApp(whatsapp: string) {
    const current = readStorage()
    const next = { ...current, whatsapp, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
    
    // Sync crítico
    queueLeadSync()
  },
  setWhatsAppRaw(whatsapp_raw: string) {
    const current = readStorage()
    const next = { ...current, whatsapp_raw, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
  },
  setEmail(email: string) {
    const current = readStorage()
    const next = { ...current, email, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
    queueLeadSync()
  },
  setContactPreference(contact_preference: 'whatsapp' | 'email') {
    const current = readStorage()
    const next = { ...current, contact_preference, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
    queueLeadSync()
  },
  setLeadId(lead_id: string) {
    const current = readStorage()
    const next = { ...current, lead_id, id_lead: lead_id }
    writeStorage(next)
  },
  setLeadIdShort(lead_id_short: string) {
    const current = readStorage()
    const next = { ...current, lead_id_short }
    writeStorage(next)
    queueLeadSync()
  },
  setNome(nome: string) {
    const current = readStorage()
    const next = { ...current, nome, created_at: current.created_at || new Date().toISOString() }
    writeStorage(next)
    queueLeadSync()
  },
}
function describeOption(key?: string): { key?: string; description?: string } {
  const k = (key || '').toLowerCase().trim()
  const map: Record<string, string> = {
    abundance: 'Abundância',
    attract: 'Atração',
    attraction: 'Atração',
    healing: 'Cura',
    balance: 'Equilíbrio',
    purpose: 'Propósito',
    peace: 'Paz',
    love: 'Amor',
    success: 'Sucesso',
    energy: 'Energia',
  }
  if (!k) return {}
  const desc = map[k] || k.charAt(0).toUpperCase() + k.slice(1)
  return { key: k, description: desc }
}
