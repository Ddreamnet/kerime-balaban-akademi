-- Class-bazlı koç atama (m2m). Bir koç birden fazla class'ta öğretebilir,
-- bir class'ta birden fazla koç olabilir.
--
-- coach_branches (Faz 1+2) branş seviyesi izindi: koç atandığı branş'ın
-- TÜM class'larını görürdü. Bu çok geniş — kullanıcı talebi class seviyesi
-- granülasyon. Yeni RLS policy'leri bu tablo üzerinden çalışır.
--
-- coach_branches mevcut kalır (admin UI'da koça class atarken hangi branş
-- alanında olduğunu bilmek için kullanışlı), ama production scope artık
-- class_coaches'tır.

CREATE TABLE IF NOT EXISTS public.class_coaches (
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (class_id, coach_id)
);

CREATE INDEX IF NOT EXISTS class_coaches_class_idx ON public.class_coaches(class_id);
CREATE INDEX IF NOT EXISTS class_coaches_coach_idx ON public.class_coaches(coach_id);

ALTER TABLE public.class_coaches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read" ON public.class_coaches;
CREATE POLICY "authenticated_read"
  ON public.class_coaches
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_all" ON public.class_coaches;
CREATE POLICY "admin_all"
  ON public.class_coaches
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
