# Strategy Handoff - 2026-04-30

## Objetivo
Trocar a estratégia de recuperação: partir de `3d58fdf` como baseline funcional e reaplicar seletivamente implementações posteriores.

## Baselines e segurança
- Branch de trabalho: `strategy/3d58fdf-reapply`
- Baseline funcional: `3d58fdf`
- Backup pré-restauração: `backup/pre-recovery-bb87a01`
- Backup da estratégia anterior: `backup/post-recovery-16cba9b`
- Alteração local preservada em stash:
  - `stash@{0}` → `preserve-user-alicechat-before-bb87a01-reset`

## O que foi reaplicado
- `9822c14`
  - helper `buildCheckoutJourneyContext`
  - teste `src/lib/__tests__/hotmartCheckout.test.ts`
  - tracking restaurado em `FimBelowFold` e `AudioUpsell`
- `a029ca7`
  - ajustes finais de `JohannChat.jsx`
- Porte seletivo de `ed1f8c6+`
  - rota `/alma-gemea`
  - `src/pages/AlmaGemea.tsx`
  - `src/components/AliceChat/*`
  - `src/components/TarotSpread/*`
  - assets públicos usados por `AlmaGemea` e `AliceChat`
  - dependências `react-card-flip` e `react-device-frameset`
  - bloco `alma_gemea` no i18n PT/DE
  - exclusão `/alma-gemea` em `useExitIntent`

## Ajustes finais mantidos
- `AudioUpsell` com `checkout_start` em `47 EUR`
- `tests/checkoutStartJourneyContract.test.js` portado da estratégia anterior

## Validação executada
- `npm run build`
- `npm test -- tests/checkoutStartJourneyContract.test.js src/lib/__tests__/hotmartCheckout.test.ts`

## Resultado
- Build verde
- 5 testes verdes

## Rollback
### Voltar ao backup pré-restauração
- `git reset --hard backup/pre-recovery-bb87a01`

### Voltar à estratégia anterior
- `git reset --hard backup/post-recovery-16cba9b`

### Recuperar a alteração local preservada de AliceChat
- inspecionar: `git stash show -p stash@{0}`
- reaplicar quando fizer sentido: `git stash apply stash@{0}`

## Observação importante
- Não reapliquei automaticamente o stash de `AliceChat`, porque ele representa trabalho local do usuário e agora existe um novo arquivo `src/components/AliceChat/AliceChat.tsx` nesta estratégia.
