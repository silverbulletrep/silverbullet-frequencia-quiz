# Integração PayPal/Stripe → Meta CAPI

Objetivo: enviar o máximo de dados de comprador para a Meta (CAPI) no evento Purchase, incluindo email, telefone, nome e endereço, para melhorar a qualidade de otimização dos anúncios.

## Endpoint

- URL do endpoint: `.../meta-capi-php/events.php`
- Healthcheck: `GET .../meta-capi-php/events.php?health=1`
- Content-Type: `application/json`

## Payload base (Purchase)

Enviar estes campos mínimos:

```json
{
  "event_name": "Purchase",
  "event_id": "paypal:ORDER_ID-OU-stripe:PI_ID",
  "event_time": 1710000000,
  "event_source_url": "https://seu-dominio.com/fim",
  "fbp": "fb.1.1717099212345.987654321",
  "fbc": "fb.1.1717099212345.ABCD1234efGhIJkLm",
  "user_agent": "Mozilla/5.0 ...",
  "ip_address": "203.0.113.10",
  "custom_data": { "currency": "EUR", "value": 27.0 }
}
```

## Dados PII opcionais (turbinados)

Você pode enviar dados “brutos” e o endpoint hash SHA-256 automaticamente:

```json
{
  "email": "cliente@exemplo.com",
  "phone": "+49 151 2345678",
  "first_name": "Maria",
  "last_name": "Silva",
  "city": "Berlin",
  "state": "BE",
  "zip": "10115",
  "country": "DE",
  "external_id": "user-123"
}
```

Os campos acima são normalizados e enviados para a Meta como `user_data.em/ph/fn/ln/ct/st/zp/country/external_id` com hash.

## Stripe (Checkout/Webhook)

1. Habilite coleta de dados no Checkout:
   - `customer_email`: enviar email ao criar a sessão
   - `billing_address_collection: 'auto'` (ou `'required'` se fizer sentido)
   - `phone_number_collection: { enabled: true }` (caso use Checkout com phone)
2. No webhook `payment_intent.succeeded`, recupere PII:
   - email: `payment_intent.receipt_email` ou `charges[0].billing_details.email` ou `session.customer_details.email`
   - phone: `charges[0].billing_details.phone` ou `session.customer_details.phone`
   - address: `charges[0].billing_details.address` (city/state/postal_code/country)
3. Monte o JSON e POST no endpoint:

```json
{
  "event_name": "Purchase",
  "event_id": "stripe:pi_XXX",
  "event_time": 1710000000,
  "event_source_url": "https://seu-dominio.com/fim",
  "fbp": "fb...",
  "fbc": "fb...",
  "user_agent": "...",
  "custom_data": { "currency": "EUR", "value": 27.0 },
  "email": "cliente@exemplo.com",
  "phone": "+49 151 2345678",
  "first_name": "Maria",
  "last_name": "Silva",
  "city": "Berlin",
  "state": "BE",
  "zip": "10115",
  "country": "DE",
  "external_id": "user-123"
}
```

## PayPal (capture)

1. Após `orders/{id}/capture`, use `json.payer` para PII:
   - email: `json.payer.email_address`
   - nome: `json.payer.name.given_name` e `json.payer.name.surname`
   - telefone: se disponível em `json.payer.phone.phone_number.national_number`
   - endereço: se disponível em `purchase_units[0].shipping.address`
2. Monte o JSON e POST no endpoint (mesmo formato acima).

## Deduplicação

- Use `event_id` estável: `paypal:ORDER_ID` ou `stripe:PI_ID`.
- O endpoint preserva `event_id` para deduplicação com o Pixel.

## Teste rápido

1. Health: `GET .../events.php?health=1` deve retornar `{ status: "ok" }`
2. Envie um evento de teste:

```bash
curl -X POST https://seu-dominio.com/meta-capi-php/events.php \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "Purchase",
    "event_id": "test-123",
    "event_time": 1710000000,
    "event_source_url": "https://seu-dominio.com/fim",
    "fbp": "fb.1.1717099212345.987654321",
    "fbc": "fb.1.1717099212345.ABCD1234efGhIJkLm",
    "user_agent": "Mozilla/5.0",
    "custom_data": { "currency": "EUR", "value": 27.0 },
    "email": "cliente@exemplo.com",
    "phone": "+49 151 2345678",
    "first_name": "Maria",
    "last_name": "Silva",
    "city": "Berlin",
    "state": "BE",
    "zip": "10115",
    "country": "DE",
    "external_id": "user-123"
  }'
```

3. Verifique na aba “Test Events” do Meta Events Manager (se `TEST_EVENT_CODE` estiver configurado no servidor).

## Checklist

- Configurar `PIXEL_ID`, `META_ACCESS_TOKEN`, `META_API_VERSION`, `TEST_EVENT_CODE` no ambiente
- Permitir CORS (`ALLOWED_ORIGINS`) para o seu frontend
- Garantir que Stripe/PayPal forneçam email/telefone/endereço na resposta
- Manter `event_source_url` apontando para `/fim` ou a página de sucesso

