alter table public.volunteer_applications
add column if not exists role_requested text,
add column if not exists skills text[] not null default '{}',
add column if not exists availability text;

alter table public.volunteer_tasks
drop constraint if exists volunteer_tasks_status_check;

alter table public.volunteer_tasks
add constraint volunteer_tasks_status_check
check (status in ('assigned', 'todo', 'in_progress', 'completed'));

alter table public.volunteer_tasks
add column if not exists volunteer_id uuid references public.profiles(id) on delete set null,
add column if not exists task_role text,
add column if not exists start_time text,
add column if not exists end_time text,
add column if not exists skills_earned text[] not null default '{}';

update public.volunteer_tasks
set status = 'assigned'
where status = 'todo';

update public.volunteer_tasks
set volunteer_id = assigned_to
where volunteer_id is null and assigned_to is not null;

alter table public.proof_records
drop constraint if exists proof_records_record_type_check;

alter table public.proof_records
add constraint proof_records_record_type_check
check (record_type in ('attendance', 'certificate', 'volunteer', 'volunteer_task'));
