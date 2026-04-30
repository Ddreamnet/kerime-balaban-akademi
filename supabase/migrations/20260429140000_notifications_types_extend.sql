-- Faz 2 hot fix: notifications.type CHECK constraint'ini paket sistem
-- bildirim tipleri için genişlet.
--
-- Faz 2 trigger'ları (attendance handler, package_completed, class_cancel)
-- yeni notification type'ları kullanıyor; mevcut constraint sadece 5 tipe
-- ('general', 'birthday', 'payment', 'exam', 'attendance') izin veriyordu
-- ve trigger'da hata fırlatıyordu. Bu migration constraint'i paket sistem
-- tipleri + Faz 3 (cron) tipleri için ileriye dönük olarak genişletir.

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    -- Mevcut (Faz öncesi)
    'general', 'birthday', 'payment', 'exam', 'attendance',
    -- Faz 2 trigger tipleri
    'package_started', 'package_completed', 'package_ending',
    'telafi_added', 'telafi_revoked',
    'excused_added', 'lesson_cancelled',
    -- Faz 3 cron tipleri (edge function'lar için hazır)
    'lesson_tomorrow', 'attendance_missing', 'package_inactive', 'payment_due_soon'
  ));
