-- Eski Video Sistemi Temizleme
-- Bu dosyayı new_simple_video_system.sql'den ÖNCE çalıştırın

-- 1. Eski tabloları sil (varsa)
DROP TABLE IF EXISTS playlist_videos CASCADE;
DROP TABLE IF EXISTS video_playlists CASCADE;
DROP TABLE IF EXISTS video_comments CASCADE;
DROP TABLE IF EXISTS video_views CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS video_categories CASCADE;

-- 2. Eski fonksiyonları sil (varsa)
DROP FUNCTION IF EXISTS update_videos_updated_at() CASCADE;
DROP FUNCTION IF EXISTS increment_video_view_count(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. Eski trigger'ları sil (varsa)
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
DROP TRIGGER IF EXISTS update_video_categories_updated_at ON video_categories;

-- 4. Eski RLS politikalarını sil (varsa)
DROP POLICY IF EXISTS "Enable read access for active videos" ON videos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON videos;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON videos;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON videos;

-- 5. Eski indeksleri sil (varsa)
DROP INDEX IF EXISTS idx_videos_category_id;
DROP INDEX IF EXISTS idx_videos_is_published;
DROP INDEX IF EXISTS idx_videos_is_featured;
DROP INDEX IF EXISTS idx_videos_created_at;
DROP INDEX IF EXISTS idx_video_categories_slug;

-- 6. Başarı mesajı
DO $$
BEGIN
    RAISE NOTICE 'Eski video sistemi temizlendi!';
    RAISE NOTICE 'Şimdi new_simple_video_system.sql dosyasını çalıştırabilirsiniz.';
END $$; 