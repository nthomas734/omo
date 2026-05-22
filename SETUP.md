# omo — setup guide

Deploy time: ~15 minutes.

---

## 1. GitHub

1. Go to github.com → New repository → name it `omo` → Private → Create
2. Open **GitHub Desktop** → Add existing repository → drag in the contents of the zip (the files inside, not the outer folder)
3. Commit all files → Push to origin

---

## 2. Supabase

1. Open the **Kura** project at supabase.co
2. Go to **SQL Editor** → New query
3. Paste the entire contents of `MIGRATION.sql` → Run
4. You should see the SD neighborhoods ranking appear in the tables

**Get your keys:**
- Go to **Project Settings → API Keys**
- Copy the **Publishable key** (starts with `sb_publishable_` or is labeled "anon")
- Copy the **Secret key** (labeled "secret" or "service_role")
- Go to **Project Settings → Data API** → copy the **API URL** (e.g. `https://lrbmtcyhqzuyczovajnj.supabase.co`) — use this exact URL, do NOT add `/rest/v1/`

---

## 3. Vercel

1. Go to vercel.com → Add New → Project → Import from GitHub → select `omo`
2. **⚠️ IMPORTANT: Set Framework Preset to "Next.js"** — if it says "Other" or is blank, change it or every route will 404
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://lrbmtcyhqzuyczovajnj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [your publishable key]
   SUPABASE_SERVICE_KEY         = [your secret key]
   ADMIN_PASSWORD               = [choose a password]
   ```
4. Deploy → wait for green checkmark

---

## 4. PWA install on iPhone

1. Open the deployed URL in **Safari** (must be Safari, not Chrome)
2. Tap the Share button → **Add to Home Screen**
3. Name it `omo` → Add
4. The app icon should appear on your home screen with the teal background

---

## 5. Verify everything works

- [ ] Home screen loads and shows SD neighborhoods ranking
- [ ] Tap the ranking → cards load and flip
- [ ] "Edit ›" opens weight editor with live sliders
- [ ] `/admin` redirects to `/admin/login`
- [ ] Admin login works with your `ADMIN_PASSWORD`

---

## Common gotchas

**Every route is 404 after deploy**
→ Framework Preset was not set to "Next.js" in Vercel. Go to Project Settings → General → Framework Preset → change to Next.js → Redeploy.

**"INVALID PATH SPECIFIED" errors in console**
→ `NEXT_PUBLIC_SUPABASE_URL` has `/rest/v1/` appended. Use the bare URL only: `https://xyz.supabase.co`

**App won't load on iPhone but works on desktop**
→ Toggle off iCloud Private Relay: Settings → [your name] → iCloud → Private Relay → Off

**App icon didn't update after you changed it**
→ Delete the app from home screen → open URL in Safari → re-add via Share → Add to Home Screen

---

## Adding new rankings

Rankings are seeded via SQL — the same way the SD neighborhoods ranking was created. In a Claude chat, describe the decision, have Claude generate the SQL seed file in omo format, paste into the Kura SQL Editor, and the ranking appears instantly.

The admin panel at `/admin` shows all rankings and links to their public views. Full in-app editing is a future feature — for now, edits to scores or weights go through the SQL editor.
