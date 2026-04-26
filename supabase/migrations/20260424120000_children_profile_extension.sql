-- Faz 1 — children profil genişletmesi
-- Performans takibi öncesi sabit kimlik/akademi/antrenör not alanları.
-- Tüm alanlar nullable: antrenör serbest, istediğini doldurur.

ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('erkek', 'kiz')),
  ADD COLUMN IF NOT EXISTS tc_no TEXT,
  ADD COLUMN IF NOT EXISTS license_no TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS coach_note TEXT;
