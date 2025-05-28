-- =====================================================
-- GALLERY SYSTEM - SQL QUERIES
-- =====================================================
-- Bu dosya galeri sistemi için tüm SQL sorgularını içerir
-- Klinik fotoğrafları, tedavi öncesi/sonrası görselleri yönetmek için kullanılır

-- =====================================================
-- TABLE CREATION
-- =====================================================

-- Gallery tablosu (klinik fotoğrafları için)
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL, -- Supabase Storage URL'i
  thumbnail_url TEXT, -- Küçük boyut görseli (otomatik oluşturulur)
  category VARCHAR(100) NOT NULL, -- Klinik Ortamı, Tedavi Öncesi/Sonrası, Ekip, Teknoloji, Hasta Deneyimleri, Başarı Hikayeleri
  treatment_type VARCHAR(100), -- İmplant, Ortodonti, Diş Beyazlatma, Kanal Tedavisi, Çekim, Estetik Dolgu, Protez, Cerrahi
  patient_age_group VARCHAR(50), -- Çocuk, Genç, Yetişkin, Yaşlı (isteğe bağlı)
  is_before_after BOOLEAN DEFAULT false, -- Tedavi öncesi/sonrası mı?
  sort_order INTEGER DEFAULT 0, -- Sıralama için
  is_featured BOOLEAN DEFAULT false, -- Öne çıkan görsel
  is_active BOOLEAN DEFAULT true, -- Aktif/pasif durumu
  alt_text VARCHAR(500), -- SEO için alternatif metin
  tags TEXT[], -- Etiketler array olarak
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Kategori bazında filtreleme için index
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);

-- Tedavi türü bazında filtreleme için index
CREATE INDEX IF NOT EXISTS idx_gallery_treatment ON gallery(treatment_type);

-- Sıralama için index
CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery(sort_order ASC, created_at DESC);

-- Öne çıkan görseller için index
CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery(is_featured);

-- Aktif görseller için index
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active);

-- Öncesi/sonrası görseller için index
CREATE INDEX IF NOT EXISTS idx_gallery_before_after ON gallery(is_before_after);

-- =====================================================
-- SAMPLE DATA (PLACEHOLDER - WILL BE REPLACED WITH REAL IMAGES)
-- =====================================================

-- Bu veriler sadece sistem testleri içindir
-- Gerçek kullanımda Supabase Storage'dan gelen URL'ler kullanılacak

-- Temizlik: Mevcut test verilerini sil
DELETE FROM gallery WHERE image_url LIKE '%unsplash.com%';

-- Test için boş kategoriler oluştur (admin panelden doldurulacak)
INSERT INTO gallery (title, description, image_url, category, treatment_type, is_featured, sort_order, alt_text, tags) VALUES
('Placeholder - Klinik Ortamı', 'Admin panelden gerçek fotoğrafları yükleyin', '', 'Klinik Ortamı', NULL, false, 999, 'Placeholder görsel', ARRAY['placeholder']),
('Placeholder - Tedavi Öncesi/Sonrası', 'Admin panelden gerçek fotoğrafları yükleyin', '', 'Tedavi Öncesi/Sonrası', 'İmplant', false, 999, 'Placeholder görsel', ARRAY['placeholder']),
('Placeholder - Ekip', 'Admin panelden gerçek fotoğrafları yükleyin', '', 'Ekip', NULL, false, 999, 'Placeholder görsel', ARRAY['placeholder'])
ON CONFLICT DO NOTHING;

-- Bu placeholder'ları gizle (is_active = false)
UPDATE gallery SET is_active = false WHERE image_url = '';

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Tüm aktif galeri öğelerini kategori ve sıralamaya göre getir
-- SELECT * FROM gallery WHERE is_active = true ORDER BY sort_order ASC, created_at DESC;

-- Öne çıkan galeri öğelerini getir
-- SELECT * FROM gallery WHERE is_active = true AND is_featured = true ORDER BY sort_order ASC;

-- Kategoriye göre filtrele
-- SELECT * FROM gallery WHERE is_active = true AND category = 'Klinik Ortamı' ORDER BY sort_order ASC;

-- Tedavi türüne göre filtrele
-- SELECT * FROM gallery WHERE is_active = true AND treatment_type = 'İmplant' ORDER BY sort_order ASC;

-- Öncesi/sonrası görselleri getir
-- SELECT * FROM gallery WHERE is_active = true AND is_before_after = true ORDER BY sort_order ASC;

-- Galeri istatistikleri
-- SELECT 
--   COUNT(*) as total_images,
--   COUNT(CASE WHEN is_featured THEN 1 END) as featured_images,
--   COUNT(CASE WHEN is_before_after THEN 1 END) as before_after_images,
--   COUNT(DISTINCT category) as total_categories,
--   COUNT(DISTINCT treatment_type) as total_treatments
-- FROM gallery WHERE is_active = true;

-- Kategori bazında görsel sayıları
-- SELECT category, COUNT(*) as image_count 
-- FROM gallery 
-- WHERE is_active = true 
-- GROUP BY category 
-- ORDER BY image_count DESC;

-- Tedavi türü bazında görsel sayıları
-- SELECT treatment_type, COUNT(*) as image_count 
-- FROM gallery 
-- WHERE is_active = true AND treatment_type IS NOT NULL
-- GROUP BY treatment_type 
-- ORDER BY image_count DESC;

-- =====================================================
-- STORAGE INTEGRATION QUERIES
-- =====================================================

-- Supabase Storage'daki dosyaları kontrol et
-- SELECT 
--   id, 
--   title, 
--   image_url,
--   CASE 
--     WHEN image_url LIKE '%supabase%' THEN 'Supabase Storage'
--     WHEN image_url LIKE '%https://%' THEN 'External URL'
--     ELSE 'Local/Other'
--   END as storage_type
-- FROM gallery 
-- WHERE is_active = true;

-- Boş image_url'leri bul
-- SELECT id, title, category FROM gallery WHERE image_url IS NULL OR image_url = '';

-- Thumbnail'ı olmayan görselleri bul
-- SELECT id, title, image_url FROM gallery WHERE thumbnail_url IS NULL OR thumbnail_url = '';

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Pasif görselleri temizle (dikkatli kullanın!)
-- DELETE FROM gallery WHERE is_active = false AND created_at < NOW() - INTERVAL '30 days';

-- Görsel sıralamalarını düzenle
-- UPDATE gallery SET sort_order = id WHERE sort_order = 0;

-- Eksik alt metinleri güncelle
-- UPDATE gallery SET alt_text = title WHERE alt_text IS NULL OR alt_text = '';

-- Kategori adlarını standardize et
-- UPDATE gallery SET category = 'Klinik Ortamı' WHERE category IN ('klinik', 'Klinik', 'ortam');

-- Placeholder verilerini temizle
-- DELETE FROM gallery WHERE tags @> ARRAY['placeholder'];

-- =====================================================
-- BACKUP AND RESTORE
-- =====================================================

-- Galeri verilerini backup al
-- COPY gallery TO '/tmp/gallery_backup.csv' WITH CSV HEADER;

-- Backup'tan restore et
-- COPY gallery FROM '/tmp/gallery_backup.csv' WITH CSV HEADER;

SELECT 'Gallery system updated for Supabase Storage! 📸' as message; 