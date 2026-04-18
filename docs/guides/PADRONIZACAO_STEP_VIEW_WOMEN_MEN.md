# Padronização de payloads: /women-success e /men-success (step_view)

Este documento consolida o payload final para as rotas /women-success e /men-success com `step_view` padronizado.

## Contexto atual no código

- As duas páginas enviam `step_view` ao montar o componente.
- `lead_id` e `session_id` são puxados do cache do navegador.
- `country` é lido do cache com fallback no fluxo `/quiz` (InitialQuestions) e reaproveitado nos eventos.

Referências:
- [WomenSuccess.jsx](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/pages/WomenSuccess.jsx#L33-L37)
- [MenSuccess.jsx](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/pages/MenSuccess.jsx#L25-L29)
- [funnelTracker.ts](file:///d:/euvidal/Funil%20aquisi%C3%A7%C3%A3o%20-Ultimo%20-%20update%20-%20bruno/Funil-Aquisicao-Alemanha-main/src/lib/funnelTracker.ts#L263-L280)

## Payload final (step_view)

### /women-success

```json
{
  "event": "step_view",
  "funnel_id": "quiz_frequencia_01",
  "lead_id": "<do cache/localStorage>",
  "session_id": "<do cache/localStorage>",
  "step": {
    "id": "prova_social_mulher",
    "index": 3,
    "name": "Prova Social Mulher"
  },
  "page": {
    "url": "<url atual>",
    "path": "<path atual>",
    "title": "<title atual>"
  },
  "metadata": {
    "country": "<do cache/localStorage>",
    "referrer": "<document.referrer>",
    "utm": {
      "source": "<utm_source>",
      "campaign": "<utm_campaign>"
    },
    "user_agent": "<navigator.userAgent>"
  },
  "timestamp": "<ISO-8601>"
}
```

### /men-success

```json
{
  "event": "step_view",
  "funnel_id": "quiz_frequencia_01",
  "lead_id": "<do cache/localStorage>",
  "session_id": "<do cache/localStorage>",
  "step": {
    "id": "prova_social_homem",
    "index": 3,
    "name": "Prova Social Homem"
  },
  "page": {
    "url": "<url atual>",
    "path": "<path atual>",
    "title": "<title atual>"
  },
  "metadata": {
    "country": "<do cache/localStorage>",
    "referrer": "<document.referrer>",
    "utm": {
      "source": "<utm_source>",
      "campaign": "<utm_campaign>"
    },
    "user_agent": "<navigator.userAgent>"
  },
  "timestamp": "<ISO-8601>"
}
```

## Mapeamento de dados

- `lead_id`: gerado no tracker e persistido em `localStorage` (chave padrão `lead_id`).
- `session_id`: gerado no tracker e persistido em `localStorage` e `sessionStorage` (chave padrão `session_id`).
- `country`: resolvido no fluxo `/quiz` (InitialQuestions) com fallback e persistência em cache.

## Decisões aplicadas

- `funnel_id`: `quiz_frequencia_01`.
- `step_view` inclui `page` e `metadata` completos.
- Substituição de `step_progress` por `step_view` nas duas rotas.
- País com fallback no fluxo `/quiz` e reaproveitado nos eventos.

## Campos nulos

Não há campos nulos por falta de informação. Campos opcionais ausentes permanecem omitidos pelo tracker.
