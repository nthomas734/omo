# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # next dev
npm run build   # next build
npm run start   # next start (production server)
npm run lint    # next lint
```

There is **no test setup** in this repo — no test runner, no test files, no test script. Do not invent test commands; verification is done by running `npm run dev` and exercising the flow, or by `npm run build` for type errors (TypeScript is `strict`).

Note: no ESLint config file is committed, so `npm run lint` will prompt for setup on first run. There is also no lockfile.

### Environment variables

All four are required (see `SETUP.md`); missing ones surface as runtime failures, not build failures:

- `NEXT_PUBLIC_SUPABASE_URL` — bare project URL, **no** `/rest/v1/` suffix (appending it causes "INVALID PATH SPECIFIED" errors)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — publishable/anon key
- `SUPABASE_SERVICE_KEY` — secret key, server-only, used by `supabaseAdmin()`
- `ADMIN_PASSWORD`

Deployed on Vercel; the Framework Preset must be **Next.js** or every route 404s.

## Architecture

Next.js 15 App Router + React 19, TypeScript, Supabase as the only backend. No ORM, no state library, no CSS framework — the whole app is ~3k lines across `src/`.

### The domain model

omo is a **weighted decision archive**. A *ranking* has weighted *criteria* (summing to 100) and *options* scored 0–10 per criterion. The ranked order is a derived value, never stored.

`computeScore()` in `src/lib/supabase.ts` is the single source of truth for ranking math:

```
score = Σ (value/10 × weight) / Σ weight × 10   → rounded to 1 decimal
```

Disqualified options always return `0` and are sorted to the bottom of the list, keeping their recorded scores for reference. Everything that displays an ordering (cards list, map list, weight editor preview) calls `computeScore` at render time.

### Data flow

Server component → client component, one hop, no client fetch on load:

- `src/app/page.tsx` and `src/app/r/[slug]/page.tsx` are `export const dynamic = 'force-dynamic'` server components that fetch everything and pass it as props to `HomeClient` / `RankingClient`.
- They `await import('@/lib/supabase')` **dynamically** — deliberate, so Supabase client construction never runs at build time. Preserve this pattern when adding pages.
- Fetch failures are caught and degrade to an empty list rather than throwing.
- The only client-side fetch is `refreshReviews()` after a review is submitted; the only client-side write is `submitReview`, done through the anon client under RLS. (`upsertVisitRating` is exported but never called — see dead code below.)

`RankingClient` holds the interactive state: a `Tab` union (`cards | map | reviews | weights`, the Map tab only rendered when some option has a `maps_url`) plus a local copy of `criteria`. The weight editor mutates that local copy only — **slider changes re-rank live but are never persisted**. Editing real data is a SQL-editor operation (see below).

### Auth model

Two unrelated, deliberately minimal schemes:

1. **Admin** (`/admin`): the plaintext `ADMIN_PASSWORD` is POSTed to `/api/admin/auth`, which sets it as the value of an httpOnly `omo_admin` cookie. `isAuthenticated()` in `src/lib/auth.ts` compares the cookie value to the env var. `/admin` is a server component that `redirect`s to `/admin/login` when unauthenticated and reads via `supabaseAdmin()` (service key, bypasses RLS).
2. **Reviewer identity** (`src/lib/identity.ts`): no auth at all. A `omo_reviewer_id` cookie (365 days, non-httpOnly) picked once on the device maps to a row in `omo_reviewers`. This is a private two-person app; reviewer identity is not a security boundary.

Public reads are governed by Supabase RLS: `omo_rankings` is readable only where `is_published = true`; child tables are readable unconditionally. The page also re-checks `is_published` and calls `notFound()`.

### Content authoring convention

There is no in-app CRUD. **All rankings, criteria, options and scores are seeded and edited by hand-written SQL run in the Supabase SQL editor** — options carry hard-coded UUIDs (`b1000000-…`) so scores and `chosen_option_id` can reference them from the same file. `/admin` is a read-only index of rankings. Follow `MIGRATION.sql`'s seed block as the template when asked to add a ranking.

### Schema (MIGRATION.sql)

`omo_rankings` → `omo_criteria` (weight 0–100, `is_disqualifier`, `why`) and `omo_options` (`vibes`/`pros`/`cons` as `text[]`, `maps_url`, `is_disqualified` + `disqualify_reason`), joined by `omo_scores` (unique on `option_id, criterion_id`, value 0–10). `omo_versions` stores a `snapshot_json` blob typed as `VersionSnapshot` — the version count is displayed but nothing writes snapshots yet.

**What V2 changed** (`MIGRATION_V2.sql`, idempotent):

- Added `chosen_option_id` (FK to `omo_options`) and `outcome` (text) to `omo_rankings` — the **epilogue**: what was chosen and how it aged. The epilogue panel renders when `is_decided && (chosen_option_id || outcome)`, and the chosen card gets a "✓ our pick" chip — which may not be the top-scoring card.
- Widened the `category` check constraint to add `'coffee'` and `'restaurants'`, turning omo into a host for *living* rankings (places judged over time via the Reviews tab) alongside one-time decisions. These rankings may never get an epilogue and should give every option a Google Maps `maps_url`.

**Schema drift — largely resolved 2026-07-18.** `src/lib/supabase.ts` reads and writes tables that neither `MIGRATION.sql` nor `MIGRATION_V2.sql` creates: `omo_reviewers`, `omo_reviews`, `omo_review_ratings`, `omo_review_photos`, plus `omo_options.lat`/`.lng` and `omo_criteria.is_visit_rated`. These were added by hand in the Supabase SQL editor. **`SCHEMA-SYNC.sql`** now captures all of it, generated from the live Kura schema — idempotent and additive, a no-op against the live DB, and required for any rebuild from empty. Read it alongside the two `MIGRATION*.sql` files to see the true schema.

Caveat on that file: its constraints are declared inline in `create table if not exists`, so a table that exists but is missing a constraint won't get it retrofitted.

**Rebuild verified 2026-07-18** against a scratch Supabase project: `MIGRATION.sql` → `MIGRATION_V2.sql` → `SCHEMA-SYNC.sql`, in that order, builds omo from empty with no errors, and the widened category check was confirmed to accept `coffee` and `restaurants`. Three things that test surfaced:

- **`MIGRATION.sql` is NOT re-runnable.** Its `create policy` statements have no `drop policy if exists` guard and it carries the SD-neighborhoods seed as plain `INSERT`s. It works exactly once against an empty database. Don't paste it twice.
- **V2's category widening relies on an implicit name.** It drops `omo_rankings_category_check`, which is the name Postgres happens to auto-assign to the inline constraint in `MIGRATION.sql`. It matches today, but nothing declares that contract.
- **A fresh rebuild has no reviewers.** `omo_reviewers` is created empty and deliberately has no insert policy, so the Reviews tab is inert until rows are seeded by hand in the SQL editor. Inherent to the design; any rebuild runbook has to mention it.

`MIGRATION_V2.sql` had never been applied to the live database — the epilogue columns were absent and the category check still rejected `coffee` and `restaurants`. **Applied 2026-07-18** (schema portion only; the commented-out epilogue `UPDATE` at the end of that file was deliberately not run). Lesson worth keeping: a migration existing in this repo does not mean it ran — verify against live before assuming.

**Dead code:** `omo_visit_ratings` does not exist in the live database and never did. `getVisitRatings()` (`src/lib/supabase.ts:180`) and `upsertVisitRating()` (`:196`) reference it but are exported and never called anywhere in `src/`. They are a superseded design — `Rater = 'nathan' | 'dez'` became the `omo_reviewers` table, and `Vibe` became `VibeTag`. The fix is deleting both functions plus the `OmoVisitRating`, `Vibe`, and `Rater` types — **not** creating the table.

### Styling conventions

- **All styling is inline `style={{}}` objects** reading from the `theme` object in `src/lib/theme.ts`. There are no CSS modules, no Tailwind. `globals.css` only holds resets, CSS custom properties for fonts (`--font-serif` Fraunces, `--font-sans` Manrope, `--font-mono` Geist Mono, loaded via a Google Fonts `<link>` in `layout.tsx`), keyframes, and a fixed SVG grain overlay.
- **Two dialects:** the dark teal shell (`theme.bg`, `theme.cream`, `theme.brass`) for home/headers/tab bar, and `theme.light.*` (cream paper) for ranking body content. Pick the right namespace for the surface you're on.
- Semantic color helpers: `scoreColor(value)` (green ≥8, gold ≥6.5, amber ≥5, else red) and `categoryColor(category)` — category dot colors are shared with the wider "kura" ecosystem, so don't retune them casually.
- Layout is a fixed `maxWidth: 480` mobile column with a fixed bottom tab bar; it's installed as a PWA on iPhone (`public/manifest.json`, `themeColor: '#162E38'`, `maximumScale: 1`).

### Non-obvious details

- The Map tab is a Google Maps **iframe embed** (`output=embed`) centered by parsing the `query` param out of the top-ranked option's `maps_url` — not a mapping library. `lat`/`lng`, when present, are only rendered as decorative coordinate text.
- `getRankingBySlug` runs a nested `await supabase.from('omo_options').select('id')` *inside* its `Promise.all` to fetch score rows — options are effectively queried twice.
- One review per (option, reviewer) is the model: `pendingReviews` is computed as `reviewers.length * options.length - reviews.length`. `upsertVisitRating` upserts on `option_id,reviewer`.
- `omo_review_photos` is read and rendered but no upload path exists in the app; photo rows are inserted out-of-band.
