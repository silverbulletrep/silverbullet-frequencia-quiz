/**
 * ═══════════════════════════════════════════════════════════
 * 🔮 Alma Gemea Tracking Helper
 * ═══════════════════════════════════════════════════════════
 * Centraliza a lógica de instrumentação para o funil de Tarot.
 * Garante idempotência e consistência nos atributos de cada checkpoint.
 */

import {
  ALMA_GEMEA_FUNNEL_ID,
  createFunnelTracker,
  getDefaultBaseUrl,
  readStoredCountry,
  shouldSendEvent
} from "./funnelTracker";

import type { ALMA_GEMEA_STEPS, SendResult } from "./funnelTracker";

type AlmaStep = (typeof ALMA_GEMEA_STEPS)[keyof typeof ALMA_GEMEA_STEPS];

/**
 * Envia um evento de step_view para o funil de Tarot com de-duplicação de 1.5s.
 * Adiciona automaticamente os campos step_id e step_name aos atributos.
 */
export const trackAlmaGemeaCheckpoint = (
  step: AlmaStep,
  attributes: Record<string, unknown> = {}
): Promise<SendResult> => {
  const dedupeKey = `alma_gemea:step_view:${step.id}`;
  if (!shouldSendEvent(dedupeKey, 1500)) {
    return Promise.resolve({ ok: false, via: "fetch" as const });
  }

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
