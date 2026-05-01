## Recovery Template Routing Epic Handoff - 2026-05-01

### Scope

- Apply `@pm` / `*create-epic`
- Create a new epic for recovery template routing and variable resolution
- Reflect the latest planning decisions from the brainstorm

### Epic Created

- `docs/stories/epic-006-recovery-template-routing-and-variable-resolution.md`

### Decisions Locked Into Epic 006

1. Template routing is no longer by sex.
2. Template routing is configured by `message_type + country`.
3. Sex-based wording is now handled only through dynamic variables if a template binds to `gender`.
4. Variable source keys must come only from `vw_funnel_lead_compact`.
5. JSONB subpaths are explicitly supported for source keys, especially:
   - `desire.question`
   - `desire.response[0]`
   - `desire.response[1]`
6. `vw_funnel_lead_compact.desire` is now the official backend source for lead desires.
7. The dashboard must allow per-placeholder configuration of:
   - `source_key`
   - user-facing display text for source key options
   - `resolution_mode`
   - template-specific `value_map`
8. Two official variable modes were captured:
   - `pass_through`
   - `mapped_value`

### Why This Became a New Epic

- The enhancement crosses three bounded areas:
  - dashboard configuration
  - backend resolution
  - N8N contract/operational validation
- It is larger than the earlier dispatch-only epic and needs its own delivery track.

### Research / Audit Basis Used

- Existing dashboard template CRUD and Meta payload persistence
- Existing recovery backend dispatcher and N8N sender
- Live Supabase evidence for:
  - `message_templates`
  - `recovery_runs`
  - `vw_funnel_lead_compact.gender`
  - `vw_funnel_lead_compact.desire`
  - real `funnel_events` at `/morning-feeling`

### Follow-up Suggested

- Next formal step should be `@sm` story breakdown for:
  - `6.1.recovery-template-routing-data-model.md`
  - `6.2.recovery-dashboard-template-binding-ui.md`
  - `6.3.recovery-backend-variable-resolution.md`
  - `6.4.recovery-n8n-contract-validation.md`
