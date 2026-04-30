-- Spor branşları (taekwondo, kickboks, cimnastik, ...).
--
-- billing_model:
--   'monthly' → mevcut taekwondo akışı: aylık abonelik, period_start/end ile.
--   'package' → 8-derslik paket: paketler bittikçe yeni paket+invoice.
--
-- default_price ve default_package_size paket branşlarında baz değer.
-- Per-student override için children.package_price_override (M4) kullanılır.
--
-- M9 (backfill) bu tablodaki 'taekwondo' satırına mevcut classes/children'ı
-- bağlayacak — bu yüzden seed bu migration'da.

CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  billing_model text NOT NULL CHECK (billing_model IN ('monthly', 'package')),
  default_package_size integer NOT NULL DEFAULT 8 CHECK (default_package_size > 0),
  default_price numeric(10, 2) CHECK (default_price IS NULL OR default_price >= 0),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS branches_active_sort_idx
  ON public.branches (is_active, sort_order);

CREATE OR REPLACE FUNCTION public.tg_branches_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS branches_set_updated_at ON public.branches;
CREATE TRIGGER branches_set_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.tg_branches_set_updated_at();

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "branches_read" ON public.branches;
CREATE POLICY "branches_read"
  ON public.branches
  FOR SELECT
  TO authenticated
  USING (is_active OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "branches_admin_all" ON public.branches;
CREATE POLICY "branches_admin_all"
  ON public.branches
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.branches (
  code, name, billing_model, default_package_size, default_price, sort_order, is_active
) VALUES (
  'taekwondo', 'Taekwondo', 'monthly', 8, NULL, 1, true
)
ON CONFLICT (code) DO NOTHING;
