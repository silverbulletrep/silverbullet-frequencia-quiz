# Handoff: Retention Modals Implementation (Johann Gift + 10% Discount)

> **Data:** 2026-04-20  
> **Status:** IMPLEMENTADO & VALIDADO (Build OK)

## 1. O que foi feito

### i18n Snapshot & Injection
- Foram adicionadas **53 novas chaves** i18n em `pt` e `de`.
- Snapshot final: **1021 chaves (DE)** / **1069 chaves (PT)**.
- Todas as chaves foram injetadas no nível raiz para evitar erros de resolução.

### Componentes de Retenção (`/src/components/retention/`)
1. **SurpriseGiftModal.jsx**: Modal animado de 4 fases.
   - Fase 1: Identificação (Mini-cards com dados do lead).
   - Fase 2: Aceleração (Gráfico SVG dual-curve animado).
   - Fase 3: Passos para resgate.
   - Fase 4: Oferta final com CTAs.
2. **DiscountModal.jsx**: Modal de 10% OFF para rotas alemãs.
   - Timer de 5 minutos persistente via `sessionStorage`.

### Integração Fim.jsx
- Captura de `videoCurrentTime` via postMessage do Smartplayer.
- Trigger automático do Modal de Presente aos **1040s (17:20)**.
- Mutação dinâmica do Header (Ícone de Presente pulsante + Timer de Desconto).
- Botões de Debug adicionados (visíveis apenas em modo DEV).

### Integração FimBelowFold.jsx
- Injeção dinâmica do item "Presente Surpresa" no Grid de Ofertas.
- Ajuste de preço dinâmico: **€37,00 → €33,00** quando o desconto está ativo.
- Propagação dos temas de retenção para o Checkout.

### CheckoutModal.jsx
- Implementação de **Idle Detection de 15s** (mousedown, mousemove, keydown, touchstart, scroll).
- Badges visuais de "Presente Incluso" e "Desconto Ativo".
- Lógica de fechamento que dispara o desconto em rotas alemãs.

## 2. Como Testar

### Modal 01 (Presente)
1. Acesse `/de/fim` ou `/pt/fim`.
2. Clique no botão de debug **"DEBUG: MODAL PRESENTE"** OU aguarde o vídeo chegar em 17:20.
3. Avance as fases do modal clicando nele (nas fases 1-3).
4. Ao fechar/aceitar, verifique se o ícone de presente aparece no Header.
5. Verifique se o item "Überraschungsgeschenk" (ou "Presente Surpresa") apareceu no grid de ofertas abaixo.

### Modal 02 (Desconto)
1. Acesse `/de/fim`.
2. Abra o Checkout (Stripe).
3. Aguarde **15 segundos sem interagir** OU feche o checkout.
4. O modal de desconto deve aparecer.
5. Clique em **"Ativar Desconto"**.
6. Verifique se o timer de 5:00 iniciou no Header.
7. Verifique se o preço no checkout mudou para **€33,00**.

## 3. Arquivos Modificados
- `src/i18n/locales/de/translation.json`
- `src/i18n/locales/pt/translation.json`
- `src/pages/Fim.jsx`
- `src/pages/Fim.module.scss`
- `src/pages/FimBelowFold.jsx`
- `src/pages/FimBelowFold.module.scss`
- `src/components/CheckoutModal.jsx`
- `src/components/CheckoutModal.module.scss`

## 4. Novos Arquivos
- `src/components/retention/SurpriseGiftModal.jsx`
- `src/components/retention/SurpriseGiftModal.module.scss`
- `src/components/retention/DiscountModal.jsx`
- `src/components/retention/DiscountModal.module.scss`

---
— Dex, sempre construindo 🔨
