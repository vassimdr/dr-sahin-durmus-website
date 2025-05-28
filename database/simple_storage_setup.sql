-- Basit Supabase Storage Setup
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- Blog images bucket'ını oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Public read access for blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own blog images" ON storage.objects;

-- Basit politikalar - herkes okuyabilir, herkes yükleyebilir
CREATE POLICY "Anyone can view blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Anyone can update blog images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can delete blog images" ON storage.objects
  FOR DELETE USING (bucket_id = 'blog-images');

SELECT 'Basit blog images storage kuruldu! 📸' as message; 