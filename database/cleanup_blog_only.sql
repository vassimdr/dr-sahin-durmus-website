-- Blog System Cleanup Script (Sadece Blog)
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- UYARI: Bu script sadece blog verilerini silecektir!

-- 1. Blog RLS Politikalarını Kaldır
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow public read access on approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow public insert on comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow authenticated insert on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow authenticated update on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow all operations for service role" ON blog_posts;
DROP POLICY IF EXISTS "Admin can manage all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Enable read access for published blog posts" ON blog_posts;

-- 2. Blog Trigger'larını Kaldır
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;

-- 3. Blog Fonksiyonlarını Kaldır
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_blog_updated_at_column();
DROP FUNCTION IF EXISTS update_blog_posts_updated_at();
DROP FUNCTION IF EXISTS increment_blog_view_count(INTEGER);

-- 4. Blog Tablolarını Kaldır (Foreign key sırası önemli)
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;

-- 5. Blog Index'lerini Kaldır
DROP INDEX IF EXISTS idx_blog_posts_slug;
DROP INDEX IF EXISTS idx_blog_posts_category;
DROP INDEX IF EXISTS idx_blog_posts_published_date;
DROP INDEX IF EXISTS idx_blog_posts_featured;
DROP INDEX IF EXISTS idx_blog_posts_published;
DROP INDEX IF EXISTS idx_categories_slug;
DROP INDEX IF EXISTS idx_blog_comments_post_id;
DROP INDEX IF EXISTS idx_blog_posts_tags;

-- Temizlik tamamlandı mesajı
SELECT 'Blog sistemi temizliği tamamlandı! ✅' as message;
SELECT 'Şimdi complete_blog_schema_fix.sql dosyasını çalıştırabilirsiniz.' as next_step; 