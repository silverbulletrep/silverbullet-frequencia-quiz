-- Migration atualizada: Novos Status e Checkpoints
-- Substitui a migration anterior (ou deve ser rodada como alteração se já aplicada)

-- 1. Se a tabela já existir, vamos garantir que ela tenha a estrutura correta.
-- Caso contrário, cria do zero.

create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  client_uuid uuid not null unique, -- Adicionado unique para garantir 1:1
  whatsapp text,
  
  -- Dados Demográficos
  genero text,
  idade_range text,
  problema_principal text,
  
  -- Funil e Status
  etapa_funil text,
  -- Status atualizados conforme regra de negócio:
  -- 'nao_convertido': Lead criado, navegando no quiz.
  -- 'pendente': Abriu checkout (intenção de compra).
  -- 'convertido': Compra finalizada.
  status text default 'nao_convertido', 
  
  respostas_quiz jsonb default '{}'::jsonb,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Se a tabela já existir e precisarmos migrar os status antigos (caso houvesse dados):
-- update public.leads set status = 'nao_convertido' where status = 'in_progress';

-- Índices
create index if not exists leads_client_uuid_idx on public.leads(client_uuid);
create index if not exists leads_status_idx on public.leads(status);

-- Trigger de update_at (mesmo da anterior)
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists update_leads_updated_at on public.leads;
create trigger update_leads_updated_at
before update on public.leads
for each row
execute function update_updated_at_column();

-- Políticas RLS (Manter permissivo para MVP/Testes)
alter table public.leads enable row level security;
drop policy if exists "Permitir tudo anonimo" on public.leads;
create policy "Permitir tudo anonimo" on public.leads for all using (true) with check (true);
