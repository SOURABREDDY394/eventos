-- EventOS real MVP schema.
-- Run this in the Supabase SQL Editor for project isttuieupsmmkivdzgdm.
-- This migration creates schema, RLS policies, indexes, profile trigger, and storage buckets.
-- It does not insert demo/fake data.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username text not null unique,
  email text not null,
  role text not null check (role in ('organizer', 'participant', 'volunteer', 'sponsor')),
  avatar_url text,
  bio text,
  passport_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  category text not null default 'General',
  date date not null,
  start_time time,
  end_time time,
  venue text,
  city text,
  poster_url text,
  max_participants integer not null default 100 check (max_participants > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_id uuid not null references public.profiles(id) on delete cascade,
  registration_code text unique,
  qr_code_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'attended', 'cancelled')),
  form_answers jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registrations_event_participant_unique unique (event_id, participant_id)
);

create table if not exists public.event_form_fields (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  label text not null,
  field_type text not null check (field_type in ('text', 'textarea', 'number', 'email', 'phone', 'select', 'checkbox')),
  required boolean not null default false,
  options text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  registration_id uuid not null references public.registrations(id) on delete cascade,
  participant_id uuid not null references public.profiles(id) on delete cascade,
  checked_in_by uuid references public.profiles(id) on delete set null,
  checked_in_at timestamptz not null default now(),
  status text not null default 'present' check (status in ('present', 'absent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_registration_unique unique (registration_id)
);

-- Supporting table required by volunteer_applications.role_id.
create table if not exists public.volunteer_roles (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  role_name text not null,
  description text,
  required_count integer not null default 1 check (required_count > 0),
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid references public.volunteer_roles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reason text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.volunteer_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed')),
  hours numeric(6,2) not null default 0 check (hours >= 0),
  skills_gained text[] not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsor_packages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  description text,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  benefits text[] not null default '{}',
  visibility_level text not null default 'standard' check (visibility_level in ('standard', 'premium', 'platinum')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsor_interests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  sponsor_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid references public.sponsor_packages(id) on delete set null,
  company_name text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  certificate_code text not null unique,
  role text not null,
  pdf_url text,
  issued_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certificate_event_user_role_unique unique (event_id, user_id, role)
);

create table if not exists public.proof_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  record_type text not null check (record_type in ('attendance', 'certificate', 'volunteer')),
  title text not null,
  description text,
  skills text[] not null default '{}',
  hours numeric(6,2) not null default 0 check (hours >= 0),
  certificate_id text,
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_username_idx on public.profiles(username);
create index if not exists events_organizer_id_idx on public.events(organizer_id);
create index if not exists events_status_date_idx on public.events(status, date);
create index if not exists events_slug_idx on public.events(slug);
create index if not exists registrations_event_id_idx on public.registrations(event_id);
create index if not exists registrations_participant_id_idx on public.registrations(participant_id);
create index if not exists registrations_code_idx on public.registrations(registration_code);
create index if not exists event_form_fields_event_sort_idx on public.event_form_fields(event_id, sort_order);
create index if not exists attendance_event_id_idx on public.attendance(event_id);
create index if not exists attendance_participant_id_idx on public.attendance(participant_id);
create index if not exists volunteer_roles_event_id_idx on public.volunteer_roles(event_id);
create index if not exists volunteer_applications_event_id_idx on public.volunteer_applications(event_id);
create index if not exists volunteer_applications_volunteer_id_idx on public.volunteer_applications(volunteer_id);
create unique index if not exists volunteer_application_unique_idx on public.volunteer_applications(event_id, volunteer_id, coalesce(role_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index if not exists volunteer_tasks_event_id_idx on public.volunteer_tasks(event_id);
create index if not exists volunteer_tasks_assigned_to_idx on public.volunteer_tasks(assigned_to);
create index if not exists sponsor_packages_event_id_idx on public.sponsor_packages(event_id);
create index if not exists sponsor_interests_event_id_idx on public.sponsor_interests(event_id);
create index if not exists sponsor_interests_sponsor_id_idx on public.sponsor_interests(sponsor_id);
create unique index if not exists sponsor_interest_unique_idx on public.sponsor_interests(event_id, sponsor_id, coalesce(package_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index if not exists budgets_event_id_idx on public.budgets(event_id);
create index if not exists certificates_event_id_idx on public.certificates(event_id);
create index if not exists certificates_user_id_idx on public.certificates(user_id);
create index if not exists certificates_code_idx on public.certificates(certificate_code);
create index if not exists proof_records_user_id_idx on public.proof_records(user_id);
create index if not exists proof_records_event_id_idx on public.proof_records(event_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at before update on public.events for each row execute function public.set_updated_at();
drop trigger if exists set_registrations_updated_at on public.registrations;
create trigger set_registrations_updated_at before update on public.registrations for each row execute function public.set_updated_at();
drop trigger if exists set_attendance_updated_at on public.attendance;
create trigger set_attendance_updated_at before update on public.attendance for each row execute function public.set_updated_at();
drop trigger if exists set_volunteer_roles_updated_at on public.volunteer_roles;
create trigger set_volunteer_roles_updated_at before update on public.volunteer_roles for each row execute function public.set_updated_at();
drop trigger if exists set_volunteer_applications_updated_at on public.volunteer_applications;
create trigger set_volunteer_applications_updated_at before update on public.volunteer_applications for each row execute function public.set_updated_at();
drop trigger if exists set_volunteer_tasks_updated_at on public.volunteer_tasks;
create trigger set_volunteer_tasks_updated_at before update on public.volunteer_tasks for each row execute function public.set_updated_at();
drop trigger if exists set_sponsor_packages_updated_at on public.sponsor_packages;
create trigger set_sponsor_packages_updated_at before update on public.sponsor_packages for each row execute function public.set_updated_at();
drop trigger if exists set_sponsor_interests_updated_at on public.sponsor_interests;
create trigger set_sponsor_interests_updated_at before update on public.sponsor_interests for each row execute function public.set_updated_at();
drop trigger if exists set_budgets_updated_at on public.budgets;
create trigger set_budgets_updated_at before update on public.budgets for each row execute function public.set_updated_at();
drop trigger if exists set_certificates_updated_at on public.certificates;
create trigger set_certificates_updated_at before update on public.certificates for each row execute function public.set_updated_at();
drop trigger if exists set_proof_records_updated_at on public.proof_records;
create trigger set_proof_records_updated_at before update on public.proof_records for each row execute function public.set_updated_at();

create or replace function public.is_role(required_role text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = required_role
  );
$$;

create or replace function public.is_event_organizer(target_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.events
    where id = target_event_id
      and organizer_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
  requested_role text;
begin
  requested_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1) || '-' || substr(new.id::text, 1, 8)
  );
  requested_role := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'participant');
  if requested_role not in ('organizer', 'participant', 'volunteer', 'sponsor') then
    requested_role := 'participant';
  end if;

  insert into public.profiles (id, full_name, username, email, role, passport_slug)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    requested_username,
    coalesce(new.email, ''),
    requested_role,
    requested_username
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.event_form_fields enable row level security;
alter table public.attendance enable row level security;
alter table public.volunteer_roles enable row level security;
alter table public.volunteer_applications enable row level security;
alter table public.volunteer_tasks enable row level security;
alter table public.sponsor_packages enable row level security;
alter table public.sponsor_interests enable row level security;
alter table public.budgets enable row level security;
alter table public.certificates enable row level security;
alter table public.proof_records enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable" on public.profiles for select using (true);
drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "published events are publicly readable" on public.events;
create policy "published events are publicly readable" on public.events for select using (status = 'published' or organizer_id = auth.uid());
drop policy if exists "organizers can create own events" on public.events;
create policy "organizers can create own events" on public.events for insert with check (organizer_id = auth.uid() and public.is_role('organizer'));
drop policy if exists "organizers can update own events" on public.events;
create policy "organizers can update own events" on public.events for update using (organizer_id = auth.uid()) with check (organizer_id = auth.uid());
drop policy if exists "organizers can delete own events" on public.events;
create policy "organizers can delete own events" on public.events for delete using (organizer_id = auth.uid());

drop policy if exists "registrations visible to participant and organizer" on public.registrations;
create policy "registrations visible to participant and organizer" on public.registrations for select using (participant_id = auth.uid() or public.is_event_organizer(event_id));
drop policy if exists "participants can register themselves" on public.registrations;
create policy "participants can register themselves" on public.registrations for insert with check (participant_id = auth.uid() and public.is_role('participant'));
drop policy if exists "participants can cancel own registrations" on public.registrations;
create policy "participants can cancel own registrations" on public.registrations for update using (participant_id = auth.uid()) with check (participant_id = auth.uid() and status = 'cancelled');
drop policy if exists "organizers can update event registrations" on public.registrations;
create policy "organizers can update event registrations" on public.registrations for update using (public.is_event_organizer(event_id)) with check (public.is_event_organizer(event_id));

drop policy if exists "event form fields are publicly readable" on public.event_form_fields;
create policy "event form fields are publicly readable" on public.event_form_fields for select using (true);
drop policy if exists "organizers can manage own event form fields" on public.event_form_fields;
create policy "organizers can manage own event form fields" on public.event_form_fields for all using (public.is_event_organizer(event_id)) with check (public.is_event_organizer(event_id));

drop policy if exists "attendance visible to participant and organizer" on public.attendance;
create policy "attendance visible to participant and organizer" on public.attendance for select using (participant_id = auth.uid() or public.is_event_organizer(event_id));
drop policy if exists "organizers can create attendance" on public.attendance;
create policy "organizers can create attendance" on public.attendance for insert with check (public.is_event_organizer(event_id));
drop policy if exists "organizers can update attendance" on public.attendance;
create policy "organizers can update attendance" on public.attendance for update using (public.is_event_organizer(event_id)) with check (public.is_event_organizer(event_id));

drop policy if exists "volunteer roles readable for published events and organizers" on public.volunteer_roles;
create policy "volunteer roles readable for published events and organizers" on public.volunteer_roles for select using (
  public.is_event_organizer(event_id) or exists (select 1 from public.events e where e.id = event_id and e.status = 'published')
);
drop policy if exists "organizers manage volunteer roles" on public.volunteer_roles;
create policy "organizers manage volunteer roles" on public.volunteer_roles for all using (public.is_event_organizer(event_id)) with check (public.is_event_organizer(event_id));

drop policy if exists "volunteer applications visible to applicant and organizer" on public.volunteer_applications;
create policy "volunteer applications visible to applicant and organizer" on public.volunteer_applications for select using (volunteer_id = auth.uid() or public.is_event_organizer(event_id));
drop policy if exists "volunteers can apply" on public.volunteer_applications;
create policy "volunteers can apply" on public.volunteer_applications for insert with check (volunteer_id = auth.uid() and public.is_role('volunteer'));
drop policy if exists "organizers update volunteer applications" on public.volunteer_applications;
create policy "organizers update volunteer applications" on public.volunteer_applications for update using (public.is_event_organizer(event_id)) with check (public.is_event_organizer(event_id));

drop policy if exists "volunteer tasks visible to assignee and organizer" on public.volunteer_tasks;
create policy "volunteer tasks visible to assignee and organizer" on public.volunteer_tasks for select using (assigned_to = auth.uid() or public.is_event_organizer(event_id));
drop policy if exists "organizers create volunteer tasks" on public.volunteer_tasks;
create policy "organizers create volunteer tasks" on public.volunteer_tasks for insert with check (public.is_event_organizer(event_id));
drop policy if exists "organizers and assignees update volunteer tasks" on public.volunteer_tasks;
create policy "organizers and assignees update volunteer tasks" on public.volunteer_tasks for update using (assigned_to = auth.uid() or public.is_event_organizer(event_id)) with check (assigned_to = auth.uid() or public.is_event_organizer(event_id));
drop policy if exists "organizers delete volunteer tasks" on public.volunteer_tasks;
create policy "organizers delete volunteer tasks" on public.volunteer_tasks for delete using (public.is_event_organizer(event_id));

drop policy if exists "sponsor packages readable for published events and organizers" on public.sponsor_packages;
create policy "sponsor packages readable for published events and organizers" on public.sponsor_packages for select using (
  public.is_event_organizer(event_id) or exists (select 1 from public.events e where e.id = event_id and e.status = 'published')
);
drop policy if exists "organizers manage sponsor packages" on public.sponsor_packages;
create policy "organizers manage sponsor packages" on public.sponsor_packages for all using (public.is_event_organizer(event_id)) with check (public.is_event_organizer(event_id));

drop policy if exists "sponsor interests visible to sponsor and organizer" on public.sponsor_interests;
create policy "sponsor interests visible to sponsor and organizer" on public.sponsor_interests for select using (sponsor_id = auth.uid() or public.is_event_organizer(event_id));
drop policy if exists "sponsors can submit interests" on public.sponsor_interests;
create policy "sponsors can submit interests" on public.sponsor_interests for insert with check (sponsor_id = auth.uid() and public.is_role('sponsor'));
drop policy if exists "organizers update sponsor interests" on public.sponsor_interests;
create policy "organizers update sponsor interests" on public.sponsor_interests for update using (public.is_event_organizer(event_id)) with check (public.is_event_organizer(event_id));

drop policy if exists "budgets visible to event organizer" on public.budgets;
create policy "budgets visible to event organizer" on public.budgets for select using (public.is_event_organizer(event_id));
drop policy if exists "organizers manage budgets" on public.budgets;
create policy "organizers manage budgets" on public.budgets for all using (public.is_event_organizer(event_id)) with check (public.is_event_organizer(event_id));

drop policy if exists "certificates public verification readable" on public.certificates;
create policy "certificates public verification readable" on public.certificates for select using (true);
drop policy if exists "organizers issue certificates" on public.certificates;
create policy "organizers issue certificates" on public.certificates for insert with check (public.is_event_organizer(event_id));
drop policy if exists "organizers update certificates" on public.certificates;
create policy "organizers update certificates" on public.certificates for update using (public.is_event_organizer(event_id)) with check (public.is_event_organizer(event_id));

drop policy if exists "proof records publicly readable" on public.proof_records;
create policy "proof records publicly readable" on public.proof_records for select using (true);
drop policy if exists "organizers create proof records for their events" on public.proof_records;
create policy "organizers create proof records for their events" on public.proof_records for insert with check (public.is_event_organizer(event_id));
drop policy if exists "organizers update proof records for their events" on public.proof_records;
create policy "organizers update proof records for their events" on public.proof_records for update using (public.is_event_organizer(event_id)) with check (public.is_event_organizer(event_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('event-posters', 'event-posters', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('certificates', 'certificates', true, 10485760, array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "event posters are publicly readable" on storage.objects;
create policy "event posters are publicly readable" on storage.objects for select using (bucket_id = 'event-posters');
drop policy if exists "certificates are publicly readable" on storage.objects;
create policy "certificates are publicly readable" on storage.objects for select using (bucket_id = 'certificates');
drop policy if exists "organizers upload event posters" on storage.objects;
create policy "organizers upload event posters" on storage.objects for insert with check (bucket_id = 'event-posters' and public.is_role('organizer'));
drop policy if exists "organizers update event posters" on storage.objects;
create policy "organizers update event posters" on storage.objects for update using (bucket_id = 'event-posters' and public.is_role('organizer')) with check (bucket_id = 'event-posters' and public.is_role('organizer'));
drop policy if exists "organizers upload certificates" on storage.objects;
create policy "organizers upload certificates" on storage.objects for insert with check (bucket_id = 'certificates' and public.is_role('organizer'));
drop policy if exists "organizers update certificates bucket" on storage.objects;
create policy "organizers update certificates bucket" on storage.objects for update using (bucket_id = 'certificates' and public.is_role('organizer')) with check (bucket_id = 'certificates' and public.is_role('organizer'));
