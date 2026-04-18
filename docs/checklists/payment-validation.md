# ✅ Checklist — Validar Confirmação de Pagamento (Stripe & PayPal)

> Referência: Ponto 11 do `docs/tasklist.md`  
> Data: 2026-02-12  
> Status: 🟡 Pendente

---

## 1. Conexão com a API (Ambiente de Produção)

### Stripe
- [ ] `STRIPE_SECRET_KEY` está definida no `.env` de produção com prefixo `sk_live_`
- [ ] Endpoint `/api/stripe/health` retorna `{ success: true, ready: true, live: true }`
- [ ] SDK inicializa sem erro (`[STRIPE] Falha ao inicializar SDK` **não** aparece nos logs)
- [ ] `STRIPE_WEBHOOK_SECRET` está definido para receber eventos `payment_intent.succeeded`

### PayPal
- [ ] `PAYPAL_CLIENT_ID` e `PAYPAL_SECRET` estão definidos no `.env` de produção
- [ ] `PAYPAL_ENV` está definido como `live` (não `sandbox`)
- [ ] Endpoint `/api/paypal/health` retorna `{ success: true, configured: true, env: "live" }`
- [ ] OAuth token é obtido com sucesso (`[PAYPAL] Operação concluída com sucesso: oauth` nos logs)

---

## 2. Status do Pagamento

### Stripe — Checkout Session Flow
- [ ] Após pagamento, `session.payment_status` retorna `"paid"`
- [ ] `CheckoutSuccess.jsx` verifica corretamente: `session?.payment_status === 'paid'` antes de chamar `/finalize`
- [ ] Rota `/api/stripe/session/:id` expande `payment_intent` e retorna status correto

### Stripe — Payment Element Flow
- [ ] `PaymentIntent.status` retorna `"succeeded"` após pagamento
- [ ] Webhook `payment_intent.succeeded` é recebido e processado pelo backend
- [ ] Frontend envia `pi` (PaymentIntent ID) e `status` via query params para `/checkout-success`

### PayPal
- [ ] Após `capture-order`, response contém `status: "COMPLETED"`
- [ ] Rota `finalize-email` verifica `status !== 'COMPLETED'` e retenta capture se necessário
- [ ] Em caso de 422 no capture, faz retry com GET para revalidar status

---

## 3. Captura de Dados (Email / Telefone / Nome)

### Stripe — Extração de PII no `/finalize`
- [ ] Email extraído na ordem correta de prioridade:
  1. `pi.receipt_email`
  2. `charge.billing_details.email`
  3. `customer.email`
  4. `req.body.email` (fallback do frontend)
- [ ] Telefone extraído na ordem correta:
  1. `charge.billing_details.phone`
  2. `customer.phone`
  3. `req.body.phone` (fallback)
- [ ] Nome é separado em `first_name` e `last_name` a partir de `billing_details.name`
- [ ] Endereço (city, state, zip, country) é extraído de `billing_details.address`

### Stripe — Extração no Webhook
- [ ] Mesma lógica de extração de PII é aplicada no handler de `payment_intent.succeeded`
- [ ] PaymentIntent é re-fetched com `expand: ['charges.data.billing_details', 'customer']`

### PayPal — Extração de PII no `/finalize-email`
- [ ] Email vem do `req.body.email` (preenchido pelo frontend)
- [ ] Nome vem de `payer.name.given_name` e `payer.name.surname`
- [ ] Phone vem de `req.body.phone` (se disponível)
- [ ] Endereço vem de `purchase_units[0].shipping.address` (se disponível)
- [ ] Se `payer` não veio no capture, faz GET adicional para obter detalhes

### Frontend — Checkout.jsx
- [ ] ⚠️ **ATENÇÃO**: Email hardcoded `'user@example.com'` na linha 24 — precisa ser substituído pelo email real do usuário

### Frontend — CheckoutSuccess.jsx
- [ ] Email do Stripe é extraído de `session.customer_details.email` e salvo no `leadCache`
- [ ] Para PayPal, email é passado via `leadCache` ou `req.body`

---

## 4. Integrações Pós-Pagamento

### Meta CAPI (Conversion API)
- [ ] Evento `Purchase` é enviado com `event_id` estável (`stripe:PI_ID` ou `paypal:ORDER_ID`)
- [ ] Flag `capi_dispatched` no metadata do Stripe previne envio duplicado
- [ ] Dados PII (email, phone, nome, endereço) são incluídos no payload CAPI
- [ ] `event_source_url` aponta para `/fim` ou `/audio-upsell` conforme origem
- [ ] Cookies `_fbp` e `_fbc` são capturados e enviados

### N8N (Email pós-compra)
- [ ] Email é enviado ao N8N via `sendPurchaseToN8N(email)` apenas se `email` existe
- [ ] Flag `n8n_dispatched` no metadata do Stripe previne envio duplicado
- [ ] Para PayPal, N8N é chamado no `finalize-email`

### Meta Pixel (Frontend)
- [ ] `trackPurchase(value, currency, eventId)` é chamado no `CheckoutSuccess.jsx`
- [ ] `event_id` do Pixel corresponde ao `event_id` do CAPI (deduplicação)

---

## 5. Cenários de Teste em Produção

### Stripe (com cartão de teste se em `sk_test_`)
- [ ] Criar sessão de checkout → Pagamento → Redirect para `/checkout-success`
- [ ] Verificar nos logs: `[STRIPE] CAPI disparado com sucesso`
- [ ] Verificar nos logs: `[STRIPE] Resultado do envio para n8n`
- [ ] Verificar no Meta Events Manager: evento Purchase aparece com dados PII

### PayPal
- [ ] Criar order → Approve → Capture → `/finalize-email`
- [ ] Verificar nos logs: `[PAYPAL] CAPI disparado com sucesso`
- [ ] Verificar nos logs: `[PAYPAL] Integrações finalizadas`
- [ ] Verificar email recebido via N8N

### Smoke Test rápido
- [ ] `GET /api/stripe/health` → `ready: true`
- [ ] `GET /api/paypal/health` → `configured: true`
- [ ] `GET /meta-capi-php/events.php?health=1` → `{ status: "ok" }`

---

## 🔴 Issues conhecidas encontradas na análise

| # | Severidade | Descrição | Arquivo | Linha |
|---|-----------|-----------|---------|-------|
| 1 | ⚠️ ALTA | Email hardcoded `'user@example.com'` no Checkout | `src/pages/Checkout.jsx` | 24 |
| 2 | ℹ️ BAIXA | Webhook Stripe precisa de `STRIPE_WEBHOOK_SECRET` configurado | `api/routes/stripe.ts` | 749 |

---

*— Quinn, guardião da qualidade 🛡️*
