# Supabase Edge Function — book-appointment

## 1. Run SQL migrations

In Supabase Dashboard → SQL Editor, run in order:

1. `migrations/001_add_triggers_and_rls.sql`
2. `migrations/002_appointments_constraints.sql`

Enable **Realtime** for `appointments` (Database → Replication) if the migration publication step fails.

## 2. Set secrets

```bash
cd derma-ai
supabase login
supabase link --project-ref YOUR_PROJECT_REF

supabase secrets set \
  GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' \
  GOOGLE_CALENDAR_ID='your-calendar@group.calendar.google.com' \
  RESEND_API_KEY='re_...' \
  EMAIL_FROM='DERMA AI <noreply@yourdomain.com>'
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically in Edge Functions.

## 3. Deploy function

```bash
supabase functions deploy book-appointment
```

## 4. Google Calendar

1. Enable Google Calendar API in Cloud Console.
2. Create a service account and download JSON.
3. Share your clinic calendar with the service account email (Make changes to events).
4. Use that calendar’s ID as `GOOGLE_CALENDAR_ID`.

## 5. Local testing

```bash
supabase functions serve book-appointment --env-file supabase/.env.local
```

Frontend calls: `{VITE_SUPABASE_URL}/functions/v1/book-appointment`

If the edge function is unavailable, the app falls back to `/api/create-appointment` + Supabase insert (run `vercel dev` in `derma-ai/` for local API routes).
