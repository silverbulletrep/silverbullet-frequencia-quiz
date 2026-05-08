<!--
Handoff for Meta/Hotmart xcod tracking preservation implementation.
Main responsibilities: summarize changed files, validation commands, runtime notes, and follow-up checks.
-->

# Meta/Hotmart XCOD Tracking Preservation — Handoff

> **Date:** 2026-05-08  
> **Status:** Implemented and locally validated  
> **Related pre-flight:** `docs/sessions/2026-05/meta-hotmart-xcod-tracking-preflight.md`

## Summary

The funnel now treats `xcod` as a first-party attribution parameter alongside `utm_*` and click IDs.

This means a Meta Ads URL containing:

```text
utm_source=FB&utm_campaign=...&utm_medium=...&utm_content=...&utm_term=...&xcod=...
```

will persist `xcod` in `persisted_query_tracking`, reapply it to funnel routes, append it to Hotmart checkout URLs, and include it in checkout metadata paths that call `getTrackingParams()`.

## Files Changed

| Action | File |
|--------|------|
| Modified | `src/lib/trackingParams.ts` |
| Added | `src/lib/__tests__/trackingParams.test.ts` |
| Modified | `src/lib/__tests__/hotmartCheckout.test.ts` |

## Validation

Passed:

```bash
npx vitest run src/lib/__tests__/trackingParams.test.ts src/lib/__tests__/hotmartCheckout.test.ts
npm run typecheck
```

Additional local smoke:

```text
tracking-smoke:pass
```

Dev server:

```text
Vite served frontend at http://localhost:3006/
```

Runtime note: the local backend reported missing Stripe/Supabase env configuration. This was pre-existing environment configuration and did not block the frontend tracking utility validation.

Playwright note: `npx playwright --version` attempted to reach npm registry and failed due restricted network. Browser automation was not used.

## Deployment Check

After deploy, validate one real click URL from Meta Ads through `/fim` and confirm the final Hotmart URL includes:

```text
utm_source
utm_campaign
utm_medium
utm_content
utm_term
xcod
```

No database schema changes were made.
