# Pesquisa PageSpeed — Funil Quiz

## Fonte: Análise Lighthouse por página

> Dados obtidos de auditoria manual via Lighthouse DevTools em fundaris.space

---

### 1. age-selection-woman
- **LCP Score:** 11 (4.2s)
- **LCP Element:** Imagem principal
- **Problemas:**
  - `fetchpriority=high` não aplicado
  - Imagem não descobrível no documento HTML inicial
  - Download de imagem lento

### 2. age-selection-man
- **LCP Score:** 11 (4.2s)
- **LCP Element:** Imagem principal
- **Problemas:**
  - `fetchpriority=high` não aplicado
  - Imagem não descobrível no documento HTML inicial
  - Download de imagem lento

### 3. men-success
- **LCP Score:** 10
- **LCP Element:** Imagem (67.9 KiB)
- **Problemas:**
  - `fetchpriority=high` não aplicado
  - Imagem não descobrível no HTML inicial

### 4. women-success
- **LCP Score:** 4
- **LCP Element:** Imagem (401 KiB — excessivamente grande)
- **Problemas:**
  - `fetchpriority=high` não aplicado
  - Imagem não descobrível no HTML inicial
  - Lazy load não aplicado

### 5. transition
- **LCP Score:** 8
- **LCP Element:** Imagem (121 KiB)
- **Problemas:**
  - `fetchpriority=high` não aplicado
  - Imagem não descobrível no HTML inicial

### 6. vsl
- **LCP Score:** 2, SI 3
- **LCP Breakdown:**

| Subpart | Duration |
|---------|----------|
| TTFB | 210 ms |
| Element render delay | 1,650 ms |

- **LCP Element:** `<video>` com blob URL
- **Nota:** Vídeo com atributos corretos (preload, autoplay, muted)

### 7. Quiz Steps (1–6)

| Página | LCP Score | TTFB | Element Render Delay |
|--------|-----------|------|---------------------|
| Step 1 | 11 | — | 990 ms |
| Step 2 | 10 | 220 ms | 25,670 ms |
| Step 3 | 7 | 690 ms | 20,200 ms |
| Step 4 | 11 | 210 ms | 13,900 ms |
| Step 5 | 11 | 210 ms | 1,040 ms / 12,720 ms |

- **LCP Element:** `h2._question_1ead5_30` (text heading)
- **Problema principal:** Render delay extremamente alto em quiz steps — indica que o JS precisa executar por muito tempo antes de renderizar o `<h2>`

### 8. resultado
- **LCP Score:** 7
- **LCP Breakdown:**

| Subpart | Duration |
|---------|----------|
| TTFB | 210 ms |
| Resource load delay | 800 ms |
| Resource load duration | 380 ms |
| Element render delay | 17,460 ms |

- **LCP Element:** `<img>` resultado-BaHGqGH5.webp (101.2 KiB, savings: 68.6 KiB)
- **Problemas:**
  - `fetchpriority=high` não aplicado
  - Imagem não descobrível no HTML inicial
  - Lazy load não aplicado

### 9. fim
- **LCP Score:** 1
- **LCP Breakdown:**

| Subpart | Duration |
|---------|----------|
| TTFB | 220 ms |
| Element render delay | 8,560 ms |

- **LCP Element:** `<div class="resume__title">` / `<h1 class="_mainHeadline_...">`

### 10. recupera
- **LCP Score:** Unscored
- **LCP Breakdown:**

| Subpart | Duration |
|---------|----------|
| TTFB | 210 ms |
| Resource load delay | 770 ms |
| Resource load duration | 210 ms |
| Element render delay | 70 ms |

- **LCP Element:** `img._heroImage_gns47_167` (`Usuario-CBxXIoyu.webp`)
- **Problemas:**
  - `fetchpriority=high` não aplicado
  - Imagem não descobrível no HTML inicial
  - Lazy load não aplicado

### 11. audio-upsell
- **LCP Score:** Unscored
- **LCP Breakdown:**

| Subpart | Duration |
|---------|----------|
| TTFB | 210 ms |
| Resource load delay | 1,100 ms |
| Resource load duration | 210 ms |
| Element render delay | 40 ms |

- **LCP Element:** `img._expertAvatar_blhey_545` (src presente: `expert-Aagt8vmP.webp`)
- **Problemas:**
  - `fetchpriority=high` não aplicado
  - Lazy load não aplicado (o que é bom, mas o audit sugere verificar)

---

## Padrões Identificados (Recorrentes)

1. **`fetchpriority=high` ausente** em todas as imagens LCP
2. **Imagens não descobríveis** no HTML inicial (carregadas via JS/lazy)
3. **Element render delay extremo** em quiz steps (até 25s) — JS blocking render
4. **Imagens grandes** sem compressão adequada (women-success: 401 KiB)
5. **Nenhuma animação de transição** entre páginas — corte abrupto

---

## Três Estratégias Macro

1. **Aumentar** a velocidade de carregamento (otimizar assets, priorizar LCP elements)
2. **Adiantar** o carregamento dos elementos (preload, prefetch, eager loading)
3. **Criar** percepção de fluidez para que o lead sinta transições suaves independentemente da velocidade real

---

## Pesquisa: Como Outros Quiz Funnels Resolveram Isso

### Typeform
- Apresenta perguntas uma por vez com animações CSS (slide-up/fade)
- Transições construídas com `@keyframes` CSS + JS para controlar timing
- Design "conversacional" com visual continuity
- Respeita `prefers-reduced-motion` para acessibilidade
- Não expõe customização de transição ao usuário — é built-in

### View Transitions API (Padrão Web Moderno)
- API nativa do browser para transições suaves entre estados DOM
- Captura snapshots do DOM antigo e novo, anima diferenças
- React Router v7 tem suporte integrado via prop `viewTransition`
- Hardware-accelerated, performático
- Suporte: Chrome 111+, Edge 111+ (Safari experimental)
- **Ideal para SPAs React** — funciona com `document.startViewTransition()`

### Padrões Validados na Indústria
- **Preload do próximo passo:** Enquanto o usuário responde a pergunta atual, prefetch dos assets do próximo passo
- **Skeleton screens:** Mostrar estrutura placeholder enquanto conteúdo carrega
- **Fade-in progressivo:** Conteúdo aparece gradualmente ao invés de corte abrupto
- **Shared element transitions:** Elementos que persistem entre páginas (header, progress bar) animam continuamente

### Dados de Case Studies
- **Renault:** LCP < 1s → 14pp redução no bounce rate, 13% aumento em conversões
- **Geral:** LCP < 2s → usuários convertem 2x mais vs LCP 5s
- **A/B Test:** LCP 8.3s → 5.7s = +11% a +15% conversão em vendas
