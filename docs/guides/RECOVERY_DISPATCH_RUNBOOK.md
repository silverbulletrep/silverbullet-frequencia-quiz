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
RECOVERY_FUNNEL_ID=quiz_frequencia_01
N8N_TIMEOUT_MS=20000
```

## Comportamento do scheduler

- O scheduler só liga quando `RECOVERY_DISPATCH_ENABLED=true`.
- O bootstrap acontece em `BACKEND/api/server.ts`.
- O agendamento usa `setInterval` no próprio processo Node.
- Existe lock em memória para evitar execução sobreposta no mesmo processo.
- Em múltiplas instâncias, a proteção real continua sendo a idempotência de `whatsapp_recovery_dispatches`.

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
- template escolhido por `message_type + country/language`
- linha criada/atualizada em `whatsapp_recovery_dispatches`

## Ativação do cron interno

Depois do `dry_run` e do primeiro envio real controlado:

```env
RECOVERY_DISPATCH_ENABLED=true
RECOVERY_DISPATCH_INTERVAL_MS=60000
RECOVERY_DISPATCH_LIMIT=20
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
