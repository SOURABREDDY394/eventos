# EventOS Implementation Plan

## Current Backend Direction

EventOS should use Supabase for real persistence and authentication. The existing localStorage/seed-data layer is demo-only and must be replaced before the app is treated as a real MVP.

Frontend environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not expose provider API keys in Vite variables.

## Database

Run `supabase/migrations/001_eventos_schema.sql` in the Supabase SQL Editor before wiring frontend features. The migration creates:

- `profiles`
- `events`
- `registrations`
- `attendance`
- `volunteer_roles`
- `volunteer_applications`
- `volunteer_tasks`
- `sponsor_packages`
- `sponsor_interests`
- `budgets`
- `certificates`
- `proof_records`
- storage buckets: `event-posters`, `certificates`

No demo data should be inserted as part of production setup.

## AI Sponsor Pitch With Groq

Production-safe approach:

- Use a Supabase Edge Function named `generate-sponsor-pitch`.
- Store the Groq key as a Supabase secret: `GROQ_API_KEY`.
- Do not put `GROQ_API_KEY` in `.env.example`, `.env.local`, or any `VITE_*` frontend variable.
- The frontend should call `supabase.functions.invoke('generate-sponsor-pitch', { body })`.

The Edge Function accepts event details, sponsor type, audience size, category, city, and sponsor goal. It returns:

- professional email pitch
- short WhatsApp pitch
- sponsor package suggestion
- value points for the sponsor

If `GROQ_API_KEY` is missing, it must return a clear error and must not produce fake output.

## Frontend Wiring To Do Later

After the schema is created and Supabase auth is wired:

1. Replace `src/data/store.ts` localStorage calls with Supabase queries/mutations.
2. Replace template-only logic in `src/pages/dashboard/SponsorPitch.tsx`.
3. Add loading and error states for the `generate-sponsor-pitch` function call.
4. Remove the hardcoded sponsor pitch fallback unless explicitly approved as local demo mode.
5. Replace seeded public passport, event, certificate, sponsor, budget, and dashboard data with database-backed queries.
