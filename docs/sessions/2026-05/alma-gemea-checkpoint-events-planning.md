<!--
Planning output for Alma Gemea checkpoint event instrumentation.
Main responsibilities: document mapped code references, implementation logic, risk, rollback, verification, and approval gate before production edits.
-->

# Alma Gemea Checkpoint Events — Planning Output (v2)

> **Status:** PLANEJADO — Aguardando aprovação  
> **Data:** 2026-05-08  
> **Scope:** `/alma-gemea`, `/de/alma-gemea`, `AliceChat`, shared funnel tracker metadata  
> **Files:** 4 arquivos (1 novo, 3 modificados)  
> **Risk:** 🔴 HIGH

---

## 1. Contexto

The `/alma-gemea` route is a tarot presell that starts in `AlmaGemea.tsx`, opens `AliceChat`, collects the user name, runs three card-selection checkpoints, shows the in-phone ad, and sends the user into the regular quiz. Today it only sends a tarot `lead_identified` event after the name is submitted. It does not emit checkpoint-level `step_view` events for the interaction gate, name step, card choices, ad view, ad completion, or quiz CTA.

Required outcome: add real funnel events to every important checkpoint in the `/alma-gemea` journey. Each event must carry a unique `step.id`/`step.name`, plus mirrored `attributes.step_id` and `attributes.step_name` so downstream tooling can read explicit `step_id` and `step_name`. `metadata.country` must be resolved for direct `/alma-gemea` traffic the same way normal quiz traffic resolves and stores country.

### Technical Mapping

Point #1: Add checkpoint events across `/alma-gemea`
├── Risk Level: 🔴 HIGH
├── Blast Radius: `/alma-gemea`, `AliceChat`, event ingestion volume for `Tarot_Quiz_01`
├── Regression Surface: duplicate events, missing lead/session continuity, extra network calls during audio/video flow
└── Confidence: HIGH for frontend event placement; MEDIUM for backend dashboard interpretation of new step IDs

- **Issue:** The tarot presell journey has several user-visible checkpoints but only one tracked lead identification event.
- **Suspected Root Cause:** `AliceChat` was built as an interactive cinematic flow first, with tracking only added at name collection.
- **Target Outcome:** Emit idempotent checkpoint events at page view, gate start, name prompt, name submitted, each card selection, ad opened/completed, and quiz CTA click.
- **Risks & Mitigation:** React dev Strict Mode and repeated handler calls can duplicate events. Mitigate with `shouldSendEvent()` keys and handler guards already present in `AliceChat`.

Point #2: Ensure every checkpoint has unique `step_id` and `step_name`
├── Risk Level: 🟡 MEDIUM
├── Blast Radius: Tarot funnel event payload shape
├── Regression Surface: downstream mapping if dashboards read `step.id` only or `attributes.step_id`
└── Confidence: HIGH

- **Issue:** Existing tracker uses `step: { id, index, name }`, but the requirement explicitly asks for `step_id` and `step_name`.
- **Suspected Root Cause:** The shared tracker normalizes step data as a nested `step` object, while external reports may expect flat names.
- **Target Outcome:** Keep the existing `step` object and mirror `step.id`/`step.name` into event attributes as `step_id` and `step_name`.
- **Risks & Mitigation:** Avoid breaking the existing schema by adding only optional attributes, not replacing `step`.

Point #3: Resolve `country` into `metadata` for direct `/alma-gemea` visits
├── Risk Level: 🔴 HIGH
├── Blast Radius: shared `funnelTracker` helpers and `/alma-gemea` initialization
├── Regression Surface: external `ipapi.co` request timing, first event metadata, existing quiz country storage conventions
└── Confidence: MEDIUM until tested with empty storage

- **Issue:** `/alma-gemea` can be a direct landing route, so `readStoredCountry()` may be empty before the normal quiz entry page stores country.
- **Suspected Root Cause:** country resolution currently lives in `InitialQuestions.jsx`, while `/alma-gemea` bypasses that page.
- **Target Outcome:** Add a shared country resolver to `funnelTracker.ts`; call it before first tarot checkpoint tracking so `metadata.country` is populated when possible.
- **Risks & Mitigation:** Network lookup can fail or take too long. Mitigate with cached country first, a 2500ms abort, locale fallback, and `"UN"` fallback matching the existing quiz entry behavior.

---

## 2. Referência de Código Mapeada

### 2.1 Shared event names, Alma funnel ID, and current Alma steps

[funnelTracker.ts L3-L43](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/funnelTracker.ts#L3-L43)

```ts
type EventName =
  | "page_view"
  | "step_view"
  | "lead_qualified"
  | "desire_selected"
  | "step_progress"
  | "checkout_start"
  | "lead_identified"
  | "purchase"
  | "discount_opened"
  | "surprise_opened"
  | "offer_revealed";

type Step = { id: string; index: number; name: string };
type StepIndex = { id: string; index: number };

export const COUNTRY_KEY = "lead_country";
export const QUIZ_FUNNEL_ID = "quiz_frequencia_01";
export const ALMA_GEMEA_FUNNEL_ID = "Tarot_Quiz_01";

export const ALMA_GEMEA_STEPS = {
  coleta_nome: { id: "coleta_nome", index: 1, name: "Primeira Etapa - Nome" }
} as const;
```

This will be extended with unique Alma checkpoint steps while preserving the current `coleta_nome` reference for compatibility.

### 2.2 Shared metadata builder already supports `country`

[funnelTracker.ts L255-L260](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/funnelTracker.ts#L255-L260)

```ts
const buildMetadata = (getCountry?: () => string | undefined) => ({
  referrer: document.referrer || undefined,
  user_agent: navigator.userAgent,
  country: getCountry ? getCountry() : undefined,
  utm: buildUtm()
});
```

This proves the event payload already has the correct metadata field. The missing piece for `/alma-gemea` is reliable stored country before the first event fires.

### 2.3 Shared `step_view` payload pattern

[funnelTracker.ts L365-L374](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/funnelTracker.ts#L365-L374)

```ts
stepView: (step: Step, attributes?: Record<string, unknown>) =>
  sendPayload({
    event: "step_view" as EventName,
    ...base(),
    ...withSession(),
    step,
    page: buildPage(),
    metadata: buildMetadata(config.getCountry),
    ...(attributes ? { attributes } : {})
  }),
```

This is the safest event type for checkpoint views because it already includes `step`, `page`, `metadata`, lead ID, and session ID.

### 2.4 Existing dedupe pattern for route step views

[QuizStep1.jsx L47-L61](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/pages/QuizStep1.jsx#L47-L61)

```jsx
useEffect(() => {
  const tracker = createFunnelTracker({
    baseUrl: getDefaultBaseUrl(),
    funnelId: QUIZ_FUNNEL_ID,
    getCountry: () => readStoredCountry() || undefined,
    debug: DEBUG
  });

  const step = buildRouteStep('/quiz-step-1', QUIZ_PROGRESS_STEPS.quizStep1);
  if (shouldSendEvent('step_view:/quiz-step-1')) {
    tracker.stepView(step).catch((err) => {
      console.error('[QUIZ_STEP1] Erro ao enviar step_view:', err);
    });
  }
}, [])
```

This pattern will be reused for Alma checkpoints, with unique dedupe keys per `step_id`.

### 2.5 Existing country resolution on normal quiz entry

[InitialQuestions.jsx L18-L73](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/pages/InitialQuestions.jsx#L18-L73)

```jsx
const normalizeCountryCode = (value) => {
  const code = String(value || '').trim()
  if (!code) return ''
  return code.toUpperCase()
}

const getCountryFromLocale = () => {
  try {
    const lang = navigator.language || ''
    const match = lang.match(/-([A-Za-z]{2})/)
    if (!match) return ''
    return normalizeCountryCode(match[1])
  } catch {
    return ''
  }
}

const storeCountry = (country) => {
  if (!country) return
  try {
    sessionStorage.setItem(COUNTRY_KEY, country)
  } catch {
    void 0
  }
  try {
    localStorage.setItem(COUNTRY_KEY, country)
  } catch {
    void 0
  }
}

const fetchCountryFromIp = async () => {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const resp = await fetch('https://ipapi.co/json/', { signal: controller.signal })
    clearTimeout(t)
    if (!resp.ok) return ''
    const data = await resp.json()
    const country = normalizeCountryCode(data?.country_code || data?.country)
    if (country) storeCountry(country)
    return country
  } catch {
    return ''
  }
}

const resolveCountry = async () => {
  const cached = readStoredCountry()
  if (cached) return cached
  const fromIp = await fetchCountryFromIp()
  if (fromIp) return fromIp
  const fromLocale = getCountryFromLocale()
  if (fromLocale) storeCountry(fromLocale)
  return fromLocale || 'UN'
}
```

This exact country behavior will be centralized into `funnelTracker.ts` and reused by `/alma-gemea`.

### 2.6 Current Alma page lifecycle and funnel variant initialization

[AlmaGemea.tsx L38-L40](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/pages/AlmaGemea.tsx#L38-L40)

```tsx
useEffect(() => {
  leadCache.setFunnelVariant(PRESALE_TAROT_FUNNEL_VARIANT);
}, []);
```

This mount effect will also resolve country and send the first tarot checkpoint event.

### 2.7 Current gate start handler in Alma page

[AlmaGemea.tsx L99-L127](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/pages/AlmaGemea.tsx#L99-L127)

```tsx
const handleStartExperience = useCallback(() => {
  // 1. Ganha o Token de Interação do Navegador
  setHasStarted(true);

  // Destrava música de fundo
  const bgAudio = document.getElementById('bg-music-audio') as HTMLAudioElement;
  if (bgAudio) {
    bgAudio.volume = 0;
    bgAudio.play().then(() => {
      bgAudio.pause();
      bgAudio.volume = 0.25;
    }).catch(e => console.log('Audio bg unlock falhou:', e));
  }

  // 3. Inicia a transição
  requestWakeLock();
  startTransition();
}, [startTransition, requestWakeLock]);
```

This is the right checkpoint for the "started experience" event because it is a real user gesture.

### 2.8 Existing Alma lead identification event

[AliceChat.tsx L388-L407](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/components/AliceChat/AliceChat.tsx#L388-L407)

```tsx
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
}).catch(err => {
  console.error('[AliceChat] Erro ao enviar lead_identified:', err);
});
```

This event already includes metadata via `leadIdentifiedCustom`; it will receive explicit `step_id` and `step_name` attributes.

### 2.9 Existing card selection handler and ad modal flow

[AliceChat.tsx L462-L620](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/components/AliceChat/AliceChat.tsx#L462-L620)

```tsx
const handleCardSelect = useCallback(async (cardIndex: number) => {
  if (isEtapaAudioPlayingRef.current) {
    setShowAudioWaitToast(true);
    setTimeout(() => setShowAudioWaitToast(false), 2800);
    return;
  }
  if (isProcessingRef.current || selectedCardIndex !== null) return;
  isProcessingRef.current = true;

  setSelectedCardIndex(cardIndex);
  setIsFlipping(true);

  let card: RevealedCardInfo;
  let revealText: string;
  let nextStage: GameState;

  if (gameState === 1) {
    card = TIRAGEM_1[gender];
    revealText = gender === 'F' ? personalize(COPIES.tiragem1RevealF, userName) : personalize(COPIES.tiragem1RevealM, userName);
    nextStage = 2;
  } else if (gameState === 2) {
    card = TIRAGEM_2;
    revealText = personalize(COPIES.tiragem2Reveal, userName);
    nextStage = 3;
  } else {
    card = TIRAGEM_3;
    revealText = personalize(COPIES.tiragem3Reveal, userName);
    nextStage = 4;
  }

  await new Promise(r => setTimeout(r, 1200));
  setPanelState('hidden');
  setRevealedCards(prev => [...prev, card]);
  setIsFlipping(false);

  // ...

  if (gameState === 3) {
    // ...
    setIsPhoneOn(true);
    setPhoneImage('on');
    setShowTapHint(true);
  } else {
    // ...
    setPanelState('buttons');
  }

  isProcessingRef.current = false;
}, [gameState, gender, userName, showMessage, startTiragem, playAudio, COPIES, TIRAGEM_1, TIRAGEM_2, TIRAGEM_3]);
```

This is where card selection events should be placed.

### 2.10 Existing ad open/completion and CTA handlers

[AliceChat.tsx L419-L459](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/components/AliceChat/AliceChat.tsx#L419-L459)

```tsx
const abrirVSL = useCallback(() => {
  if (!isPhoneOn) return;
  setIsPhoneModalOpen(true);
  setShowTapHint(false);
}, [isPhoneOn]);

const handleClosePhoneModal = useCallback(() => {
  setIsPhoneModalOpen(false);
  setActiveMessage('__PORTA_RETRATO__');
  setIsPhoneOn(false);
  setPhoneImage('off');

  const etapa9Audio = playAudio('/Audio/alice/etapa_9.mp3');

  const onEtapa9End = () => {
    const etapa10Audio = playAudio('/Audio/alice/etapa_10.mp3');
    setTimeout(() => {
      setIsPhoneOn(true);
      setPhoneImage('exame');
      setShowTapHint(false);
      setPanelState('cta');
    }, 5000);
  };

  // ...
}, [playAudio]);

const handleCTA = useCallback(() => {
  window.location.href = withTrackingParams(asset(`/${lang}/quiz`));
}, [lang]);
```

These handlers map directly to "ver anúncio", "ad completed", and "quiz CTA clicked" checkpoints.

### 2.11 Context7 React lifecycle reference

Context7 `/reactjs/react.dev` confirms that `useEffect` is the correct place to synchronize a component with external systems, including analytics. It also notes that dev Strict Mode can run effects twice, so event calls must be idempotent.

```js
useEffect(() => {
  logVisit(url);
}, [url]);
```

This supports using `shouldSendEvent()` for mount/open checkpoint effects and handler-level dedupe for interaction checkpoints.

---

## 3. Lógica de Implementação

### 3.1 Centralize country resolution for tracking metadata

**Origem:** `[REPO EXISTENTE]` + `[CRIADO]`

```ts
const normalizeCountryCode = (value: string) => {
  const code = String(value || "").trim();
  if (!code) return "";
  return code.toUpperCase();
};

export const storeCountry = (country: string, key: string = COUNTRY_KEY) => {
  const normalized = normalizeCountryCode(country);
  if (!normalized) return "";
  try {
    sessionStorage.setItem(key, normalized);
  } catch {
    void 0;
  }
  try {
    localStorage.setItem(key, normalized);
  } catch {
    void 0;
  }
  return normalized;
};

const getCountryFromLocale = () => {
  try {
    const lang = navigator.language || "";
    const match = lang.match(/-([A-Za-z]{2})/);
    if (!match) return "";
    return normalizeCountryCode(match[1]);
  } catch {
    return "";
  }
};

export const resolveTrackingCountry = async () => {
  const cached = readStoredCountry();
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2500);
    const resp = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    window.clearTimeout(timer);
    if (resp.ok) {
      const data = await resp.json();
      const country = storeCountry(data?.country_code || data?.country || "");
      if (country) return country;
    }
  } catch {
    void 0;
  }

  const fromLocale = storeCountry(getCountryFromLocale());
  return fromLocale || "UN";
};
```

Flow: reuse the same country order as `InitialQuestions.jsx`: cached storage, IP lookup, browser locale, then `UN`. This ensures `metadata.country` is present for direct Alma traffic before the first event when the lookup succeeds.

### 3.2 Expand Alma checkpoint step map

**Origem:** `[CRIADO]` + `[REPO EXISTENTE]`

```ts
export const ALMA_GEMEA_STEPS = {
  page_view: { id: "alma_gemea_page_view", index: 1, name: "Alma Gemea - Page View" },
  gate_started: { id: "alma_gemea_gate_started", index: 2, name: "Alma Gemea - Start Experience" },
  transition_completed: { id: "alma_gemea_transition_completed", index: 3, name: "Alma Gemea - Transition Completed" },
  name_prompt: { id: "alma_gemea_name_prompt", index: 4, name: "Alma Gemea - Escolher Nome" },
  coleta_nome: { id: "alma_gemea_name_submitted", index: 5, name: "Alma Gemea - Nome Enviado" },
  card_1_selected: { id: "alma_gemea_card_1_selected", index: 6, name: "Alma Gemea - Carta 1 Selecionada" },
  card_2_selected: { id: "alma_gemea_card_2_selected", index: 7, name: "Alma Gemea - Carta 2 Selecionada" },
  card_3_selected: { id: "alma_gemea_card_3_selected", index: 8, name: "Alma Gemea - Carta 3 Selecionada" },
  ad_opened: { id: "alma_gemea_ad_opened", index: 9, name: "Alma Gemea - Ver Anuncio" },
  ad_completed: { id: "alma_gemea_ad_completed", index: 10, name: "Alma Gemea - Anuncio Concluido" },
  quiz_cta_clicked: { id: "alma_gemea_quiz_cta_clicked", index: 11, name: "Alma Gemea - Ir Para Quiz" }
} as const;
```

Flow: every checkpoint receives a stable unique ID and readable name. Names use ASCII in code for safer payload consistency.

### 3.3 New Alma tracking helper

**Origem:** `[CRIADO]`

```ts
import {
  ALMA_GEMEA_FUNNEL_ID,
  createFunnelTracker,
  getDefaultBaseUrl,
  readStoredCountry,
  shouldSendEvent
} from "./funnelTracker";

import type { ALMA_GEMEA_STEPS } from "./funnelTracker";

type AlmaStep = (typeof ALMA_GEMEA_STEPS)[keyof typeof ALMA_GEMEA_STEPS];

export const trackAlmaGemeaCheckpoint = (
  step: AlmaStep,
  attributes: Record<string, unknown> = {}
) => {
  const dedupeKey = `alma_gemea:step_view:${step.id}`;
  if (!shouldSendEvent(dedupeKey, 1500)) return Promise.resolve({ ok: false, via: "fetch" as const });

  const tracker = createFunnelTracker({
    baseUrl: getDefaultBaseUrl(),
    funnelId: ALMA_GEMEA_FUNNEL_ID,
    getCountry: () => readStoredCountry() || undefined,
    debug: import.meta.env.DEV
  });

  return tracker.stepView(step, {
    step_id: step.id,
    step_name: step.name,
    ...attributes
  });
};
```

Flow: this helper keeps Alma checkpoint events consistent and prevents repeated step views from rapid re-renders or dev-mode effect duplication.

### 3.4 Track page entry and gate start in `AlmaGemea.tsx`

**Origem:** `[CRIADO]` + `[REPO EXISTENTE]` + `[CONTEXT7]`

```tsx
useEffect(() => {
  let cancelled = false;

  const initTracking = async () => {
    leadCache.setFunnelVariant(PRESALE_TAROT_FUNNEL_VARIANT);
    await resolveTrackingCountry();
    if (cancelled) return;

    trackAlmaGemeaCheckpoint(ALMA_GEMEA_STEPS.page_view, {
      lang,
      funnel_origin: `alma-gemea-${lang}`,
    }).catch((err) => {
      console.error('[AlmaGemea] Erro ao enviar page checkpoint:', err);
    });
  };

  initTracking();

  return () => {
    cancelled = true;
  };
}, [lang]);

const handleStartExperience = useCallback(() => {
  setHasStarted(true);

  trackAlmaGemeaCheckpoint(ALMA_GEMEA_STEPS.gate_started, {
    lang,
    funnel_origin: `alma-gemea-${lang}`,
  }).catch((err) => {
    console.error('[AlmaGemea] Erro ao enviar gate checkpoint:', err);
  });

  requestWakeLock();
  startTransition();
}, [lang, startTransition, requestWakeLock]);
```

Flow: the mount effect resolves country before sending the first checkpoint. The gate event is tied to a real click and keeps the existing audio/wake-lock behavior.

### 3.5 Track chat open, name prompt, and name submission in `AliceChat.tsx`

**Origem:** `[CRIADO]` + `[REPO EXISTENTE]`

```tsx
const trackCheckpoint = useCallback((step: (typeof ALMA_GEMEA_STEPS)[keyof typeof ALMA_GEMEA_STEPS], attributes = {}) => {
  return trackAlmaGemeaCheckpoint(step, {
    lang,
    funnel_origin: `alma-gemea-${lang}`,
    ...attributes
  }).catch((err) => {
    console.error('[AliceChat] Erro ao enviar checkpoint:', err);
  });
}, [lang]);

const startState0 = useCallback(async () => {
  if (isProcessingRef.current) return;
  isProcessingRef.current = true;
  setPanelState('hidden');
  setRevealedCards([]);

  await trackCheckpoint(ALMA_GEMEA_STEPS.name_prompt, {
    game_state: 0,
  });

  // existing audio/message flow remains unchanged
}, [trackCheckpoint, playAudio, COPIES]);

tracker.leadIdentifiedCustom(ALMA_GEMEA_STEPS.coleta_nome, {
  step_id: ALMA_GEMEA_STEPS.coleta_nome.id,
  step_name: ALMA_GEMEA_STEPS.coleta_nome.name,
  name: formattedName,
  lead_id: currentLeadId,
  lang,
  funnel_origin: `alma-gemea-${lang}`,
}).catch(err => {
  console.error('[AliceChat] Erro ao enviar lead_identified:', err);
});
```

Flow: the name prompt is a `step_view`; name submission keeps the current `lead_identified` event but gains explicit `step_id` and `step_name`.

### 3.6 Track card selections

**Origem:** `[CRIADO]` + `[REPO EXISTENTE]`

```tsx
const getCardSelectedStep = (state: GameState) => {
  if (state === 1) return ALMA_GEMEA_STEPS.card_1_selected;
  if (state === 2) return ALMA_GEMEA_STEPS.card_2_selected;
  return ALMA_GEMEA_STEPS.card_3_selected;
};

const handleCardSelect = useCallback(async (cardIndex: number) => {
  if (isEtapaAudioPlayingRef.current) {
    setShowAudioWaitToast(true);
    setTimeout(() => setShowAudioWaitToast(false), 2800);
    return;
  }
  if (isProcessingRef.current || selectedCardIndex !== null) return;
  isProcessingRef.current = true;

  const selectedStep = getCardSelectedStep(gameState);

  // existing card calculation remains unchanged

  await trackCheckpoint(selectedStep, {
    selected_card_position: cardIndex + 1,
    tarot_card_name: card.name,
    game_state: gameState,
  });
}, [gameState, selectedCardIndex, trackCheckpoint]);
```

Flow: Selection events fire after the existing guard accepts the click, so blocked clicks do not count.

### 3.7 Track ad open/completed and quiz CTA

**Origem:** `[CRIADO]` + `[REPO EXISTENTE]`

```tsx
const abrirVSL = useCallback(() => {
  if (!isPhoneOn) return;

  trackCheckpoint(ALMA_GEMEA_STEPS.ad_opened, {
    game_state: gameState,
    phone_image: phoneImage,
  });

  setIsPhoneModalOpen(true);
  setShowTapHint(false);
}, [isPhoneOn, gameState, phoneImage, trackCheckpoint]);

const handleClosePhoneModal = useCallback(() => {
  trackCheckpoint(ALMA_GEMEA_STEPS.ad_completed, {
    video_progress: Math.round(videoProgress),
    lang,
  });

  setIsPhoneModalOpen(false);
  // existing close flow remains unchanged
}, [playAudio, trackCheckpoint, videoProgress, lang]);

const handleCTA = useCallback(() => {
  trackCheckpoint(ALMA_GEMEA_STEPS.quiz_cta_clicked, {
    destination: `/${lang}/quiz`,
  }).finally(() => {
    window.location.href = withTrackingParams(asset(`/${lang}/quiz`));
  });
}, [lang, trackCheckpoint]);
```

Flow: ad open is user-triggered, ad completed is tied to the existing video `onEnded`, and CTA tracking gets a short chance to send before navigation via `sendBeacon`/`keepalive` fallback.

---

## 4. Arquitetura de Componentes

```mermaid
graph TD
    A[AlmaGemea.tsx] -->|"resolveTrackingCountry + page/gate checkpoints"| B[almaGemeaTracking.ts]
    C[AliceChat.tsx] -->|"name/card/ad/cta checkpoints"| B
    B -->|"createFunnelTracker(...Tarot_Quiz_01)"| D[funnelTracker.ts]
    D -->|"metadata.country from readStoredCountry"| E[/eventos worker]
    D -->|"lead_id/session_id/funnel_variant"| E
    A -->|"isOpen/lang props"| C
```

---

## 5. CSS/SCSS Reference

No CSS/SCSS changes are planned.

### 5.1 Existing SCSS integration remains unchanged

[AliceChat.tsx L18-L28](file:///Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/components/AliceChat/AliceChat.tsx#L18-L28)

```tsx
import { asset } from '@/lib/asset';
import styles from './AliceChat.module.scss';
import { leadCache } from '@/lib/leadCache';
import { withTrackingParams } from '@/lib/trackingParams';
import {
  createFunnelTracker,
  getDefaultBaseUrl,
  readStoredCountry,
  ALMA_GEMEA_FUNNEL_ID,
  ALMA_GEMEA_STEPS
} from '@/lib/funnelTracker';
```

**Adaptações necessárias:**

| Propriedade | Valor Original | Novo Valor |
|-------------|---------------|------------|
| CSS/SCSS | `AliceChat.module.scss` unchanged | unchanged |
| Visual UI | Current cinematic tarot flow | unchanged |
| Inline Alma styles | Current `styles` object | unchanged |

---

## 6. Novos Componentes

No React components will be created.

### 6.1 `almaGemeaTracking.ts`

**Path:** `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/almaGemeaTracking.ts`

#### Exports

```ts
{
  trackAlmaGemeaCheckpoint: (
    step: AlmaStep,
    attributes?: Record<string, unknown>
  ) => Promise<SendResult>
}
```

#### Lógica Core

```ts
export const trackAlmaGemeaCheckpoint = (
  step: AlmaStep,
  attributes: Record<string, unknown> = {}
) => {
  const dedupeKey = `alma_gemea:step_view:${step.id}`;
  if (!shouldSendEvent(dedupeKey, 1500)) return Promise.resolve({ ok: false, via: "fetch" as const });

  const tracker = createFunnelTracker({
    baseUrl: getDefaultBaseUrl(),
    funnelId: ALMA_GEMEA_FUNNEL_ID,
    getCountry: () => readStoredCountry() || undefined,
    debug: import.meta.env.DEV
  });

  return tracker.stepView(step, {
    step_id: step.id,
    step_name: step.name,
    ...attributes
  });
};
```

---

## 7. Componentes Modificados

### 7.1 `funnelTracker.ts`

**New exports:**

```ts
export const resolveTrackingCountry = async () => {
  const cached = readStoredCountry();
  if (cached) return cached;
  // ipapi -> locale -> UN fallback
};
```

**Modified constants:**

```ts
export const ALMA_GEMEA_STEPS = {
  page_view: { id: "alma_gemea_page_view", index: 1, name: "Alma Gemea - Page View" },
  // ...
  quiz_cta_clicked: { id: "alma_gemea_quiz_cta_clicked", index: 11, name: "Alma Gemea - Ir Para Quiz" }
} as const;
```

### 7.2 `AlmaGemea.tsx`

**New imports:**

```tsx
import {
  ALMA_GEMEA_STEPS,
  resolveTrackingCountry
} from '@/lib/funnelTracker';
import { trackAlmaGemeaCheckpoint } from '@/lib/almaGemeaTracking';
```

**Modifications:**

```tsx
useEffect(() => {
  let cancelled = false;

  const initTracking = async () => {
    leadCache.setFunnelVariant(PRESALE_TAROT_FUNNEL_VARIANT);
    await resolveTrackingCountry();
    if (cancelled) return;
    await trackAlmaGemeaCheckpoint(ALMA_GEMEA_STEPS.page_view, { lang });
  };

  initTracking();
  return () => {
    cancelled = true;
  };
}, [lang]);
```

### 7.3 `AliceChat.tsx`

**New helper use:**

```tsx
const trackCheckpoint = useCallback((step, attributes = {}) => {
  return trackAlmaGemeaCheckpoint(step, {
    lang,
    funnel_origin: `alma-gemea-${lang}`,
    ...attributes
  });
}, [lang]);
```

**Exact event placement:**

```tsx
await trackCheckpoint(ALMA_GEMEA_STEPS.name_prompt, { game_state: 0 });
await trackCheckpoint(ALMA_GEMEA_STEPS.card_1_selected, { selected_card_position: cardIndex + 1 });
await trackCheckpoint(ALMA_GEMEA_STEPS.ad_opened, { game_state, phone_image: phoneImage });
await trackCheckpoint(ALMA_GEMEA_STEPS.ad_completed, { video_progress: Math.round(videoProgress) });
await trackCheckpoint(ALMA_GEMEA_STEPS.quiz_cta_clicked, { destination: `/${lang}/quiz` });
```

---

## 8. i18n Keys

No i18n changes are planned.

### 8.1 Novas Chaves

```json
{}
```

### 8.2 Plano de Verificação Anti-Reversão

```bash
git diff -- src/i18n/locales/pt/translation.json src/i18n/locales/de/translation.json
```

Expected: no diff.

---

## 9. Files Summary

| Action | File | Risk |
|--------|------|------|
| **NEW** | `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/almaGemeaTracking.ts` | 🟡 MEDIUM |
| **MODIFY** | `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/funnelTracker.ts` | 🔴 HIGH |
| **MODIFY** | `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/pages/AlmaGemea.tsx` | 🔴 HIGH |
| **MODIFY** | `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/components/AliceChat/AliceChat.tsx` | 🔴 HIGH |

---

## 10. Implementation Order

1. **Phase A:** Add `resolveTrackingCountry`, `storeCountry`, and expanded `ALMA_GEMEA_STEPS` in `funnelTracker.ts`.
2. **Phase B:** Add `src/lib/almaGemeaTracking.ts` with idempotent checkpoint helper.
3. **Phase C:** Instrument `AlmaGemea.tsx` page entry and interaction gate.
4. **Phase D:** Instrument `AliceChat.tsx` name, card selections, ad, and quiz CTA checkpoints.
5. **Phase E:** Run typecheck/build and manually validate payloads in browser Network tab for `/alma-gemea` and `/de/alma-gemea`.

---

## 11. Rollback Plan

```
Point #1 Rollback:
├── Git Reference: 9a00cfe before implementation
├── Files to Revert:
│   ├── /Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/almaGemeaTracking.ts
│   ├── /Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/funnelTracker.ts
│   ├── /Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/pages/AlmaGemea.tsx
│   └── /Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/components/AliceChat/AliceChat.tsx
├── Revert Command:
│   git checkout 9a00cfe -- src/lib/funnelTracker.ts src/pages/AlmaGemea.tsx src/components/AliceChat/AliceChat.tsx
│   git rm src/lib/almaGemeaTracking.ts
└── Post-Revert Validation:
    npm run typecheck
```

---

## 12. Verification Plan

| # | Test Case | Route | Expected |
|---|-----------|-------|----------|
| 1 | Empty storage direct page load | `/alma-gemea` | first `step_view` has `funnel_id: Tarot_Quiz_01`, `step.id: alma_gemea_page_view`, `attributes.step_id`, `attributes.step_name`, and `metadata.country` |
| 2 | Interaction gate click | `/alma-gemea` | event `alma_gemea_gate_started` fires once after click |
| 3 | Name prompt displayed | `/alma-gemea` | event `alma_gemea_name_prompt` fires once when input panel opens |
| 4 | Name submitted | `/alma-gemea` | existing `lead_identified` fires with `step.id: alma_gemea_name_submitted`, `attributes.step_id`, `attributes.step_name`, `metadata.country` |
| 5 | Card 1 selection | `/alma-gemea` | selected event uses unique card 1 step ID and include selected card position |
| 6 | Card 2 selection | `/alma-gemea` | selected event uses unique card 2 step ID |
| 7 | Card 3 selection | `/alma-gemea` | selected event uses unique card 3 step ID |
| 8 | Ad opened | `/alma-gemea` | `alma_gemea_ad_opened` fires once when phone is clicked |
| 9 | Ad completed | `/alma-gemea` | `alma_gemea_ad_completed` fires when video ends with video progress attribute |
| 10 | CTA to quiz | `/alma-gemea` | `alma_gemea_quiz_cta_clicked` fires before navigation to `/{lang}/quiz` |
| 11 | German route parity | `/de/alma-gemea` | same event IDs fire with `lang: de` |
| 12 | Build validation | n/a | `npm run typecheck` and `npm run build` pass |

---

## 13. Handoff

### 13.1 Backend/events dashboard

- **O que é necessário:** Confirm that the event consumer/dashboard should read `step.id`/`step.name` or the mirrored `attributes.step_id`/`attributes.step_name`. This plan sends both for compatibility.
- **Documento de handoff:** `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/docs/sessions/2026-05/alma-gemea-checkpoint-events-handoff.md` after implementation and validation.
