-- Database Cleanup Script
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- UYARI: Bu script tüm blog verilerini silecektir!

-- 1. RLS Politikalarını Kaldır
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow public read access on approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow public insert on comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow authenticated insert on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow authenticated update on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow all operations for service role" ON blog_posts;
DROP POLICY IF EXISTS "Admin can manage all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin can manage all videos" ON videos;
DROP POLICY IF EXISTS "Enable read access for published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Enable read access for published videos" ON videos;
DROP POLICY IF EXISTS "Enable read access for active videos" ON doctor_videos;
DROP POLICY IF EXISTS "Enable read access for approved reviews" ON patient_reviews;
DROP POLICY IF EXISTS "Enable insert for new reviews" ON patient_reviews;

-- 2. Trigger'ları Kaldır
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP TRIGGER IF EXISTS update_doctor_videos_updated_at ON doctor_videos;
DROP TRIGGER IF EXISTS update_patient_reviews_updated_at ON patient_reviews;
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;

-- 3. Fonksiyonları Kaldır
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_blog_updated_at_column();
DROP FUNCTION IF EXISTS update_doctor_videos_updated_at();
DROP FUNCTION IF EXISTS update_patient_reviews_updated_at();
DROP FUNCTION IF EXISTS update_blog_posts_updated_at();
DROP FUNCTION IF EXISTS update_videos_updated_at();
DROP FUNCTION IF EXISTS increment_video_view_count(INTEGER);
DROP FUNCTION IF EXISTS increment_blog_view_count(INTEGER);
DROP FUNCTION IF EXISTS approve_review(INTEGER, VARCHAR(255), BOOLEAN);
DROP FUNCTION IF EXISTS increment_helpful_count(INTEGER);
DROP FUNCTION IF EXISTS check_ip_review_limit(VARCHAR(64));
DROP FUNCTION IF EXISTS add_patient_review(VARCHAR(100), TEXT, INTEGER, VARCHAR(50), VARCHAR(64), VARCHAR(64));

-- 4. View'ları Kaldır
DROP VIEW IF EXISTS review_statistics;

-- 5. Tabloları Kaldır (Foreign key sırası önemli)
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS patient_reviews CASCADE;
DROP TABLE IF EXISTS review_ip_tracking CASCADE;
DROP TABLE IF EXISTS review_moderation_log CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS doctor_videos CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;
DROP TABLE IF EXISTS video_categories CASCADE;

-- 6. Index'leri Kaldır (tablolar silindiği için otomatik silinir ama emin olmak için)
DROP INDEX IF EXISTS idx_blog_posts_slug;
DROP INDEX IF EXISTS idx_blog_posts_category;
DROP INDEX IF EXISTS idx_blog_posts_published_date;
DROP INDEX IF EXISTS idx_blog_posts_featured;
DROP INDEX IF EXISTS idx_blog_posts_published;
DROP INDEX IF EXISTS idx_categories_slug;
DROP INDEX IF EXISTS idx_blog_comments_post_id;
DROP INDEX IF EXISTS idx_doctor_videos_category;
DROP INDEX IF EXISTS idx_doctor_videos_is_active;
DROP INDEX IF EXISTS idx_doctor_videos_view_count;
DROP INDEX IF EXISTS idx_doctor_videos_sort_order;
DROP INDEX IF EXISTS idx_doctor_videos_created_at;
DROP INDEX IF EXISTS idx_patient_reviews_approved;
DROP INDEX IF EXISTS idx_patient_reviews_featured;
DROP INDEX IF EXISTS idx_patient_reviews_rating;
DROP INDEX IF EXISTS idx_patient_reviews_category;
DROP INDEX IF EXISTS idx_patient_reviews_created_at;
DROP INDEX IF EXISTS idx_patient_reviews_email;
DROP INDEX IF EXISTS idx_patient_reviews_helpful;
DROP INDEX IF EXISTS idx_patient_reviews_ip_hash;
DROP INDEX IF EXISTS idx_review_ip_tracking_hash;
DROP INDEX IF EXISTS idx_review_moderation_review_id;
DROP INDEX IF EXISTS idx_blog_posts_published;
DROP INDEX IF EXISTS idx_blog_posts_tags;
DROP INDEX IF EXISTS idx_videos_published;
DROP INDEX IF EXISTS idx_videos_featured;
DROP INDEX IF EXISTS idx_videos_category;
DROP INDEX IF EXISTS idx_videos_youtube_id;
DROP INDEX IF EXISTS idx_videos_tags;

-- 7. Extension'ları Kaldır (isteğe bağlı - diğer projeler kullanıyor olabilir)
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- Temizlik tamamlandı mesajı
SELECT 'Database temizliği tamamlandı! ✅' as message;
SELECT 'Şimdi complete_blog_schema_fix.sql dosyasını çalıştırabilirsiniz.' as next_step; 