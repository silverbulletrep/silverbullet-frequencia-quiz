# Story 004: Otimização de Páginas Críticas de Conversão

**Status**: Ready for Review
**Prioridade**: Alta
**Tipo**: Performance
**Agente**: @dev

## Contexto
Como parte do Epic 001 (Performance Optimization), precisamos melhorar a velocidade de carregamento das páginas onde ocorrem as transações finais e upsells. Atualmente, estas páginas possuem scores Lighthouse abaixo do ideal (< 80), o que pode impactar negativamente a taxa de conversão, especialmente em dispositivos móveis.

**Scores Atuais (Baseline do Epic):**
- `/fim`: 57 (Crítico)
- `/resultado`: 66
- `/audio-upsell`: 78

## Objetivos
1.  Atingir score **Lighthouse Performance >= 80** (Mobile) nas páginas alvo.
2.  Reduzir o tempo de bloqueio (TBT) e melhorar o Largest Contentful Paint (LCP).
3.  Garantir zero regressão em funcionalidades críticas (Checkout, Playback de vídeo/áudio).

## Tarefas de Implementação
- [ ] **Auditoria Inicial**:
    - [ ] Rodar Lighthouse localmente para confirmar baseline.
    - [ ] Identificar bundles grandes e scripts de terceiros bloqueantes.
- [ ] **Otimização `/fim`**:
    - [ ] Analisar componentes pesados (ex: Checkout).
    - [ ] Implementar Code Splitting/Lazy Loading onde seguro.
- [ ] **Otimização `/resultado`**:
    - [ ] Implementar Lazy Loading para componentes abaixo da dobra (non-critical).
    - [ ] Otimizar carregamento de imagens/assets.
- [ ] **Otimização `/audio-upsell`**:
    - [ ] Otimizar carregamento do player de áudio e imagens de capa.
- [ ] **Refinamento Global**:
    - [ ] Verificar configurações de build do Vite (chunks, minificação).

## Critérios de Aceite
- [ ] **Performance**: Score Lighthouse Mobile >= 80 em `/fim`, `/resultado` e `/audio-upsell`.
- [ ] **Funcionalidade**: O fluxo de compra e upsell funciona sem erros.
- [ ] **UX**: Sem Layout Shifts (CLS) visíveis causados pelo lazy loading (usar skeletons se necessário).
- [ ] **Integridade**: Scripts de tracking/analytics continuam disparando corretamente.

## Plano de Teste Manual
1.  **Teste de Performance**:
    -   Rodar `npm run build` e `npm run preview`.
    -   Utilizar Chrome DevTools > Lighthouse > Mobile Navigation.
    -   Executar 3 vezes e tirar a média.
2.  **Teste Funcional**:
    -   Realizar uma compra completa passando por `/resultado` -> `/fim`.
    -   Verificar se o player em `/audio-upsell` carrega e toca imediatamente.
3.  **Teste de Rede**:
    -   Simular rede "Fast 3G" para garantir que o carregamento progressivo é suave.

## Arquivos Envolvidos
- `src/pages/Fim.jsx`
- `src/pages/Resultado.jsx`
- `src/pages/AudioUpsell.jsx`
- `vite.config.ts` (potencialmente)

## CodeRabbit Integration
- **Impacto**: Médio (Alterações em estrutura de carregamento e build).
- **Testes Sugeridos**:
    - Validação de syntax de dynamic imports.
    - Verificação de não remoção de código necessário (side-effects).
- **Reviewer**: @sm / @devops

## Notas Técnicas
- Cuidado com lazy loading em elementos "First Fold" (acima da dobra), pois pode piorar o LCP.
- Verificar se bibliotecas de terceiros (pixels, chat) são os principais ofensores; se sim, considerar carregar `onInteraction` ou `delay`.
