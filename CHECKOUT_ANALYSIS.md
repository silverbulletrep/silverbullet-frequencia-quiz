# 🔍 Análise Técnica Completa do Checkout
> Engenheiro Sênior — Análise baseada no código real dos arquivos:
> `CheckoutModal.jsx` · `Fim.jsx` · `FimBelowFold.jsx` · `Recupera.jsx` · `stripe.ts` (backend)

---

## 💳 Estrutura Stripe / Payment Flow

### Você cria o PaymentIntent no backend antes de renderizar o checkout ou só no submit?
**⚠️ Só no submit (lazy).**
A função `ensureClientSecret()` só é chamada dentro de `onConfirm()` (quando o usuário clica em pagar). O modal renderiza completo sem ter um PaymentIntent ativo. Isso significa que **cada clique no botão pode gerar um novo PaymentIntent** se o `clientSecret` ainda não existir.

### O `confirmation_method` está como `automatic` ou `manual`?
**`automatic` (padrão).**
Não é definido explicitamente no backend (`stripe.paymentIntents.create`). O padrão da Stripe API é `automatic`, o que delega a decisão do 3DS ao Stripe Radar automaticamente.

### Você chama `stripe.confirmPayment()` ou `confirmCardPayment()`?
**`stripe.confirmCardPayment()`** — linha 273 do `CheckoutModal.jsx`.
```js
const result = await stripe.confirmCardPayment(secret, { ... })
```

### Você está usando o Payment Element ou Card Element custom?
**Card Element custom com 3 campos separados:**
- `CardNumberElement`
- `CardExpiryElement`
- `CardCvcElement`

Não usa o Payment Element unificado da Stripe.

### O `client_secret` é gerado novo a cada tentativa ou você reutiliza?
**Reutiliza se já existe:**
```js
async function ensureClientSecret(normalizedEmail) {
  let secret = String(clientSecret || '').trim()
  if (secret) return secret  // ← reutiliza
  // ...cria novo
}
```
Porém, se o usuário fechar e reabrir o modal, o state é zerado e um novo PaymentIntent é criado.

---

## 🔄 Estados do Pagamento (CRÍTICO)

### Você trata explicitamente `requires_action`, `processing`, `requires_payment_method`?
**❌ Não explicitamente para todos.**
- `requires_action` → **tratado apenas no fluxo Apple Pay** (linha 392-401). No fluxo do Card Element padrão, o `confirmCardPayment` com `automatic` lida internamente — mas não há UI de feedback explícita para o usuário durante o redirecionamento 3DS.
- `processing` → **tratado indiretamente** na função `handleStripeSuccess`: o código aceita `succeeded` OU `processing` como sucesso válido (linha 202).
- `requires_payment_method` → **❌ Não tratado**. Se o PI entrar nesse estado após falha, não há lógica de recuperação.

### Quando dá `requires_action`, você chama corretamente o fluxo do 3DS ou depende do automático?
**Depende do automático** no fluxo Card Element. O `confirmCardPayment` gerencia o redirecionamento 3DS internamente (popup/iframe). No fluxo Apple Pay existe código explícito (linha 392):
```js
if (paymentIntent?.status === 'requires_action') {
  const actionResult = await stripe.confirmCardPayment(secret)
  // ...
}
```

### Se o usuário fecha o modal do banco (3DS), o que acontece no seu código?
**⚠️ PROBLEMA CRÍTICO:** Não existe tratamento específico. O `confirmCardPayment()` retornará um `error` com `type: 'card_error'` ou ficará pendente. O código captura erros genéricos mas não diferencia "usuário abandonou o 3DS" de "cartão recusado".

### Existe timeout ou retry automático se o usuário não completar o 3DS?
**❌ Não existe.** Nenhum timeout ou retry automático foi implementado.

### Você diferencia erro de autenticação vs erro de cartão?
**⚠️ Parcialmente.** O código captura `decline_code` e verifica `card_not_supported`, mas não diferencia `authentication_required` de erros de cartão comuns. A mensagem genérica de erro é exibida para todos os casos não mapeados.

---

## 🔐 Validação e Dados do Cartão

### Você valida o CVC antes de enviar ou deixa 100% pra Stripe?
**Delega 100% à Stripe.** O código verifica apenas se o campo está "complete" (via `cardCvcComplete` state), mas não valida o valor em si. A validação real fica no SDK da Stripe.

### Se o CVC falha, você mostra erro específico ou genérico?
**⚠️ Erro parcialmente específico.** O código exibe a mensagem de erro retornada pela Stripe (`error?.message`), que pode incluir "Your card's security code is incorrect", mas não customiza essa mensagem para PT ou UX amigável.

### Você captura o `decline_code` retornado?
**✅ Sim** — linha 291 e 294:
```js
const declineCode = String(error?.decline_code || '')
const isNotSupported = declineCode === 'card_not_supported'
```
Porém **só o `card_not_supported` é tratado com mensagem customizada**. Os demais `decline_code` caem no erro genérico.

### Você loga o `last_payment_error` completo?
**✅ Sim** — via `console.error` com `code`, `decline_code`, `type` e `message` (linha 288-293). Não há logging remoto (ex: Sentry).

### Você trata erros diferentes de `insufficient_funds`, `incorrect_cvc`, `authentication_required`?
| Código | Tratamento |
|--------|-----------|
| `insufficient_funds` | ❌ Mensagem genérica |
| `incorrect_cvc` | ❌ Mensagem genérica |
| `authentication_required` | ❌ Sem tratamento específico |
| `card_not_supported` | ✅ Mensagem customizada |

---

## 🧱 UX Controlada por Código

### Existe estado de loading ao clicar em pagar?
**✅ Sim** — `const [loading, setLoading] = useState(false)`. Loading é ativado em `onConfirm()`.

### Você bloqueia múltiplos cliques no botão?
**✅ Sim** — `disabled={loading}` no botão de pagamento (linha 799).

### O botão muda de estado (ex: "Processando...")?
**⚠️ Parcialmente.** O botão tem `disabled={loading}` mas a lógica de trocar o texto está nos estilos CSS/spinner, não foi confirmada no código JSX visível até linha 800.

### Você mostra alguma mensagem ANTES do 3DS?
**❌ Não.** Não existe nenhuma mensagem de aviso antes do popup 3DS aparecer (ex: "Seu banco pode solicitar autenticação").

### Existe alguma UI DURANTE o 3DS?
**❌ Não.** Durante o processo 3DS (que é gerenciado pelo iframe/popup da Stripe), o frontend não exibe nenhum indicador ativo ao usuário.

---

## 🔁 Retry e Reprocessamento

### Quando falha, você reaproveita o mesmo PaymentIntent?
**✅ Sim** — a função `ensureClientSecret` só cria um novo PaymentIntent se `clientSecret` for vazio. Se já existe um secret no state, reutiliza.

### Ou cria um novo automaticamente?
Apenas se o `clientSecret` estiver zerado (modal fechado/reaberto).

### Existe botão de retry imediato?
**❌ Não.** Após erro, o usuário vê a mensagem de erro mas não há botão "Tentar novamente" separado — o botão de pagar continua disponível.

### O retry reaproveita os dados já digitados?
**✅ Sim.** Os campos `cardholderName`, `contactEmail`, e `contactPhone` mantêm o state. **Os campos do Card Element (número, CVC, validade) podem resetar** dependendo do comportamento do iframe do Stripe após erro.

### Você limpa o formulário após falha (erro comum)?
**❌ Não limpa explicitamente.** Após erro, apenas `setLoading(false)` e `setErrorMsg(msg)` são chamados. Os dados do cartão nos Elements não são resetados conscientemente, mas o comportamento do iframe após erro de cartão pode variar.

---

## 🌍 Localização / Comportamento

### Você detecta o país do usuário no código?
**⚠️ Parcialmente.** O `readStoredCountry()` do `funnelTracker` é usado para rastreamento, mas não controla o comportamento do checkout diretamente.

### Você altera comportamento para Portugal vs outros países?
**⚠️ Apenas no player de vídeo** — `isPtRoute` detecta a rota `/pt/` para trocar o vídeo. No checkout em si, a moeda é sempre EUR e o valor é 3700 cents (€37), independente do país.

### Você identifica tipo de cartão (débito vs crédito)?
**❌ Não.** O código só detecta `card_not_supported` via `decline_code`, mas não há lógica proativa para identificar o tipo de cartão antes do submit.

### Você trata diferente cartões de débito?
**❌ Não.** Sem distinção de tratamento.

### Você bloqueia algum tipo de cartão sem saber?
**⚠️ Possível.** A lista de `payment_method_types` no backend inclui múltiplos métodos (sepa, giropay, klarna...) mas com fallback para `card` apenas. Se o método primário falhar no backend, o checkout cai apenas para cartão — isso pode bloquear usuários de métodos alternativos sem feedback claro.

---

## ⚙️ Performance e Render

### Quanto tempo leva pra inicializar o Stripe Elements?
O `loadStripe()` é executado com `useMemo` no componente pai e o Stripe.js é carregado de forma assíncrona. O CheckoutModal usa `React.lazy()`, então só carrega quando aberto. **Estimativa: 300ms-1.5s** dependendo da rede.

### Você lazy load ou carrega tudo direto?
**✅ Lazy load correto.** `const CheckoutModal = React.lazy(() => import('@/components/CheckoutModal'))` tanto em `FimBelowFold.jsx` quanto em `Recupera.jsx`.

### Existe risco de re-render quebrar o iframe?
**⚠️ Sim, existe risco.** O `useEffect` com `clientSecret` e outros estados pode provocar re-renders que recriam o `Elements` provider. O código usa `useMemo` para o `stripePromise` mas estados como `paymentRequest` têm dependências amplas (linha 446).

### Você já viu o campo de cartão resetar sozinho?
**⚠️ Provavelmente sim.** A lista de dependências do `useEffect` do `paymentRequest` inclui `clientSecret` e `contactEmail` — qualquer mudança nesses estados pode causar re-mount do `Elements`, o que reseta os Card Elements.

### Seu checkout funciona 100% em mobile (testado via código/responsividade)?
**⚠️ Parcialmente.** Existe detecção de viewport para PayPal (`window.matchMedia('(max-width: 420px)')`). O Apple Pay usa `window.ApplePaySession`. Os Card Elements têm `fontSize: '16px'` (bom para iOS — evita zoom). Sem testes explícitos de mobile no código.

---

## 🔁 Recuperação de Pagamento

### Você salva o email antes do pagamento?
**✅ Sim** — `leadCache.setEmail()` é chamado ao digitar no campo de email (linha 775):
```js
onChange={(e) => { leadCache.setEmail(String(e.target.value).trim()) }}
```

### Você dispara algo quando recebe `payment_failed`?
**❌ Não via webhook.** O webhook em `stripe.ts` trata `payment_intent.succeeded` e `checkout.session.completed` mas **não trata `payment_intent.payment_failed`**.

### Você envia novo link automaticamente?
**❌ Não.** Sem automação de recuperação via email após falha de pagamento.

### Você tem delay estratégico (ex: 2min depois)?
**❌ Não existe** nenhuma lógica de recuperação com delay.

### Você personaliza a mensagem pelo erro?
**⚠️ Em partes.** Apenas `card_not_supported` recebe mensagem customizada. Todos os outros erros exibem a mensagem da Stripe sem personalização de copy direcionada à conversão.

---

## 💳 Métodos de Pagamento

| Método | Status |
|--------|--------|
| Cartão (crédito/débito) | ✅ |
| PayPal | ✅ (com `VITE_PAYPAL_CLIENT_ID`) |
| Apple Pay / Google Pay | ✅ (via PaymentRequest API, só aparece se disponível) |
| Klarna | ⚠️ Backend oferece, mas o CheckoutModal não tem UI específica |
| SEPA/Giropay | ⚠️ Backend oferece, mas cai no fallback `card` se falhar |
| Débito vs Crédito | ❌ Sem distinção |

> ⚠️ **ATENÇÃO:** No `Recupera.jsx` e `FimBelowFold.jsx`, o `openCheckoutDirect()` aponta para **Hotmart** (`pay.hotmart.com`), não para o modal Stripe. Isso é um resquício de código antigo que pode confundir o fluxo real.

---

## 🧠 Psicologia / Conversão

### Você prepara o usuário pro 3DS antes?
**❌ Não.** Nenhuma mensagem de "seu banco pode pedir confirmação" antes do submit.

### Você reduz ansiedade no momento do pagamento?
**⚠️ Parcialmente.** O modal exibe ícones de segurança (Visa, Mastercard, shield). Há um sinal de "Pagamento Seguro" mas sem copy emocional específico de redução de ansiedade.

### Você explica por que pode falhar?
**❌ Não.** Mensagens de erro são técnicas ou da Stripe, sem explicação contextual ao usuário (ex.: "Verifique se está habilitado para compras internacionais").

### Você tem prova/confiança perto do botão?
**⚠️ Sim, mas fraca.** Há logos de bandeiras de cartão. No `Fim.jsx` há testimonials, mas **fora do modal de checkout**.

### Seu checkout parece seguro ou "genérico"?
**⚠️ Intermediário.** O design tem Card Elements customizados (não o Stripe padrão). Tem ícone de lock e logos de cartão. Mas a ausência de copy de segurança e de preparação para o 3DS pode gerar abandono.

---

## 🩺 Resumo Executivo — Pontos Críticos

| # | Prioridade | Problema | Impacto |
|---|-----------|----------|---------|
| 1 | 🔴 CRÍTICO | Sem tratamento para `requires_action` no Card Element (3DS não tem UI de espera) | Abandono |
| 2 | 🔴 CRÍTICO | `openCheckoutDirect` em `Recupera.jsx` e `FimBelowFold.jsx` aponta para **Hotmart**, não Stripe | Funil quebrado |
| 3 | 🔴 CRÍTICO | Nenhum webhook para `payment_intent.payment_failed` → recuperação zero | Receita perdida |
| 4 | 🟠 ALTO | `insufficient_funds`, `incorrect_cvc` não têm mensagens específicas | Conversão baixa |
| 5 | 🟠 ALTO | Sem aviso pré-3DS ("seu banco pode pedir confirmação") | Abandono no modal 3DS |
| 6 | 🟠 ALTO | Re-render pode resetar campos de cartão (dependências amplas no `useEffect`) | Fricção UX |
| 7 | 🟡 MÉDIO | Sem recovery automático (delay + email) após falha | LTV perdido |
| 8 | 🟡 MÉDIO | Locale hardcoded como `'de'` na sessão Stripe da rota PT | Experiência errada |
| 9 | 🟡 MÉDIO | Sem diferenciação de cartão débito vs crédito | Bloqueio silencioso |
| 10 | 🟢 BAIXO | Sem logging remoto (Sentry/Datadog) dos erros de pagamento | Debugging blind |
