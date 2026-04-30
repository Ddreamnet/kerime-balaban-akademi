-- children_billing_changed (20260425120000) trigger'ını branş-aware yap.
-- Çocuğun branş'ı 'package' modeli ise aylık period üretme; eğer çocuk
-- monthly'den package'a geçtiyse gelecek unpaid monthly satırlarını sil.
--
-- Trigger ayrıca branch_id değişimini de yakalar artık.

CREATE OR REPLACE FUNCTION public.children_billing_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  due_day int;
  v_billing_model text;
BEGIN
  -- Skip when none of the relevant columns changed (UPDATE only).
  IF tg_op = 'UPDATE'
     AND (new.billing_start_date IS NOT DISTINCT FROM old.billing_start_date)
     AND (new.payment_due_day    IS NOT DISTINCT FROM old.payment_due_day)
     AND (new.branch_id          IS NOT DISTINCT FROM old.branch_id) THEN
    RETURN new;
  END IF;

  -- Branş paket modeli ise aylık period üretme.
  -- Çocuk monthly→package geçtiyse gelecek unpaid monthly'leri temizle.
  SELECT billing_model INTO v_billing_model
  FROM public.branches
  WHERE id = new.branch_id;

  IF v_billing_model = 'package' THEN
    DELETE FROM public.payments
    WHERE child_id = new.id
      AND status = 'unpaid'
      AND package_id IS NULL
      AND period_start IS NOT NULL
      AND period_start >= current_date;
    RETURN new;
  END IF;

  -- billing_start_date temizlendi: gelecek unpaid monthly'leri sil.
  IF new.billing_start_date IS NULL THEN
    DELETE FROM public.payments
    WHERE child_id = new.id
      AND status = 'unpaid'
      AND package_id IS NULL
      AND period_start IS NOT NULL
      AND period_start >= current_date;
    RETURN new;
  END IF;

  due_day := COALESCE(
    new.payment_due_day,
    EXTRACT(day FROM new.billing_start_date)::int
  );

  -- Yeni anchor'dan itibaren gelecek unpaid monthly'leri temizle (paid'ler korunur).
  DELETE FROM public.payments
  WHERE child_id = new.id
    AND status = 'unpaid'
    AND package_id IS NULL
    AND period_start IS NOT NULL
    AND period_start >= new.billing_start_date;

  PERFORM public.generate_payment_periods(
    new.id, new.billing_start_date, due_day, 12
  );

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS children_billing_changed ON public.children;
CREATE TRIGGER children_billing_changed
AFTER INSERT OR UPDATE OF billing_start_date, payment_due_day, branch_id
ON public.children
FOR EACH ROW EXECUTE FUNCTION public.children_billing_changed();
