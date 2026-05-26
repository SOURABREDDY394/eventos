# EventOS

EventOS is an event-tech MVP for creating, managing, and verifying events. The product story is simple: organizers create events, participants browse and apply, organizers approve applications, approved participants receive QR tickets, attendance is verified, and certificates/proof records can become part of a public Proof Passport.

The app is built as a Vite React frontend with Supabase schema, storage, and Edge Function support. Demo access is currently one-click local access for fast project review, while event data infrastructure and Groq-backed AI generation are prepared through Supabase.

## Project Overview

EventOS focuses on two primary experiences:

- Organizer experience: create and manage events, including AI-assisted event draft generation, manual event creation, registration forms, application review, attendance, volunteers, sponsors, budget, and certificates.
- Participant experience: browse upcoming events, submit approval-based registrations, track pending/approved/rejected applications, view QR tickets after approval, and access certificates/proof.

Supporting workspaces are included for:

- Volunteers: applications, assigned tasks, completed hours, skills, and proof records.
- Sponsors: browse events and manage sponsor interests.
- Public proof: Proof Passport and certificate verification routes.

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure frontend environment

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not add `GROQ_API_KEY` to any Vite env file. Vite env variables are exposed to the browser.

### 3. Run the app locally

```bash
npm run dev
```

If port `5173` is busy, Vite may choose another port such as `3000`.

### 4. Build for production

```bash
npm run build
```

### 5. Set up Supabase database

Run the SQL migrations in `supabase/migrations` in your Supabase project, starting with:

```text
supabase/migrations/001_eventos_schema.sql
```

The schema includes tables for profiles, events, registrations, attendance, event form fields, volunteers, sponsors, budgets, certificates, proof records, and storage buckets.

### 6. Deploy Groq Edge Functions

Set the Groq key as a Supabase secret:

```bash
supabase secrets set GROQ_API_KEY=your_groq_key
```

Deploy the event draft function:

```bash
supabase functions deploy generate-event-draft
```

Optional sponsor pitch function:

```bash
supabase functions deploy generate-sponsor-pitch
```

Optional model override:

```bash
supabase secrets set GROQ_MODEL=llama-3.3-70b-versatile
```

Important: the current app uses one-click demo login for review. Real Supabase writes protected by RLS, such as inserting events into `public.events`, require a real Supabase Auth organizer session or a secure server-side create-event flow.

## Features Implemented

- Premium EventOS landing page with AI event creation prompt.
- One-click demo login for fast access to the product.
- Dashboard workspace routing for Organizer, Participant, Volunteer, and Sponsor.
- AI Create Event page wired to a secure Supabase Edge Function for Groq-powered structured event draft generation.
- Editable event draft form after AI generation.
- Manual event creation flow.
- Event poster upload helper and public event poster/fallback display.
- Public events listing with upcoming/past lifecycle filtering.
- Event detail page with approval-based registration flow.
- Registration statuses: pending, approved, rejected, attended, cancelled.
- Organizer registration review with approve/reject behavior.
- Participant applications and tickets pages with pending/approved/rejected states.
- QR ticket availability only after approval.
- Attendance logic guarded by registration status.
- Volunteer module with applications, task tracking, completed hours, skills, and proof records.
- Sponsor module with event browsing and sponsor interests.
- Budget and certificate management surfaces.
- Public Proof Passport and certificate verification routes.
- Supabase database migrations and RLS policies.
- Supabase Storage buckets for event posters and certificates.
- Supabase Edge Function for Groq sponsor pitch generation.

## Tech Stack Used

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI primitives
- Lucide React icons
- Supabase JavaScript client
- Supabase PostgreSQL, Row Level Security, Storage, and Edge Functions
- Groq API through Supabase Edge Functions
- QR code rendering with `qrcode.react`
- Charts with Recharts
- Toasts with Sonner

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Repository Notes

- `.env.local` is ignored and should not be committed.
- `dist`, `node_modules`, and local scrape/reference files are ignored.
- Groq keys must live only in Supabase secrets, never in frontend environment variables.
