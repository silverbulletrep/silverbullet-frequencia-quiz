<!-- Session handoff for the offer_revealed tracking event and no_checkout recovery eligibility change. -->
# Offer Revealed No Checkout Handoff - 2026-05-08

## Summary

- Added frontend tracking for `offer_revealed` when `/fim` reaches `gatingComplete`.
- The event uses step `/fim-pos-pitch` and includes `source`, `gate`, `target_seconds`, `player_id`, and `route_language`.
- Updated backend recovery eligibility so `no_checkout` requires `offer_revealed` at `/fim-pos-pitch`.
- `no_checkout` now becomes due 25 minutes after the offer reveal event, not after `/resultado` or first lead event.

## Files Changed

- `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/lib/funnelTracker.ts`
- `/Users/brunogovas/Projects/Funnel_Quiz/silverbullet-frequencia-quiz/src/pages/Fim.jsx`
- `/Users/brunogovas/Projects/Silver Bullet/Projetos/Funil_Quiz_2.0/BACKEND/api/lib/recoveryDispatcher.ts`
- `/Users/brunogovas/Projects/Silver Bullet/Projetos/Funil_Quiz_2.0/BACKEND/api/lib/__tests__/recoveryDispatcher.test.ts`

## Verification

- Frontend: `npm run typecheck`
- Frontend: `npm run build`
- Backend: `npm run test:api`

## Rollout Note

Confirm that new production events arrive in `funnel_events` as `event_type = 'offer_revealed'` and `step_id = '/fim-pos-pitch'` before relying on `no_checkout` volume in production.
