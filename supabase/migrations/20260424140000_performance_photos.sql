-- Faz 3 — performans kayıtlarına çoklu foto desteği.
-- Tek photo_url kolonu yerine ayrı tablo; her foto için opsiyonel caption ve sort_order.

CREATE TABLE IF NOT EXISTS public.performance_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES public.performance_records(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS performance_photos_record_idx
  ON public.performance_photos(record_id, sort_order);

INSERT INTO public.performance_photos (record_id, url, sort_order)
SELECT id, photo_url, 0
FROM public.performance_records
WHERE photo_url IS NOT NULL;

ALTER TABLE public.performance_records DROP COLUMN IF EXISTS photo_url;

ALTER TABLE public.performance_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_read_own" ON public.performance_photos;
CREATE POLICY "parent_read_own"
  ON public.performance_photos
  FOR SELECT
  TO authenticated
  USING (
    record_id IN (
      SELECT pr.id
      FROM public.performance_records pr
      JOIN public.children c ON c.id = pr.child_id
      WHERE c.parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "coach_all" ON public.performance_photos;
CREATE POLICY "coach_all"
  ON public.performance_photos
  FOR ALL
  TO authenticated
  USING (public.is_coach(auth.uid()))
  WITH CHECK (public.is_coach(auth.uid()));

DROP POLICY IF EXISTS "admin_all" ON public.performance_photos;
CREATE POLICY "admin_all"
  ON public.performance_photos
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
