alter table public.registrations
drop constraint if exists registrations_status_check;

alter table public.registrations
add constraint registrations_status_check
check (status in ('pending', 'approved', 'rejected', 'attended', 'cancelled'));

alter table public.registrations
alter column registration_code drop not null;

alter table public.registrations
add column if not exists form_answers jsonb default '{}'::jsonb;

alter table public.registrations
add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

alter table public.registrations
add column if not exists reviewed_at timestamptz;

alter table public.registrations
add column if not exists rejection_reason text;

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

create index if not exists event_form_fields_event_sort_idx
on public.event_form_fields(event_id, sort_order);

alter table public.event_form_fields enable row level security;

drop policy if exists "event form fields are publicly readable" on public.event_form_fields;
create policy "event form fields are publicly readable"
on public.event_form_fields for select
using (true);

drop policy if exists "organizers can manage own event form fields" on public.event_form_fields;
create policy "organizers can manage own event form fields"
on public.event_form_fields for all
using (
  exists (
    select 1 from public.events
    where events.id = event_form_fields.event_id
    and events.organizer_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.events
    where events.id = event_form_fields.event_id
    and events.organizer_id = auth.uid()
  )
);
