-- Migration para criar a tabela de leads (Simplificada)
-- Foco: Alta performance, dados demográficos e recuperação de funil

create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  
  -- Identificação
  client_uuid uuid not null, -- Identificador anônimo para rastreio desde o início
  whatsapp text, -- Chave principal de contato (nullable pois só vem no final)
  
  -- Dados Demográficos e Segmentação
  genero text,
  idade_range text, -- Ex: '35-49'
  problema_principal text, -- Ex: 'ansiedade', 'relacionamento'
  
  -- Estado do Funil
  etapa_funil text, -- Ex: 'quiz_step_5', 'resultado'
  status text default 'in_progress', -- 'in_progress', 'completed', 'recovered'
  
  -- Dados Flexíveis
  respostas_quiz jsonb default '{}'::jsonb, -- Armazena todas as respostas estruturadas
  
  -- Metadados de Sistema
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para performance em queries comuns
create index if not exists leads_client_uuid_idx on public.leads(client_uuid);
create index if not exists leads_whatsapp_idx on public.leads(whatsapp);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at);

-- Trigger para atualizar o updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_leads_updated_at
before update on public.leads
for each row
execute function update_updated_at_column();

-- Políticas de Segurança (RLS) - Opcional mas recomendado
alter table public.leads enable row level security;

-- Permitir inserção pública (para leads anônimos)
create policy "Permitir insert público" on public.leads
for insert with check (true);

-- Permitir select apenas se tiver o client_uuid (o próprio usuário pode ver seus dados)
create policy "Permitir select por client_uuid" on public.leads
for select using (client_uuid = auth.uid()::uuid); 
-- Nota: Como não estamos usando auth.uid() do Supabase Auth padrão aqui (é um quiz aberto),
-- essa política pode precisar de ajustes dependendo de como você autentica admin.
-- Por enquanto, deixarei permissivo para leitura pública via API Key (controle no backend) ou restrito.
-- Ajuste ideal: Criar política para Service Role (backend) ter acesso total.
