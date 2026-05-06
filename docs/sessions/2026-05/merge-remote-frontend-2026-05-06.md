<!-- Handoff for the merge-remote branch integration of remote frontend updates. -->

# Merge Remote Frontend - 2026-05-06

## Context

Branch: `merge-remote`

Goal: update the protected local frontend branch with remote updates from `origin/main`, while preserving local implementations that were not present remotely.

Local state was protected first with:

- `ba14d9c docs: clarify recovery no-checkout trigger`

## Implemented Commits

- `e9cbc5f feat: add remote alma gemea media assets`
- `86fbfec feat: add alma gemea lead tracking support`
- `e36e894 feat: merge remote alma gemea experience`
- `fca5733 feat: apply remote alma gemea shell optimizations`
- `2d984b6 feat: add remote alma gemea gate translations`
- `19822fc docs: add remote frontend audit note`

## Remote Updates Applied

- Added remote Alma Gemea media assets, including new public phone/video assets and `AD-10-DE.webm`.
- Added `src/hooks/useWakeLock.js`.
- Added Alma Gemea tracker support in `funnelTracker.ts`: `ALMA_GEMEA_FUNNEL_ID`, `ALMA_GEMEA_STEPS`, and `getLeadId()`.
- Added `nome` and `setNome()` support in `leadCache.ts`.
- Merged remote `AlmaGemea.tsx`, `AliceChat.tsx`, and `AliceChat.module.scss` changes for interaction gate, audio unlock, wake lock behavior, German VSL asset, and enriched lead tracking payload.
- Added shell optimizations for `/alma-gemea` in `index.html`, `App.tsx`, and `AuthorityHeader.jsx`.
- Added wake lock usage in `Fim.jsx` and `VSL.jsx`.
- Added `alma_gemea.gate` translations in PT and DE and aligned the transition copy with the remote version.
- Added remote frontend audit doc and root Alma Gemea background asset.

## Preserved Local Work

The following local work was intentionally preserved instead of overwritten by the remote diff:

- Stripe checkout modal and checkout prompt components.
- Retention modals and discount/gift flow.
- Recovery dispatcher docs, stories, migration, and runbooks.
- Local checkout tracking helper/tests where they were already more complete than the remote version.
- `JohannChat` support-discount segmentation via `/suporteDesconto`.
- Existing local i18n blocks for processing, result, Fim, retention, discount, and checkout.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 7 files and 27 tests.
- `npm run build`: passed.

Build emitted existing warnings about deprecated Sass `@import` usage and Vite chunking notices for modules imported both statically and dynamically.
