-- Push notification infrastructure
--
-- Adds:
--   • target_user_ids[] on notifications (multi-recipient admin sends)
--   • sent_push_at on notifications (idempotency marker)
--   • delivery_error on device_tokens (debug failed tokens)
--   • RLS update for inbox visibility with target_user_ids
--   • pg_cron + pg_net setup for the daily birthday job

-- ─── Schema -----------------------------------------------------------------

alter table public.notifications
  add column if not exists target_user_ids uuid[] null,
  add column if not exists sent_push_at timestamptz null;

create index if not exists notifications_sent_push_at_idx
  on public.notifications (sent_push_at);

create index if not exists notifications_target_user_ids_idx
  on public.notifications using gin (target_user_ids);

alter table public.device_tokens
  add column if not exists last_error text null,
  add column if not exists last_used_at timestamptz null;

create unique index if not exists device_tokens_user_token_uniq
  on public.device_tokens (user_id, token);

-- ─── RLS: inbox visibility -------------------------------------------------
-- Replaces the existing "notifications: user reads own" policy so that
-- notifications with target_user_ids containing the caller are also visible.

drop policy if exists "notifications: user reads own" on public.notifications;

create policy "notifications: user reads own"
  on public.notifications
  for select
  to authenticated
  using (
    -- Single-user target
    target_user = auth.uid()
    -- Multi-user target
    or auth.uid() = any(target_user_ids)
    -- Role-targeted ('all' or matches caller's role) — only when no
    -- per-user targeting is set.
    or (
      target_user is null
      and (target_user_ids is null or cardinality(target_user_ids) = 0)
      and (
        target_role = 'all'
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role = public.notifications.target_role
        )
      )
    )
  );

-- ─── Extensions for cron -----------------------------------------------------

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ─── Helper: schedule daily birthday push ----------------------------------
-- Runs 09:00 UTC daily = 12:00 TRT.
-- The URL + service_role_key are set as database settings; if missing, the
-- job silently no-ops (set them via `alter database ... set app.X = '...'`).

-- Reads the service_role key from Supabase Vault. Set it once (idempotent):
--   select vault.create_secret('YOUR_SERVICE_ROLE_KEY', 'service_role_key');

create or replace function public.trigger_birthday_notifications()
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  fn_url constant text := 'https://gzuubgohtmxsrpqqviyy.supabase.co/functions/v1/daily-birthday-notifications';
  fn_key text;
begin
  select decrypted_secret into fn_key
  from vault.decrypted_secrets
  where name = 'service_role_key'
  limit 1;

  if fn_key is null then
    raise notice 'service_role_key vault secret is missing; skipping';
    return;
  end if;

  perform net.http_post(
    url := fn_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || fn_key
    ),
    body := '{}'::jsonb
  );
end;
$$;

-- Unschedule any previous version to keep migrations re-runnable.
do $$
declare
  j_id bigint;
begin
  for j_id in select jobid from cron.job where jobname = 'daily-birthday-notifications'
  loop
    perform cron.unschedule(j_id);
  end loop;
end;
$$;

select cron.schedule(
  'daily-birthday-notifications',
  '0 9 * * *',
  $$ select public.trigger_birthday_notifications(); $$
);
