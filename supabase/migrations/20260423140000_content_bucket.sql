-- Content storage bucket
--
-- Public bucket for site content images (announcement covers, product
-- photos, etc.). Used by uploadContentImage() in src/lib/storage.ts.
--
-- Path convention: '{folder}/{timestamp}.{ext}'  e.g. 'announcements/...',
-- 'products/...'. Authoring is admin-only at the page layer (admin pages
-- guard access); we keep the storage policy at "any authenticated user"
-- to mirror the avatars bucket and avoid duplicating auth checks here.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content',
  'content',
  true,
  5 * 1024 * 1024,                               -- 5 MB cap
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "content_public_read" on storage.objects;
create policy "content_public_read"
  on storage.objects for select
  using (bucket_id = 'content');

drop policy if exists "content_authenticated_insert" on storage.objects;
create policy "content_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'content');

drop policy if exists "content_authenticated_update" on storage.objects;
create policy "content_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'content')
  with check (bucket_id = 'content');

drop policy if exists "content_authenticated_delete" on storage.objects;
create policy "content_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'content');
