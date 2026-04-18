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

## 3) Análise de payloads por etapa

Eventos usados nestes componentes são do tipo `desire_selected`. Esse evento exige:

- `event` (string literal `desire_selected`)
- `funnel_id` (string)
- `lead_id` (string prefixada com `lead_`)
- `timestamp` (ISO 8601)
- `attributes.desire` (string)

Campos opcionais nesse evento (não exigidos pelo schema atual): `session_id`, `page`, `metadata`.

### QuizStep1.jsx

- Campos obrigatórios faltando: nenhum com o tracker atual.
- Formato esperado:
  - `attributes.desire`: string (texto da opção selecionada)
  - `timestamp`: ISO 8601 com timezone (`new Date().toISOString()`)
- Estrutura JSON:

```json
{
  "event": "desire_selected",
  "funnel_id": "quiz_frquencia_01",
  "lead_id": "lead_x",
  "timestamp": "2026-01-31T12:00:00.000Z",
  "attributes": { "desire": "<texto da opção>" }
}
```

- Mapeamento de estado React:
  - `selectedOption.text` → `attributes.desire`

Código de envio:

```ts
const tracker = createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined })
tracker.desireSelected(selectedOption.text)
```

### QuizStep2.jsx

- Campos obrigatórios faltando: nenhum com o tracker atual.
- Formato esperado: igual ao QuizStep1.
- Mapeamento de estado React:
  - `selectedOption.text` → `attributes.desire`

### QuizStep3.jsx

- Campos obrigatórios faltando: nenhum com o tracker atual.
- Formato esperado: igual ao QuizStep1.
- Mapeamento de estado React:
  - `selectedOption.text` → `attributes.desire`

### QuizStep4.jsx

- Campos obrigatórios faltando: nenhum com o tracker atual.
- Formato esperado: igual ao QuizStep1.
- Mapeamento de estado React:
  - `selectedOption.text` → `attributes.desire`

### QuizStep5.jsx

- Campos obrigatórios faltando: nenhum com o tracker atual.
- Formato esperado: igual ao QuizStep1.
- Mapeamento de estado React:
  - `selectedOption.text` → `attributes.desire`

### QuizStep6.jsx

- Campos obrigatórios faltando: nenhum com o tracker atual.
- Formato esperado: igual ao QuizStep1.
- Mapeamento de estado React:
  - `selectedOption.text` → `attributes.desire`

### MorningFeeling.jsx

- Campos obrigatórios faltando: nenhum com o tracker atual.
- Formato esperado:
  - `attributes.desire`: string composta pela junção das opções escolhidas
- Estrutura JSON:

```json
{
  "event": "desire_selected",
  "funnel_id": "quiz_frquencia_01",
  "lead_id": "lead_x",
  "timestamp": "2026-01-31T12:00:00.000Z",
  "attributes": { "desire": "<opção 1>, <opção 2>" }
}
```

- Mapeamento de estado React:
  - `selectedOptions` → `desireValue` → `attributes.desire`

## 4) Checklist para prevenir erro 400

- Schema válido do evento:
  - `event` deve estar entre os tipos aceitos
  - `funnel_id`, `lead_id`, `timestamp` obrigatórios
  - Para `desire_selected`, `attributes.desire` obrigatório
- Timestamp:
  - Usar ISO 8601 com `new Date().toISOString()`
- IDs:
  - `lead_id` com prefixo `lead_`
  - `session_id` com prefixo `sess_` quando exigido
- Strings:
  - Normalizar strings para UTF-8
  - Evitar `null` e `undefined` em campos obrigatórios
- Tamanho do payload:
  - Evitar payloads acima de ~64KB para `sendBeacon`
- Headers:
  - `sendBeacon`: `text/plain; charset=UTF-8`
  - `fetch`: `Content-Type: application/json`
- Ordem lógica de etapas:
  - Não pular `step.index`
  - `purchase` exige `checkout_start` prévio
- Rate limit:
  - Máximo 60 eventos/60s por `session_id` e `lead_id`

## 5) Template de perguntas para completude de payload

### QuizStep1–QuizStep6

- Quais estados do usuário estão sendo capturados?
  - Opção selecionada no quiz (texto e chave)
- Quais dados enviados no payload estão faltando?
  - Nenhum se `attributes.desire` estiver presente
- Qual o evento correto para este momento?
  - `desire_selected`
- O `funnel_id` está correto para este funil?
  - Confirmar `quiz_frquencia_01`
- O `lead_id` já foi criado e persistido?
  - Confirmar localStorage/cookie

### MorningFeeling

- Quais estados do usuário estão sendo capturados?
  - Lista de desejos selecionados (array)
- Quais dados enviados no payload estão faltando?
  - Nenhum se `attributes.desire` for string final
- O evento correto é `desire_selected`?
  - Sim, quando o usuário confirma o desejo principal

## Exemplos de payload por evento

### page_view

```json
{
  "event": "page_view",
  "funnel_id": "vsl_01",
  "lead_id": "lead_x",
  "session_id": "sess_y",
  "step": { "id": "vsl", "index": 1, "name": "VSL" },
  "page": { "url": "https://exemplo.com/vsl", "path": "/vsl", "title": "VSL" },
  "timestamp": "2026-01-31T12:00:00.000Z",
  "metadata": { "country": "DE", "referrer": "https://facebook.com", "utm": { "source": "facebook", "campaign": "vsl_test_01" }, "user_agent": "Mozilla/5.0" }
}
```

### desire_selected

```json
{
  "event": "desire_selected",
  "funnel_id": "quiz_frquencia_01",
  "lead_id": "lead_x",
  "timestamp": "2026-01-31T12:00:00.000Z",
  "attributes": { "desire": "energia e foco" }
}
```

## Exemplos de código funcional por etapa

### QuizStep (genérico)

```ts
const tracker = createFunnelTracker({
  baseUrl: getDefaultBaseUrl(),
  funnelId: QUIZ_FUNNEL_ID,
  getCountry: () => readStoredCountry() || undefined
})

tracker.desireSelected(selectedOption.text)
```

### MorningFeeling

```ts
const desireValue = selectedOptions.map((key) => desireLabels[key] || key).join(', ')
tracker.desireSelected(desireValue)
```

## Testes unitários sugeridos (validação de payload)

Função de validação simples:

```ts
export const validateDesireSelected = (payload) => {
  if (!payload || payload.event !== 'desire_selected') return false
  if (!payload.funnel_id || typeof payload.funnel_id !== 'string') return false
  if (!payload.lead_id || typeof payload.lead_id !== 'string') return false
  if (!payload.timestamp || typeof payload.timestamp !== 'string') return false
  if (!payload.attributes || typeof payload.attributes.desire !== 'string') return false
  return true
}
```

Teste unitário exemplo (framework opcional):

```ts
import { validateDesireSelected } from './validateDesireSelected'

const ok = validateDesireSelected({
  event: 'desire_selected',
  funnel_id: 'quiz_frquencia_01',
  lead_id: 'lead_123',
  timestamp: new Date().toISOString(),
  attributes: { desire: 'energia' }
})

if (!ok) throw new Error('payload inválido')
```

## Referências internas

- [funnelTracker.ts](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/lib/funnelTracker.ts)
- [QuizStep1.jsx](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/pages/QuizStep1.jsx)
- [QuizStep2.jsx](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/pages/QuizStep2.jsx)
- [QuizStep3.jsx](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/pages/QuizStep3.jsx)
- [QuizStep4.jsx](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/pages/QuizStep4.jsx)
- [QuizStep5.jsx](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/pages/QuizStep5.jsx)
- [QuizStep6.jsx](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/pages/QuizStep6.jsx)
- [MorningFeeling.jsx](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/pages/MorningFeeling.jsx)
