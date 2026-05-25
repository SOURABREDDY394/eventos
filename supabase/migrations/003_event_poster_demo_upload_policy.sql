-- Required while EventOS uses demo role access instead of Supabase Auth.
-- This allows the Vite frontend anon key to upload event posters into the public bucket.
-- Keep paths scoped to events/* and bucket MIME/size limits still apply.

drop policy if exists "demo role event poster uploads" on storage.objects;

create policy "demo role event poster uploads"
on storage.objects for insert
with check (
  bucket_id = 'event-posters'
  and name like 'events/%'
);
