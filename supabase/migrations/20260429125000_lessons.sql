-- Önceden planlanmış ders satırları. Her paket oluşunca branş takvimine
-- (classes.days + classes.time_start) göre 8 lesson üretilir.
-- absent ile +1 telafi (is_telafi=true), max 1.
-- mazeretli/iptal ile +1 extra (is_extra=true), her biri için, sınırsız.
--
-- lesson_index: sıralı (1, 2, 3...). is_telafi/is_extra ile flag'lenmiş
-- bonus lesson'lar da bu numaralandırmaya dahildir.
--
-- Coach UI'daki "x/8" göstergesi: kullanılan slot sayısı =
--   completed lesson'lar (excused hariç). 8 = packages.total_slots.

CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,

  scheduled_date date NOT NULL,
  scheduled_time text,
  lesson_index integer NOT NULL CHECK (lesson_index > 0),

  is_telafi boolean NOT NULL DEFAULT false,
  is_extra boolean NOT NULL DEFAULT false,

  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'excused', 'cancelled')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT lessons_telafi_extra_exclusive
    CHECK (NOT (is_telafi AND is_extra)),
  CONSTRAINT lessons_package_index_uniq
    UNIQUE (package_id, lesson_index)
);

CREATE INDEX IF NOT EXISTS lessons_child_date_idx
  ON public.lessons(child_id, scheduled_date);
CREATE INDEX IF NOT EXISTS lessons_class_date_idx
  ON public.lessons(class_id, scheduled_date);
CREATE INDEX IF NOT EXISTS lessons_status_idx
  ON public.lessons(status);
CREATE INDEX IF NOT EXISTS lessons_package_idx
  ON public.lessons(package_id);

CREATE OR REPLACE FUNCTION public.tg_lessons_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lessons_set_updated_at ON public.lessons;
CREATE TRIGGER lessons_set_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.tg_lessons_set_updated_at();

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Veli kendi çocuğunun lesson'larını görür.
DROP POLICY IF EXISTS "parent_read_own" ON public.lessons;
CREATE POLICY "parent_read_own"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

-- Koç sadece kendi branşlarındaki lesson'ları görür.
DROP POLICY IF EXISTS "coach_read_branch" ON public.lessons;
CREATE POLICY "coach_read_branch"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM public.classes
      WHERE branch_id IN (
        SELECT branch_id FROM public.coach_branches WHERE coach_id = auth.uid()
      )
    )
  );

-- Adminler tam yetki.
DROP POLICY IF EXISTS "admin_all" ON public.lessons;
CREATE POLICY "admin_all"
  ON public.lessons
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
