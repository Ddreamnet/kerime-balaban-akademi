-- Faz E — Payment reminder cron
--
-- Schedules a daily job that calls the payment-reminders edge function at
-- 17:00 UTC = 20:00 TRT. The function looks up payments whose due_date is
-- exactly 2 days from today (TRT) and sends "vade yaklaştı" pushes.
--
-- Mirrors the daily-birthday-notifications setup in
-- 20260419120000_notifications_push.sql:
--   • pg_cron + pg_net extensions (already enabled there; ensured here for
--     idempotency)
--   • service_role_key read from Supabase Vault
--   • re-runnable: previous schedule with the same name is unscheduled first

create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.trigger_payment_reminders()
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  fn_url constant text :=
    'https://gzuubgohtmxsrpqqviyy.supabase.co/functions/v1/payment-reminders';
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

-- Re-runnable: drop any prior schedule with the same name.
do $$
declare
  j_id bigint;
begin
  for j_id in select jobid from cron.job where jobname = 'payment-reminders'
  loop
    perform cron.unschedule(j_id);
  end loop;
end;
$$;

-- 17:00 UTC = 20:00 TRT (UTC+3, no DST). Daily.
select cron.schedule(
  'payment-reminders',
  '0 17 * * *',
  $$ select public.trigger_payment_reminders(); $$
);
