-- omo v2 migration — the epilogue + place categories
-- Run in the Kura Supabase SQL editor. Idempotent — safe to re-run.

-- ── EPILOGUE ─────────────────────────────────────────────
-- What we chose, and how it aged. Shown as a brass-edged panel
-- at the top of the cards list on decided rankings.

alter table omo_rankings add column if not exists
  chosen_option_id uuid references omo_options(id) on delete set null;

alter table omo_rankings add column if not exists
  outcome text;

-- ── NEW CATEGORIES: coffee + restaurants ─────────────────
-- omo's second life: living rankings of coffee shops and restaurants.

alter table omo_rankings drop constraint if exists omo_rankings_category_check;
alter table omo_rankings add constraint omo_rankings_category_check
  check (category in ('life','apartments','travel','gear','coffee','restaurants','other'));

-- ── RECORD THE FIRST EPILOGUE (edit the note, then un-comment) ──
-- The SD neighborhoods ranking is decided; give it its last page.

-- update omo_rankings set
--   chosen_option_id = 'b1000000-0000-0000-0000-000000000001',  -- Little Italy
--   outcome = 'Over Bankers Hill — the Mercato, the walkability, and twelve minutes to SAN tipped it. Ask us about the flight path after the first month in the apartment.'
-- where slug = 'sd-neighborhoods';
