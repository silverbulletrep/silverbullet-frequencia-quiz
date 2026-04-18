# Epic 002 — Recupera Page: Copy & Structure Overhaul

## Epic Goal

Atualizar a página `/recupera` com a nova copy (copy2), ajustar a estrutura de seções, adicionar novos componentes (timer, card relatório, progress bar, FAQ, FOMO), integrar novas imagens e preparar copy para tradução em alemão — sem quebrar checkout existente.

---

## Existing System Context

| Item | Detalhe |
|---|---|
| **Página** | [Recupera.jsx](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/src/pages/Recupera.jsx) (586 linhas) |
| **Estilos** | [Recupera.module.scss](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/src/pages/Recupera.module.scss) (414 linhas) |
| **Rota** | `/recupera` — lazy-loaded em [App.tsx](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/src/App.tsx#L101) |
| **Header** | [AuthorityHeader.jsx](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/src/components/AuthorityHeader.jsx) — progress bar global |
| **Checkout** | `CheckoutModal` + `DiscountBottomSheet` (lazy-loaded) |
| **i18n** | Copy hardcoded em PT no JSX. Arquivos de tradução existem mas **não usados** pela Recupera |
| **Imagens** | 31 imgs em `/img/`, 8 usadas pela Recupera. Novas: `CMassaru.webp`, `CWatter.webp` já existem |

---

## Componentes Reutilizáveis & Referências

### ✅ FAQ Accordion — de [FimBelowFold.jsx](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/src/pages/FimBelowFold.jsx#L340-L366)

- Accordion com `ChevronDown`, i18n keys `fim.faq.q1-q4`.
- **Ação:** Extrair padrão para Recupera.

### ✅ Scroll to Offer Logic — de [Fim.jsx](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/src/pages/Fim.jsx#L451-L454)

- Header CTA usa `document.getElementById('plan-receipt-anchor').scrollIntoView({ behavior: 'smooth', block: 'center' })`.
- **Ação:** Replicar esse comportamento no novo Header Sticky e nos botões Pre-Offer da Recupera.

### 🔴 Card Relatório Vermelho — de [Resultado.jsx](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/src/pages/Resultado.jsx#L460-L475)

- `container13` (red alert) `MANIFESTATION BLOCKED`.
- **Ação:** Mistura criativa deste card + cards dark.

### ⬛ Dark Sequential Cards — de [Resultado.jsx](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/src/pages/Resultado.jsx#L476-L529)

- Animations `seqItem`/`seqVisible`.
- **Ação:** Referência para cards de frequência.

---

## Inventário de Novas Funcionalidades

| Funcionalidade | Descrição | Detalhes Técnicos |
|---|---|---|
| **Timer / Sticky Header** | Header com Timer 15 min + CTA. ⚠️ **Comportamento:** O Timer começa na página (Hero). O Header Sticky só aparece (fade-in) **APÓS** o timer da página sair da viewport (scrolldown). | **CTA do Header:** Deve fazer scroll smooth até a seção de oferta (centralizar botão). |
| **Remover Header Global** | A `AuthorityHeader` atual deve ser removida/oculta em `/recupera`. | Condicional em `App.tsx` ou `AuthorityHeader.jsx`. |
| **CTAs Pré-Oferta** | Todos os botões de CTA antes da oferta (no corpo da copy). | Devem ter o mesmo evento do header: **scroll smooth até a oferta**. |
| **Barra de Progresso** | Barra horizontal no topo. ⚠️ **Estilo:** Design atual do projeto (Gold/Premium), **NÃO** roxo/Mindvalley. | Estilo visual consistente com `AuthorityHeader` mas simplificado se necessário. |
| **Card Relatório Vermelho** | Híbrido: Visual de alerta vermelho (`Resultado.jsx`) + Dados do lead (`leadCache`). | Animação scroll reveal. |
| **Layout 2 Caminhos** | Comparativo visual ("Now" vs "Goal"). | **Sliders Obrigatórios:** Vibração, Sucesso, Desejo Principal (fallback: Riqueza), Potencial. |
| **FAQ Section** | Accordion extraído de `FimBelowFold.jsx`. | Perguntas da copy2. |
| **FOMO Section** | Urgência/Escassez. | Timer final. |

---

## Mapeamento Copy (Resumo)

Baseado em `copy2.md`:
1. **Hero:** Nova copy, Timer (inline), foto existente (Celular).
2. **Sinais de Alerta:** Card Relatório Vermelho, Foto Instituição (AI), diagnóstico dinâmico.
3. **Cientista:** Masaru Emoto (`CMassaru.webp`), Água (`CWatter.webp`).
4. **Frequências:** Card Plano #N19894.
5. **Resultados:** Cards de Frequência (Dark cards style).
6. **Depoimentos:** Nomes alemães, fotos (AI).
7. **Oferta:** Preços individuais.
8. ** Garantia:** 3 passos.
9. **Aplicação:** 3 passos visuais.
10. **Final CTA:** Layout 2 Caminhos (Sliders), fotos (Triste/Feliz existentes).
11. **FAQ:** Novo.
12. **FOMO:** Novo.

---

## Inventário de Imagens

| Imagem | Origem | Status |
|---|---|---|
| Hero (Mulher Celular) | Reutilizar existente | ✅ OK |
| Masaru Emoto | `img/CMassaru.webp` | ✅ OK |
| Água (Abundância/Escassez) | `img/CWatter.webp` | ✅ OK |
| Pessoa Triste | `img/MulherTriste.webp` | ✅ OK |
| Pessoa Feliz | `img/Mulherfeliz.webp` | ✅ OK |
| Instituição / Científico | **Gerar com AI** (revisão humana/AI) | 🎨 GERAR |
| Depoimentos (3x) | **Gerar com AI** (rostos europeus) | 🎨 GERAR |

---

## Stories

### Story 1: Preparação & Estrutura

- **Tasks:**
  - Remover `AuthorityHeader` em `/recupera`.
  - Implementar **Sticky Header + Timer**: Lógica de "aparecer após timer do hero sair da viewport". Botão CTA com scroll-to-offer.
  - Implementar **Barra de Progresso**: Estilo Gold/Premium.
  - Configurar CTAs pré-oferta com scroll-to-offer.
- **Valid:** Timer behavior, Scroll behavior.

### Story 2: Copy & Componentes Layout

- **Tasks:**
  - Atualizar seções 1-12 com copy2.md (i18n ready).
  - Componente **Card Relatório Vermelho** (híbrido Resultado).
  - Componente **Layout 2 Caminhos** com Sliders (Vibração, Sucesso, Desejo, Potencial).
  - **FAQ Accordion** (ref FimBelowFold).
  - Integrar imagens existentes (Masaru, Watter, Triste/Feliz).
  - Garantir responsividade em mobile/desktop.
- **Valid:** Sliders visual, FAQ collapse.

### Story 3: Ativos AI e Tradução

- **Tasks:**
  - Gerar imagem Instituição e Depoimentos (AI + Review).
  - Tradução completa DE/PT.
- **Valid:** Qualidade imagens, i18n switch.

---

## Quality Gates

- Checkout flow intacto.
- Scroll-to-offer funciona em mobile/desktop.
- Timer behavior correto (não sobrepõe hero timer).
- Imagens otimizadas (webp).

---

— Morgan, planejando o futuro 📊
