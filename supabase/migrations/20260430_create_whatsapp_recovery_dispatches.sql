-- Story 5.1: Controle de Disparos e Contrato de Dados
-- Cria a tabela de idempotencia/auditoria usada pelo dispatcher de recuperacao WhatsApp.
--
-- Manual rollback:
--   drop trigger if exists trg_whatsapp_recovery_dispatches_set_updated_at on public.whatsapp_recovery_dispatches;
--   drop function if exists public.set_whatsapp_recovery_dispatches_updated_at();
--   drop table if exists public.whatsapp_recovery_dispatches;

create extension if not exists "pgcrypto";

create or replace function public.set_whatsapp_recovery_dispatches_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.whatsapp_recovery_dispatches (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null,
  funnel_id text not null,
  message_type text not null,
  country text not null default 'unknown',
  trigger_event_id uuid,
  eligible_at timestamptz not null,
  dispatched_at timestamptz,
  n8n_status text not null default 'pending',
  n8n_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint whatsapp_recovery_dispatches_lead_message_type_key
    unique (lead_id, message_type),
  constraint whatsapp_recovery_dispatches_message_type_check
    check (
      message_type in (
        'multibanco_reminder',
        'checkout_no_purchase',
        'no_checkout'
      )
    ),
  constraint whatsapp_recovery_dispatches_n8n_status_check
    check (
      n8n_status in (
        'pending',
        'sent',
        'failed',
        'skipped_purchase_found'
      )
    )
);

create index if not exists idx_whatsapp_recovery_dispatches_lead_id
  on public.whatsapp_recovery_dispatches (lead_id);

create index if not exists idx_whatsapp_recovery_dispatches_message_type
  on public.whatsapp_recovery_dispatches (message_type);

create index if not exists idx_whatsapp_recovery_dispatches_n8n_status
  on public.whatsapp_recovery_dispatches (n8n_status);

create index if not exists idx_whatsapp_recovery_dispatches_eligible_at
  on public.whatsapp_recovery_dispatches (eligible_at);

drop trigger if exists trg_whatsapp_recovery_dispatches_set_updated_at
  on public.whatsapp_recovery_dispatches;

create trigger trg_whatsapp_recovery_dispatches_set_updated_at
before update on public.whatsapp_recovery_dispatches
for each row
execute function public.set_whatsapp_recovery_dispatches_updated_at();

comment on table public.whatsapp_recovery_dispatches is
  'Controle de disparos WhatsApp para idempotencia, auditoria e reconciliacao com o N8N.';

comment on column public.whatsapp_recovery_dispatches.country is
  'Pais enviado ao N8N. Preferir vw_funnel_lead_compact.country e aplicar fallback documentado na Story 5.1.';

comment on column public.whatsapp_recovery_dispatches.trigger_event_id is
  'Evento que tornou o lead elegivel. Nao usa foreign key obrigatoria para tolerar historico legado.';

comment on column public.whatsapp_recovery_dispatches.n8n_response is
  'Payload bruto de sucesso/erro retornado pelo N8N para auditoria operacional.';
