<!--
Session handoff for the presell tarot funnel_variant implementation.
Main responsibilities: summarize implemented files, verification gates, residual risks, and backend follow-up.
-->

# Presell Tarot Funnel Variant — Handoff

**Date:** 2026-05-08  
**Status:** Implemented and locally verified  
**Scope:** `/alma-gemea` attribution into downstream funnel event payloads

## What Changed

- `src/pages/AlmaGemea.tsx` now marks tarot presell entrants with `presell_tarot` on mount.
- `src/lib/leadCache.ts` persists `funnel_variant` in the existing local lead cache.
- `src/lib/funnelTracker.ts` reads the persisted variant and adds top-level `funnel_variant` to every event payload built through the shared tracker.
- `src/lib/leadSyncService.ts` mirrors `funnel_variant` inside `leads.attributes` for operational visibility.

## Files Changed

| File | Action |
|------|--------|
| `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/pages/AlmaGemea.tsx` | Modified |
| `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/leadCache.ts` | Modified |
| `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/funnelTracker.ts` | Modified |
| `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/leadSyncService.ts` | Modified |
| `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/docs/sessions/2026-05/presell-tarot-funnel-variant-planning.md` | Added |

## Verification

| Gate | Result |
|------|--------|
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm test` | Passed: 8 files, 32 tests |
| Bundle search | Passed: `presell_tarot`, `setFunnelVariant`, and `funnel_variant` present in built assets |
| `npm run lint` | Failed due pre-existing lint issues in `AliceChat`, `api.ts`, `AlmaGemea`, and `App.tsx`; not introduced by this change |

## Residual Risk

The frontend now sends top-level `funnel_variant` through `/eventos`. The local repository does not include the `funnel_events` schema or the `/eventos` ingestion implementation, so backend validation is still needed to confirm that field is mapped into `public.funnel_events.funnel_variant`.

## Rollback

```bash
git revert <commit_sha>
```

Or revert only implementation files:

```bash
git checkout <ref> -- src/pages/AlmaGemea.tsx src/lib/leadCache.ts src/lib/funnelTracker.ts src/lib/leadSyncService.ts
```
