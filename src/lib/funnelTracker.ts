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
type Page = { url: string; path: string; title: string };
type DesireSelectedAttributes = { desire: string; question?: string; response?: string[] };

type TrackerConfig = {
  baseUrl: string;
  funnelId: string;
  leadStorageKey?: string;
  sessionStorageKey?: string;
  getCountry?: () => string | undefined;
  debug?: boolean;
};

type SendResult = { ok: boolean; via: "beacon" | "fetch" };

export const COUNTRY_KEY = "lead_country";
export const QUIZ_FUNNEL_ID = "quiz_frequencia_01";
export const ALMA_GEMEA_FUNNEL_ID = "Tarot_Quiz_01";

export const QUIZ_STEPS = {
  quiz: { id: "quiz", index: 1, name: "Quiz" },
  age: { id: "age_selection", index: 2, name: "Seleção de Idade" }
} as const;

export const ALMA_GEMEA_STEPS = {
  coleta_nome: { id: "coleta_nome", index: 1, name: "Primeira Etapa - Nome" }
} as const;

export const QUIZ_PROGRESS_STEPS = {
  age: { id: QUIZ_STEPS.age.id, index: QUIZ_STEPS.age.index },
  proofWomen: { id: "women_success", index: 3 },
  proofMen: { id: "men_success", index: 3 },
  morningFeeling: { id: "morning_feeling", index: 4 },
  transition: { id: "transition", index: 5 },
  vsl: { id: "vsl", index: 6 },
  quizStep1: { id: "quiz_step_1", index: 7 },
  quizStep2: { id: "quiz_step_2", index: 8 },
  quizStep3: { id: "quiz_step_3", index: 9 },
  quizStep4: { id: "quiz_step_4", index: 10 },
  quizStep5: { id: "quiz_step_5", index: 11 },
  quizStep6: { id: "quiz_step_6", index: 12 },
  processing: { id: "processing", index: 13 },
  resultado: { id: "resultado", index: 14 },
  fim: { id: "fim", index: 15 }
} as const;

export const getQuizStepName = (index: number) => {
  const names: Record<number, string> = {
    7: "questionario 1",
    8: "questionario 2",
    9: "questionario 3",
    10: "questionario 4",
    11: "questionario 5",
    12: "questionario 6",
    13: "processamento",
    14: "Coleta de Contato",
    15: "Video de Vendas"
  };
  return names[index] ?? `Etapa ${index}`;
};

export const buildQuizStep = (step: StepIndex): Step => ({
  ...step,
  name: getQuizStepName(step.index)
});

export const buildRouteStepIndex = (route: string, step: StepIndex): StepIndex => ({
  id: route,
  index: step.index
});

export const buildRouteStep = (route: string, step: StepIndex, name?: string): Step => ({
  id: route,
  index: step.index,
  name: name ?? getQuizStepName(step.index)
});

export const readStoredCountry = (key: string = COUNTRY_KEY) => {
  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal) return fromLocal;
  } catch {
    void 0;
  }
  return "";
};

export const getDefaultBaseUrl = () => {
  const envBase = import.meta.env.VITE_EVENTS_BASE_URL;
  if (envBase && typeof envBase === "string") return envBase;
  return "https://bkend-aquisicao-worker-redis-supabase.6jcwzd.easypanel.host";
};

const eventDedupeCache = new Map<string, number>();

export const shouldSendEvent = (key: string, windowMs: number = 2000) => {
  const now = Date.now();
  const last = eventDedupeCache.get(key);
  if (typeof last === "number" && now - last < windowMs) return false;
  eventDedupeCache.set(key, now);
  return true;
};

const generateUUID = () => {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      void 0;
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const readCookie = (name: string) => {
  try {
    const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[2]) : "";
  } catch {
    return "";
  }
};

const setCookie = (name: string, value: string, maxAgeSeconds?: number) => {
  try {
    const base = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
    const maxAge = typeof maxAgeSeconds === "number" ? `; Max-Age=${maxAgeSeconds}` : "";
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${base}${maxAge}${secure}`;
  } catch {
    void 0;
  }
};

const normalizePrefixedId = (value: string, prefix: string) => {
  if (!value) return "";
  if (value.startsWith(prefix)) return value;
  return `${prefix}${value}`;
};

const getOrCreateLeadId = (key: string) => {
  let existing = "";
  try {
    existing = localStorage.getItem(key) || "";
  } catch {
    void 0;
  }
  if (!existing) existing = readCookie(key);
  existing = normalizePrefixedId(existing, "lead_");
  if (!existing) {
    existing = `lead_${generateUUID()}`;
    try {
      localStorage.setItem(key, existing);
    } catch {
      void 0;
    }
  }
  if (existing) {
    try {
      localStorage.setItem(key, existing);
    } catch {
      void 0;
    }
  }
  setCookie(key, existing, 60 * 60 * 24 * 365);
  return existing;
};

const getOrCreateSessionId = (key: string) => {
  let existing = "";
  try {
    existing = localStorage.getItem(key) || "";
  } catch {
    void 0;
  }
  if (!existing) {
    try {
      existing = sessionStorage.getItem(key) || "";
    } catch {
      void 0;
    }
  }
  if (!existing) existing = readCookie(key);
  existing = normalizePrefixedId(existing, "sess_");
  if (!existing) {
    existing = `sess_${generateUUID()}`;
    try {
      localStorage.setItem(key, existing);
    } catch {
      void 0;
    }
    try {
      sessionStorage.setItem(key, existing);
    } catch {
      void 0;
    }
  }
  if (existing) {
    try {
      localStorage.setItem(key, existing);
    } catch {
      void 0;
    }
    try {
      sessionStorage.setItem(key, existing);
    } catch {
      void 0;
    }
  }
  setCookie(key, existing);
  return existing;
};

const buildPage = (): Page => ({
  url: window.location.href,
  path: window.location.pathname,
  title: document.title
});

const buildUtm = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source') || '';
    const campaign = params.get('utm_campaign') || '';
    if (!source && !campaign) return undefined;
    return {
      source: source || undefined,
      campaign: campaign || undefined,
    };
  } catch {
    return undefined;
  }
};

const buildMetadata = (getCountry?: () => string | undefined) => ({
  referrer: document.referrer || undefined,
  user_agent: navigator.userAgent,
  country: getCountry ? getCountry() : undefined,
  utm: buildUtm()
});

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
      if (debug) {
        console.warn("[TRACK] Beacon não enviado, fallback fetch", {
          event: payload?.event,
          funnel_id: payload?.funnel_id
        });
      }
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    });

    if (debug) {
      if (response.ok) {
        console.log("[TRACK] Enviado via fetch", {
          event: payload?.event,
          funnel_id: payload?.funnel_id,
          status: response.status
        });
      } else {
        console.warn("[TRACK] Falha no fetch", {
          event: payload?.event,
          funnel_id: payload?.funnel_id,
          status: response.status
        });
      }
    }

    return { ok: response.ok, via: "fetch" };
  };

  const base = () => ({
    funnel_id: config.funnelId,
    lead_id: getOrCreateLeadId(leadKey),
    timestamp: new Date().toISOString()
  });

  const withSession = () => {
    const sid = getOrCreateSessionId(sessionKey);
    if (debug && !sid) {
      console.error("[TRACK] session_id está vazio/null!", { sessionKey });
    }
    return { session_id: sid };
  };

  return {
    pageView: (step: Step) =>
      sendPayload({
        event: "page_view" as EventName,
        ...base(),
        ...withSession(),
        step,
        page: buildPage(),
        metadata: buildMetadata(config.getCountry)
      }),

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

    leadQualified: (step: Step, gender: string, age: number) =>
      sendPayload({
        event: "lead_qualified" as EventName,
        ...base(),
        ...withSession(),
        step,
        page: buildPage(),
        metadata: buildMetadata(config.getCountry),
        attributes: { gender, age }
      }),

    desireSelected: (desire: string) =>
      sendPayload({
        event: "desire_selected" as EventName,
        ...base(),
        ...withSession(),
        attributes: { desire }
      }),

    desireSelectedWithStep: (step: Step, attributes: DesireSelectedAttributes) =>
      sendPayload({
        event: "desire_selected" as EventName,
        ...base(),
        ...withSession(),
        step,
        attributes,
        metadata: buildMetadata(config.getCountry)
      }),

    stepProgress: (from_step: StepIndex, to_step: StepIndex) =>
      sendPayload({
        event: "step_progress" as EventName,
        ...base(),
        ...withSession(),
        from_step,
        to_step,
        page: buildPage(),
        metadata: buildMetadata(config.getCountry)
      }),

    checkoutStart: (
      step: Step,
      purchase?: { value: number; currency: string },
      attributes?: Record<string, unknown>
    ) =>
      sendPayload({
        event: "checkout_start" as EventName,
        ...base(),
        ...withSession(),
        step,
        ...(purchase ? { purchase: { value: purchase.value, currency: purchase.currency } } : {}),
        ...(attributes ? { attributes } : {})
      }),

    leadIdentified: (name: string, email: string, phone: string, step?: Step) =>
      sendPayload({
        event: "lead_identified" as EventName,
        ...base(),
        ...withSession(),
        ...(step ? { step } : {}),
        attributes: { name, email, phone }
      }),

    leadIdentifiedCustom: (step: Step, attributes: Record<string, unknown>) =>
      sendPayload({
        event: "lead_identified" as EventName,
        ...base(),
        ...withSession(),
        step,
        attributes,
        metadata: buildMetadata(config.getCountry)
      }),

    purchase: (
      order_id: string,
      product: string,
      value: number,
      currency: string,
      payment_method: string,
      is_upsell: boolean
    ) =>
      sendPayload({
        event: "purchase" as EventName,
        ...base(),
        purchase: { order_id, product, value, currency, payment_method, is_upsell }
      }),

    customEvent: (eventName: EventName, step?: Step, attributes?: Record<string, unknown>) =>
      sendPayload({
        event: eventName,
        ...base(),
        ...withSession(),
        ...(step ? { step } : {}),
        ...(attributes ? { attributes } : {}),
        metadata: buildMetadata(config.getCountry)
      }),

    getLeadId: () => getOrCreateLeadId(leadKey)
  };
};
