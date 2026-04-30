-- payments.package_id: paket invoice'ları için.
-- Aylık (taekwondo) payments'larda NULL — period_start/end ile yönetilir.
-- Paket payments'ında period_start/end NULL — package_id ile yönetilir.
--
-- Mevcut migration (20260425120000) period_start/end/due_date'i NOT NULL
-- yapmıştı; period_start ve period_end için bu kısıtı kaldırıyoruz çünkü
-- paket payments'larında bunlar boş kalır. due_date her ikisinde de zorunlu
-- kalır (cron reminder bu kolonu kullanıyor).

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS package_id uuid REFERENCES public.packages(id) ON DELETE SET NULL;

ALTER TABLE public.payments
  ALTER COLUMN period_start DROP NOT NULL,
  ALTER COLUMN period_end DROP NOT NULL;

-- XOR constraint: payment ya monthly (period_start dolu) ya package (package_id dolu).
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_kind_xor;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_kind_xor
  CHECK (
    (period_start IS NOT NULL AND package_id IS NULL)
    OR (period_start IS NULL AND package_id IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS payments_package_idx
  ON public.payments(package_id)
  WHERE package_id IS NOT NULL;

-- Bir paketin sadece bir invoice satırı olabilir.
CREATE UNIQUE INDEX IF NOT EXISTS payments_package_uniq
  ON public.payments(package_id)
  WHERE package_id IS NOT NULL;
