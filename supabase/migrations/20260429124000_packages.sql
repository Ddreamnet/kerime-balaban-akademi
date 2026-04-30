-- 8-derslik paket takip tablosu.
-- Sadece billing_model='package' branşlardaki çocuklar için kayıt oluşur.
-- Paket başlangıcı = ilk attendance işaretlemesi (implicit consent — Faz 2 trigger).
-- Paket bitişi = used_slots == total_slots olunca, son lesson işaretlendiğinde.
--
-- price: paket oluşurken snapshot (branches.default_price veya
--        children.package_price_override). Sonradan branş veya child
--        override değişse paket fiyatı etkilenmez.
--
-- telafi_granted: paket başına max 1 telafi. İlk absent'te true olur.

CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,

  package_number integer NOT NULL CHECK (package_number > 0),

  total_slots integer NOT NULL DEFAULT 8 CHECK (total_slots > 0),
  used_slots integer NOT NULL DEFAULT 0 CHECK (used_slots >= 0),
  telafi_granted boolean NOT NULL DEFAULT false,

  start_date date,
  planned_end_date date,
  actual_end_date date,

  price numeric(10, 2) CHECK (price IS NULL OR price >= 0),

  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'abandoned')),

  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT packages_child_number_uniq UNIQUE (child_id, package_number),
  CONSTRAINT packages_used_lte_total CHECK (used_slots <= total_slots)
);

CREATE INDEX IF NOT EXISTS packages_child_idx ON public.packages(child_id);
CREATE INDEX IF NOT EXISTS packages_active_idx
  ON public.packages(child_id)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS packages_branch_idx ON public.packages(branch_id);

CREATE OR REPLACE FUNCTION public.tg_packages_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS packages_set_updated_at ON public.packages;
CREATE TRIGGER packages_set_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.tg_packages_set_updated_at();

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Veli kendi çocuğunun paketlerini görür.
DROP POLICY IF EXISTS "parent_read_own" ON public.packages;
CREATE POLICY "parent_read_own"
  ON public.packages
  FOR SELECT
  TO authenticated
  USING (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

-- Koç sadece kendi branşlarındaki paketleri görür.
DROP POLICY IF EXISTS "coach_read_branch" ON public.packages;
CREATE POLICY "coach_read_branch"
  ON public.packages
  FOR SELECT
  TO authenticated
  USING (
    branch_id IN (SELECT branch_id FROM public.coach_branches WHERE coach_id = auth.uid())
  );

-- Adminler tam yetki.
DROP POLICY IF EXISTS "admin_all" ON public.packages;
CREATE POLICY "admin_all"
  ON public.packages
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- NOT: Paket oluşturma (INSERT) ve güncelleme (status, used_slots) Faz 2'deki
-- SECURITY DEFINER trigger'ları üzerinden yapılır; koç/veli'ye write policy
-- vermiyoruz (admin haricinde).
