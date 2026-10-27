# 💌 Rutuja & Himanshu — Digital Wedding Invite

## Preview locally
    python3 server.py
Open http://localhost:8000. RSVP dashboard: `/admin?key=<data/admin_key.txt>`

## Edit details
Everything (names, events, venue, photos, captions) lives in `public/config.js`. Save, then refresh.
- **Music:** put the song in `public/` named `music.mp3`. If it's missing, a soft built-in tune plays.
- **Photos:** `public/photos/us-1.jpg`, `us-2.jpg`, `us-3.jpg`

---

## Put it online (Render, free) — about 15 minutes, one time

### Step 1: Google Sheet for RSVPs (so they're never lost)
1. Create a new Google Sheet, e.g. "Wedding RSVPs".
2. **Extensions → Apps Script**. Delete what's there and paste in all of `google-sheet-script.gs`.
3. Change `const SECRET = "CHANGE-ME"` to any long random word, e.g. `shubhmangal-8x2k9q`. Save.
4. **Deploy → New deployment → ⚙ → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   → **Deploy** → authorise → copy the **Web app URL** (it ends in `/exec`).

### Step 2: GitHub (personal account)
1. Create a **private** repo on your *personal* GitHub, e.g. `wedding-invite`.
2. Push this folder to it (Claude can do this once you're logged in with `gh auth login`).

### Step 3: Render
1. Sign up at https://render.com with your personal GitHub.
2. **New → Blueprint** → pick the `wedding-invite` repo. It reads `render.yaml`.
3. When asked, fill in:
   - `SHEET_URL` = the Apps Script URL from step 1
   - `SHEET_SECRET` = the secret word from step 1
4. **Apply**. After about 2 minutes you get `https://rutuja-himanshu-wedding.onrender.com`. That's the link to share 🎉
5. Your admin key is under **Environment → ADMIN_KEY**. Dashboard: `https://…onrender.com/admin?key=…`

### Good to know
- Free Render apps sleep after 15 min idle, so the first visitor may wait about 30–50 s.
  To avoid this, add a free monitor at https://uptimerobot.com pinging your link every 5 minutes.
- After changing `config.js`, push to GitHub and Render redeploys automatically.
- RSVPs show up live in the Google Sheet and in `/admin`.
