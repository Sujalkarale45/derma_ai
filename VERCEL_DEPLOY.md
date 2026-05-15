# Deploy DERMA AI on Vercel

## Prerequisites

- GitHub account with this repo pushed
- [Vercel account](https://vercel.com)
- Supabase, Firebase, Google Calendar, and Resend configured (see `.env`)

---

## Option A — Deploy from GitHub (recommended)

### 1. Push code to GitHub

```bash
cd "E:\RCOEM 1ST\SEM 6\Mini Project\Skin-Cancer-Classifier"
git add derma-ai
git commit -m "Prepare derma-ai for Vercel deployment"
git push origin main
```

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your `Skin-Cancer-Classifier` repository
3. **Root Directory** → click **Edit** → set to **`derma-ai`** (required)
4. Framework: **Vite** (auto-detected)
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Do **not** deploy yet — add environment variables first

### 3. Environment variables

In **Settings → Environment Variables**, add all below for **Production** (and Preview if you want).

#### Frontend (`VITE_` prefix — exposed to browser)

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | `https://qozopuucpnhlfjdvgnew.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon JWT |
| `VITE_FIREBASE_API_KEY` | from Firebase console |
| `VITE_FIREBASE_AUTH_DOMAIN` | `dermaai-56163.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `dermaai-56163` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `dermaai-56163.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `295004169630` |
| `VITE_FIREBASE_APP_ID` | `1:295004169630:web:...` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-YC08EY700D` |
| `VITE_APP_NAME` | `DERMA AI` |
| `VITE_ENABLE_BOOTSTRAP_ADMIN` | `true` (optional, for admin bootstrap login) |
| `VITE_BOOTSTRAP_ADMIN_EMAIL` | `admin@dermaai.com` |
| `VITE_BOOTSTRAP_ADMIN_PASSWORD` | your secure password |

#### Server-only (no `VITE_` — for `/api/*` routes)

| Name | Value |
|------|--------|
| `RESEND_API_KEY` | your Resend key |
| `EMAIL_FROM` | `DERMA AI <onboarding@resend.dev>` |
| `GOOGLE_CALENDAR_ID` | your shared Google Calendar ID |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | **entire** `secrets/google-service-account.json` as **one line** |

To generate one-line JSON locally:

```bash
cd derma-ai
node scripts/print-google-env.mjs
```

Copy the output into Vercel’s `GOOGLE_SERVICE_ACCOUNT_JSON` value.

> `GOOGLE_SERVICE_ACCOUNT_JSON_PATH` does **not** work on Vercel (file is not deployed). Use `GOOGLE_SERVICE_ACCOUNT_JSON` instead.

### 4. Deploy

Click **Deploy**. Wait for build to finish (~1–2 min).

Your URL will be like: `https://derma-ai-xxx.vercel.app`

### 5. Post-deploy

**Supabase → Authentication → URL configuration**

- Site URL: `https://YOUR-APP.vercel.app`
- Redirect URLs: `https://YOUR-APP.vercel.app/**`

Redeploy after changing env vars if needed.

---

## Option B — Deploy with Vercel CLI

```bash
cd derma-ai
npm i -g vercel
vercel login
vercel
```

Follow prompts (link to existing project or create new).

Production deploy:

```bash
vercel --prod
```

Pull env from Vercel locally:

```bash
vercel env pull .env.local
```

---

## What runs on Vercel

| Path | Purpose |
|------|---------|
| `/` | React SPA (Vite build) |
| `/api/create-appointment` | Google Meet via Calendar API (Python) |
| `/api/send-appointment-email` | Resend emails (Node.js) |

Booking flow: frontend → Supabase Edge Function **or** fallback → `/api/create-appointment` + `/api/send-appointment-email`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Vercel | Run `npm run build` locally; fix TypeScript errors |
| 404 on refresh | `vercel.json` rewrites to `index.html` — already configured |
| Login redirect fails | Update Supabase auth URLs to your Vercel domain |
| Meet link fails | Set `GOOGLE_SERVICE_ACCOUNT_JSON` + `GOOGLE_CALENDAR_ID`; share calendar with service account |
| Emails not sent | Set `RESEND_API_KEY`; sandbox only sends to verified emails |
| Admin login fails | Disable Supabase email confirmation; use bootstrap admin credentials |

---

## Security (production)

- Set `VITE_ENABLE_BOOTSTRAP_ADMIN=false` or remove bootstrap vars on production
- Rotate any API keys posted in chat
- Never commit `.env` or `secrets/`
