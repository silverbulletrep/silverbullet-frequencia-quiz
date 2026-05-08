<!--
Planning output for the presell tarot funnel_variant adjustment.
Main responsibilities: document mapped references, implementation logic, risks, rollback, and verification before code execution.
-->

# Presell Tarot Funnel Variant — Planning Output (v1)

> **Status:** PLANEJADO — Aguardando aprovação  
> **Data:** 2026-05-08  
> **Scope:** `/alma-gemea`, `/de/alma-gemea`, downstream quiz/funnel event tracking  
> **Files:** 4 arquivos (0 novos, 4 modificados)  
> **Risk:** 🔴 HIGH

---

## 1. Contexto

The `/alma-gemea` page is an alternate tarot presell that opens `AliceChat`, identifies the lead, and then sends the user into the standard quiz flow. Today, `AliceChat` records `funnel_origin` in event attributes, and `leadCache` persists lead metadata between pages, but `createFunnelTracker()` does not add a top-level `funnel_variant` to every event payload.

Required outcome: if a lead entered through `/alma-gemea`, every `funnel_events` event fired by that lead must contain `funnel_variant = "presell_tarot"`. The safest implementation is to persist the variant once on the presell page and centralize payload injection in `createFunnelTracker()`, so all current event senders inherit it without per-page edits.

### Technical Mapping

Point #1: Persist and attach tarot presell variant to all events
├── Risk Level: 🔴 HIGH
├── Blast Radius: `/alma-gemea`, `AliceChat`, every page/component using `createFunnelTracker`
├── Regression Surface: event payload shape, lead cache persistence, checkout/quiz event ingestion
└── Confidence: HIGH for frontend payload behavior; MEDIUM for backend storage because `funnel_events` schema is not represented in local migrations

- **Issue:** Events from leads entering via `/alma-gemea` lack top-level `funnel_variant`.
- **Suspected Root Cause:** The variant is stored only as contextual origin data in `attributes.funnel_origin`, while the shared tracker base payload has no variant field.
- **Target Outcome:** Once `/alma-gemea` is visited, `leadCache` stores `funnel_variant: "presell_tarot"` and `createFunnelTracker()` includes top-level `funnel_variant` in all subsequent event payloads for that lead.
- **Risks & Mitigation:** Shared tracker changes can affect all events. Mitigate by making the field optional, only sending it when persisted, keeping existing event names/attributes untouched, and validating a tarot path plus a normal `/quiz` path.

---

## 2. Referência de Código Mapeada

### 2.1 Shared Funnel Payload Factory

[funnelTracker.ts L260-L329](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/funnelTracker.ts#L260-L329)

```ts
export const createFunnelTracker = (config: TrackerConfig) => {
  const leadKey = config.leadStorageKey ?? "lead_id";
  const sessionKey = config.sessionStorageKey ?? "session_id";
  const normalizedBase = config.baseUrl ? config.baseUrl.replace(/\/$/, "") : "";
  const endpoint = normalizedBase.endsWith("/eventos")
    ? normalizedBase
    : `${normalizedBase}/eventos`;
  const debug = Boolean(config.debug);

  const sendPayload = async (payload: Record<string, unknown>): Promise<SendResult> => {
    const body = JSON.stringify(payload);
    if (debug) {
      console.log("[TRACK] Enviando evento", {
        event: payload?.event,
        funnel_id: payload?.funnel_id,
        endpoint
      });
    }
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const ok = navigator.sendBeacon(
        endpoint,
        new Blob([body], { type: "text/plain; charset=UTF-8" })
      );
      if (ok) {
        if (debug) {
          console.log("[TRACK] Enviado via beacon", {
            event: payload?.event,
            funnel_id: payload?.funnel_id
          });
        }
        return { ok: true, via: "beacon" };
      }
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    });

    return { ok: response.ok, via: "fetch" };
  };

  const base = () => ({
    funnel_id: config.funnelId,
    lead_id: getOrCreateLeadId(leadKey),
    timestamp: new Date().toISOString()
  });
```

↑ This is the single shared place where top-level event payload fields should be injected.

### 2.2 Existing Lead Cache Persistence

[leadCache.ts L7-L25](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/leadCache.ts#L7-L25)

```ts
type LeadCacheData = {
  genero?: 'homem' | 'mulher'
  idade?: number
  problema_principal?: string | string[]
  respostas_quiz?: Record<string, unknown>
  etapa_atual_do_funil?: string
  whatsapp?: string
  whatsapp_raw?: string
  email?: string
  contact_preference?: 'whatsapp' | 'email'
  lead_id?: string
  id_lead?: string
  lead_id_short?: string
  created_at?: string
  client_uuid?: string
  selected_option?: string
  selected_option_description?: string
  nome?: string
}
```

[leadCache.ts L57-L81](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/leadCache.ts#L57-L81)

```ts
function readStorage(): LeadCacheData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return MEMORY_STORE.data || {}
    const payload = JSON.parse(raw)
    return (payload?.data || {}) as LeadCacheData
  } catch {
    return MEMORY_STORE.data || {}
  }
}

function writeStorage(data: LeadCacheData) {
  const next = ensureClientUUID({ ...data })
  MEMORY_STORE.data = next
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data: MEMORY_STORE.data })
    )
    console.info('[LEAD_CACHE] Dados salvos no cache:', MEMORY_STORE.data)
  } catch {
    console.warn('[LEAD_CACHE] Falha ao salvar no storage')
  }
}
```

↑ This pattern will be extended with a `funnel_variant` field and setter.

### 2.3 Tarot Lead Identification Point

[AliceChat.tsx L385-L405](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/components/AliceChat/AliceChat.tsx#L385-L405)

```tsx
// ── Tracking e Cache (Sync com /quiz) ──
leadCache.setNome(formattedName);

const tracker = createFunnelTracker({
  baseUrl: getDefaultBaseUrl(),
  funnelId: ALMA_GEMEA_FUNNEL_ID,
  getCountry: () => readStoredCountry() || undefined,
  debug: import.meta.env.DEV
});

// Sincroniza o ID entre funnelTracker e leadCache para garantir reuso em outras páginas
const currentLeadId = tracker.getLeadId();
leadCache.setLeadId(currentLeadId);

// Envia o payload com nome, id único, idioma e origem do funil
tracker.leadIdentifiedCustom(ALMA_GEMEA_STEPS.coleta_nome, {
  name: formattedName,
  lead_id: currentLeadId,
  lang,
  funnel_origin: `alma-gemea-${lang}`,
```

↑ This is the first tarot-specific tracked event and will remain compatible; the variant will come from the shared tracker base.

### 2.4 Existing Route-Level Persistence Pattern

[trackingParams.ts L48-L75](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/trackingParams.ts#L48-L75)

```ts
function writeStoredTrackingParams(params: Record<string, string>) {
  const payload = JSON.stringify(params)
  try { sessionStorage.setItem(STORAGE_KEY, payload) } catch { void 0 }
  try { localStorage.setItem(STORAGE_KEY, payload) } catch { void 0 }
}

export function captureTrackingParams(search?: string): Record<string, string> {
  const stored = readStoredTrackingParams()
  const params = new URLSearchParams(
    typeof search === 'string'
      ? search.replace(/^\?/, '')
      : (typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '')
  )
  let changed = false

  params.forEach((value, key) => {
    if (!isTrackingParam(key)) return
    const normalizedKey = key.toLowerCase()
    const normalizedValue = String(value || '').trim()
    if (!normalizedValue) return
    if (stored[normalizedKey] !== normalizedValue) {
      stored[normalizedKey] = normalizedValue
      changed = true
    }
  })

  if (changed) writeStoredTrackingParams(stored)
  return stored
}
```

↑ This confirms the app already persists attribution context across pages.

### 2.5 Context7 React Lifecycle Reference

Context7 `/reactjs/react.dev`: `useEffect` synchronizes React components with external systems; dependencies must include reactive values, and cleanup is used for subscriptions/listeners. This supports using a small mount effect for `leadCache.setFunnelVariant()` and keeping DOM/wake-lock cleanup untouched.

```tsx
useEffect(() => {
  localStorage.setItem('preferredTheme', theme);
  document.body.className = theme;
}, [theme]);
```

---

## 3. Lógica de Implementação

### 3.1 Persist Funnel Variant in Lead Cache

**Origem:** `[CRIADO]` + `[REPO EXISTENTE]`

```ts
type LeadCacheData = {
  // existing fields...
  funnel_variant?: string
}

export const leadCache = {
  // existing methods...
  setFunnelVariant(funnel_variant: string) {
    const current = readStorage()
    const normalizedVariant = String(funnel_variant || '').trim()
    if (!normalizedVariant || current.funnel_variant === normalizedVariant) return

    const next = {
      ...current,
      funnel_variant: normalizedVariant,
      created_at: current.created_at || new Date().toISOString(),
    }
    writeStorage(next)
  },
}
```

Flow: extend the existing cache shape; write only when the value is non-empty and changed; preserve all existing cached lead data.

### 3.2 Attach Variant in Shared Tracker Base Payload

**Origem:** `[CRIADO]` + `[REPO EXISTENTE]`

```ts
import { leadCache } from './leadCache'

const readStoredFunnelVariant = () => {
  try {
    return String(leadCache.getAll()?.funnel_variant || '').trim() || undefined
  } catch {
    return undefined
  }
}

const base = () => {
  const funnelVariant = readStoredFunnelVariant()

  return {
    funnel_id: config.funnelId,
    lead_id: getOrCreateLeadId(leadKey),
    ...(funnelVariant ? { funnel_variant: funnelVariant } : {}),
    timestamp: new Date().toISOString()
  }
}
```

Flow: every tracker method already spreads `...base()`. Adding the optional field here makes `page_view`, `step_view`, `lead_identified`, `checkout_start`, `purchase`, and custom events inherit the variant without touching each callsite.

### 3.3 Mark `/alma-gemea` Entrants

**Origem:** `[CRIADO]` + `[CONTEXT7]`

```tsx
import { leadCache } from '@/lib/leadCache';

const PRESALE_TAROT_FUNNEL_VARIANT = 'presell_tarot';

const AlmaGemea: React.FC = () => {
  // existing hooks...

  useEffect(() => {
    leadCache.setFunnelVariant(PRESALE_TAROT_FUNNEL_VARIANT);
  }, []);
}
```

Flow: on first render of the presell page, the lead cache is marked as tarot presell. The effect has no cleanup because it intentionally persists attribution across downstream pages for the same lead.

### 3.4 Include Variant in Lead Sync Attributes

**Origem:** `[CRIADO]` + `[REPO EXISTENTE]`

```ts
export type LeadPayload = {
  // existing fields...
  attributes?: Record<string, unknown>
}

const payload: LeadPayload = {
  // existing fields...
  attributes: {
    email: cache.email || null,
    whatsapp: cache.whatsapp || null,
    lead_id_short: cache.lead_id_short || null,
    funnel_variant: cache.funnel_variant || null,
  },
}
```

Flow: no database column change is required for `leads`; the existing JSON `attributes` object carries the variant for operational visibility while the top-level event field remains owned by `funnelTracker`.

---

## 4. Arquitetura de Componentes

```mermaid
graph TD
    A[/alma-gemea AlmaGemea.tsx] -->|"mount effect: setFunnelVariant('presell_tarot')"| B[leadCache localStorage]
    A -->|"renders after transition"| C[AliceChat.tsx]
    C -->|"leadIdentifiedCustom"| D[createFunnelTracker]
    E[Quiz / VSL / Resultado / Checkout Pages] -->|"stepView/customEvent/checkoutStart"| D
    D -->|"base() reads leadCache.funnel_variant"| B
    D -->|"POST /eventos with top-level funnel_variant"| F[(funnel_events)]
```

---

## 5. CSS/SCSS Reference

No CSS/SCSS change is planned. `AlmaGemea.tsx` uses inline style objects, and the requested change is tracking-only.

**Adaptações necessárias:**

| Propriedade | Valor Original | Novo Valor |
|-------------|---------------|------------|
| N/A | N/A | N/A |

---

## 6. Novos Componentes

No new components are planned.

---

## 7. Componentes Modificados

### 7.1 `src/lib/leadCache.ts`

**Novos states/hooks:**
```ts
funnel_variant?: string
```

**Modificações no código existente:**
```ts
setFunnelVariant(funnel_variant: string) {
  const current = readStorage()
  const normalizedVariant = String(funnel_variant || '').trim()
  if (!normalizedVariant || current.funnel_variant === normalizedVariant) return
  writeStorage({
    ...current,
    funnel_variant: normalizedVariant,
    created_at: current.created_at || new Date().toISOString(),
  })
}
```

### 7.2 `src/lib/funnelTracker.ts`

**Modificações no código existente:**
```ts
import { leadCache } from './leadCache'

const readStoredFunnelVariant = () => {
  try {
    return String(leadCache.getAll()?.funnel_variant || '').trim() || undefined
  } catch {
    return undefined
  }
}

const base = () => {
  const funnelVariant = readStoredFunnelVariant()
  return {
    funnel_id: config.funnelId,
    lead_id: getOrCreateLeadId(leadKey),
    ...(funnelVariant ? { funnel_variant: funnelVariant } : {}),
    timestamp: new Date().toISOString()
  }
}
```

### 7.3 `src/pages/AlmaGemea.tsx`

**Novos states/hooks:**
```tsx
const PRESALE_TAROT_FUNNEL_VARIANT = 'presell_tarot';

useEffect(() => {
  leadCache.setFunnelVariant(PRESALE_TAROT_FUNNEL_VARIANT);
}, []);
```

### 7.4 `src/lib/leadSyncService.ts`

**Modificações no código existente:**
```ts
attributes: {
  email: cache.email || null,
  whatsapp: cache.whatsapp || null,
  lead_id_short: cache.lead_id_short || null,
  funnel_variant: cache.funnel_variant || null,
},
```

---

## 8. i18n Keys (se aplicável)

No i18n keys are required.

### 8.1 Novas Chaves

```json
{}
```

### 8.2 Plano de Verificação Anti-Reversão

```bash
npm run typecheck
npm run build
```

---

## 9. Files Summary

| Action | File | Risk |
|--------|------|------|
| **MODIFY** | `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/pages/AlmaGemea.tsx` | 🔴 HIGH |
| **MODIFY** | `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/leadCache.ts` | 🔴 HIGH |
| **MODIFY** | `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/funnelTracker.ts` | 🔴 HIGH |
| **MODIFY** | `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/leadSyncService.ts` | 🟡 MEDIUM |

---

## 10. Implementation Order

1. **Phase A:** Update `leadCache.ts` to store `funnel_variant`.
2. **Phase B:** Update `funnelTracker.ts` so shared `base()` attaches the persisted variant to every event payload.
3. **Phase C:** Update `AlmaGemea.tsx` to mark tarot presell entrants on mount.
4. **Phase D:** Update `leadSyncService.ts` attributes for operational visibility.
5. **Phase E:** Run validation gates before any further adjustment.

---

## 11. Rollback Plan

```
Point #1 Rollback:
├── Git Reference: HEAD before implementation
├── Files to Revert:
│   ├── /Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/pages/AlmaGemea.tsx
│   ├── /Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/leadCache.ts
│   ├── /Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/funnelTracker.ts
│   └── /Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/leadSyncService.ts
├── Revert Command: git checkout <ref> -- src/pages/AlmaGemea.tsx src/lib/leadCache.ts src/lib/funnelTracker.ts src/lib/leadSyncService.ts
└── Post-Revert Validation: npm run typecheck && npm run build
```

---

## 12. Verification Plan

| # | Test Case | Route | Expected |
|---|-----------|-------|----------|
| 1 | Tarot entrant marks cache | `/alma-gemea` | `lead_cache_app_espiritualidade.data.funnel_variant === "presell_tarot"` |
| 2 | First tarot lead event includes variant | `/alma-gemea` name submit | `lead_identified` payload contains top-level `funnel_variant: "presell_tarot"` |
| 3 | Downstream quiz events inherit variant | `/quiz`, then quiz steps | `page_view` / `step_view` payloads contain top-level `funnel_variant: "presell_tarot"` |
| 4 | Standard entry remains unchanged | `/quiz` fresh storage | event payloads do not include `funnel_variant` |
| 5 | No tracking regression | affected routes | existing `funnel_id`, `lead_id`, `session_id`, `metadata`, and `attributes` are preserved |
| 6 | Build/type gate | repo root | `npm run typecheck` and `npm run build` pass |

---

## 13. Handoff (se aplicável)

### 13.1 Backend `/eventos` / Supabase `funnel_events`

- **O que é necessário:** Confirm that the `/eventos` ingestion service maps a top-level `funnel_variant` payload field into the `public.funnel_events.funnel_variant` column. The frontend repo does not include the `funnel_events` migration/schema, so this must be validated against the backend or database after implementation approval.
- **Documento de handoff:** `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/docs/sessions/2026-05/presell-tarot-funnel-variant-planning.md`
