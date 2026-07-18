# omo v2 update — the epilogue + coffee & restaurants

Two changes in this update:

1. **The epilogue.** A decided ranking can now record *what we chose, and how it aged* — a brass-edged panel at the top of the cards list, plus a "✓ our pick" chip on the chosen card (even if it wasn't the top-scoring one).
2. **Two new categories** — `coffee` and `restaurants` — with their own filter chips on the home screen (roast-caramel and muted-red dots). This is omo's second life: living rankings of places, judged over time through the Reviews tab.

## Step 1 — Run the migration (~1 min)

1. Open the **Kura** project in Supabase → **SQL Editor**
2. Paste the contents of `MIGRATION_V2.sql` → **Run**
3. Safe to re-run if you're not sure it took.

## Step 2 — Push the code (~2 min)

In GitHub Desktop you'll see changes to:

- `src/lib/supabase.ts` — new `chosen_option_id` / `outcome` fields + category types
- `src/lib/theme.ts` — coffee + restaurants dot colors
- `src/components/HomeClient.tsx` — Coffee and Restaurants filter chips
- `src/components/RankingClient.tsx` — the epilogue panel
- `src/components/FlipCard.tsx` — the "✓ our pick" chip

Commit → push to `main` → Vercel deploys automatically.

## Step 3 — Record your first epilogue

Open `MIGRATION_V2.sql`, edit the commented `update` block at the bottom (the SD
neighborhoods example — rewrite the `outcome` note in your own words), un-comment
it, and run just that block in the SQL editor. The panel appears immediately.

The epilogue shows on any ranking where `is_decided = true` and either
`chosen_option_id` or `outcome` is set. Update the `outcome` note whenever the
choice ages — that's the point of it.

## Starting a coffee or restaurant ranking

Ask Claude for the SQL, same flow as always — just note the ranking's
`category` should be `'coffee'` or `'restaurants'`. Reminders for these:

- Every option gets a **Google Maps `maps_url`** (`https://www.google.com/maps/search/?api=1&query=PLACE+NAME+CITY`)
- These are *living* rankings — they may never get an epilogue. The Reviews tab
  (loved/liked/nope + stars + photos, one review each) is the ongoing verdict.
- Criteria still apply (e.g. espresso · pastries · seats · wifi · vibe), so new
  places slot into the ranked list as you score them.
