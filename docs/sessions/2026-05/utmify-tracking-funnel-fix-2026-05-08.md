<!--
Session handoff: documents the UTMify tracking fix, touched files, verification,
and follow-up checks for the paid-traffic sales funnel.
-->

# UTMify Tracking Funnel Fix - 2026-05-08

## Context

The DTC funnel moves leads quickly from Meta ads through `/alma-gemea` or `/quiz` into `/fim` and external checkouts. UTMify was showing sales with empty UTMs, so attribution by ad/campaign was being lost.

## Root Cause

- Several route transitions rebuilt URLs without preserving `location.search`.
- The existing global UTM persistence ran in `useEffect`, so route scripts and checkout code could execute before UTMs were restored.
- `/alma-gemea` redirected into `/quiz` with `window.location.href = asset(...)`, discarding query params immediately.
- Hotmart checkout URLs only received payment/email/lead parameters, not the persisted UTMs.
- The UTMify script was configured with `data-utmify-prevent-xcod-sck`, while UTMify's Hotmart snippet uses only `data-utmify-prevent-subids`.

## Changes

- Added `src/lib/trackingParams.ts` to persist UTM/click-id params in session/local storage and synchronously merge them into internal routes and external checkout URLs.
- Updated fast funnel navigations to use `withTrackingParams`.
- Updated Hotmart checkout URL building and AudioUpsell fallback links to append stored tracking params.
- Added tracking params into Stripe/PayPal metadata and Stripe return URLs.
- Adjusted Stripe Checkout Session success/cancel URLs to include tracking params from metadata.
- Updated the UTMify script attributes in `index.html` to match the Hotmart recommendation.

## Verification

- `npm run typecheck` passed.
- `npm run build` passed.

## Follow-Up

- Run a production URL test with a full Meta-style query string through `/alma-gemea` and `/quiz`.
- Confirm `/fim` and Hotmart checkout URLs include `utm_source`, `utm_campaign`, `utm_medium`, `utm_content`, and `utm_term`.
- In UTMify, monitor the next tracked sales and compare the "UTMs Vazias" count after deployment.
