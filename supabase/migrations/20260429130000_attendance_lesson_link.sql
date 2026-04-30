-- attendance.lesson_id: paket sistemindeki lesson satırına bağlantı.
-- Taekwondo (monthly) attendance'larda NULL kalır (mevcut serbest-tarih akışı).
-- Paket sistemindeki attendance her zaman bir lesson'a bağlıdır.

ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS attendance_lesson_idx
  ON public.attendance(lesson_id)
  WHERE lesson_id IS NOT NULL;
