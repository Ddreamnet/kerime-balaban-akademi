-- Paket tamamlama bildirim trigger'ı.
--
-- packages.status 'active' → 'completed' transition'ında veli ve admin'e
-- 'package_completed' bildirimi atılır. Yeni paket OLUŞMAZ — implicit consent
-- akışı ile (attendance handler) bir sonraki yoklama işaretlemesinde
-- otomatik tetiklenir.
--
-- Bu trigger AFTER UPDATE'tir; attendance handler içinde packages.status
-- güncellendikten sonra çalışır.

CREATE OR REPLACE FUNCTION public.tg_package_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
  v_child_name text;
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  SELECT parent_id, full_name INTO v_parent_id, v_child_name
  FROM public.children WHERE id = NEW.child_id;

  IF v_parent_id IS NOT NULL THEN
    INSERT INTO public.notifications (target_user, type, title, body)
    VALUES (
      v_parent_id, 'package_completed',
      'Paket tamamlandı',
      format(
        '%s''in %s. paketi tamamlandı. Yeni paket için bir sonraki derse gelmesi yeterli.',
        v_child_name, NEW.package_number
      )
    );
  END IF;

  INSERT INTO public.notifications (target_role, type, title, body)
  VALUES (
    'admin', 'package_completed',
    'Paket tamamlandı',
    format('%s — %s. paket tamamlandı.', v_child_name, NEW.package_number)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS package_completed ON public.packages;
CREATE TRIGGER package_completed
  AFTER UPDATE OF status ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.tg_package_completed();
