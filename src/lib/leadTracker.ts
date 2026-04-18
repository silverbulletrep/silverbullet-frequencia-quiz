import { leadCache } from './leadCache'
import { upsertLead, updateLeadPurchase } from './api'

type InsertPayload = {
  genero?: string
  idade?: number
  problema_principal?: string
  respostas_quiz?: Record<string, unknown>
  whatsapp: string
  estado_lead: 'aguardando_recuperacao'
  etapa_funil: 'resultado'
}

export async function insertLeadOnResultado(whatsapp: string) {
  const cache = leadCache.getAll()

  const payload: InsertPayload = {
    genero: cache.genero,
    idade: cache.idade,
    problema_principal: Array.isArray(cache.problema_principal)
      ? cache.problema_principal.join(', ')
      : cache.problema_principal,
    respostas_quiz: cache.respostas_quiz || {},
    whatsapp,
    estado_lead: 'aguardando_recuperacao',
    etapa_funil: 'resultado',
  }

  // Valida campos essenciais
  if (!payload.whatsapp) throw new Error('WhatsApp é obrigatório')

  const resp = await upsertLead(payload)
  const data = resp?.data

  const id_lead = data?.id_lead || data?.id || data?.uuid
  if (id_lead) {
    leadCache.setLeadId(id_lead)
  }
  leadCache.setWhatsApp(whatsapp)
  leadCache.setEtapa('resultado')

  return data
}

/**
 * Exibe um resumo moderno das informações do usuário no console,
 * incluindo perguntas e respostas por etapa e metadados (telefone, opção selecionada, etc.).
 */
export function logUserSummary() {
  const cache = leadCache.getAll()
  const qaTable = leadCache.getQATable()

  const meta = {
    telefone: cache.whatsapp || '(não informado)',
    genero: cache.genero || '(não informado)',
    idade: cache.idade || '(não informado)',
    problema_principal: cache.problema_principal || cache.selected_option_description || '(não informado)',
    selected_option: cache.selected_option_description || cache.selected_option || '(não informado)',
    etapa_atual: cache.etapa_atual_do_funil || '(não definida)',
    id_lead: cache.id_lead || '(a definir)',
    client_uuid: cache.client_uuid || '(gerando)',
  }

  // Ordena por número da etapa para uma visualização consistente
  const ordered = [...qaTable].sort((a, b) => {
    const aNum = parseInt(String(a.etapa || '').match(/(\d+)/)?.[1] || '0', 10)
    const bNum = parseInt(String(b.etapa || '').match(/(\d+)/)?.[1] || '0', 10)
    return aNum - bNum
  })

  console.groupCollapsed('%cResumo do Usuário', 'color:#fff;background:#4f46e5;padding:4px 8px;border-radius:6px')
  console.log('%c📋 Metadados', 'color:#111;background:#e5e7eb;padding:2px 6px;border-radius:4px')
  console.table(meta)

  if (ordered.length > 0) {
    console.log('%c🧩 Perguntas e Respostas (por etapa)', 'color:#111;background:#e5e7eb;padding:2px 6px;border-radius:4px')
    console.table(
      ordered.map((row) => {
        const stepNum = String(row.etapa || '').match(/(\d+)/)?.[1] || row.etapa || '?'
        return {
          Etapa: stepNum,
          Pergunta: row.pergunta || '(pergunta não definida)',
          Resposta: row.resposta || '(resposta não definida)',
          Emoji: row.emoji || ''
        }
      })
    )

    console.log('%c📝 Relatório detalhado', 'color:#111;background:#e5e7eb;padding:2px 6px;border-radius:4px')
    for (const row of ordered) {
      const stepNum = String(row.etapa || '').match(/(\d+)/)?.[1] || row.etapa || '?'
      const pergunta = row.pergunta || '(pergunta não definida)'
      const resposta = row.resposta || '(resposta não definida)'
      const emoji = row.emoji ? ` ${row.emoji}` : ''
      console.log(`Etapa ${stepNum}: "${pergunta}" → ${resposta}${emoji}`)
    }

    console.log('%cTotal de perguntas respondidas: ' + ordered.length, 'color:#10b981')
  } else {
    console.warn('[RESUMO] Nenhuma resposta de quiz capturada ainda.')
  }
  console.groupEnd()
}

export async function updatePurchaseOnSuccess(dados_compra: Record<string, unknown>) {
  const cache = leadCache.getAll()
  const id_lead = cache.id_lead
  const whatsapp = cache.whatsapp

  const resp = await updateLeadPurchase({ id_lead, whatsapp, dados_compra })
  return resp
}

/**
 * Logs progressivos conforme o usuário avança no funil
 */
export function logGenderSelected() {
  const cache = leadCache.getAll()
  const genero = cache.genero || '(não informado)'
  console.log(`Gênero: ${genero}`)
}

export function logGenderAndAge() {
  const cache = leadCache.getAll()
  const genero = cache.genero || '(não informado)'
  const idade = typeof cache.idade !== 'undefined' ? cache.idade : '(não informado)'
  console.log(`Gênero: ${genero}\nIdade: ${idade}`)
}

export function logDesejoProgress() {
  const cache = leadCache.getAll()
  const genero = cache.genero || '(não informado)'
  const idade = typeof cache.idade !== 'undefined' ? cache.idade : '(não informado)'
  const desejo = cache.selected_option_description || cache.problema_principal || '(não informado)'
  console.log(`Gênero: ${genero}\nIdade: ${idade}\nDesejo: ${desejo}`)
}

export function logQuizProgress() {
  const qaRows = leadCache.getQATable()
  console.groupCollapsed('%cTeste de frequência (cumulativo)', 'color:#fff;background:#22c55e;padding:4px 8px;border-radius:6px')
  if (!qaRows || qaRows.length === 0) {
    console.warn('Nenhuma pergunta respondida ainda.')
  } else {
    for (const row of qaRows) {
      const match = String(row.etapa || '').match(/(\d+)/)
      const stepNum = match?.[1] || row.etapa || '?'
      const pergunta = row.pergunta || '(pergunta não definida)'
      const resposta = row.resposta || '(resposta não definida)'
      console.log(`Etapa ${stepNum}: "${pergunta}" → ${resposta}`)
    }
  }
  console.groupEnd()
}
