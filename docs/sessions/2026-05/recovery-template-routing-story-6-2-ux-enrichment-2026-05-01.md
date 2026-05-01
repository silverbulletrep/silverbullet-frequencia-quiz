## Recovery Template Routing Story 6.2 UX Enrichment - 2026-05-01

### Scope

- Apply `ux-design-expert` guidance to enrich Story 6.2
- Add explicit component reuse guidance
- Add design-system adherence requirements for the future implementation

### Story Updated

- `docs/stories/6.2.recovery-dashboard-template-binding-ui.md`

### What Was Added

1. New acceptance criteria requiring:
   - reuse of the current dashboard layout and primitives
   - reuse of existing components/patterns before creating new visual blocks
2. New task set for design-system adherence
3. Existing component inventory for reuse, including:
   - `Templates.tsx`
   - `CreationModal.tsx`
   - `TemplateVariableResolutionModal.tsx`
   - `MetaWhatsappTemplateEditor.tsx`
   - `SyncStatus.tsx`
   - `RecoveryAnalyticsPage.tsx`
   - `AppLayout.tsx`
4. Explicit design guardrails:
   - stay inside MUI + current dashboard theme system
   - avoid a parallel visual language
   - avoid JSON-as-primary-UI for `value_map`
   - preserve responsive behavior and spacing patterns already used in the app

### Implementation Intent Locked In

- Story 6.2 should feel like an extension of `/templates`, not a separate admin tool.
- New components may live in `src/components/RecoveryTemplateRouting/`, but only after checking reuse from `Templates/` and shared dashboard patterns.
- The implementation should use the same structural rhythm as the rest of the dashboard: `AppLayout`, responsive `Container`, MUI cards/forms/dialogs, and current theme tokens.
