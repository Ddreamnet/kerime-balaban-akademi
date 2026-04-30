-- RLS sıkılaştırması: koçlar branş seviyesinden class seviyesine çekildi.
--
-- Eski: koç branş'ına atanmış mı? → tüm class'ları görür.
-- Yeni: koç class_coaches'ta o class'a atanmış mı? → SADECE o class'ı görür.
--
-- Etkilenen tablolar: lessons, packages, children, attendance.
-- cancel_class_lesson RPC yetki kontrolü de class_coaches'a göre güncellendi.

-- ─── lessons ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "coach_read_branch" ON public.lessons;
DROP POLICY IF EXISTS "coach_read_class" ON public.lessons;
CREATE POLICY "coach_read_class"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (
    class_id IN (SELECT class_id FROM public.class_coaches WHERE coach_id = auth.uid())
  );

-- ─── packages ───────────────────────────────────────────────────────────────
-- packages.class_id NULL olursa (rare) koç görmez; admin görür.
DROP POLICY IF EXISTS "coach_read_branch" ON public.packages;
DROP POLICY IF EXISTS "coach_read_class" ON public.packages;
CREATE POLICY "coach_read_class"
  ON public.packages
  FOR SELECT
  TO authenticated
  USING (
    class_id IS NOT NULL
    AND class_id IN (SELECT class_id FROM public.class_coaches WHERE coach_id = auth.uid())
  );

-- ─── children ───────────────────────────────────────────────────────────────
-- "coach read all" + "coach update name and avatar" kaldırıldı; class scope.
DROP POLICY IF EXISTS "children: coach read all" ON public.children;
DROP POLICY IF EXISTS "children: coach read assigned class" ON public.children;
CREATE POLICY "children: coach read assigned class"
  ON public.children
  FOR SELECT
  TO authenticated
  USING (
    public.is_coach(auth.uid())
    AND class_group_id IS NOT NULL
    AND class_group_id IN (SELECT class_id FROM public.class_coaches WHERE coach_id = auth.uid())
  );

DROP POLICY IF EXISTS "children: coach update name and avatar" ON public.children;
DROP POLICY IF EXISTS "children: coach update assigned class" ON public.children;
CREATE POLICY "children: coach update assigned class"
  ON public.children
  FOR UPDATE
  TO authenticated
  USING (
    public.is_coach(auth.uid())
    AND class_group_id IS NOT NULL
    AND class_group_id IN (SELECT class_id FROM public.class_coaches WHERE coach_id = auth.uid())
  )
  WITH CHECK (
    public.is_coach(auth.uid())
    AND class_group_id IS NOT NULL
    AND class_group_id IN (SELECT class_id FROM public.class_coaches WHERE coach_id = auth.uid())
  );

-- ─── attendance ─────────────────────────────────────────────────────────────
-- "coach all" çok geniş — class scope ile sıkılaştır.
DROP POLICY IF EXISTS "attendance: coach all" ON public.attendance;
DROP POLICY IF EXISTS "attendance: coach assigned class" ON public.attendance;
CREATE POLICY "attendance: coach assigned class"
  ON public.attendance
  FOR ALL
  TO authenticated
  USING (
    public.is_coach(auth.uid())
    AND class_id IS NOT NULL
    AND class_id IN (SELECT class_id FROM public.class_coaches WHERE coach_id = auth.uid())
  )
  WITH CHECK (
    public.is_coach(auth.uid())
    AND class_id IS NOT NULL
    AND class_id IN (SELECT class_id FROM public.class_coaches WHERE coach_id = auth.uid())
  );

-- ─── cancel_class_lesson RPC: yetki kontrolü class_coaches'a göre ──────────
CREATE OR REPLACE FUNCTION public.cancel_class_lesson(p_class_id uuid, p_date date)
RETURNS integer
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
  INTO v_branch_id, v_billing, v_class_name
  FROM public.classes cl JOIN public.branches b ON b.id = cl.branch_id
  WHERE cl.id = p_class_id;

  IF v_branch_id IS NULL THEN
    RAISE EXCEPTION 'Sınıf bulunamadı: %', p_class_id;
  END IF;

  IF NOT (
    public.is_admin(v_caller)
    OR EXISTS (SELECT 1 FROM public.class_coaches WHERE coach_id = v_caller AND class_id = p_class_id)
  ) THEN
    RAISE EXCEPTION 'cancel_class_lesson: yetkisiz (caller=%, class=%)', v_caller, p_class_id;
  END IF;

  PERFORM set_config('app.bulk_cancel', '1', true);

  FOR v_child IN
    SELECT id, parent_id, full_name FROM public.children
    WHERE class_group_id = p_class_id AND branch_id = v_branch_id
  LOOP
    INSERT INTO public.attendance (child_id, class_id, date, status, marked_by, notes)
    VALUES (v_child.id, p_class_id, p_date, 'excused', v_caller, 'class_cancelled')
    ON CONFLICT (child_id, date, class_id) DO UPDATE
      SET status = 'excused', marked_by = v_caller, notes = 'class_cancelled';

    IF v_child.parent_id IS NOT NULL AND v_billing = 'package' THEN
      INSERT INTO public.notifications (target_user, type, title, body)
      VALUES (v_child.parent_id, 'lesson_cancelled', 'Ders iptal edildi',
        format('%s için %s tarihli %s dersi iptal edildi. Paketin sonuna 1 ders eklendi.',
          v_child.full_name, to_char(p_date, 'DD.MM.YYYY'), v_class_name));
    ELSIF v_child.parent_id IS NOT NULL THEN
      INSERT INTO public.notifications (target_user, type, title, body)
      VALUES (v_child.parent_id, 'lesson_cancelled', 'Ders iptal edildi',
        format('%s için %s tarihli %s dersi iptal edildi.',
          v_child.full_name, to_char(p_date, 'DD.MM.YYYY'), v_class_name));
    END IF;

    v_count := v_count + 1;
  END LOOP;

  PERFORM set_config('app.bulk_cancel', '', true);
  RETURN v_count;
END;
$$;
