# Story 001: Atualizar Preço Base de Monetização para 37 Euros

**Tipo:** Feature
**Status:** Approved
**Prioridade:** Alta
**Função:** Sm (Scrum Master)

## 📌 Contexto
A implementação atual em `src/pages/Fim.jsx` usa um valor de teste de 1.00 BRL (100 centavos) para transações Stripe e PayPal. A apresentação visual também codifica "R$ 1,00". Precisamos atualizar o preço de produção para **37.00 Euros**.

## 📝 Descrição
Atualizar a lógica de monetização no frontend e os elementos visuais para refletir o novo preço base de €37.00. Isso envolve atualizar as constantes codificadas passadas para as APIs de pagamento e o texto exibido ao usuário nas seções de recibo e modal de checkout.

## ✅ Critérios de Aceite
- [x] **Integração Stripe**: As chamadas `createCheckoutSession` e `createPaymentIntent` devem iniciar uma transação de **3700 cents** (37.00) na moeda **EUR**.
- [x] **Integração PayPal**: A criação do pedido PayPal deve usar **37.00** como valor e **EUR** como código de moeda.
- [x] **Consistência Visual**: A seção de recibo em `Fim.jsx` (ambas as versões principal e bottom sheet) deve exibir "37,00 €" (ou formato equivalente localizado em EUR) em vez de "R$ 1,00".
- [x] **Modal de Checkout**: O `CheckoutModal` deve exibir o total correto (**37€**) e cálculo consistente de economia (ex: se a base é 330€, a economia deve ser 293€).
- [x] **Precisão de Rastreamento**: Os eventos `funnelTracker` para compra e início de checkout devem reportar consistentemente 37.00 EUR.
- [x] **Logs de Debug**: Implementar logs explícitos no console que mostrem os valores dos payloads (amount/currency) para Stripe e PayPal antes de disparar a transação.
- [x] **Simulação**: A função de debug `simulatePurchase` deve refletir a nova estrutura de preço (3700 cents, EUR).

## 🛠 Implementação Técnica

A implementação será dividida em duas fases para garantir a validação dos valores antes e depois da mudança.

### Fase 1: Instrumentação de Logs
1.  **api.ts**:
    - Adicionar logs explícitos em `createCheckoutSession`, `createPaymentIntent` e `createPayPalOrder`.
    - O log deve exibir claramente o `amount` e `currency` antes da chamada à API.

### Fase 2: Atualização de Preço (37.00 EUR)
1.  **src/pages/Fim.jsx**:
    - Atualizar a constante `amount` de `100` para `3700` (cents).
    - Alterar referências `currency: 'brl'` para `currency: 'eur'`.
    - Substituir ocorrências visuais de `R$ 1,00` por `37,00 €`.
2.  **Simulação e Modal**:
    - Atualizar `simulatePurchase` para os novos valores.
    - Garantir que o `<CheckoutModal>` receba as novas props de preço e moeda.
3.  **StandardDiscountContent.jsx**:
    - Atualizar o `tracker.checkoutStart` para `{ value: 37, currency: 'EUR' }`.

## 🧪 Plano de Verificação
1.  **Teste Manual (Stripe)**:
    - Usar `?stripe_debug=1` ou modo Dev.
    - Clicar em "Garantir meu plano".
    - Verificar no Checkout do Stripe (ou Modal) que o valor exibido é **€37.00**.
    - Verificar se a linha "Total" no texto do modal diz `37€`.
2.  **Teste Manual (PayPal)**:
    - Abrir o checkout do PayPal.
    - Confirmar no popup/modal do PayPal que o valor é **37.00 EUR**.
    - Validar via logs da Fase 1 se o payload enviado contém `value: 37.00` e `currency: 'EUR'`.
3.  **Teste Manual (Visual)**:
    - Inspecionar a seção "Resumo" (Recibo) na página `/fim`.
    - Confirmar que "Hoje" mostra **37,00 €**.
    - Inspecionar a oferta de desconto no Bottom Sheet, garantir que mostre preço/moeda corretos.
4.  **Revisão de Código**:
    - Garantir que nenhum "BRL" ou "100" centavos específicos para a oferta principal permaneçam em `Fim.jsx` ou `CheckoutModal.jsx`.

## 🤖 Configuração CodeRabbit
- **Foco**: Lógica de precificação, Códigos de moeda, Atualizações de texto JSX.
- **Labels**: `monetization`, `stripe`, `paypal`, `eur`

## 👥 Atribuição de Agente
- **Implementação**: @dev
- **Validação**: @qa
