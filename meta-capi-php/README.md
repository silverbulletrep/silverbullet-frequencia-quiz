# Endpoint PHP para Meta Conversions API

Este endpoint em PHP recebe eventos via POST e os encaminha para a Meta Conversions API (CAPI), preservando `event_id` para deduplicação e respondendo imediatamente ao frontend antes de enviar para a Meta.

## Rotas

- POST `events.php` — recebe eventos e retorna imediatamente uma confirmação.
- GET `events.php?health=1` — verificação de saúde (200 OK com JSON).

## Payload (POST)

Enviar `Content-Type: application/json` com o seguinte formato mínimo:

```json
{
  "event_name": "Purchase",
  "event_id": "uuid",
  "event_time": 1710000000,
  "event_source_url": "https://exemplo.com/checkout/sucesso",
  "fbp": "fb.1.1717099212345.987654321",
  "fbc": "fb.1.1717099212345.ABCD1234efGhIJkLm",
  "user_agent": "Mozilla/5.0 ...",
  "ip_address": "203.0.113.10",
  "custom_data": {
    "value": 27.0,
    "currency": "BRL"
  }
}
```

Campos obrigatórios: `event_name`, `event_id`, `event_source_url`, `custom_data.value`, `custom_data.currency`.

Campos opcionais encaminhados se presentes: `contents`, `content_ids`, `content_type`, `order_id`, `num_items`, `delivery_category`.

Se `event_time` não for enviado, será definido automaticamente para o horário atual em segundos.

### Dados PII com hash (opcionais)

Você pode enviar os dados brutos do comprador (PII) e o servidor irá normalizar e aplicar SHA‑256 automaticamente antes de enviar para a Meta:

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

Observações:
- Também é aceito enviar os mesmos campos dentro de `user_data` (ex.: `user_data.email`, `user_data.phone`, etc.).
- Se `user_agent`/`ip_address` não forem enviados, o servidor captura dos cabeçalhos da requisição.

## Resposta

```json
{
  "ok": true,
  "event_id": "uuid",
  "received_at": 1710000000
}
```

Após essa resposta, o servidor continua o envio para a Meta e o log opcional no Supabase em background.

## Credenciais necessárias

- PIXEL_ID — ID do Pixel (Meta Events Manager).
- META_ACCESS_TOKEN — Access Token gerado no Meta Events Manager.
- TEST_EVENT_CODE — opcional, para testes (aba "Test events").
- SUPABASE_URL — opcional, URL do seu projeto Supabase (para logging).
- SUPABASE_SERVICE_ROLE_KEY — opcional, chave Service Role do Supabase (para logging).
- ALLOWED_ORIGINS — opcional, lista de origens permitidas para CORS, separadas por vírgula. Use `*` para liberar todas.

Defina estas variáveis no painel da hospedagem (ambiente) sem salvar segredos em código. Opcionalmente, `credentials.php` pode fornecer valores locais (override), que são mesclados por `config.php`.

### CORS

`events.php` lê `ALLOWED_ORIGINS` e aplica `Access-Control-Allow-Origin` dinamicamente. Use `*` para liberar todas as origens ou uma lista separada por vírgulas (ex.: `https://site-a.com,https://site-b.com`).

## Deploy em Hostinger

1. Faça upload da pasta `meta-capi-php/` dentro da sua `public_html`.
2. Garanta PHP 7.4+ com cURL habilitado.
3. Configure as variáveis de ambiente acima no painel da hospedagem.
4. Aponte seu frontend para `https://seu-dominio.com/meta-capi-php/events.php`.

## Testes

Use o código de testes do Events Manager (`TEST_EVENT_CODE`) nas variáveis de ambiente e envie um evento:

```bash
curl -X POST https://seu-dominio.com/meta-capi-php/events.php \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "Purchase",
    "event_id": "a7b4c1f0-1234-5678-9abc-def012345678",
    "event_time": 1710000000,
    "event_source_url": "https://seu-dominio.com/checkout/sucesso",
    "fbp": "fb.1.1717099212345.987654321",
    "fbc": "fb.1.1717099212345.ABCD1234efGhIJkLm",
    "custom_data": { "value": 27.0, "currency": "BRL" }
  }'
```

Verifique em Events Manager, na aba Test Events.

Envio com PII (hash feito no servidor):

```bash
curl -X POST https://seu-dominio.com/meta-capi-php/events.php \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "Purchase",
    "event_id": "test-456",
    "event_source_url": "https://seu-dominio.com/fim",
    "custom_data": { "value": 27.0, "currency": "EUR" },
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

## Referências

- Parâmetros requeridos para web: `action_source`, `event_source_url`, `client_user_agent` (Meta) — ver [developers.facebook.com: Parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters).
- Envio para `/events` com `access_token` — ver [developers.facebook.com: Using the API](https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api/).

## Arquivos

- events.php
- config.php
- lib/meta.php
- lib/supabase.php

## Deduplicação

`event_id` é preservado e usado para deduplicação com o Pixel. Recomendações:
- PayPal: `event_id` = `paypal:ORDER_ID`
- Stripe: `event_id` = `stripe:PI_ID`
