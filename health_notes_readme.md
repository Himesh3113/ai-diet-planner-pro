# Health Condition Notes V1 (Implementation Notes)

This document describes what was implemented for **Health Condition Notes V1** in the active project.

## What’s included
- **Editable health condition cards** on the dashboard.
- **Textareas per condition**:
  - acne
  - migraine
  - knee_pain
  - hair_fall
- **Supabase persistence**:
  - Notes are fetched on dashboard load.
  - Notes are saved back to Supabase (upsert by `user_id`).
- **Loading + saving states** in the UI.
- **Supabase schema** additions:
  - `public.health_condition_notes` table (one row per user).
  - RLS enabled with policies scoped to `auth.uid() = user_id`.
  - `created_at` and `updated_at` timestamps.

## Files changed
- `src/components/dashboard/health-dashboard/health-conditions-section.tsx`
- `supabase_schema.sql`

## Supabase table: `public.health_condition_notes`
Columns:
- `user_id` uuid (PK, FK -> `public.profiles.id`)
- `acne` text
- `migraine` text
- `knee_pain` text
- `hair_fall` text
- `created_at`, `updated_at`

## UI behavior
- On mount, the component calls Supabase to fetch the user’s row from `health_condition_notes`.
- Each card opens an editor panel.
- Clicking **Save note** triggers an upsert.
- Buttons are disabled while loading/saving.

## Next step
- Run migrations / apply `supabase_schema.sql` updates to your Supabase project.
- Deploy the updated Next.js app.

