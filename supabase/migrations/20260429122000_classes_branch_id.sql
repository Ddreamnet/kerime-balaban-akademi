-- classes tablosuna branch_id ekle. M9 backfill sonrası NOT NULL yapılacak.
-- ON DELETE RESTRICT: branş silinemez aktif class varsa (soft-delete kullanılır).

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS classes_branch_idx ON public.classes(branch_id);
