-- Paket sistemi attendance handler — iki ayrı trigger:
--
--   1. tg_attendance_resolve_lesson (BEFORE INSERT)
--      - branch billing_model 'monthly' → no-op (taekwondo serbest yoklama).
--      - lesson_id zaten set ise → no-op (admin/coach manuel set ettiyse).
--      - Aktif paket varsa: o tarihteki scheduled lesson'a bağla, yoksa hata.
--      - Aktif paket yoksa → IMPLICIT CONSENT:
--          - Yeni paket oluştur (price snapshot: child override veya branch.default).
--          - 8 lesson generate (classes.days takvimine göre).
--          - Paket invoice oluştur (due_date = start_date + 7d).
--          - attendance.lesson_id := lesson_index=1.id.
--          - Bildirim: 'package_started' (veli + admin).
--
--   2. tg_attendance_state_machine (AFTER INSERT OR UPDATE OF status)
--      - lesson_id NULL ise → no-op.
--      - Paket 'active' değilse → no-op (completed/abandoned'a retro yazılmaz).
--      - State transition (idempotent): OLD undo + NEW apply.
--          * Sayaç (used_slots): SADECE normal lesson (telafi/extra değil)
--            present/absent için ±1.
--          * Telafi grant: normal lesson + NEW absent + paket telafi_granted=false.
--          * Telafi revoke: normal lesson + OLD absent + NEW != absent +
--            paket'te başka absent yok + telafi lesson scheduled.
--          * Extra append: NEW excused + OLD != excused (her tip lesson için).
--          * Extra delete: OLD excused + NEW != excused + extra lesson scheduled.
--      - lessons.status sync (scheduled → completed/excused).
--      - Paket dolduysa packages.status='completed' (bildirim ayrı trigger'da).

------------------------------------------------------------
-- Helper: aktif paketin id'sini döner (yoksa NULL).
------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.active_package_for_child(p_child_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM public.packages
  WHERE child_id = p_child_id AND status = 'active'
  ORDER BY package_number DESC
  LIMIT 1;
$$;

------------------------------------------------------------
-- Helper: paket fiyatı (child override > branch.default_price).
------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.compute_package_price(p_child_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(c.package_price_override, b.default_price)
  FROM public.children c
  JOIN public.branches b ON b.id = c.branch_id
  WHERE c.id = p_child_id;
$$;

------------------------------------------------------------
-- BEFORE INSERT trigger fonksiyonu.
------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tg_attendance_resolve_lesson()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_billing_model   text;
  v_branch_id       uuid;
  v_branch_size     integer;
  v_class_id        uuid;
  v_package_id      uuid;
  v_lesson_id       uuid;
  v_next_pkg_no     integer;
  v_price           numeric;
  v_payment_id      uuid;
  v_parent_id       uuid;
  v_child_name      text;
  v_lesson_count    integer;
BEGIN
  IF NEW.lesson_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Race condition önlemi: aynı child için concurrent attendance INSERT'lerini
  -- sıraya al. İlk INSERT implicit consent ile paket oluşturur, ikinci INSERT
  -- bekler ve paket'i bulup scheduled lesson'a bağlar (veya hata fırlatır).
  -- FOR UPDATE OF c sadece children row'unu lock'lar.
  SELECT c.branch_id, b.billing_model, b.default_package_size, c.parent_id, c.full_name
  INTO   v_branch_id, v_billing_model, v_branch_size, v_parent_id, v_child_name
  FROM public.children c
  JOIN public.branches b ON b.id = c.branch_id
  WHERE c.id = NEW.child_id
  FOR UPDATE OF c;

  IF v_billing_model IS NULL OR v_billing_model = 'monthly' THEN
    RETURN NEW;
  END IF;

  IF NEW.class_id IS NULL THEN
    RAISE EXCEPTION 'Paket sistemi yoklamasında class_id zorunludur (child=%)', NEW.child_id;
  END IF;

  v_package_id := public.active_package_for_child(NEW.child_id);

  IF v_package_id IS NOT NULL THEN
    SELECT id INTO v_lesson_id
    FROM public.lessons
    WHERE package_id = v_package_id
      AND scheduled_date = NEW.date
      AND status = 'scheduled'
    ORDER BY lesson_index
    LIMIT 1;

    IF v_lesson_id IS NULL THEN
      RAISE EXCEPTION
        'Aktif paket var (%), ama % tarihinde scheduled lesson yok',
        v_package_id, NEW.date;
    END IF;

    NEW.lesson_id := v_lesson_id;
    RETURN NEW;
  END IF;

  -- IMPLICIT CONSENT: yeni paket başlat.
  v_class_id := NEW.class_id;
  v_price    := public.compute_package_price(NEW.child_id);

  SELECT COALESCE(MAX(package_number), 0) + 1
  INTO v_next_pkg_no
  FROM public.packages
  WHERE child_id = NEW.child_id;

  INSERT INTO public.packages (
    child_id, branch_id, class_id,
    package_number, total_slots, used_slots, telafi_granted,
    start_date, price, status
  ) VALUES (
    NEW.child_id, v_branch_id, v_class_id,
    v_next_pkg_no, COALESCE(v_branch_size, 8), 0, false,
    NEW.date, v_price, 'active'
  ) RETURNING id INTO v_package_id;

  PERFORM public.generate_package_lessons(
    v_package_id, COALESCE(v_branch_size, 8), NEW.date
  );

  INSERT INTO public.payments (
    child_id, package_id, amount, due_date, status
  ) VALUES (
    NEW.child_id, v_package_id, v_price, NEW.date + 7, 'unpaid'
  ) RETURNING id INTO v_payment_id;

  UPDATE public.packages SET payment_id = v_payment_id WHERE id = v_package_id;

  SELECT id INTO v_lesson_id
  FROM public.lessons
  WHERE package_id = v_package_id AND lesson_index = 1;

  NEW.lesson_id := v_lesson_id;

  IF v_parent_id IS NOT NULL THEN
    INSERT INTO public.notifications (target_user, type, title, body)
    VALUES (
      v_parent_id, 'package_started',
      'Yeni paket başladı',
      format(
        '%s için %s. paket başladı. %s ders, ödeme: %s ₺ (son ödeme: %s).',
        v_child_name, v_next_pkg_no, COALESCE(v_branch_size, 8),
        COALESCE(v_price::text, '?'), to_char(NEW.date + 7, 'DD.MM.YYYY')
      )
    );
  END IF;

  INSERT INTO public.notifications (target_role, type, title, body)
  VALUES (
    'admin', 'package_started',
    'Yeni paket başladı',
    format(
      '%s için %s. paket başladı. %s ₺',
      v_child_name, v_next_pkg_no, COALESCE(v_price::text, '?')
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS attendance_resolve_lesson ON public.attendance;
CREATE TRIGGER attendance_resolve_lesson
  BEFORE INSERT ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.tg_attendance_resolve_lesson();

------------------------------------------------------------
-- AFTER INSERT OR UPDATE OF status: state machine.
------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tg_attendance_state_machine()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lesson_normal   boolean;
  v_is_telafi       boolean;
  v_is_extra        boolean;
  v_package_id      uuid;
  v_pkg_status      text;
  v_pkg_used        integer;
  v_pkg_total       integer;
  v_pkg_telafi_granted boolean;
  v_old_status      text;
  v_new_status      text;
  v_old_counts      boolean;
  v_new_counts      boolean;
  v_delta_used      integer;
  v_other_absent_cnt integer;
  v_telafi_lesson_id uuid;
  v_telafi_lesson_status text;
  v_extra_lesson_id  uuid;
  v_extra_lesson_status text;
  v_parent_id        uuid;
  v_child_name       text;
  v_planned_end      date;
  v_lesson_status    text;
BEGIN
  IF NEW.lesson_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT package_id, is_telafi, is_extra
  INTO v_package_id, v_is_telafi, v_is_extra
  FROM public.lessons
  WHERE id = NEW.lesson_id;

  IF v_package_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT status, used_slots, total_slots, telafi_granted
  INTO v_pkg_status, v_pkg_used, v_pkg_total, v_pkg_telafi_granted
  FROM public.packages
  WHERE id = v_package_id
  FOR UPDATE;

  v_lesson_normal := NOT (v_is_telafi OR v_is_extra);
  v_new_status    := NEW.status;
  v_old_status    := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END;

  -- lessons.status sync — paket statüsünden bağımsız HER ZAMAN yapılır,
  -- aksi halde paket completed olduktan sonra retro işaretleme'de lesson
  -- 'scheduled' kalır ve UI tutarsız görünür.
  v_lesson_status := CASE v_new_status
    WHEN 'present' THEN 'completed'
    WHEN 'absent'  THEN 'completed'
    WHEN 'excused' THEN 'excused'
    ELSE 'completed'
  END;

  UPDATE public.lessons
  SET status = v_lesson_status
  WHERE id = NEW.lesson_id;

  -- Paket aktif değilse: lesson sync yapıldı, geri kalan logic (sayaç, telafi
  -- grant/revoke, extra append/delete, completion check) atlanır. Completed/
  -- abandoned paket'e retro state machine yazılmaz.
  IF v_pkg_status <> 'active' THEN
    RETURN NEW;
  END IF;

  -- Sayaç delta'sı: SADECE normal lesson + present/absent.
  v_old_counts := (v_old_status IN ('present', 'absent')) AND v_lesson_normal;
  v_new_counts := (v_new_status IN ('present', 'absent')) AND v_lesson_normal;
  v_delta_used := (CASE WHEN v_new_counts THEN 1 ELSE 0 END)
                - (CASE WHEN v_old_counts THEN 1 ELSE 0 END);

  IF v_delta_used <> 0 THEN
    UPDATE public.packages
    SET used_slots = used_slots + v_delta_used
    WHERE id = v_package_id
    RETURNING used_slots INTO v_pkg_used;
  END IF;

  -- Bildirim için child bilgileri.
  SELECT c.parent_id, c.full_name
  INTO v_parent_id, v_child_name
  FROM public.children c
  JOIN public.lessons l ON l.child_id = c.id
  WHERE l.id = NEW.lesson_id;

  -- TELAFİ GRANT: normal lesson + NEW absent + (TG_OP=INSERT veya OLD!=absent) + henüz grant yok.
  IF v_lesson_normal
     AND v_new_status = 'absent'
     AND (TG_OP = 'INSERT' OR v_old_status <> 'absent')
     AND NOT v_pkg_telafi_granted
  THEN
    PERFORM public.append_lesson(v_package_id, 'telafi');
    UPDATE public.packages
    SET telafi_granted = true
    WHERE id = v_package_id;

    SELECT planned_end_date INTO v_planned_end
    FROM public.packages WHERE id = v_package_id;

    IF v_parent_id IS NOT NULL THEN
      INSERT INTO public.notifications (target_user, type, title, body)
      VALUES (
        v_parent_id, 'telafi_added',
        'Telafi hakkın eklendi',
        format(
          '%s''in paketine 1 telafi dersi eklendi. Yeni planlanan bitiş: %s.',
          v_child_name, to_char(v_planned_end, 'DD.MM.YYYY')
        )
      );
    END IF;
  END IF;

  -- TELAFİ REVOKE: normal lesson + OLD absent + NEW != absent + paket'te başka absent yok + telafi lesson scheduled.
  IF v_lesson_normal
     AND TG_OP = 'UPDATE'
     AND v_old_status = 'absent'
     AND v_new_status <> 'absent'
     AND v_pkg_telafi_granted
  THEN
    SELECT COUNT(*) INTO v_other_absent_cnt
    FROM public.attendance a
    JOIN public.lessons l ON l.id = a.lesson_id
    WHERE l.package_id = v_package_id
      AND a.status = 'absent'
      AND a.id <> NEW.id
      AND NOT (l.is_telafi OR l.is_extra);

    IF v_other_absent_cnt = 0 THEN
      SELECT id, status
      INTO v_telafi_lesson_id, v_telafi_lesson_status
      FROM public.lessons
      WHERE package_id = v_package_id AND is_telafi = true
      LIMIT 1;

      IF v_telafi_lesson_id IS NOT NULL AND v_telafi_lesson_status = 'scheduled' THEN
        DELETE FROM public.lessons WHERE id = v_telafi_lesson_id;

        UPDATE public.packages
        SET telafi_granted = false,
            planned_end_date = (
              SELECT MAX(scheduled_date) FROM public.lessons WHERE package_id = v_package_id
            )
        WHERE id = v_package_id;

        IF v_parent_id IS NOT NULL THEN
          INSERT INTO public.notifications (target_user, type, title, body)
          VALUES (
            v_parent_id, 'telafi_revoked',
            'Telafi geri alındı',
            format('%s''in paketinden telafi hakkı kaldırıldı (devam durumu güncellendi).', v_child_name)
          );
        END IF;
      END IF;
    END IF;
  END IF;

  -- EXTRA APPEND: NEW excused + (INSERT veya OLD != excused). Her tip lesson için (zincirleme dahil).
  -- Bildirim: cancel_class_lesson içinden çağrıldığında tek-tek 'excused_added'
  -- yerine fonksiyon kendi 'lesson_cancelled' toplu bildirimini gönderir;
  -- bu yüzden GUC bayrağı varsa per-row bildirimi atlanır.
  IF v_new_status = 'excused'
     AND (TG_OP = 'INSERT' OR v_old_status <> 'excused')
  THEN
    PERFORM public.append_lesson(v_package_id, 'extra');

    SELECT planned_end_date INTO v_planned_end
    FROM public.packages WHERE id = v_package_id;

    IF v_parent_id IS NOT NULL
       AND COALESCE(current_setting('app.bulk_cancel', true), '') <> '1'
    THEN
      INSERT INTO public.notifications (target_user, type, title, body)
      VALUES (
        v_parent_id, 'excused_added',
        'Mazeretli — ders ertelendi',
        format(
          '%s için %s tarihli ders mazeretli işaretlendi. Paketin yeni planlanan bitişi: %s.',
          v_child_name, to_char(NEW.date, 'DD.MM.YYYY'),
          to_char(v_planned_end, 'DD.MM.YYYY')
        )
      );
    END IF;
  END IF;

  -- EXTRA DELETE: OLD excused + NEW != excused + en son extra lesson scheduled ise.
  IF TG_OP = 'UPDATE'
     AND v_old_status = 'excused'
     AND v_new_status <> 'excused'
  THEN
    SELECT id, status
    INTO v_extra_lesson_id, v_extra_lesson_status
    FROM public.lessons
    WHERE package_id = v_package_id AND is_extra = true
    ORDER BY lesson_index DESC
    LIMIT 1;

    IF v_extra_lesson_id IS NOT NULL AND v_extra_lesson_status = 'scheduled' THEN
      DELETE FROM public.lessons WHERE id = v_extra_lesson_id;

      UPDATE public.packages
      SET planned_end_date = (
        SELECT MAX(scheduled_date) FROM public.lessons WHERE package_id = v_package_id
      )
      WHERE id = v_package_id;
    END IF;
  END IF;

  -- PAKET TAMAMLANMA KONTROLÜ.
  IF v_pkg_used >= v_pkg_total THEN
    UPDATE public.packages
    SET status = 'completed',
        actual_end_date = current_date
    WHERE id = v_package_id AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS attendance_state_machine ON public.attendance;
CREATE TRIGGER attendance_state_machine
  AFTER INSERT OR UPDATE OF status ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.tg_attendance_state_machine();
