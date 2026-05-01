## Recovery Template Routing Story Drafts - 2026-05-01

### Scope

- Apply `@sm` / `*draft`
- Break Epic 006 into actionable story files
- Preserve the latest planning decisions already locked in the epic

### Stories Created

- `docs/stories/6.1.recovery-template-routing-data-model.md`
- `docs/stories/6.2.recovery-dashboard-template-binding-ui.md`
- `docs/stories/6.3.recovery-backend-variable-resolution.md`
- `docs/stories/6.4.recovery-n8n-contract-validation.md`

### Key Decisions Carried Into The Drafts

1. Template routing remains `message_type + country` only.
2. There is no routing by sex anywhere in the new model.
3. `gender` can still be used as a source key for dynamic copy if needed.
4. `vw_funnel_lead_compact` is the only lead source for variable resolution in this scope.
5. `desire.question`, `desire.response[0]` and `desire.response[1]` are first-class source keys.
6. `fallback_value` exists for both `mapped_value` and `pass_through`.
7. `name + pass_through` must resolve to first-name-only with normalized casing.
8. N8N stays as a transport/orchestration layer, not a business-rules engine.

### Notes

- The architecture files expected by `core-config.yaml` were not present in the configured root locations; the drafts were grounded instead in:
  - Epic 006
  - existing Story 5.x patterns
  - direct file audit of dashboard/backend paths
  - existing schema docs in `Dashboard_2.0`
- ClickUp sync was not executed because the ClickUp tool is unavailable in this session.

### Recommended Next Step

- Hand off these drafts to `@po` for prioritization or to `@dev` when implementation is ready to begin.
