# Epic 006: Recovery Template Routing and Variable Resolution

**Status:** Draft  
**Priority:** High  
**Owner:** PM (Morgan)  
**Criado em:** 2026-05-01  
**Modo AIOS:** @pm `*create-epic`  

---

## Epic Structure Decision

**Single coordinated epic**. Embora esta melhoria exceda o escopo ideal de 1-3 stories da task brownfield-create-epic, ela continua sendo uma unica capacidade integrada: configurar templates de recovery no dashboard, resolver variaveis no backend e disparar payloads completos ao N8N sem introduzir nova fragmentacao arquitetural. Separar em multiplos epics aqui aumentaria a dependencia cruzada entre dashboard, backend e contrato N8N sem ganho real de entrega.

---

## Epic Goal

Implementar um sistema completo de roteamento de templates e resolucao de variaveis para recovery WhatsApp, configuravel via dashboard e executado pelo backend. O sistema deve escolher o template por `message_type + country`, resolver valores a partir de `vw_funnel_lead_compact` incluindo `desire`, aplicar transformacoes dinamicas por template e enviar ao N8N um payload final pronto para a Meta.

---

## Epic Description

### Existing System Context

- **Templates Meta ja existem no dashboard:** `message_templates` ja armazena `meta_template_id`, `meta_language`, `meta_payload` e `variable_definitions`.
- **Outbound WhatsApp ja carrega metadata estruturada:** o dashboard ja envia `template_id`, `template_name`, `meta_language`, `meta_payload`, `template_variable_definitions` e `template_variable_values`.
- **N8N ja suporta 0, 1 ou N parametros:** o workflow atual le `metadata.template_variable_definitions` e `metadata.template_variable_values` para montar `components.body.parameters`.
- **Recovery backend ja existe:** o endpoint `POST /api/recovery/dispatch-due` ja classifica candidatos e envia payloads basicos ao N8N, mas ainda sem resolucao completa de template/variaveis.
- **Lead context compacto ja existe:** `vw_funnel_lead_compact` ja entrega `name`, `email`, `phone`, `gender`, `country`, `auto_tag`, `has_purchase`, e agora tambem `desire`.
- **Recovery configurator dedicado ainda nao existe:** a rota `/ai-recovery` atual e de outro contexto e nao deve ser reutilizada para esta implementacao. O planejamento desta epic passa a prever uma nova rota dedicada: `/recovery-template-routing`.

### Enhancement Details

**O que sera adicionado:**

1. Uma configuracao persistida de roteamento `message_type + country -> template`.
2. Um catalogo fixo de `source_key` derivadas exclusivamente de `vw_funnel_lead_compact`.
3. Um configurador por template/variavel que define:
   - qual `source_key` abastece cada placeholder (`{{1}}`, `{{2}}`, ...)
   - o texto amigavel exibido para cada opcao de `source_key`
   - o modo de resolucao da variavel
4. Dois modos oficiais de resolucao de variaveis:
   - **Tipo A: Dynamic mapped value**
     - backend le o valor bruto da `source_key`
     - backend converte esse valor para um texto especifico do template
   - **Tipo B: Pass-through / hard-coded source value**
     - backend usa diretamente o valor bruto vindo de `vw_funnel_lead_compact`
5. Resolucao backend usando `vw_funnel_lead_compact.desire` como fonte oficial para desejos do lead.
6. Payload backend -> N8N enriquecido com `meta_template_id`, `meta_language`, `template_variable_definitions` e `template_variable_values`.

### Rules Locked by This Epic

- **Nao havera mais roteamento por sexo.**
- Qualquer personalizacao por homem/mulher deve ocorrer via variavel dinamica resolvida no backend.
- **Source keys devem ser fixas** e limitadas a campos de `vw_funnel_lead_compact`.
- **JSONB subpaths sao permitidos** quando a coluna da view for `jsonb`, por exemplo:
  - `desire.question`
  - `desire.response[0]`
  - `desire.response[1]`
- O backend **nao** deve inventar valores fora do catalogo configurado.
- O N8N continua como camada de transporte para Meta, sem if/else de negocio por template.

### Initial Source Key Catalog for V1

As opcoes abaixo devem ser tratadas como catalogo controlado no dashboard/backend:

| Source Key | Display Text | Source |
|---|---|---|
| `name` | Nome completo | `vw_funnel_lead_compact.name` |
| `email` | E-mail | `vw_funnel_lead_compact.email` |
| `phone` | Telefone | `vw_funnel_lead_compact.phone` |
| `age` | Idade | `vw_funnel_lead_compact.age` |
| `gender` | Genero | `vw_funnel_lead_compact.gender` |
| `country` | Pais | `vw_funnel_lead_compact.country` |
| `auto_tag` | Auto tag atual | `vw_funnel_lead_compact.auto_tag` |
| `desire.question` | Pergunta do desejo | `vw_funnel_lead_compact.desire->question` |
| `desire.response[0]` | Primeiro desejo | `vw_funnel_lead_compact.desire->response[0]` |
| `desire.response[1]` | Segundo desejo | `vw_funnel_lead_compact.desire->response[1]` |

> Nota: `desire.response[0]` representa o primeiro desejo; `desire.response[1]`, o segundo.

### Example of Per-Template Dynamic Mapping

**Template variable binding example:**

- `{{2}}`
  - `source_key = desire.response[0]`
  - `resolution_mode = mapped_value`
  - `value_map`:
    - `Riqueza` -> `uma vida de prosperidade financeira ilimitada`
    - `Relacionamentos` -> `relacionamentos profundamente harmoniosos`
    - `Saude` -> `um estado continuo de saude e vitalidade`

**Pass-through example:**

- `{{1}}`
  - `source_key = name`
  - `resolution_mode = pass_through`
  - backend envia o valor bruto de `vw_funnel_lead_compact.name`

### Payload Target for N8N

```json
{
  "lead_id": "lead_x",
  "message_type": "checkout_no_purchase",
  "destination": "351...",
  "metadata": {
    "template_id": "local-template-uuid",
    "meta_template_id": "1614925649613959",
    "template_name": "recuperacao_portugal_base",
    "template_category": "inicializacao",
    "meta_language": "pt_PT",
    "template_variable_definitions": [
      { "token": "{{1}}", "index": 1, "label": "Nome", "required": true },
      { "token": "{{2}}", "index": 2, "label": "Desejo principal", "required": true }
    ],
    "template_variable_values": {
      "{{1}}": "Maria",
      "{{2}}": "uma vida de prosperidade financeira ilimitada"
    }
  }
}
```

### Success Criteria

- O dashboard permite configurar exatamente qual template sera usado para cada `message_type + country`.
- O dashboard permite configurar por placeholder qual `source_key` sera usada.
- O dashboard exibe texto amigavel para cada `source_key` disponivel.
- O dashboard permite configurar `mapped_value` por template/variavel.
- O backend resolve variaveis exclusivamente a partir de `vw_funnel_lead_compact`.
- O backend usa `vw_funnel_lead_compact.desire` como fonte oficial dos desejos.
- O backend envia ao N8N payload final com template Meta e valores resolvidos.
- O roteamento por sexo deixa de existir no planejamento e na implementacao.

---

## Codebase & Documentation Audit Summary

### Achados locais

- `Dashboard_2.0/dashbord/src/pages/Templates.tsx` ja faz CRUD completo em `message_templates` e ja persiste `meta_language`, `meta_payload` e `variable_definitions`.
- `Dashboard_2.0/dashbord/src/components/Templates/MetaWhatsappTemplateEditor.tsx` ja reconstrui placeholders e salva a estrutura de variaveis do template Meta.
- `Dashboard_2.0/dashbord/src/services/templateVariableService.ts` hoje modela apenas `token`, `index`, `label`, `example` e `required`; ainda nao conhece `source_key`, `resolution_mode` ou `value_map`.
- `Dashboard_2.0/dashbord/src/services/leadService.ts` ja envia `template_variable_definitions` e `template_variable_values` no metadata outbound, provando que o contrato com N8N ja aceita template resolvido.
- `Dashboard_2.0/dashbord/src/app/router.tsx` ja expoe `/templates` e `/ai-recovery`.
- `Dashboard_2.0/dashbord/src/pages/AiRecoveryDashboard.tsx` existe, mas hoje esta focado em visualizacao de mensagens e nao em configuracao operacional de routing.
- `Dashboard_2.0/dashbord/supabase/migrations/202605010001_add_desire_to_compact_view.sql` adicionou `desire` em `vw_funnel_lead_compact` e normalizou `response` para ate dois valores.
- `BACKEND/api/lib/recoveryDispatcher.ts` ja seleciona candidatos e ja consulta `vw_funnel_lead_compact`, mas ainda gera payload simples sem template resolution.
- `BACKEND/api/lib/recoveryTypes.ts` e `BACKEND/api/lib/recoveryN8N.ts` ainda estao orientados a `message_type/country/language`, sem `meta_template_id` ou binding resolution.

### Dados reais observados

- Em leitura read-only no Supabase em **2026-05-01**, `message_templates` ja possui templates reais nos estados `approved`, `pending`, `rejected` e `local_only`.
- O banco real ja possui `vw_funnel_lead_compact.gender` com valores reais como `homem` e `mulher`.
- O step real de desejo e `step_id = /morning-feeling`.
- `funnel_events.attributes.response` aparece como array de strings e pode conter 1 ou 2 desejos reais, como `["Riqueza"]` e `["Riqueza", "Relacionamentos"]`.
- `recovery_runs` ja existe no banco real, provando que a camada de recovery do dashboard esta ativa.

### Reuso e nao duplicacao

- O catalogo de templates continua em `message_templates`; nao deve ser recriado.
- O contrato outbound atual com N8N deve ser estendido, nao substituido.
- O backend de recovery atual deve ser evoluido, nao reimplementado do zero.

### Pesquisa externa de implementacao

- **Supabase / Postgres views:** views sao apropriadas para encapsular consultas complexas e expor um read model consistente para consumo de app e automacoes. Fonte: Supabase Docs, `Tables and Data -> Views` - https://supabase.com/docs/guides/database/tables
- **Supabase database as Postgres:** o projeto tem Postgres completo disponivel, permitindo modelagem com tabelas auxiliares, JSONB e views sem sair do stack atual. Fonte: Supabase Docs, `Database Overview` - https://supabase.com/docs/guides/database/overview
- **n8n webhook response control:** o workflow pode responder com JSON estruturado via `Respond to Webhook`, adequado para confirmar `accepted`, `failed` ou outros status ao backend. Fonte: n8n Docs, `Respond to Webhook` - https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/
- **n8n webhook trigger contract:** o Webhook node continua sendo o ponto correto para receber o payload resolvido do backend sem mover a logica de negocio para o fluxo visual. Fonte: n8n Docs, `Webhook` - https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- **WhatsApp template components:** o envio de template depende de `name`, `language` e `components.parameters` coerentes com a estrutura aprovada do template, o que reforca a decisao de enviar payload resolvido ja no backend. Fonte: WhatsApp Cloud API Node.js SDK docs - https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/messages/template/

---

## Affected Files Map

### Files to MODIFY

| File Path | What Changes | Why |
|---|---|---|
| `../Dashboard_2.0/dashbord/src/pages/Templates.tsx` | Estender CRUD para bindings/resolution config ou conectar com nova UI de configuracao | Manter edicao de templates consistente com o catalogo atual |
| `../Dashboard_2.0/dashbord/src/components/Templates/MetaWhatsappTemplateEditor.tsx` | Permitir configuracao de binding por placeholder | Ligar `{{N}}` a `source_key` e modo de resolucao |
| `../Dashboard_2.0/dashbord/src/services/templateVariableService.ts` | Evoluir o modelo de variavel para incluir binding metadata | Base tipada para dashboard e backend |
| `../Dashboard_2.0/dashbord/src/app/router.tsx` | Registrar a nova rota `/recovery-template-routing` | Navegacao da nova superficie operacional |
| `../Dashboard_2.0/dashbord/supabase/docs/SCHEMA.md` | Documentar tabelas/colunas novas de routing e binding | Contrato de dados para operacao |
| `BACKEND/api/lib/recoveryDispatcher.ts` | Resolver rota, template, source keys e mappings | Mover inteligencia para o backend |
| `BACKEND/api/lib/recoveryTypes.ts` | Tipar source keys, bindings, value maps e payload N8N expandido | Seguranca de contrato |
| `BACKEND/api/lib/recoveryN8N.ts` | Enviar payload enriquecido e registrar resposta | Integracao final com N8N |
| `BACKEND/api/lib/__tests__/recoveryDispatcher.test.ts` | Cobrir route lookup, source key resolution e value mapping | Garantir nao regressao |

### Files to CREATE

| File Path | Purpose | Based On |
|---|---|---|
| `../Dashboard_2.0/dashbord/supabase/migrations/YYYYMMDD_create_recovery_template_routes.sql` | Tabela de roteamento por `message_type + country` | Padrao de migrations Supabase existentes |
| `../Dashboard_2.0/dashbord/supabase/migrations/YYYYMMDD_create_recovery_template_bindings.sql` | Persistir binding por template/placeholder | Stack atual de `message_templates` |
| `../Dashboard_2.0/dashbord/src/pages/RecoveryTemplateRouting.tsx` | Tela dedicada da nova rota `/recovery-template-routing` | Separacao explicita do fluxo atual `/ai-recovery` |
| `../Dashboard_2.0/dashbord/src/services/recoveryTemplateConfigService.ts` | CRUD tipado das configuracoes de routing/binding | Padrao dos services existentes |
| `../Dashboard_2.0/dashbord/src/components/RecoveryTemplateRouting/*` | Componentes da UI de roteamento/configuracao | Padrao MUI do dashboard |
| `../Dashboard_2.0/dashbord/src/components/Templates/TemplateVariableBindingEditor.tsx` | Editor de `source_key`, modo e `value_map` por placeholder | Evolucao do editor atual |
| `BACKEND/api/lib/recoveryTemplateResolver.ts` | Resolver `source_key`, `mapped_value` e pass-through | Separacao de responsabilidade do dispatcher |
| `BACKEND/api/lib/recoveryTemplateCatalog.ts` | Catalogo fixo de source keys aceitas pelo backend | Fonte unica da verdade para keys/labels |
| `BACKEND/api/lib/__tests__/recoveryTemplateResolver.test.ts` | Testes do resolvedor de variaveis | Cobertura especifica do core novo |
| `SILVER-BULLET-AQUISICAO-FREQUENCIA/docs/stories/6.1.recovery-template-routing-data-model.md` | Story detalhada do modelo de dados | Handoff para @sm |
| `SILVER-BULLET-AQUISICAO-FREQUENCIA/docs/stories/6.2.recovery-dashboard-template-binding-ui.md` | Story detalhada do dashboard | Handoff para @sm |
| `SILVER-BULLET-AQUISICAO-FREQUENCIA/docs/stories/6.3.recovery-backend-variable-resolution.md` | Story detalhada do backend | Handoff para @sm |
| `SILVER-BULLET-AQUISICAO-FREQUENCIA/docs/stories/6.4.recovery-n8n-contract-validation.md` | Story detalhada do contrato N8N e rollout | Handoff para @sm |

### Files to DELETE

Nenhum arquivo deve ser deletado.

---

## Stories

### Story 6.1: Data Model for Recovery Template Routing and Bindings

**Description:** Criar o modelo de dados que permite configurar, por `message_type + country`, qual template sera usado e como cada placeholder desse template resolve sua variavel.

**Predicted Agents:** @dev, @db-sage  

**Quality Gates:**

- Pre-Commit: Validar schema SQL, constraints de unicidade e indexes operacionais.
- Pre-PR: Revisar backward compatibility com `message_templates`, `vw_funnel_lead_compact` e `recovery_runs`.

**Tasks:**

- [ ] Criar tabela de roteamento `recovery_template_routes`.
- [ ] Garantir que o roteamento seja por `message_type + country`, sem coluna de sexo.
- [ ] Criar persistencia de bindings por placeholder/template.
- [ ] Modelar `resolution_mode` com pelo menos `pass_through` e `mapped_value`.
- [ ] Modelar `value_map` por binding.
- [ ] Documentar catalogo V1 de source keys aceitas a partir de `vw_funnel_lead_compact`.
- [ ] Documentar subpaths JSONB suportados em `desire`.

**Acceptance Criteria:**

- [ ] O banco permite configurar um template por `message_type + country`.
- [ ] Cada placeholder do template pode apontar para uma `source_key`.
- [ ] O schema nao suporta roteamento por sexo.
- [ ] O schema suporta mapear um valor bruto para um texto final especifico do template.

### Story 6.2: Dashboard Configuration for Routes, Source Keys and Value Maps

**Description:** Implementar a superficie do dashboard que permite configurar rotas de template, escolher `source_key` por placeholder e editar `value_map` por template.

**Predicted Agents:** @dev, @ux-expert  

**Quality Gates:**

- Pre-Commit: Validar UX dos selects, formularios e serializacao dos bindings.
- Pre-PR: Revisar acessibilidade, textos operacionais e consistencia com o editor de templates atual.

**Tasks:**

- [ ] Implementar a configuracao em uma nova rota dedicada `/recovery-template-routing`.
- [ ] Exibir catalogo fixo de source keys com `key` tecnico e `display text`.
- [ ] Permitir selecionar `source_key` por `{{N}}`.
- [ ] Permitir selecionar `resolution_mode`.
- [ ] Permitir cadastrar `value_map` por binding.
- [ ] Permitir modo pass-through usando o valor bruto da source key.
- [ ] Validar formularios para impedir bindings incompletos.

**Acceptance Criteria:**

- [ ] O operador consegue dizer qual template vai para qual trigger/pais.
- [ ] O operador consegue dizer exatamente qual `source_key` abastece cada placeholder.
- [ ] O operador consegue ver texto amigavel para cada source key.
- [ ] O operador consegue configurar mapeamentos como `Riqueza -> uma vida de prosperidade financeira ilimitada`.

### Story 6.3: Backend Variable Resolution from vw_funnel_lead_compact

**Description:** Evoluir o backend de recovery para resolver rotas, ler `vw_funnel_lead_compact`, capturar `desire` e montar `template_variable_values` conforme os bindings configurados.

**Predicted Agents:** @dev, @architect  

**Quality Gates:**

- Pre-Commit: Testes unitarios de route lookup, source key resolution e dynamic mapping.
- Pre-PR: Revisao de contrato backend, tratamento de valores ausentes e fallback controlado.

**Tasks:**

- [ ] Ler `desire` diretamente de `vw_funnel_lead_compact`.
- [ ] Implementar catalogo backend fixo de source keys aceitas.
- [ ] Resolver scalars (`name`, `gender`, `country`, etc.) e subpaths JSONB (`desire.response[0]`, `desire.response[1]`).
- [ ] Implementar `pass_through`.
- [ ] Implementar `mapped_value`.
- [ ] Definir tratamento para valor ausente ou sem mapping.
- [ ] Remover qualquer dependencia de roteamento por sexo.
- [ ] Integrar resolvedor ao dispatcher atual.

**Acceptance Criteria:**

- [ ] O backend resolve variaveis sem consultar fontes fora de `vw_funnel_lead_compact` para este escopo.
- [ ] `desire.response[0]` e `desire.response[1]` podem abastecer placeholders.
- [ ] Um template pode transformar `Riqueza` em uma copy expandida.
- [ ] O sexo do lead so influencia a mensagem se o template usar uma variavel baseada em `gender`.

### Story 6.4: N8N Contract Upgrade and Operational Validation

**Description:** Atualizar o contrato final backend -> N8N para enviar template Meta resolvido e validar o fluxo fim a fim com dados reais.

**Predicted Agents:** @dev, @github-devops, @qa  

**Quality Gates:**

- Pre-Commit: Build e testes do backend.
- Pre-PR: Validacao do payload contra o workflow N8N e retorno estruturado.
- Pre-Deployment: Dry run e primeiro envio real controlado.

**Tasks:**

- [ ] Expandir payload para enviar `meta_template_id`, `template_name`, `meta_language`, `template_variable_definitions` e `template_variable_values`.
- [ ] Confirmar compatibilidade do N8N atual com esse payload resolvido.
- [ ] Validar um caso com `pass_through`.
- [ ] Validar um caso com `mapped_value`.
- [ ] Validar um caso usando `desire.response[0]`.
- [ ] Validar um caso usando `desire.response[1]` quando existir.
- [ ] Documentar fallback/erro quando faltar valor obrigatorio.

**Acceptance Criteria:**

- [ ] O N8N recebe payload completo sem precisar decidir source keys ou mappings.
- [ ] O backend consegue disparar com valores dinamicos ja traduzidos para a copy final.
- [ ] Falta de valor obrigatorio gera status auditavel e nao envio silencioso.
- [ ] O fluxo fim a fim funciona sem reintroduzir roteamento por sexo.

---

## Compatibility Requirements

- [ ] `message_templates` continua sendo o catalogo oficial de templates.
- [ ] O contrato atual de templates Meta nao sofre quebra retroativa para envios manuais/campanhas.
- [ ] `vw_funnel_lead_compact` continua sendo o read model preferencial do backend de recovery.
- [ ] A logica de elegibilidade do dispatcher atual permanece valida.
- [ ] O N8N continua generico e nao recebe if/else de negocio por template.
- [ ] Sexo nao participa mais do roteamento estrutural de template.

---

## Risk Mitigation

**Primary Risk:** Criar um configurador poderoso, mas opaco para o operador.  
**Mitigation:** Catalogo fixo de source keys com texto amigavel; bindings explicitos por placeholder; validacao de configuracao incompleta.

**Secondary Risk:** Resolver valores diferentes entre dashboard e backend.  
**Mitigation:** Catalogo unico de source keys documentado e tipado; tests dedicados do resolver; payload final auditavel.

**Third Risk:** Usar `desire` de forma inconsistente ou fora do step real.  
**Mitigation:** Fonte oficial unica em `vw_funnel_lead_compact.desire`, ja derivada do step real `/morning-feeling`.

**Fourth Risk:** Reintroduzir complexidade via branching por sexo.  
**Mitigation:** Bloquear sexo no schema de routing; tratar `gender` apenas como source key opcional.

**Rollback Plan:** Desativar lookup das rotas novas no backend, manter envio atual simples, preservar tabelas/configuracoes para auditoria e reentrada controlada.

### Quality Assurance Strategy

- Testes unitarios para source key resolution e dynamic mapping.
- Fixtures reais anonimizadas com `desire.response[0]` e `desire.response[1]`.
- Dry run obrigatorio antes de disparos reais do novo payload.
- Validacao visual do dashboard com bindings completos/incompletos.
- Verificacao de regressao em templates manuais e campanhas existentes.

---

## Definition of Done

- [ ] 4 stories completadas com criterios de aceite atendidos.
- [ ] Dashboard consegue configurar rotas de recovery por `message_type + country`.
- [ ] Dashboard consegue configurar source keys e mappings por placeholder.
- [ ] Backend resolve variaveis usando `vw_funnel_lead_compact`, incluindo `desire`.
- [ ] Payload final ao N8N contem template Meta resolvido e valores finais.
- [ ] Roteamento por sexo foi removido do planejamento e da implementacao.
- [ ] Runbook e documentacao de contrato foram atualizados.
