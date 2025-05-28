-- =====================================================
-- SUPABASE STORAGE SETUP
-- =====================================================
-- Bu dosya Supabase storage bucket'larını ve politikalarını kurar

-- =====================================================
-- STORAGE BUCKET CREATION
-- =====================================================

-- Gallery images bucket'ını oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-images',
  'gallery-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Public read access for all gallery images
CREATE POLICY "Public read access for gallery images" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery-images');

-- Authenticated users can upload gallery images
CREATE POLICY "Authenticated users can upload gallery images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery-images' 
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update gallery images
CREATE POLICY "Authenticated users can update gallery images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'gallery-images' 
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'gallery-images'
);

-- Authenticated users can delete gallery images
CREATE POLICY "Authenticated users can delete gallery images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery-images' 
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- FOLDER STRUCTURE
-- =====================================================
-- Supabase'de klasör yapısı:
-- gallery-images/
--   ├── gallery/          # Galeri görselleri
--   ├── treatments/       # Tedavi görselleri
--   ├── clinic/          # Klinik ortam görselleri
--   ├── team/            # Ekip görselleri
--   ├── technology/      # Teknoloji görselleri
--   └── thumbnails/      # Otomatik oluşturulan küçük resimler

-- =====================================================
-- FUNCTIONS FOR IMAGE PROCESSING
-- =====================================================

-- Thumbnail URL oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION public.generate_thumbnail_url(image_url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Supabase image transformation kullanarak thumbnail oluştur
  RETURN image_url || '?tr=w-300,h-300,c-force';
END;
$$;

-- Görsel metadata extraction fonksiyonu
CREATE OR REPLACE FUNCTION public.extract_image_metadata(file_path TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  metadata JSONB;
BEGIN
  -- Basit metadata döndür (genişletilebilir)
  metadata := jsonb_build_object(
    'file_path', file_path,
    'created_at', NOW(),
    'processed', true
  );
  
  RETURN metadata;
END;
$$;

-- =====================================================
-- GALLERY UPDATE TRIGGER
-- =====================================================

-- Gallery tablosuna yeni resim eklendiğinde thumbnail oluştur
CREATE OR REPLACE FUNCTION public.generate_gallery_thumbnail()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Eğer thumbnail_url boşsa, otomatik oluştur
  IF NEW.thumbnail_url IS NULL OR NEW.thumbnail_url = '' THEN
    NEW.thumbnail_url := public.generate_thumbnail_url(NEW.image_url);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger'ı gallery tablosuna ekle
DROP TRIGGER IF EXISTS gallery_thumbnail_trigger ON gallery;
CREATE TRIGGER gallery_thumbnail_trigger
  BEFORE INSERT OR UPDATE ON gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_gallery_thumbnail();

-- =====================================================
-- CLEANUP FUNCTIONS
-- =====================================================

-- Kullanılmayan dosyaları temizleme fonksiyonu
CREATE OR REPLACE FUNCTION public.cleanup_unused_images()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  cleanup_count INTEGER := 0;
BEGIN
  -- Bu fonksiyon manuel olarak çalıştırılabilir
  -- Veritabanında referansı olmayan dosyaları bulup silebilir
  
  RAISE NOTICE 'Cleanup function called. Manual implementation required for specific use cases.';
  
  RETURN cleanup_count;
END;
$$;

-- =====================================================
-- IMAGE OPTIMIZATION SETTINGS
-- =====================================================

-- Supabase storage için optimizasyon ayarları:
-- 1. Dosya boyutu limiti: 5MB
-- 2. Desteklenen formatlar: JPEG, PNG, WebP
-- 3. Otomatik sıkıştırma: Aktif
-- 4. CDN cache: 1 saat (3600 saniye)
-- 5. Thumbnail boyutları: 300x300 (cover)

SELECT 'Storage setup completed! 📁' as message; 