# omo 重

*— nothing decided lightly —*

A weighted decision archive. Score options against criteria, adjust weights live, flip cards to read the reasoning. Part of the kura ecosystem.

Decided rankings close with an **epilogue** — what we chose, and how it aged — shown as a brass-edged panel above the cards, with a "✓ our pick" chip on the winning card. Set via SQL like all omo content (see `MIGRATION_V2.sql` for the shape).

Alongside one-time decisions, omo keeps **living rankings** — `coffee` and `restaurants` categories — where the two-person Reviews tab (loved/liked/nope, stars, photos) does the ongoing judging.

**Stack:** Next.js 15 · Supabase · Vercel · PWA

See `SETUP.md` to deploy. Updating from v1: see `UPDATE.md`.
