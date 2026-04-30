-- Paket lesson üretici fonksiyonlar.
--
-- generate_package_lessons: paket oluşunca 8 (veya p_count) lesson satırı
-- üretir. classes.days (TEXT[] — pazartesi/carsamba/cuma) ve classes.time_start
-- baz alınarak p_start_date'ten ileriye doğru sıralı tarihler hesaplanır.
--
-- append_lesson: paket sonuna tek bonus ders ekler (telafi veya extra).
-- planned_end_date günceller; sayaç (used_slots) bu fonksiyonlarda DEĞİŞMEZ
-- — sayaç attendance handler trigger'ında yönetilir.
--
-- DOW eşlemesi: PostgreSQL EXTRACT(DOW) → 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi.
-- TrainingDay enum (src/types/content.types.ts): pazartesi/carsamba/cuma.
-- Ama gelecekte yeni branşlar farklı günlerde olacağı için 7 günü de eşleştiriyoruz.

CREATE OR REPLACE FUNCTION public.dow_to_turkish(p_date date)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE EXTRACT(DOW FROM p_date)::int
    WHEN 0 THEN 'pazar'
    WHEN 1 THEN 'pazartesi'
    WHEN 2 THEN 'sali'
    WHEN 3 THEN 'carsamba'
    WHEN 4 THEN 'persembe'
    WHEN 5 THEN 'cuma'
    WHEN 6 THEN 'cumartesi'
  END;
$$;

CREATE OR REPLACE FUNCTION public.generate_package_lessons(
  p_package_id uuid,
  p_count integer DEFAULT 8,
  p_start_date date DEFAULT current_date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class_id   uuid;
  v_child_id   uuid;
  v_days       text[];
  v_time_start text;
  v_cursor     date := p_start_date;
  v_made       integer := 0;
  v_index      integer := 1;
  v_iter       integer := 0;
  v_max_iter   integer := 200;  -- ~28 hafta tavanı; 8 ders için bolca yeter
  v_last_date  date;
BEGIN
  IF p_count <= 0 THEN
    RAISE EXCEPTION 'generate_package_lessons: p_count > 0 olmalı';
  END IF;

  SELECT class_id, child_id INTO v_class_id, v_child_id
  FROM public.packages
  WHERE id = p_package_id;

  IF v_class_id IS NULL THEN
    RAISE EXCEPTION 'Paket %1 class_id''siz, lesson üretilemez', p_package_id;
  END IF;

  SELECT days, time_start INTO v_days, v_time_start
  FROM public.classes WHERE id = v_class_id;

  IF v_days IS NULL OR array_length(v_days, 1) IS NULL THEN
    RAISE EXCEPTION 'Class % günsüz, lesson üretilemez', v_class_id;
  END IF;

  WHILE v_made < p_count AND v_iter < v_max_iter LOOP
    IF public.dow_to_turkish(v_cursor) = ANY (v_days) THEN
      INSERT INTO public.lessons (
        package_id, class_id, child_id,
        scheduled_date, scheduled_time, lesson_index,
        is_telafi, is_extra, status
      ) VALUES (
        p_package_id, v_class_id, v_child_id,
        v_cursor, v_time_start, v_index,
        false, false, 'scheduled'
      );
      v_made   := v_made + 1;
      v_index  := v_index + 1;
      v_last_date := v_cursor;
    END IF;
    v_cursor := v_cursor + 1;
    v_iter   := v_iter + 1;
  END LOOP;

  IF v_made < p_count THEN
    RAISE EXCEPTION 'generate_package_lessons: % lesson üretilemedi (%/% yapıldı)',
      p_count, v_made, p_count;
  END IF;

  UPDATE public.packages
  SET start_date       = COALESCE(start_date, p_start_date),
      planned_end_date = v_last_date
  WHERE id = p_package_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.append_lesson(
  p_package_id uuid,
  p_kind       text  -- 'telafi' veya 'extra'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class_id   uuid;
  v_child_id   uuid;
  v_days       text[];
  v_time_start text;
  v_last_date  date;
  v_last_index integer;
  v_cursor     date;
  v_iter       integer := 0;
  v_lesson_id  uuid;
BEGIN
  IF p_kind NOT IN ('telafi', 'extra') THEN
    RAISE EXCEPTION 'append_lesson: p_kind ''telafi'' veya ''extra'' olmalı';
  END IF;

  SELECT p.class_id, p.child_id
  INTO v_class_id, v_child_id
  FROM public.packages p
  WHERE p.id = p_package_id;

  IF v_class_id IS NULL THEN
    RAISE EXCEPTION 'Paket % class_id''siz, lesson eklenemez', p_package_id;
  END IF;

  SELECT MAX(scheduled_date), MAX(lesson_index)
  INTO v_last_date, v_last_index
  FROM public.lessons
  WHERE package_id = p_package_id;

  IF v_last_date IS NULL THEN
    RAISE EXCEPTION 'Paket % lesson''suz, append yapılamaz', p_package_id;
  END IF;

  SELECT days, time_start INTO v_days, v_time_start
  FROM public.classes WHERE id = v_class_id;

  v_cursor := v_last_date + 1;

  WHILE v_iter < 30 LOOP
    IF public.dow_to_turkish(v_cursor) = ANY (v_days) THEN
      INSERT INTO public.lessons (
        package_id, class_id, child_id,
        scheduled_date, scheduled_time, lesson_index,
        is_telafi, is_extra, status
      ) VALUES (
        p_package_id, v_class_id, v_child_id,
        v_cursor, v_time_start, v_last_index + 1,
        p_kind = 'telafi', p_kind = 'extra', 'scheduled'
      ) RETURNING id INTO v_lesson_id;

      UPDATE public.packages
      SET planned_end_date = v_cursor
      WHERE id = p_package_id;

      RETURN v_lesson_id;
    END IF;
    v_cursor := v_cursor + 1;
    v_iter   := v_iter + 1;
  END LOOP;

  RAISE EXCEPTION 'append_lesson: 30 gün içinde uygun bir scheduled gün bulunamadı (class %)', v_class_id;
END;
$$;
