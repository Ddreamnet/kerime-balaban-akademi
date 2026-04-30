-- Antrenör → branş çok-çoka atama.
-- Bir koç birden fazla branşta öğretebilir, bir branşta birden fazla koç olabilir.
--
-- coach_branches RLS scope'u sağlar: koç yalnızca atandığı branşların
-- class/lesson/package'larını görür (M5, M6, vd. policy'lerinden referanslanır).
--
-- child_coaches (mevcut, 20260424150000) öğrenci-koç specific atama için ayrı
-- durur — bu tablo permission scope'u, oraki tablo workload assignment.

CREATE TABLE IF NOT EXISTS public.coach_branches (
  coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (coach_id, branch_id)
);

CREATE INDEX IF NOT EXISTS coach_branches_branch_idx ON public.coach_branches(branch_id);
CREATE INDEX IF NOT EXISTS coach_branches_coach_idx ON public.coach_branches(coach_id);

ALTER TABLE public.coach_branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read" ON public.coach_branches;
CREATE POLICY "authenticated_read"
  ON public.coach_branches
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_all" ON public.coach_branches;
CREATE POLICY "admin_all"
  ON public.coach_branches
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
