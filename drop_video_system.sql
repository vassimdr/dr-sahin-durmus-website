-- Video Sistemi Tamamen Silme
-- Bu dosya tüm video sistemi bileşenlerini siler

-- 1. Trigger'ları sil
DROP TRIGGER IF EXISTS update_doctor_videos_updated_at ON doctor_videos;

-- 2. Fonksiyonları sil
DROP FUNCTION IF EXISTS update_doctor_videos_updated_at() CASCADE;
DROP FUNCTION IF EXISTS increment_video_view_count(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. RLS politikalarını sil
DROP POLICY IF EXISTS "Enable read access for active videos" ON doctor_videos;
DROP POLICY IF EXISTS "Anyone can view active videos" ON doctor_videos;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON doctor_videos;

-- 4. İndeksleri sil
DROP INDEX IF EXISTS idx_doctor_videos_category;
DROP INDEX IF EXISTS idx_doctor_videos_is_active;
DROP INDEX IF EXISTS idx_doctor_videos_view_count;
DROP INDEX IF EXISTS idx_doctor_videos_sort_order;
DROP INDEX IF EXISTS idx_doctor_videos_created_at;

-- 5. Ana tabloyu sil
DROP TABLE IF EXISTS doctor_videos CASCADE;

-- 6. Başarı mesajı
DO $$
BEGIN
    RAISE NOTICE 'Video sistemi tamamen silindi!';
    RAISE NOTICE 'Tüm tablolar, fonksiyonlar, trigger''lar ve politikalar kaldırıldı.';
END $$;

SELECT 'Video sistemi tamamen silindi!' as status; 