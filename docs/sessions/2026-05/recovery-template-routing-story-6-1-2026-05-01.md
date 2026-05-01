## Recovery Template Routing Story 6.1 - 2026-05-01

### Scope

- Implement `Story 6.1: Data Model for Recovery Template Routing and Variable Bindings`
- Add recovery routing/binding schema in the dashboard Supabase project
- Update the schema documentation and story record

### What Was Implemented

- Added migration:
  - `../../Dashboard_2.0/dashbord/supabase/migrations/202605010002_create_recovery_template_routes_and_bindings.sql`
- Added `public.recovery_template_routes` with:
  - `message_type`
  - `country`
  - `template_id`
  - `is_active`
  - `metadata`
  - audit timestamps
  - partial unique index for one active route per `message_type + country`
- Added `public.recovery_template_bindings` with:
  - `route_id`
  - `token`
  - `source_key`
  - `source_label`
  - `resolution_mode`
  - `value_map`
  - `fallback_value`
  - `required`
  - audit timestamps
  - unique index for one token per route
- Limited V1 `source_key` values via check constraint to:
  - `name`
  - `email`
  - `phone`
  - `age`
  - `gender`
  - `country`
  - `auto_tag`
  - `desire.question`
  - `desire.response[0]`
  - `desire.response[1]`
- Updated:
  - `../../Dashboard_2.0/dashbord/supabase/docs/SCHEMA.md`
  - `docs/stories/6.1.recovery-template-routing-data-model.md`

### Important Decisions

1. Routing stays `message_type + country` only.
2. There is no sex-based routing column in the schema.
3. Bindings are anchored to `route_id`, not directly to the template catalog.
4. `message_templates` remains the source-of-truth template catalog.
5. `fallback_value` is stored for both `mapped_value` and `pass_through`.

### Validation

- Manual SQL review completed.
- `supabase db lint` was attempted in `../../Dashboard_2.0/dashbord` but failed because the local CLI database was unavailable:
  - `127.0.0.1:54322 connection refused`

### Residual Risk

- The highest-value next validation is to run the migration in a real local/dev Supabase environment and confirm:
  - the FK to `message_templates(template_id)` resolves cleanly
  - the partial unique index behaves as expected
  - the CLI lint passes with the local database available
