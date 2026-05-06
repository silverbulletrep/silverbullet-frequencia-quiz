# Handoff: Punctual Dev Adjustment - Tracking nos Modais de Retenção

**Data:** 2026-05-06
**Scope:** `src/components/retention/DiscountModal.jsx`, `src/components/retention/SurpriseGiftModal.jsx`, `src/lib/funnelTracker.ts`

## Resumo dos Ajustes Concluídos

1. **Adição do Evento `discount_opened` e `surprise_opened` no `funnelTracker.ts`**
   - **Risk Level:** 🟢 LOW
   - **Gates Passed:** Visual Verification (N/A), Console Error Check (via Linting).
   - O tipo `EventName` foi expandido e o helper `customEvent` exportado.

2. **Trigger Logic no `DiscountModal.jsx`**
   - **Risk Level:** 🟢 LOW
   - **Gates Passed:** Console Error Check (via Linting).
   - Implementado no `useEffect` o disparo de `customEvent('discount_opened')` protegido por `try-catch` e deduplicação (`shouldSendEvent`).

3. **Trigger Logic no `SurpriseGiftModal.jsx`**
   - **Risk Level:** 🟢 LOW
   - **Gates Passed:** Console Error Check (via Linting).
   - Implementado no `useEffect` o disparo de `customEvent('surprise_opened')` protegido por `try-catch` e deduplicação (`shouldSendEvent`).

## Detalhes Técnicos

Todos os eventos disparam sem interferir no fluxo principal de rendering e utilizam as funções nativas de `buildRouteStep` (`/fim` e `QUIZ_PROGRESS_STEPS.fim`). O fallback via `beacon` ou `fetch` garante entrega assíncrona.

O erro de sintaxe temporário introduzido no `.ts` foi resolvido em tempo de execução e não há novos warnings atrelados a esses arquivos específicos (restantes warnings do projeto ignorados).

## Rollback Plan (Caso Necessário)

Se for necessário reverter:
```bash
git checkout HEAD -- SILVER-BULLET-AQUISICAO-FREQUENCIA/src/lib/funnelTracker.ts \
                    SILVER-BULLET-AQUISICAO-FREQUENCIA/src/components/retention/DiscountModal.jsx \
                    SILVER-BULLET-AQUISICAO-FREQUENCIA/src/components/retention/SurpriseGiftModal.jsx
```