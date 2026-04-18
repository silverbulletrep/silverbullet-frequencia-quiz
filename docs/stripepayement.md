> Documento dedicado ao estudo e análise de um problema de pagamento que aconteceu em 26/02/2026 na stripe.

### O problema

Ao utilizar o pagamento de cartão disponibilizado no checkout, ao invés do pagamento ser concluído, surge a mensagem de erro:

```
"Invalid value. Please refresh the page and try again."
```

### Responsabilidade de Código

#### Código Bruto
1. O arquivo api.ts é responsável por fazer a comunicação entre o frontend e o backend
2. O arquivo api.ts é responsável por fazer a comunicação entre o backend e a api do stripe
3. CheckoutModal.jsx é responsável por conter a UI do checkout com formulário de cartão e paypal.
4. fim.jsx faz a fluxo de finalização de compra, então dispara os pixels e redireciona.
5. fimbellowfold.jsx é responsável por iniciar o fluxo do checkout, faz health check e abre o checkout.
6. audioupsell.jsx é responsável por fazer o upsell de audio. **verificar se dispara evento**
7. recupera.jsx é responsável por fazer a recuperação de carrinho. **verificar se dispara evento**

#### Exportado
1. @stripe/stripe-js -> SDK do stripe
2. @stripe/react-stripe-js -> React wrapper do SDK do stripe

#### Variáveis de ambiente
1. VITE_STRIPE_PUBLISHABLE_KEY — chave pública Stripe, indica qual é a conta da stripe e permite o uso do sdk (define qual fluxo usar)
2. VITE_API_BASE_URL — base da API (padrão: https://api.fundaris.space)

### Análise do Código

#### api.ts 
1. getOrCreateStripeEventId. Gera ou recupera um stripe_event_id no sessionStorage para deduplicação de eventos do Meta Pixel. Local.
2. creatteCheckoutSession. Cria uma checkout Session (Redireciona para outra página ), quando não há publishable_key. POST /api/stripe/checkout-session.
3. createPaymentIntent. Cria uma payment intent na mesma tela, quando há publishable_key. POST /api/stripe/payment-intent.
4. getStripeHealth. Verifica se o stripe está configurado. GET /api/stripe/health.
5. finalizeStripePurchase. Envia dados pós-compra para rastreamento server-side ( meta CAPI ). POST /api/stripe/finalize.
6. getCheckoutSession. Recupera dados de uma checkout Session, usado em checkoutSucess. GET /api/stripe/session/:id

#### CheckoutModal.jsx
1. Chama o onConfirm() quando o usuário clica em confirmar pagamento.
2. Usa os elementos da stripe para criar o formulário de pagamento.

Aceita os valores: 
BRL: R$ 1,00 / R$ 9,90 / R$ 14,70 / R$ 19,80 (
L32 ) e EUR: €37,00 / €24,00 / €47,00

#### Fim 
1. Recebe onCheckoutSuccess do CheckoutModal.jsx
2. Detecta o providar (stripe/paypal) e o intent id
3. Monta o payload e chama finalize.
4. Registra evento de compra no tracker do funil.
5. Dispara pixel tiktok.
6. Redirecionada para /audio-upsell

#### FimBellowfold
1. Chama getStripeHealth
2. Abre checkoutmodal se tem publishable_key, com o valor definido em amount_cents
3. Se não tem publishable_key, redireciona para checkout da stripe, via checkoutSession
4. Ceckout modal é instanciado em L397-L414 com: amount_cents, currency e metadadta.

#### Audioupsell
1. Chama health
2. Abre modal ou redireciona.
3. Modal instanciado em L619-L637
4. Atualiza lead após confimação de pagamento.

#### Checkout.jsx
1. Página de checkout puro.
2. chama handleChcekout, com createCheckoutSession e redireciona.
3. Está com email hardcoded

#### CheckoutSucess.jsx
1. Página de destino via checkoutSession
2. Fluxo em useEffect: 
    a. se tem session_id, chama getCheckoutSession
    b. se tem payment_intent, chama finalizeStripePurchase
  
### Fluxo Inlina

1. Publishable.
2. Stripe Health.
3. Abre modal.
4. Intent após botão de compra.
5. confirmCardPayment.
6. onCheckoutSuccess.
7. finilizeStripePurchase.

### Recupera

### 


1. O sistema de pagamento é utilizado em fim.jsx, audioupsell.jsx e recupera.jsx

Nos três casos o fluxo é o mesmo:

a. Eles ativam o CheckoutModal.jsx, que é UI do checkout 

b. O checkout faz chamada de api

c. A api do backend faz a chamada para a api do stripe

2. Todas as chamadas estão chamando o mesmo arquivo de api para acessoar o backend -- api.ts

### Comentários e Análises

1. A única função da api relacionada ao pré-pagamento que pode estar relacionada ao problema é a createPaymentIntent. Ele é disparado quando o usuário confirma o pagamento no checkout ( função onConfirm()).

Fluxo após onConfirm():
a. Valida campos: número, cvc, validade, nome e email,
b. Verifica se já existe um clientSecret
c. Se não existe chama createPaymentIntent
d. Recebe o client_secret do payment intent
e. Usa o secret para chamar o confirmCardPayment

Fluxo do createPaymentIntent:
a. Front: Post para backend, com: amount_cents, currency, email e metadada.
b. Back: Cria um payment intent, ele reserva o valor no Stripe, retorna o client_secret e define os métodos de pagamento aceitos ( se o método for aceito, ele passa ).
c. Front: O client_secret retornado é usado no confirmCardPayment. Que efetivamente processa o pagamento.

Como existe uma mensagem de erro "Invalid value. Please refresh the page and try again.", isso indica que o problema está, ou no payment intent, pois ele recusa a reserva de valor, ou no confirmCardPayment, pois ele recusa o pagamento, com base no valor.

A função de payment intent tem um whiteliste de valores, o erro dispara se o valor está na llista, se não, retorna o erro.

###### Whitelist
// BRL - permitidos:
const allowedAmountsBRL = [100, 990, 1470, 1980]  // R$1, R$9.90, R$14.70, R$19.80
// EUR - permitidos:
const allowedAmountsEUR = [3700, 2400, 4700]       // €37, €24, €47

Se currency = brl, valida contra BRL, se currency = eur, valida contra EUR.

1. Payload: amount_cents: 100 currency: "brl"

Isso mostra que o valor está correto, pois está na whitelist. Ainda sim, o backend não está conseguindo criar o payment intent.

Isso pode significar que o problema está no recebimento dos dados do backend, é possível que o valor esteja chegando com um tipo errado.