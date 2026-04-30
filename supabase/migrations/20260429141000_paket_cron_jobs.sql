-- Faz 3 — Paket sistemi için 3 yeni cron job + trigger fonksiyonları.
--
-- Mevcut payment-reminders / daily-birthday-notifications pattern'ini takip
-- eder: her trigger fn vault'tan service_role_key'i alır ve edge function'ı
-- net.http_post ile çağırır.
--
-- Schedule (UTC | TRT):
--   lesson-reminder              15:00 UTC | 18:00 TRT — yarınki dersler
--   attendance-missing-detector  18:00 UTC | 21:00 TRT — bugün eksik yoklamalar
--   package-inactive-detector    09:30 UTC | 12:30 TRT — paket biteli 14+ gün
--
-- TRT = UTC+3 sabittir (DST yok).

CREATE OR REPLACE FUNCTION public.trigger_lesson_reminder()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault'
AS $$
DECLARE
  fn_url CONSTANT text := 'https://gzuubgohtmxsrpqqviyy.supabase.co/functions/v1/lesson-reminder';
  fn_key text;
BEGIN
  SELECT decrypted_secret INTO fn_key
  FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1;

  IF fn_key IS NULL THEN
    RAISE NOTICE 'service_role_key vault secret missing; skipping';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || fn_key),
    body := '{}'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_attendance_missing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault'
AS $$
DECLARE
  fn_url CONSTANT text := 'https://gzuubgohtmxsrpqqviyy.supabase.co/functions/v1/attendance-missing-detector';
  fn_key text;
BEGIN
  SELECT decrypted_secret INTO fn_key
  FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1;

  IF fn_key IS NULL THEN
    RAISE NOTICE 'service_role_key vault secret missing; skipping';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || fn_key),
    body := '{}'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_package_inactive()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'vault'
AS $$
DECLARE
  fn_url CONSTANT text := 'https://gzuubgohtmxsrpqqviyy.supabase.co/functions/v1/package-inactive-detector';
  fn_key text;
BEGIN
  SELECT decrypted_secret INTO fn_key
  FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1;

  IF fn_key IS NULL THEN
    RAISE NOTICE 'service_role_key vault secret missing; skipping';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || fn_key),
    body := '{}'::jsonb
  );
END;
$$;

-- Cron job'ları kaydet (idempotent: existing varsa unschedule, sonra schedule).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='lesson-reminder') THEN
    PERFORM cron.unschedule('lesson-reminder');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='attendance-missing-detector') THEN
    PERFORM cron.unschedule('attendance-missing-detector');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='package-inactive-detector') THEN
    PERFORM cron.unschedule('package-inactive-detector');
  END IF;
END $$;

SELECT cron.schedule('lesson-reminder',             '0 15 * * *', 'SELECT public.trigger_lesson_reminder();');
SELECT cron.schedule('attendance-missing-detector', '0 18 * * *', 'SELECT public.trigger_attendance_missing();');
SELECT cron.schedule('package-inactive-detector',   '30 9 * * *', 'SELECT public.trigger_package_inactive();');
