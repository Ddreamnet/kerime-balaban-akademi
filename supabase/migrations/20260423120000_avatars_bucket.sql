-- Avatars storage bucket
--
-- Creates the public 'avatars' bucket used by uploadAvatar() in src/lib/storage.ts
-- and the RLS policies that scope writes to each user's own folder.
--
-- Path convention: '{userId}/{timestamp}.{ext}'
--   • userId = auth.uid() (parent's own avatar) OR any UUID for child avatars
--     uploaded by the parent. Writes for the latter are guarded at the API
--     layer (parent must own the child); on storage we restrict to
--     authenticated role.

-- ─── Bucket ----------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2 * 1024 * 1024,                               -- 2 MB cap (we resize client-side to ~512px)
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ─── RLS policies on storage.objects ---------------------------------------

-- Public read (bucket is public, but an explicit SELECT policy keeps RLS
-- consistent if the bucket is later flipped to private).
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Authenticated users can write (insert/update/delete) any object in the
-- avatars bucket. We keep this broad because parents need to upload avatars
-- for their children (path prefix = childId, not auth.uid()), and that
-- ownership is enforced at the application layer.
drop policy if exists "avatars_authenticated_insert" on storage.objects;
create policy "avatars_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

drop policy if exists "avatars_authenticated_update" on storage.objects;
create policy "avatars_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');

drop policy if exists "avatars_authenticated_delete" on storage.objects;
create policy "avatars_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars');
