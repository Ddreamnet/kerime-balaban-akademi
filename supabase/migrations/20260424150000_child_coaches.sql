-- Öğrenci-antrenör çok-çoka atama tablosu.
-- Bir çocuk birden fazla antrenöre, bir antrenör birden fazla çocuğa atanabilir.

CREATE TABLE IF NOT EXISTS public.child_coaches (
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (child_id, coach_id)
);

CREATE INDEX IF NOT EXISTS child_coaches_coach_idx ON public.child_coaches(coach_id);
CREATE INDEX IF NOT EXISTS child_coaches_child_idx ON public.child_coaches(child_id);

ALTER TABLE public.child_coaches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_read_own" ON public.child_coaches;
CREATE POLICY "parent_read_own"
  ON public.child_coaches
  FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM public.children WHERE parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "coach_read_own" ON public.child_coaches;
CREATE POLICY "coach_read_own"
  ON public.child_coaches
  FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "admin_all" ON public.child_coaches;
CREATE POLICY "admin_all"
  ON public.child_coaches
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
