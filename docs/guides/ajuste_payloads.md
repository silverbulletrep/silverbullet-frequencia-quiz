


---------------------------------------------------------------------------------------------------------------------------------------------------

# Manual técnico de padronização de eventos (/eventos)

Este manual define o padrão de envio de eventos via POST para o endpoint de tracking e descreve a estratégia beacon-first com fallback para fetch, o formato correto de payload e checklists para evitar erro 400. O conteúdo foi baseado no código atual do tracker e no contrato interno documentado.

## Endpoint e estratégia recomendada

- Endpoint: `https://bkend-aquisicao-worker-redis-supabase.6jcwzd.easypanel.host/eventos`
- Estratégia: tentativa com `sendBeacon`, fallback para `fetch` com `keepalive: true`
- Base URL configurável por `VITE_EVENTS_BASE_URL`

Referências de implementação:
- [funnelTracker.ts](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/lib/funnelTracker.ts#L188-L339)
- [InitialQuestions.jsx](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/pages/InitialQuestions.jsx#L113-L121)

## 1) Configuração de headers para sendBeacon

### Regras do navegador

- `sendBeacon` não permite configurar headers customizados.
- O tipo do payload é definido pelo `Blob` enviado.
- Autenticação via header não é possível em `sendBeacon`.

### Recomendação de headers

- Para `sendBeacon`, usar `text/plain; charset=UTF-8` no `Blob`, como já implementado no tracker.
- Para `fetch`, usar `Content-Type: application/json`.

### CORS e políticas de segurança

- O servidor deve aceitar `POST` de origem do site com `Content-Type: text/plain` (beacon) e `application/json` (fetch).
- O servidor deve habilitar `Access-Control-Allow-Origin` para os domínios do frontend.
- Evite exigir headers de autenticação no `sendBeacon`. Se necessário, inclua o token no body e valide no backend.

Exemplo de envio beacon-first:

```ts
const payload = { event: 'page_view', funnel_id: 'vsl_01', lead_id: 'lead_x', timestamp: new Date().toISOString() }
const body = JSON.stringify(payload)
const ok = navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain; charset=UTF-8' }))
```

## 2) Fallback com fetch e keep-alive

### Estratégia

- Tentar `sendBeacon` primeiro.
- Se `sendBeacon` retornar `false`, executar `fetch` com `keepalive: true`.
- `fetch` deve usar `application/json`.

Exemplo completo:

```ts
const sendEvent = async (endpoint, payload) => {
  const body = JSON.stringify(payload)
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const ok = navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain; charset=UTF-8' }))
    if (ok) return { ok: true, via: 'beacon' }
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  })
  return { ok: response.ok, via: 'fetch' }
}
```

### Timeouts e retry

- `sendBeacon` não suporta timeout.
- Para `fetch`, use `AbortController` se quiser timeout.
- Evite retry agressivo para não violar rate limit do endpoint.

Exemplo com timeout:

```ts
const sendFetchWithTimeout = async (endpoint, payload, ms) => {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), ms)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
    signal: controller.signal
  })
  clearTimeout(t)
  return response
}
```

⚠️ Aviso importante:
Os trechos --> texto explicativo NÃO fazem parte do JSON.
Eles existem apenas para documentar e explicar a função de cada campo.
Antes de enviar para o backend, essas explicações devem ser removidas.

## PAYLOAD DOCUMENTADO: 
{
  "event": "desire_selected", 
  --> nome do evento que representa a ação do utilizador (ex: seleção de desejo)

  "funnel_id": "quiz_frequencia_01",
  --> id fixo do funil; após definido, é inserido de forma fixa em todas as páginas desse funil

  "lead_id": "lead_x",
  --> identificador do lead; deve ser recuperado do localStorage (verificar se já está implementado)

  "session_id": "sess_x",
  --> identificador da sessão; deve ser implementado e recuperado do localStorage

  "step": {
    "id": "checkout_exemplo",
    --> identificador lógico da página/etapa

    "index": 3,
    --> posição da página dentro do funil (ordem de navegação)

    "name": "Checkout exemplo"
    --> nome humano da página, usado para debug, logs ou frontend
  },

  "attributes": {
    "question": "Qual é o teu maior objetivo neste momento?",
    --> headline da pergunta apresentada ao utilizador na página

    "response": [
      "Perder peso sem dietas restritivas",
      --> opção selecionada pelo utilizador

      "Reduzir a barriga sem ginásio"
      --> exemplo de múltiplas seleções (quando permitido)
    ]
  },
  --> payload principal do evento: pergunta feita + resposta(s) do utilizador

  "metadata": {
    "referrer": "https://facebook.com",
    --> origem imediata do tráfego (ainda a estudar uso estratégico)

    "utm": {
      "source": "facebook",
      --> fonte da campanha

      "campaign": "vsl_test_01"
      --> nome da campanha
    },
    --> parâmetros de campanha para análise de performance

    "user_agent": "Mozilla/5.0",
    --> user agent do navegador (para debug, device tracking, etc.)

    "country": "BR"
    --> país do utilizador; Usar uma API de geolocalização por IP no frontend (ex: ipapi/ipwhois), obter o country do utilizador e salvar esse valor uma única vez no localStorage para reutilizar em todos os eventos do funil. precisamos checar se tem algo salvando o pais do usuario no cache, se não tiver, basta implementar. 
  },

  "timestamp": "2026-01-31T12:00:00.000Z"
  --> data e hora em que o evento foi enviado (UTC, padrão ISO 8601)
}

## PATLOAD PRODUÇÃO:
{
  "event": "desire_selected",
  "funnel_id": "quiz_frequencia_01",
  "lead_id": "lead_x",
  "session_id": "sess_x",
  "step": {
    "id": "checkout_exemplo",
    "index": 3,
    "name": "Checkout exemplo"
  },
  "attributes": {
    "question": "Qual é o teu maior objetivo neste momento?",
    "response": [
      "Perder peso sem dietas restritivas",
      "Reduzir a barriga sem ginásio"
    ]
  },
  "metadata": {
    "referrer": "https://facebook.com",
    "utm": {
      "source": "facebook",
      "campaign": "vsl_test_01"
    },
    "user_agent": "Mozilla/5.0",
    "country": "BR"
  },
  "timestamp": "2026-01-31T12:00:00.000Z"
}
