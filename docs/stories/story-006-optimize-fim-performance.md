# Story 006: Otimização de Performance da Página /fim

**Status**: Draft
**Prioridade**: Alta
**Tipo**: Performance / Technical Debt
**Agente**: @dev

## Contexto
Relatórios do Lighthouse indicam problemas críticos de performance na página `/fim`, especificamente afetando LCP (Largest Contentful Paint) e CLS (Cumulative Layout Shift). A experiência do usuário está sendo degradada por shifts de layout e lentidão no carregamento inicial.

## Auditoria Lighthouse & Diagnóstico

### 1. Cumulative Layout Shift (CLS)
- **Score Atual**: 0.538 (Pobre)
- **Culprits (Causas Raiz)**:
    - Elemento: `<div class="_videoCard_1xmrj_578 ...>` (Score: 0.538)
    - Elemento: `<p class="_introTextTop_1xmrj_45 ...>` (Score: 0.000, mas listado)
- **Análise**: O container do vídeo ou elementos acima dele estão mudando de tamanho ou sendo inseridos dinamicamente sem espaço reservado, empurrando o conteúdo para baixo.

### 2. Largest Contentful Paint (LCP)
- **Fatores de Atraso**:
    - **Element Render Delay**: 620ms. O navegador sabe que o elemento está lá, mas demora para renderizá-lo.
    - **Render Blocking Requests**: CSS crítico (`...assets/index-D4pucqe1.css`) bloqueando a renderização por ~300ms.
    - **Network Dependency Tree**: Cadeia crítica de requests: `/main/fim` -> `...assets/index-CdcRa0kV.js` -> `...assets/index-D4pucqe1.css`.
- **Preload/Preconnect**: Assets de fonte (`fonts.googleapis.com`, `fonts.gstatic.com`) identificados, verificar se o preconnect está otimizado.

### 3. Otimizações de Assets & JS
- **Legacy JavaScript**: `...v4/smartplayer.js` contém polyfills desnecessários para navegadores modernos (Estimate savings: 15 KiB).
- **Imagens**: Imagens como `Gemini_Generated_Image...` estão maiores que o necessário (1024x1024 renderizado como 72x72) e fora de formato otimizado (Estimate savings: 99 KiB).

## Objetivos
1.  **Zerar CLS**: Garantir estabilidade visual absoluta no carregamento, reservando espaço para o player de vídeo e textos dinâmicos.
2.  **Reduzir LCP**: Diminuir render delay otimizando a cadeia de requests e priorizando conteúdo above-the-fold.
3.  **Modernizar Assets**: Servir imagens redimensionadas em Next-Gen formats (WebP/AVIF) e revisar necessidade de polyfills.

## Tarefas de Implementação

- [ ] **Correção de CLS**:
    - [ ] Adicionar `aspect-ratio` ou `height`/`width` fixos no container do vídeo `_videoCard...` para reservar espaço antes do carregamento.
    - [ ] Verificar elementos renderizados condicionalmente que causam shift no topo da página.

- [ ] **Otimização de Imagens**:
    - [ ] Implementar `srcset` ou componente `<picture>` para servir imagens redimensionadas adequadamente (ex: thumbnail do vídeo, avatares).
    - [ ] Converter imagens estáticas para WebP/AVIF.
    - [ ] Adicionar `width` e `height` explícitos em todas as tags `<img>`.

- [ ] **Otimização de Scripts & CSS**:
    - [ ] Analisar `smartplayer.js` e verificar se é possível carregar versão ES6+ ou deferir carregamento.
    - [ ] Revisar estratégia de carregamento de CSS (extrair critical CSS se possível ou garantir inline styles para o fold).
    - [ ] Implementar `font-display: swap` para evitar flash de texto invisível (FOIT).

- [ ] **Verificação**:
    - [ ] Rodar Lighthouse (Mobile & Desktop) para validar redução de CLS para < 0.1 e LCP < 2.5s.

## Critérios de Aceite
- [ ] **CLS Score**: < 0.1 (Good/Green).
- [ ] **LCP Score**: < 2.5s.
- [ ] **Layout**: Nenhum pulo visual perceptível ao carregar a página `/fim`.
- [ ] **Imagens**: Nenhuma imagem carregada com tamanho intrínseco desproporcional ao tamanho de renderização.

## Arquivos Envolvidos (Estimado)
- `src/pages/Fim.jsx`

## Plano de Teste Manual
1.  **Teste Visual e Comportamental**:
    -   Acessar `/fim` com *Network Throttling* (Fast 3G) e *CPU Slowdown* (4x).
    -   Observar carregamento inicial: O player de vídeo deve ocupar seu espaço imediatamente (esqueleto/placeholder) sem empurrar conteúdo.
    -   Recarregar a página várias vezes e verificar se há algum "pulo" de layout (CLS).
2.  **Teste de Performance (DevTools)**:
    -   Rodar Performance Monitor no Chrome DevTools.
    -   Verificar se LCP ocorre dentro de 2.5s.
    -   Confirmar que não há *Layout Shifts* na trilha de performance.
3.  **Teste Responsivo**:
    -   Verificar em resoluções mobile (360px, 375px, 414px) e desktop.
    -   Garantir que imagens não estão pixeladas ou distorcidas.

## CodeRabbit Integration
- **Impacto**: Médio (Mudanças visuais e de carregamento de assets).
- **Testes Sugeridos**:
    - Verificar se `width` e `height` estão presentes em todas as tags `<img>` e `video`.
    - Verificar se novas imagens estão em formato WebP/AVIF.
    - Confirmar remoção/otimização de `smartplayer.js`.
- **Reviewer**: @sm / @devops

## QA Results

### Automated Checks
- **CodeRabbit**: Pending
- **Linting/Tests**: Pending

### Manual Review
- [ ] **CLS Zero**: Layout estável no carregamento.
- [ ] **LCP Otimizado**: Conteúdo principal visível rapidamente.
- [ ] **Assets**: Imagens otimizadas e carregadas corretamente.

### Risk Assessment
- **Risk Level**: Low
- **Regression Check**: Pending. Verificar se o player de vídeo ainda funciona (play, pause, volume) após otimizações.

### Gate Decision
**PENDING** ⏳

