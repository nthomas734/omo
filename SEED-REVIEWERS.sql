-- omo — SEED-REVIEWERS.sql
-- ============================================================
-- The two reviewers. Without these rows the Reviews tab is inert.
--
-- Why this file exists: omo_reviewers is created by SCHEMA-SYNC.sql but
-- deliberately has NO anon insert policy — reviewers are seeded by hand in
-- the Supabase SQL editor, not created through the app. That means a
-- rebuilt omo comes up with zero reviewers, and since every review is keyed
-- (option_id, reviewer_id), the entire Reviews tab has nothing to work
-- with. Until 2026-07-18 these two rows existed only in the live database.
--
-- Exported verbatim from live on 2026-07-18. Run AFTER SCHEMA-SYNC.sql
-- (which creates the table). Idempotent on `name`, so re-running is safe.
--
-- The original ids are preserved deliberately. omo_reviews rows reference
-- reviewer_id, and the app's identity cookie (`omo_reviewer_id`, see
-- src/lib/identity.ts) stores one of these uuids on each device — so
-- changing them would silently orphan existing reviews and log both
-- devices out of their reviewer identity.
-- ============================================================

insert into omo_reviewers (id, name, color, created_at)
values
  ('92bc5568-c18b-4573-ab6e-3d53c81591b1', 'Nathan', '#162E38', '2026-05-22 07:59:43.309843+00'),
  ('360c600d-74ea-487e-a275-77966c2cab95', 'Dez',    '#1C3828', '2026-05-22 07:59:43.309843+00')
on conflict (name) do nothing;
