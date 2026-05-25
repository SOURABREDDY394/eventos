# EventOS Supabase Setup

## Frontend environment

Create `.env.local` for the Vite app:

```env
VITE_SUPABASE_URL=https://isttuieupsmmkivdzgdm.supabase.co
VITE_SUPABASE_ANON_KEY=<your Supabase publishable anon key>
```

Do not put `GROQ_API_KEY` in frontend env files. A Vite variable is exposed to the browser.

## Database migration

Run the full contents of:

```text
supabase/migrations/001_eventos_schema.sql
```

in the Supabase SQL Editor.

The migration creates all EventOS tables, RLS policies, indexes, updated_at triggers, an auth profile trigger, and these storage buckets:

- `event-posters`
- `certificates`

It does not insert demo data.

## Groq sponsor pitch Edge Function

Deploy:

```bash
supabase functions deploy generate-sponsor-pitch
```

Set the Groq key as a Supabase secret:

```bash
supabase secrets set GROQ_API_KEY=your_groq_key
```

Optional model override:

```bash
supabase secrets set GROQ_MODEL=llama-3.3-70b-versatile
```

The frontend should call the Supabase Edge Function named `generate-sponsor-pitch`. It should not call Groq directly.

Expected request body:

```json
{
  "eventTitle": "AI Workshop 2026",
  "eventDescription": "Hands-on AI workshop",
  "eventDate": "2026-03-15",
  "venue": "Tech Campus Auditorium",
  "city": "Bengaluru",
  "eventCategory": "Technology",
  "audienceSize": 200,
  "sponsorType": "Technology",
  "sponsorGoal": "Developer awareness"
}
```

Expected response:

```json
{
  "emailPitch": "...",
  "whatsappPitch": "...",
  "sponsorPackageSuggestion": "...",
  "valuePoints": ["...", "..."]
}
```

If `GROQ_API_KEY` is missing, the function returns a clear JSON error instead of fake output.
