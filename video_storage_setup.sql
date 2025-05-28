-- Video Storage Setup for Supabase
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- Videos bucket'ını oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true, -- Public bucket (videolar herkese açık)
  524288000, -- 500MB limit (500 * 1024 * 1024)
  ARRAY[
    'video/mp4',
    'video/webm', 
    'video/avi',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Mevcut video storage politikalarını temizle
DROP POLICY IF EXISTS "Public read access for videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete videos" ON storage.objects;

-- Basit politikalar - herkes okuyabilir, authenticated users yükleyebilir
CREATE POLICY "Anyone can view videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'videos' 
    AND auth.role() = 'authenticated'
  );

-- Service role için tam erişim (API operations için)
CREATE POLICY "Service role can manage videos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'videos' 
    AND auth.jwt() ->> 'role' = 'service_role'
  );

-- Başarı mesajı
SELECT 'Video storage bucket kuruldu! 🎬' as message;
SELECT 'Bucket ID: videos' as bucket_info;
SELECT 'Max file size: 500MB' as size_limit;
SELECT 'Allowed formats: MP4, WebM, AVI, MOV, MKV' as formats; 