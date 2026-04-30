-- Mevcut tüm classes ve children'ı default 'taekwondo' branşına bağla.
-- Backfill sonrası branch_id NOT NULL yap.

DO $$
DECLARE
  v_taekwondo_id uuid;
BEGIN
  SELECT id INTO v_taekwondo_id
  FROM public.branches
  WHERE code = 'taekwondo';

  IF v_taekwondo_id IS NULL THEN
    RAISE EXCEPTION 'Default taekwondo branş bulunamadı (M1 seed başarısız mı?)';
  END IF;

  UPDATE public.classes
  SET branch_id = v_taekwondo_id
  WHERE branch_id IS NULL;

  UPDATE public.children
  SET branch_id = v_taekwondo_id
  WHERE branch_id IS NULL;
END $$;

ALTER TABLE public.classes
  ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE public.children
  ALTER COLUMN branch_id SET NOT NULL;
