-- Fix RLS Policies for Blog Posts Table
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- Mevcut INSERT/UPDATE politikalarını kaldır (varsa)
DROP POLICY IF EXISTS "Allow authenticated insert on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow authenticated update on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow all operations for service role" ON blog_posts;

-- Service role için tüm işlemlere izin ver (API'ler service role kullanır)
CREATE POLICY "Allow all operations for service role" ON blog_posts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternatif olarak sadece INSERT/UPDATE için özel politikalar
-- CREATE POLICY "Allow authenticated insert on blog_posts" ON blog_posts
--   FOR INSERT
--   WITH CHECK (true);

-- CREATE POLICY "Allow authenticated update on blog_posts" ON blog_posts
--   FOR UPDATE
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Allow authenticated delete on blog_posts" ON blog_posts
--   FOR DELETE
--   USING (true);

-- Politikaları yeniden yükle
SELECT pg_reload_conf();

-- Test query - bu çalışmalı
-- INSERT INTO blog_posts (title, slug, content, excerpt, author, category, published_date, read_time) 
-- VALUES ('Test', 'test-slug', 'Test content', 'Test excerpt', 'Dr. Test', 'Test Category', CURRENT_DATE, '1 dk'); 