-- 005 — Event Tech Track features (QR check-in, certificate automation,
-- AI sponsor tools, volunteer recommendations, gamified leaderboard).
--
-- These tables are intentionally standalone and prefixed `etrack_` so they
-- never collide with the base schema (001) and accept the app's string ids
-- (e.g. "demo-organizer", "e1") without foreign-key friction. The front-end
-- writes here best-effort and falls back to localStorage when the tables are
-- absent, so the app keeps working before this migration is applied.

-- 1. QR-Based Event Check-In ------------------------------------------------
create table if not exists public.etrack_check_ins (
  id text primary key,
  event_id text not null,
  registration_id text not null,
  participant_id text,
  participant_name text,
  registration_code text,
  checked_in_by text,
  handled_by_name text,
  method text default 'manual',          -- 'manual' | 'qr'
  status text default 'present',
  checked_in_at timestamptz not null default now()
);
create unique index if not exists etrack_check_ins_registration_uniq
  on public.etrack_check_ins (registration_id);

-- 2. Attendance & Certificate Automation ------------------------------------
create table if not exists public.etrack_certificates (
  id text primary key,
  event_id text not null,
  event_title text,
  user_id text not null,
  user_name text,
  certificate_code text not null,
  role text default 'Participant',
  organizer_name text,
  event_date text,
  issued_at timestamptz not null default now()
);
create unique index if not exists etrack_certificates_code_uniq
  on public.etrack_certificates (certificate_code);

-- 3 & 4. AI Sponsor Proposals + Matching ------------------------------------
create table if not exists public.etrack_sponsor_proposals (
  id text primary key,
  event_id text,
  created_by text,
  event_title text,
  audience_size integer,
  expected_reach integer,
  sponsor_benefits text,
  proposal text,
  email_pitch text,
  packages jsonb,           -- Gold / Silver / Bronze tiers
  matches jsonb,            -- suggested sponsor categories + types
  created_at timestamptz not null default now()
);

-- 5. AI Volunteer Recommendation -------------------------------------------
create table if not exists public.etrack_volunteer_profiles (
  user_id text primary key,
  full_name text,
  skills jsonb default '[]'::jsonb,
  availability text,
  recommended_roles jsonb,
  updated_at timestamptz not null default now()
);

-- 6. Gamified Volunteer Leaderboard ----------------------------------------
create table if not exists public.etrack_volunteer_points (
  id text primary key,
  user_id text not null,
  full_name text,
  points integer not null default 0,
  reason text,
  event_id text,
  created_at timestamptz not null default now()
);

-- Row Level Security: permissive policies for the demo's anon access. -------
alter table public.etrack_check_ins          enable row level security;
alter table public.etrack_certificates       enable row level security;
alter table public.etrack_sponsor_proposals  enable row level security;
alter table public.etrack_volunteer_profiles enable row level security;
alter table public.etrack_volunteer_points   enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'etrack_check_ins','etrack_certificates','etrack_sponsor_proposals',
    'etrack_volunteer_profiles','etrack_volunteer_points'
  ]
  loop
    execute format('drop policy if exists %I on public.%I;', t || '_all', t);
    execute format(
      'create policy %I on public.%I for all using (true) with check (true);',
      t || '_all', t
    );
  end loop;
end $$;
