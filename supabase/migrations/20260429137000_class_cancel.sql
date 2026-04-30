-- Class-level ders iptali.
--
-- cancel_class_lesson(p_class_id, p_date): belirtilen sınıfa kayıtlı tüm
-- öğrenciler için o tarihli yoklamayı 'excused' (mazeretli) yapar. Attendance
-- handler her biri için sayaç değiştirmez (excused) ve +1 extra lesson append
-- eder; class-level akışta tek-tek 'excused_added' bildirimi yerine BURADA
-- toplu 'lesson_cancelled' bildirimi gönderilir (app.bulk_cancel GUC ile
-- attendance trigger per-row bildirimi suppress eder).
--
-- Yetki: admin veya o branşın koçu çağırabilir. RLS yerine SECURITY DEFINER +
-- explicit yetki kontrolü.

CREATE OR REPLACE FUNCTION public.cancel_class_lesson(
  p_class_id uuid,
  p_date     date
)
RETURNS integer  -- iptal edilen öğrenci sayısı
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller     uuid := auth.uid();
  v_branch_id  uuid;
  v_billing    text;
  v_class_name text;
  v_count      integer := 0;
  v_child      record;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'cancel_class_lesson: kimliklendirilmemiş çağrı';
  END IF;

  SELECT cl.branch_id, b.billing_model, cl.name
  INTO   v_branch_id, v_billing, v_class_name
  FROM public.classes cl
  JOIN public.branches b ON b.id = cl.branch_id
  WHERE cl.id = p_class_id;

  IF v_branch_id IS NULL THEN
    RAISE EXCEPTION 'Sınıf bulunamadı: %', p_class_id;
  END IF;

  -- Yetki: admin veya o branşın koçu.
  -- NOT: Bu sürüm fresh-deploy timestamp sırasına göre `coach_branches` (M2)
  -- üzerinden çalışır — `class_coaches` tablosu M16 (20260429142000) ile
  -- sonradan eklendiği için bu migration o tarihte erişemez. M17
  -- (20260429143000_class_scope_rls.sql) fonksiyonu class_coaches'a göre
  -- yeniden tanımlar — production'da çalışan SON sürüm odur. Bu migration'ı
  -- silmek history'yi kırar, bu yüzden olduğu gibi bırakıldı.
  IF NOT (
    public.is_admin(v_caller)
    OR EXISTS (
      SELECT 1 FROM public.coach_branches
      WHERE coach_id = v_caller AND branch_id = v_branch_id
    )
  ) THEN
    RAISE EXCEPTION 'cancel_class_lesson: yetkisiz (% — %)', v_caller, v_branch_id;
  END IF;

  -- Per-row 'excused_added' bildirimini atla; toplu bildirimi aşağıda gönderiyoruz.
  PERFORM set_config('app.bulk_cancel', '1', true);

  FOR v_child IN
    SELECT id, parent_id, full_name
    FROM public.children
    WHERE class_group_id = p_class_id
  LOOP
    -- Mevcut attendance varsa UPDATE, yoksa INSERT (trigger'lar her iki durumda da çalışır).
    INSERT INTO public.attendance (
      child_id, class_id, date, status, marked_by, notes
    ) VALUES (
      v_child.id, p_class_id, p_date, 'excused', v_caller, 'class_cancelled'
    )
    ON CONFLICT (child_id, date, class_id) DO UPDATE
      SET status    = 'excused',
          marked_by = v_caller,
          notes     = 'class_cancelled';

    IF v_child.parent_id IS NOT NULL AND v_billing = 'package' THEN
      INSERT INTO public.notifications (target_user, type, title, body)
      VALUES (
        v_child.parent_id, 'lesson_cancelled',
        'Ders iptal edildi',
        format(
          '%s için %s tarihli %s dersi iptal edildi. Paketin sonuna 1 ders eklendi.',
          v_child.full_name, to_char(p_date, 'DD.MM.YYYY'), v_class_name
        )
      );
    ELSIF v_child.parent_id IS NOT NULL THEN
      -- Monthly (taekwondo) — sadece bilgi notu, paket akışı yok.
      INSERT INTO public.notifications (target_user, type, title, body)
      VALUES (
        v_child.parent_id, 'lesson_cancelled',
        'Ders iptal edildi',
        format('%s için %s tarihli %s dersi iptal edildi.',
          v_child.full_name, to_char(p_date, 'DD.MM.YYYY'), v_class_name)
      );
    END IF;

    v_count := v_count + 1;
  END LOOP;

  -- GUC'yi sıfırla (transaction sonunda zaten reset olur ama açık olalım).
  PERFORM set_config('app.bulk_cancel', '', true);

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_class_lesson(uuid, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_class_lesson(uuid, date) TO authenticated;
