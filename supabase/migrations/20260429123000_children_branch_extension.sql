-- children tablosuna branch_id ve package_price_override ekle.
-- branch_id: M9'da backfill edilip NOT NULL yapılacak.
-- package_price_override: paket branşlarında öğrenci-spesifik fiyat override
--                         (NULL ise branches.default_price kullanılır).

ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS package_price_override numeric(10, 2)
    CHECK (package_price_override IS NULL OR package_price_override >= 0);

CREATE INDEX IF NOT EXISTS children_branch_idx ON public.children(branch_id);
