<!--
Handoff for Hotmart InitiateCheckout pixel event implementation.
Main responsibilities: summarize the IC trigger point, modified files, validation, and production checks.
-->

# Hotmart InitiateCheckout — Handoff

> **Date:** 2026-05-08  
> **Status:** Implemented and locally validated  
> **Scope:** Front offer Hotmart checkout entry from `FimBelowFold.jsx`

## Summary

The Hotmart redirect path now initializes the Meta Pixel and fires `InitiateCheckout` before sending the user to Hotmart.

The trigger runs after internal `checkout_start` tracking succeeds/fails and before `window.location.href = checkoutUrl`.

## Files Changed

| Action | File |
|--------|------|
| Modified | `src/pages/FimBelowFold.jsx` |

## Behavior

- Stripe/modal checkout path is unchanged; it already fires `InitiateCheckout` when `CheckoutModal` mounts.
- Hotmart/PT redirect path now calls `initMetaPixel()` and `trackInitiateCheckout(checkoutValue, 'EUR')`.
- Pixel errors are caught and do not block checkout navigation.
- Redirect buffer was increased from `80ms` to `120ms` to give the browser a small window to enqueue the pixel call.

## Validation

Passed:

```bash
npm run typecheck
npm run build
```

Build notes:

- Build passed.
- Existing Sass `@import` deprecation warnings remain unrelated to this change.

## Production Check

After deploy:

1. Open a real `/pt/fim` path with Meta parameters.
2. Click through to the Hotmart payment method/checkout redirect.
3. Confirm the browser reaches Hotmart normally.
4. Confirm Meta Events Manager or Meta Pixel Helper receives `InitiateCheckout` for pixel `1365856334837391`.
5. Confirm the final Hotmart URL still includes `xcod` and UTM parameters.
