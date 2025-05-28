-- Supabase Storage Setup for Blog Images
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

-- Storage policies
-- Public read access for all images
CREATE POLICY "Public read access for blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' 
    AND auth.role() = 'authenticated'
  );

-- Service role can do everything (for API operations)
CREATE POLICY "Service role can manage blog images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'blog-images' 
    AND auth.jwt() ->> 'role' = 'service_role'
  );

-- Users can update their own uploads
CREATE POLICY "Users can update their own blog images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-images' 
    AND auth.role() = 'authenticated'
  );

-- Users can delete their own uploads
CREATE POLICY "Users can delete their own blog images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images' 
    AND auth.role() = 'authenticated'
  );

SELECT 'Blog images storage bucket kuruldu! 📸' as message; 