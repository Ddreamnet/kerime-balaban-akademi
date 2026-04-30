-- Faz 1 / M8 (20260429131000) period_start ve period_end için NOT NULL'ı
-- kaldırmıştı, ancak period_month ve period_year için aynı düzenleme
-- atlanmıştı. Paket invoice'larında period kavramı yok (package_id ile
-- yönetilir), bu yüzden bu iki kolon da nullable olmalı.
--
-- Mevcut monthly satırlarda her iki kolon da dolu kalır; paket satırlarında
-- NULL gelir. Period XOR constraint zaten period_start üzerinden çalışıyor.

ALTER TABLE public.payments
  ALTER COLUMN period_month DROP NOT NULL,
  ALTER COLUMN period_year  DROP NOT NULL;
