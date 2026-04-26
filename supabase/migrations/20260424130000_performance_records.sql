-- Faz 2 — performans kayıtları
-- Antrenörün serbestçe ölçüm ve not girebileceği, veliyle paylaşılabilir
-- gelişim takibi kayıtları. Tüm ölçüm alanları nullable — antrenör
-- doldurduğu kadarını kaydeder.

CREATE TABLE IF NOT EXISTS public.performance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Fiziksel
  height_cm numeric(5,2),
  weight_kg numeric(5,2),

  -- Esneklik (yerden cm — küçük = esnek)
  split_cm numeric(5,2),
  forward_reach_cm numeric(5,2),

  -- Güç
  jump_cm numeric(5,2),

  -- Serbest notlar
  technique_notes text,
  general_note text,

  -- Müsabaka/sınav uygunluğu
  exam_ready boolean NOT NULL DEFAULT false,

  -- Tek foto (Faz 3'te çoklu foto eklenecek)
  photo_url text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS performance_records_child_id_idx
  ON public.performance_records(child_id, recorded_at DESC);

CREATE OR REPLACE FUNCTION public.tg_performance_records_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS performance_records_set_updated_at ON public.performance_records;
CREATE TRIGGER performance_records_set_updated_at
  BEFORE UPDATE ON public.performance_records
  FOR EACH ROW EXECUTE FUNCTION public.tg_performance_records_set_updated_at();

ALTER TABLE public.performance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_read_own" ON public.performance_records;
CREATE POLICY "parent_read_own"
  ON public.performance_records
  FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM public.children WHERE parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "coach_all" ON public.performance_records;
CREATE POLICY "coach_all"
  ON public.performance_records
  FOR ALL
  TO authenticated
  USING (public.is_coach(auth.uid()))
  WITH CHECK (public.is_coach(auth.uid()));

DROP POLICY IF EXISTS "admin_all" ON public.performance_records;
CREATE POLICY "admin_all"
  ON public.performance_records
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
