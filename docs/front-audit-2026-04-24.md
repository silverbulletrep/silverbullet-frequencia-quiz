<!-- Audits frontend changes from 2026-04-24 and documents checkout tracking impacts. -->

# Auditoria Frontend - Alteracoes em 2026-04-24

## Escopo
Este documento cobre o frontend `SILVER-BULLET-AQUISICAO-FREQUENCIA` no recorte solicitado a partir de `2026-04-24`.

Observacao importante:
- Depois de `2026-04-24 23:59:59 -0300`, nao ha commits no frontend.
- Incluindo o dia `2026-04-24`, existem 2 commits relevantes:
  - `f2f74a4` em `2026-04-24 11:20:56 -0300`
  - `3d58fdf` em `2026-04-24 15:00:14 -0300`

## Commit `f2f74a4`
**Mensagem**: `fix: preserve metadata origin in CheckoutPromptModal`

### Arquivo alterado
- `src/components/CheckoutPromptModal.jsx`

### Alteracao exata
Antes, o componente sempre sobrescrevia `metadata.origin` com `checkout_prompt_modal`.

Depois, passou a preservar a origem recebida pelo chamador:

```js
const finalOrigin = (metadata && metadata.origin) ? metadata.origin : 'checkout_prompt_modal'
```

Essa logica agora e aplicada em dois pontos:
- na chamada de `createCheckoutSession(...)`
- no `metadata` repassado para `CheckoutModal`

### Impacto no payload
O payload enviado ao backend continuou contendo:
- `origin`
- `fbp`
- `fbc`
- `ua`

A mudanca foi no valor de `origin`:
- Antes: era forcado para `checkout_prompt_modal`
- Depois: usa `metadata.origin` quando existir, com fallback para `checkout_prompt_modal`

### Efeito pratico
- A origem real do checkout deixa de ser perdida.
- O backend passa a receber um `origin` mais fiel ao ponto de entrada do usuario.
- Isso impacta diretamente a metadata enviada para Stripe e os desdobramentos que dependem de `origin`.

### Referencias no codigo atual
- `src/components/CheckoutPromptModal.jsx:54`
- `src/components/CheckoutPromptModal.jsx:92`

## Commit `3d58fdf`
**Mensagem**: `fix: prevent CheckoutModal from closing automatically on idle when onIdle is not provided`

### Arquivos alterados
- `src/components/CheckoutModal.jsx`
- `src/pages/AudioUpsell.jsx`
- `src/pages/FimBelowFold.jsx`

### Alteracao 1: comportamento do modal idle
No `CheckoutModal`, foi removido o fechamento automatico quando nao existe handler `onIdle`.

Antes, ao bater o tempo limite sem `onIdle`, o modal podia fechar por `onClose`.

Depois, o timeout:
- chama `onIdle` apenas se ele existir
- nao fecha mais o modal sozinho como fallback

### Impacto
- Mudanca de comportamento de UI
- Sem alteracao direta de payload para backend ou banco

### Referencia no codigo atual
- `src/components/CheckoutModal.jsx:181`

### Alteracao 2: enriquecimento do `checkoutStart`
As paginas `AudioUpsell` e `FimBelowFold` passaram a enviar mais contexto no evento `tracker.checkoutStart(...)`.

#### Em `AudioUpsell`
Campos adicionados:
- `journey_type: 'upsell'`
- `purchase_kind: 'upsell'`
- `product_id: 'elevate_up01'`

Referencia:
- `src/pages/AudioUpsell.jsx:473`

#### Em `FimBelowFold`
Campos adicionados:
- `journey_type: 'front'`
- `purchase_kind: 'main'`
- `product_id: 'elevate_front'`

Referencia:
- `src/pages/FimBelowFold.jsx:181`

### Impacto no payload
Esse commit enriquece o payload de tracking do frontend no evento `checkoutStart`.

Nao ha evidencia, neste commit, de mudanca direta no payload de persistencia em banco a partir do frontend.

## Resumo Executivo
As alteracoes exatas no frontend em `2026-04-24` foram:

1. Preservacao de `metadata.origin` no `CheckoutPromptModal`, evitando sobrescrita indevida e mudando a metadata enviada ao backend.
2. Remocao do fechamento automatico do `CheckoutModal` por idle quando nao existe `onIdle`.
3. Enriquecimento do evento `checkoutStart` com `journey_type`, `purchase_kind` e `product_id` nas paginas de front e upsell.

## Conclusao
Se o foco for payload sensivel para integracoes:
- a mudanca mais importante no frontend foi o commit `f2f74a4`, porque ele altera o valor real de `origin` enviado ao backend

Se o foco for comportamento e contexto de jornada:
- o commit `3d58fdf` adicionou contexto de produto/jornada ao tracking e corrigiu o comportamento do modal

Se o foco for banco:
- nao houve mudanca direta de payload de escrita em banco no frontend dentro desse recorte
