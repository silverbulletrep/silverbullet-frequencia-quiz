# Recovery Dispatch Runbook

## Objetivo
Ativar o dispatcher interno de recuperacao WhatsApp com rollout seguro, validacao em `dry_run` e rollback simples.

## Variáveis de ambiente do backend

Obrigatórias:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE
RECOVERY_DISPATCH_SECRET=SEU_SEGREDO_OPERACIONAL
N8N_META_TEMPLATE_WEBHOOK_URL=https://SEU-N8N/webhook/recovery
```

Operacionais:

```env
RECOVERY_DISPATCH_ENABLED=false
RECOVERY_DISPATCH_INTERVAL_MS=60000
RECOVERY_DISPATCH_LIMIT=20
RECOVERY_DISPATCH_RECENT_LOOKBACK_MS=
RECOVERY_DISPATCH_BACKFILL_ENABLED=false
RECOVERY_FUNNEL_ID=quiz_frequencia_01
N8N_TIMEOUT_MS=20000
```

## Comportamento do scheduler

- O scheduler só liga quando `RECOVERY_DISPATCH_ENABLED=true`.
- O bootstrap acontece em `BACKEND/api/server.ts`.
- O agendamento usa `setInterval` no próprio processo Node.
- Existe lock em memória para evitar execução sobreposta no mesmo processo.
- A busca operacional prioriza leads recentes primeiro; backlog antigo só entra como cauda opcional quando `RECOVERY_DISPATCH_BACKFILL_ENABLED=true`.
- Em múltiplas instâncias, a proteção real continua sendo a idempotência de `whatsapp_recovery_dispatches`.

## Prioridade de leitura dos leads

- O lote quente usa uma janela recente derivada de `RECOVERY_DISPATCH_MAX_ELIGIBLE_AGE_MS + 25 min + margem`.
- `RECOVERY_DISPATCH_RECENT_LOOKBACK_MS` permite sobrescrever essa janela quando for necessário um rollout controlado.
- Se `RECOVERY_DISPATCH_BACKFILL_ENABLED=false`, o scheduler foca apenas no lote recente.
- Se `RECOVERY_DISPATCH_BACKFILL_ENABLED=true`, o sistema completa vagas restantes com leads antigos sem deixar o backlog bloquear os recentes.

## Contrato backend -> N8N

Payload esperado para o webhook de recovery:

```json
{
  "lead_id": "lead_x",
  "message_type": "checkout_no_purchase",
  "destination": "351912345678",
  "country": "PT",
  "language": "pt",
  "phone": "351912345678",
  "email": "lead@email.com",
  "name": "Maria da Silva",
  "funnel_id": "quiz_frequencia_01",
  "trigger": {
    "event_id": "evt_x",
    "event_type": "checkout_start",
    "event_timestamp": "2026-05-02T05:00:00.000Z",
    "payment_type": null,
    "step_id": "/fim",
    "page_path": "/pt/fim"
  },
  "metadata": {
    "template_id": "local-template-uuid",
    "meta_template_id": "1614925649613959",
    "template_name": "recuperacao_portugal_base",
    "template_category": "inicializacao",
    "meta_language": "pt_PT",
    "meta_payload": {
      "components": []
    },
    "template_variable_definitions": [
      { "token": "{{1}}", "index": 1, "label": "Nome", "required": true },
      { "token": "{{2}}", "index": 2, "label": "Desejo principal", "required": true }
    ],
    "template_variable_values": {
      "{{1}}": "Maria",
      "{{2}}": "Riqueza"
    }
  }
}
```

Regras importantes:

- O backend decide `template_id`, `meta_language`, `source_key`, `resolution_mode`, `value_map` e `fallback_value`.
- O N8N deve apenas transformar `metadata.template_variable_definitions` e `metadata.template_variable_values` em `components.body.parameters` para a Meta.
- O N8N nao deve conter `if/else` para escolher template por `message_type`, sexo ou pais.

## Logs esperados

Permitidos:

- `lead_id`
- `message_type`
- `eligible_at`
- `n8n_status`
- `status` HTTP do N8N

Nunca logar:

- `RECOVERY_DISPATCH_SECRET`
- service role key
- headers/tokens sensíveis

Logs adicionais esperados após o ajuste:

- `fetch_mode`
- `recent_lookback_ms`
- `fetched_context_count`
- `skipped_expired_count`

## Sequência recomendada de validação

### 1. Build do backend

```bash
cd BACKEND
npm run build:api
```

### 2. Dry run manual com `limit=1`

```bash
curl -X POST 'http://localhost:3005/api/recovery/dispatch-due' \
  -H 'Content-Type: application/json' \
  -H 'x-recovery-dispatch-secret: SEU_SEGREDO_AQUI' \
  -d '{
    "dry_run": true,
    "limit": 1
  }'
```

### 3. Dry run por regra

Multibanco:

```bash
curl -X POST 'http://localhost:3005/api/recovery/dispatch-due' \
  -H 'Content-Type: application/json' \
  -H 'x-recovery-dispatch-secret: SEU_SEGREDO_AQUI' \
  -d '{
    "dry_run": true,
    "limit": 1,
    "lead_id": "LEAD_MULTIBANCO"
  }'
```

Checkout sem compra:

```bash
curl -X POST 'http://localhost:3005/api/recovery/dispatch-due' \
  -H 'Content-Type: application/json' \
  -H 'x-recovery-dispatch-secret: SEU_SEGREDO_AQUI' \
  -d '{
    "dry_run": true,
    "limit": 1,
    "lead_id": "LEAD_CHECKOUT_NO_PURCHASE"
  }'
```

Sem checkout:

```bash
curl -X POST 'http://localhost:3005/api/recovery/dispatch-due' \
  -H 'Content-Type: application/json' \
  -H 'x-recovery-dispatch-secret: SEU_SEGREDO_AQUI' \
  -d '{
    "dry_run": true,
    "limit": 1,
    "lead_id": "LEAD_NO_CHECKOUT"
  }'
```

Checklist de leitura do `dry_run`:

- confirmar ausência de `purchase`
- confirmar `message_type`
- confirmar `country`
- confirmar `language`
- confirmar telefone válido
- confirmar que o lead escolhido possui rota ativa em `recovery_template_routes`
- confirmar `fetch_mode = exact_lead` quando `lead_id` for informado

### 3.1 Matriz de validação do contrato

Casos que devem ser conferidos entre backend, resposta da rota e N8N:

| Caso | Como validar | Evidência esperada |
|---|---|---|
| `pass_through` com valor presente | Binding `source_key = name` ou `email` com valor real | `template_variable_values` recebe valor resolvido sem usar fallback |
| `pass_through` com fallback | Binding `source_key` sem valor no lead e `fallback_value` preenchido | `template_variable_values` usa o fallback |
| `mapped_value` com match | `value_map` contém a chave bruta do lead | `template_variable_values` recebe o texto mapeado |
| `mapped_value` com fallback | valor bruto nao existe em `value_map` e fallback existe | `template_variable_values` recebe o fallback |
| `desire.response[0]` | lead com `desire.response[0]` preenchido | placeholder recebe o primeiro desejo |
| `desire.response[1]` | lead com segundo desejo disponivel | placeholder recebe o segundo desejo |
| obrigatoria sem resolucao | binding `required=true` sem valor final nem fallback | backend marca `missing_required_template_variable` e nao chama N8N |

Evidência automatizada local já disponível:

- `npm run test:api` cobre `pass_through` com valor presente, `pass_through` com fallback, `mapped_value` com match, `mapped_value` com fallback, `desire.response[0]`, `desire.response[1]` e bloqueio por variavel obrigatoria sem envio.

### 4. Primeiro envio real controlado

```bash
curl -X POST 'http://localhost:3005/api/recovery/dispatch-due' \
  -H 'Content-Type: application/json' \
  -H 'x-recovery-dispatch-secret: SEU_SEGREDO_AQUI' \
  -d '{
    "dry_run": false,
    "limit": 1
  }'
```

Depois validar:

- resposta HTTP da rota
- execução no N8N
- `metadata.template_id`, `metadata.meta_template_id`, `metadata.template_name` e `metadata.meta_language`
- `metadata.template_variable_definitions`
- `metadata.template_variable_values`
- linha criada/atualizada em `whatsapp_recovery_dispatches`
- ausencia de regra de negocio no workflow do N8N para template/binding

### 4.1 Consulta de auditoria após envio real

```sql
select
  lead_id,
  message_type,
  country,
  n8n_status,
  eligible_at,
  dispatched_at,
  n8n_response
from public.whatsapp_recovery_dispatches
where lead_id = 'LEAD_VALIDADO'
order by updated_at desc;
```

## Ativação do cron interno

Depois do `dry_run` e do primeiro envio real controlado:

```env
RECOVERY_DISPATCH_ENABLED=true
RECOVERY_DISPATCH_INTERVAL_MS=60000
RECOVERY_DISPATCH_LIMIT=20
RECOVERY_DISPATCH_BACKFILL_ENABLED=false
```

Reinicie o backend e confirme no log:

- scheduler habilitado
- intervalo
- limite

## Rollback

Rollback simples:

```env
RECOVERY_DISPATCH_ENABLED=false
```

Fallback emergencial:

- remover ou invalidar `N8N_META_TEMPLATE_WEBHOOK_URL`
- reiniciar o backend
- desativar a rota em `recovery_template_routes` para o `message_type + country` afetado, se o problema estiver no template

## Consultas operacionais úteis

Pendentes:

```sql
select *
from public.whatsapp_recovery_dispatches
where n8n_status = 'pending'
order by eligible_at asc;
```

Falhas:

```sql
select *
from public.whatsapp_recovery_dispatches
where n8n_status = 'failed'
order by updated_at desc;
```

Pulados por compra:

```sql
select *
from public.whatsapp_recovery_dispatches
where n8n_status = 'skipped_purchase_found'
order by updated_at desc;
```
