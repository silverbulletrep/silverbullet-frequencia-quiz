# Audit de Alterações - Branch `feat-I18N-DE`

Este documento detalha todas as alterações realizadas na branch `feat-I18N-DE`, consolidando as implementações de localização (DE), modais de retenção e otimizações de checkout.

## 1. Sistema de Retenção (Novos Componentes)
Foram implementados dois novos modais de retenção para aumentar o engajamento no funil de vendas:

- **`SurpriseGiftModal`**: 
  - Localizado em `src/components/retention/SurpriseGiftModal.jsx`.
  - Sistema de 3 fases: Revelação do bônus, confirmação de recepção e oferta final.
  - Integração com i18n para suporte PT e DE.
  - Implementação de botões de continuidade manual (substituindo timers automáticos).
- **`DiscountModal` (DiscountBottomSheet)**:
  - Localizado em `src/components/retention/DiscountModal.jsx`.
  - Disparado após 15 segundos de inatividade se o `SurpriseGiftModal` não estiver ativo.
  - Oferece desconto imediato para conversão rápida.

## 2. Localização e I18N
Expansão massiva do suporte multilíngue com foco no mercado alemão:

- **Arquivos de Tradução**: 
  - Atualização completa de `src/i18n/locales/de/translation.json` e `src/i18n/locales/pt/translation.json`.
  - Adição de chaves para todos os novos componentes de retenção e fluxos de checkout.
- **Lógica de Localização**:
  - Implementação de caminhos dinâmicos (ex: `/de/chat-whatsapp` vs `/chat-whatsapp`) em `useExitIntent.js` e `JohannChat.jsx`.
  - Sincronização de chaves VSL via scripts (`inject_vsl_key.cjs`).
- **Assets Localizados**:
  - Adição de imagens específicas para o mercado DE (`img/equipe-de.webp`, `img/resultado-atualizado-de.webp`, etc).

## 3. Otimização da Página Fim (`Fim.jsx` e `FimBelowFold.jsx`)
A página final do funil sofreu alterações estruturais para suportar a nova lógica:

- **Controle de Timers**: 
  - Implementação de `displayHiddenElements` via API do VTurb para sincronizar o aparecimento dos componentes de venda com o vídeo.
  - Lógica de "idle timer" para disparar modais de retenção apenas quando o usuário está inativo.
- **Sincronização de Preços**:
  - Garantia de que os preços exibidos (Stripe/PayPal) estão sincronizados com a localidade e o estado do desconto.

## 4. Fluxo de Checkout (`CheckoutModal.jsx`)
Melhorias críticas na experiência de pagamento:

- **Correção de Sobreposição (Z-Index)**:
  - Migração para `React.createPortal` para garantir que o modal de checkout sempre apareça sobre o header da autoridade.
- **Estado de Checkout**:
  - Bloqueio de modais de retenção enquanto o usuário está ativamente preenchendo dados no Stripe ou interagindo com o PayPal.
  - Correção de bug no `ensureClientSecret` que pendia o carregamento do Stripe.

## 5. JohannChat (`JohannChat.jsx`)
- Refatoração para suportar mensagens dinâmicas e localizadas.
- Integração de webhooks N8N com payload de linguagem correto (`pt` ou `de`).

## 6. Scripts e Ferramentas de Suporte
Foram criados scripts utilitários para manter a integridade das traduções:
- `scripts/inject_johann_translations.cjs`: Injeção de traduções no componente de chat.
- `scripts/merge_translations.cjs`: Auxilia no merge de arquivos JSON de tradução.
- `update_i18n.py`: Script Python para gerenciamento de chaves i18n.

## 7. Documentação de Sessão
Consolidação do conhecimento técnico em `docs/sessions/2026-04/`:
- `retention-modals.md`: Definição técnica dos modais.
- `DE_Localization_Handoff.md`: Guia para futuras manutenções na tradução alemã.
- `audit-stripe-flow.md` e `plan-stripe-flow.md`: Documentação dos ajustes no fluxo de pagamento.

---
*Auditado por Antigravity em 2026-04-21.*
