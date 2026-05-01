# Epic 005: Disparo Automatico de Templates WhatsApp para Recuperacao de Vendas

**Status:** Draft  
**Priority:** High  
**Owner:** PM (Morgan)  
**Criado em:** 2026-05-01  
**Modo AIOS:** @pm `*create-epic`  

---

## Epic Goal

Implementar um dispatcher backend interno que identifica leads elegiveis para recuperacao de venda e dispara um payload de template para o N8N/Meta API sem duplicar mensagens. O sistema deve cobrir leads PT e DE, usar pais do lead no payload final e preservar o worker atual apenas como registrador de eventos.

---

## Epic Description

### Existing System Context

- **Funcionalidade atual:** O frontend envia eventos para o worker `/eventos`; o worker grava `funnel_events` e atualiza `funnel_leads`. Eventos de compra e boleto/multibanco tambem chegam via N8N e sao registrados em `funnel_events`.
- **Stack relevante:** Node.js 18+, Express, TypeScript, Supabase JS, Axios, N8N, Meta API via workflow N8N.
- **Repositorios/areas:** O backend principal esta em `BACKEND/`; o frontend e docs ficam em `SILVER-BULLET-AQUISICAO-FREQUENCIA/`; o worker de eventos existe no projeto irmao `../Worker_Funil_01`.
- **Dados centrais:** `funnel_events`, `funnel_leads`, `vw_funnel_lead_compact`, eventos `lead_identified`, `checkout_start`, `PURCHASE_BILLET_PRINTED` e `purchase`.
- **Integracoes existentes:** `BACKEND/api/lib/n8n.ts` ja envia payloads de compra ao N8N; `purchaseN8N.md` registra compras; `hotmart-icN8N.md` registra eventos Hotmart, incluindo `attributes.payment_type`.

### Enhancement Details

**O que sera adicionado:**

1. Um modulo backend de recuperacao que consulta leads/eventos elegiveis.
2. Uma tabela de controle de disparos para idempotencia e auditoria.
3. Um sender N8N especifico para templates Meta/WhatsApp.
4. Um endpoint operacional para executar o dispatcher em modo real ou `dry_run`.
5. Documentacao de payload e criterios dos 3 templates.

**Tipos de mensagem:**

| Message Type | Condicao | Janela |
|---|---|---|
| `multibanco_reminder` | Tem `PURCHASE_BILLET_PRINTED`, `attributes.payment_type = CASHPAYMENT`, e nao tem `purchase` | 10 minutos apos o evento |
| `checkout_no_purchase` | Tem `checkout_start`, nao tem `purchase`, e nao e `CASHPAYMENT` | 10 minutos apos `checkout_start` |
| `no_checkout` | Nao tem `checkout_start`, nao tem `purchase` | 25 minutos apos marco inicial do lead |

**Marco inicial recomendado para `no_checkout`:**

Usar primeiro `lead_identified` em `step_id = /resultado`. Se nao existir, usar primeiro evento do lead no funil. Essa regra evita esperar por `/fim` quando o lead nao chegou ao IC.

**Payload esperado para N8N:**

```json
{
  "lead_id": "lead_x",
  "message_type": "checkout_no_purchase",
  "country": "PT",
  "language": "pt",
  "phone": "351...",
  "email": "lead@email.com",
  "name": "Nome",
  "funnel_id": "quiz_frequencia_01",
  "trigger": {
    "event_type": "checkout_start",
    "event_timestamp": "2026-05-01T12:00:00.000Z",
    "payment_type": null
  }
}
```

**Success Criteria:**

- Um lead elegivel dispara no maximo uma vez por `message_type`.
- Leads com `purchase` nunca recebem mensagem de recuperacao.
- Multibanco com `CASHPAYMENT` recebe apenas `multibanco_reminder`, nao `checkout_no_purchase`.
- Payload enviado ao N8N contem `country` vindo de `vw_funnel_lead_compact.country` quando disponivel, com fallback controlado.
- `dry_run` permite validar candidatos sem enviar WhatsApp.
- Logs e tabela de controle permitem auditar candidatos, sucesso e falha do N8N.

---

## Codebase & Documentation Audit Summary

### Achados locais

- `BACKEND/api/app.ts` registra rotas Express em `/api/auth`, `/api/stripe`, `/api/paypal` e `/api/leads`; a nova rota deve seguir esse padrao.
- `BACKEND/api/lib/n8n.ts` ja usa Axios, timeout configuravel e env vars; deve ser estendido ou espelhado para o webhook de templates.
- `BACKEND/api/routes/stripe.ts` e `BACKEND/api/routes/paypal.ts` ja enriquecem compra e chamam `sendPurchaseToN8N`.
- `../Worker_Funil_01/src/worker/worker.ts` faz upsert em `funnel_leads` e insert em `funnel_events`; nao deve receber a regra de disparo para manter responsabilidade simples.
- `../Worker_Funil_01/db/schema.sql` documenta `funnel_events` e `funnel_leads`; o schema local nao inclui a futura tabela de disparos.
- `SILVER-BULLET-AQUISICAO-FREQUENCIA/src/lib/funnelTracker.ts` envia `checkout_start`, `lead_identified` e `purchase`.
- `hotmart-icN8N.md` registra eventos Hotmart em `funnel_events` com `attributes.payment_type`.
- `purchaseN8N.md` registra `purchase` com dados de transacao e compra.

### Dados reais observados

- `funnel_events` possui colunas como `event_id`, `funnel_id`, `lead_id`, `event_type`, `event_timestamp`, `received_at`, `step_id`, `page_path`, `attributes`, `purchase` e `metadata`.
- `checkout_start` atual aparece em `step_id = /fim` com `attributes` muitas vezes nulo.
- `lead_identified` em `/resultado` carrega `attributes.name`, `attributes.email` e `attributes.phone`.
- `vw_funnel_lead_compact` confirma campos como `lead_id`, `funnel_id`, `has_purchase`, `last_event_at` e `auto_tag`; o epic requer validar/adicionar uso de `country`.

### Squads/reuso

- Nao foi encontrado diretorio `squads/` neste workspace.
- O reuso principal deve ser `BACKEND/api/lib/n8n.ts` e o padrao das rotas Express existentes.

### Pesquisa externa de implementacao

- Supabase JS suporta `upsert` com `onConflict` e `ignoreDuplicates`, util para idempotencia de disparos. Fonte: https://supabase.com/docs/reference/javascript/upsert
- n8n Webhook node pode receber payload externo e operar como gatilho de workflow em URL de producao. Fonte: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- n8n Respond to Webhook permite controlar resposta HTTP de workflows, util para confirmar `accepted`, `sent` ou erro ao backend. Fonte: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/

---

## Affected Files Map

### Files to MODIFY

| File Path | What Changes | Why |
|---|---|---|
| `BACKEND/api/app.ts` | Registrar rota `/api/recovery` | Expor execucao operacional do dispatcher |
| `BACKEND/api/lib/n8n.ts` | Adicionar sender de template ou separar tipos compartilhados | Reaproveitar padrao de webhook/timeout/logs existente |
| `BACKEND/package.json` | Adicionar scripts de teste/build se necessario | Validacao da feature backend |
| `purchaseN8N.md` | Documentar compatibilidade do payload de compra com bloqueio de recovery | Garantir que purchase cancele candidatos |
| `hotmart-icN8N.md` | Documentar dependencia de `PURCHASE_BILLET_PRINTED` e `payment_type` | Garantir que Multibanco seja detectavel |

### Files to CREATE

| File Path | Purpose | Based On |
|---|---|---|
| `BACKEND/api/routes/recovery.ts` | Endpoint `POST /api/recovery/dispatch-due` com `dry_run` | Padrao de `routes/leads.ts` |
| `BACKEND/api/lib/recoveryDispatcher.ts` | Regra de elegibilidade, prioridade e dispatch | Padrao service module simples |
| `BACKEND/api/lib/recoveryTypes.ts` | Tipos dos candidatos, mensagens e payload N8N | Tipagem TS existente |
| `BACKEND/api/lib/recoveryN8N.ts` | Sender especifico para webhook de templates | `api/lib/n8n.ts` |
| `BACKEND/api/lib/__tests__/recoveryDispatcher.test.ts` | Testes de classificacao/idempotencia | Testes unitarios backend |
| `SILVER-BULLET-AQUISICAO-FREQUENCIA/supabase/migrations/YYYYMMDD_create_whatsapp_recovery_dispatches.sql` | Tabela de controle e indice unico | Migrations Supabase existentes |
| `SILVER-BULLET-AQUISICAO-FREQUENCIA/docs/stories/5.1.recovery-dispatch-control.md` | Story detalhada de banco/idempotencia | Handoff para @sm |
| `SILVER-BULLET-AQUISICAO-FREQUENCIA/docs/stories/5.2.recovery-backend-dispatcher.md` | Story detalhada do dispatcher | Handoff para @sm |
| `SILVER-BULLET-AQUISICAO-FREQUENCIA/docs/stories/5.3.recovery-activation-validation.md` | Story detalhada de ativacao/validacao | Handoff para @sm |

### Files to DELETE

Nenhum arquivo deve ser deletado.

---

## Stories

### Story 1: Controle de Disparos e Contrato de Dados

**Description:** Criar a tabela de controle `whatsapp_recovery_dispatches`, definir constraints de idempotencia e documentar contrato dos campos usados em `funnel_events`/`vw_funnel_lead_compact`.

**Predicted Agents:** @dev, @db-sage  

**Quality Gates:**

- Pre-Commit: Validar migration SQL, indice unico `(lead_id, message_type)`, status permitidos e rollback manual.
- Pre-PR: Revisao de schema, leitura completa das colunas reais no Supabase e verificacao de nao impacto em tabelas existentes.

**Tasks:**

- [ ] Criar migration com `whatsapp_recovery_dispatches`.
- [ ] Incluir campos `lead_id`, `funnel_id`, `message_type`, `country`, `trigger_event_id`, `eligible_at`, `dispatched_at`, `n8n_status`, `n8n_response`, `created_at`, `updated_at`.
- [ ] Adicionar unique constraint para impedir duplicidade por lead/tipo.
- [ ] Definir status: `pending`, `sent`, `failed`, `skipped_purchase_found`.
- [ ] Confirmar schema real de `vw_funnel_lead_compact.country`.
- [ ] Documentar fallback de country quando o campo estiver nulo.

**Acceptance Criteria:**

- [ ] Tabela criada sem alterar comportamento de `funnel_events`.
- [ ] Inserir o mesmo `(lead_id, message_type)` duas vezes nao gera dois disparos.
- [ ] Migration e rollback manual documentados.

### Story 2: Dispatcher Backend Interno

**Description:** Implementar a rota e service backend que identificam candidatos elegiveis, aplicam prioridade entre mensagens e enviam payload para N8N.

**Predicted Agents:** @dev, @architect  

**Quality Gates:**

- Pre-Commit: Testes unitarios das 3 regras e da prioridade.
- Pre-PR: Validacao de contrato HTTP, tratamento de erro N8N, logs sem expor secrets.

**Tasks:**

- [ ] Criar `POST /api/recovery/dispatch-due`.
- [ ] Suportar `dry_run`, `limit` e filtro opcional por `lead_id`.
- [ ] Buscar candidatos em Supabase com service role no backend.
- [ ] Implementar regra `multibanco_reminder`.
- [ ] Implementar regra `checkout_no_purchase`.
- [ ] Implementar regra `no_checkout`.
- [ ] Bloquear qualquer candidato com `has_purchase = true` ou evento `purchase`.
- [ ] Priorizar `multibanco_reminder` acima de `checkout_no_purchase`, e `checkout_no_purchase` acima de `no_checkout`.
- [ ] Montar payload final com `country`, `language`, `lead_id`, `message_type`, `phone`, `email`, `name`, `funnel_id` e `trigger`.
- [ ] Enviar para env var `N8N_META_TEMPLATE_WEBHOOK_URL`.
- [ ] Registrar sucesso/falha na tabela de dispatch.

**Acceptance Criteria:**

- [ ] `dry_run` retorna candidatos sem enviar N8N.
- [ ] Execucao real envia payload apenas para leads elegiveis.
- [ ] Reexecutar o endpoint nao duplica mensagem ja enviada.
- [ ] Falha do N8N fica auditavel e nao marca como sucesso.

### Story 3: Ativacao Operacional e Validacao com Dados Reais

**Description:** Definir como o dispatcher roda em producao, validar um lead por regra antes de lote e preparar handoff para o workflow N8N de Meta templates.

**Predicted Agents:** @dev, @github-devops, @qa  

**Quality Gates:**

- Pre-Commit: Build TypeScript do backend.
- Pre-PR: Validacao manual com `dry_run`, revisao de env vars e payload contra N8N.
- Pre-Deployment: Primeiro disparo controlado com `limit=1`, monitoramento de logs e rollback.

**Tasks:**

- [ ] Definir ativacao backend interna: intervalo configuravel via env ou comando operacional protegido.
- [ ] Adicionar env vars: `N8N_META_TEMPLATE_WEBHOOK_URL`, `RECOVERY_DISPATCH_ENABLED`, `RECOVERY_DISPATCH_INTERVAL_MS`, `RECOVERY_DISPATCH_LIMIT`.
- [ ] Validar 1 candidato Multibanco em `dry_run`.
- [ ] Validar 1 candidato IC sem compra em `dry_run`.
- [ ] Validar 1 candidato sem IC em `dry_run`.
- [ ] Enviar 1 disparo real controlado e conferir resposta N8N.
- [ ] Documentar payload esperado pelo workflow Meta/N8N.
- [ ] Criar runbook de rollback: desligar `RECOVERY_DISPATCH_ENABLED`.

**Acceptance Criteria:**

- [ ] Feature desliga por env sem deploy de codigo.
- [ ] Validacao real nao processa lote antes de validar um candidato.
- [ ] N8N recebe `country` e `message_type` suficientes para escolher template.
- [ ] Logs permitem rastrear `lead_id -> message_type -> resposta N8N`.

---

## Compatibility Requirements

- [ ] Worker `/eventos` continua apenas registrando eventos; sem nova responsabilidade de disparo.
- [ ] `funnel_events` nao sofre alteracao destrutiva.
- [ ] Eventos de compra existentes continuam cancelando recuperacao.
- [ ] Stripe/PayPal/Hotmart continuam enviando purchase ao N8N atual.
- [ ] Endpoint novo deve exigir segredo operacional ou ficar acessivel apenas em ambiente interno.
- [ ] Nenhum fluxo frontend deve depender do dispatcher para continuar funcionando.

---

## Risk Mitigation

**Primary Risk:** Enviar WhatsApp duplicado ou para lead que ja comprou.  
**Mitigation:** Unique constraint por `(lead_id, message_type)`, checagem final de `purchase` imediatamente antes do envio e status auditavel.

**Secondary Risk:** Classificar Multibanco como checkout comum.  
**Mitigation:** Prioridade explicita para `PURCHASE_BILLET_PRINTED` + `CASHPAYMENT`, e exclusao de `CASHPAYMENT` da regra `checkout_no_purchase`.

**Third Risk:** Campo `country` ausente ou inconsistente.  
**Mitigation:** Ler `vw_funnel_lead_compact.country`; fallback para `metadata.country`, `page_path` (`/pt/`, `/de/`) ou `unknown`, sempre expondo o valor usado no payload.

**Rollback Plan:** Desligar `RECOVERY_DISPATCH_ENABLED`; manter tabela de controle para auditoria; se necessario remover rota do app em um commit unico.

### Quality Assurance Strategy

- Testes unitarios da classificacao com fixtures reais anonimizadas.
- `dry_run` obrigatorio antes de qualquer disparo real.
- Validacao de 1 candidato por regra antes de lote.
- Logs sem secrets e com `lead_id`, `message_type`, `eligible_at`, `n8n_status`.
- Build backend com `npm run build:api`.

---

## Definition of Done

- [ ] 3 stories completadas com criterios de aceite atendidos.
- [ ] Dispatcher backend identifica os 3 casos corretamente.
- [ ] N8N recebe payload com pais do lead.
- [ ] Duplicidade bloqueada por banco e por logica de aplicacao.
- [ ] Compradores sao excluidos antes do envio.
- [ ] Validacao com dados reais registrada.
- [ ] Documentacao de operacao e rollback atualizada.

---

## Story Manager Handoff

> Please develop detailed user stories for this brownfield epic. Key considerations:
> - This is an enhancement to an existing event/recovery system running Express, TypeScript, Supabase, N8N and Meta API workflows.
> - Integration points: `BACKEND/api/app.ts`, `BACKEND/api/lib/n8n.ts`, Supabase `funnel_events`, `funnel_leads`, `vw_funnel_lead_compact`, `purchaseN8N.md`, `hotmart-icN8N.md`.
> - Existing patterns to follow: Express route modules in `BACKEND/api/routes`, Supabase service role usage in `BACKEND/api/routes/leads.ts`, Axios webhook sender pattern in `BACKEND/api/lib/n8n.ts`, worker-only event ingestion in `../Worker_Funil_01`.
> - Critical compatibility requirements: no duplicate WhatsApp messages, no recovery message after purchase, no change to existing Stripe/PayPal/Hotmart purchase flows, and no new responsibility inside the event ingestion worker.
> - Each story must include verification that existing event ingestion, purchase recording and N8N purchase webhook remain intact.
>
> The epic should deliver automatic WhatsApp recovery dispatches for PT and DE leads while keeping the solution direct, auditable and easy to disable.

---

— Morgan, planejando o futuro
