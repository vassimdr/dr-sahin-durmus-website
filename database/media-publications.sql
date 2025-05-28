-- =====================================================
-- MEDIA PUBLICATIONS SYSTEM - SQL QUERIES
-- =====================================================
-- Bu dosya medya yayınları sistemi için tüm SQL sorgularını içerir
-- Gazete, dergi ve haber sitelerindeki yayınları yönetmek için kullanılır

-- =====================================================
-- TABLE CREATION
-- =====================================================

-- Media Publications tablosu (gazete ve dergi yayınları için)
CREATE TABLE IF NOT EXISTS media_publications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  source_name VARCHAR(100) NOT NULL, -- Mynet, CNN Türk, Sabah, Hürriyet, Posta, Cumhuriyet, Milli Gazete, DHA, Gazete Vatan, Kelebek, Elele, Milliyet, Pembe Nar
  source_url TEXT NOT NULL, -- Orijinal makale linki
  publication_date DATE NOT NULL,
  image_url TEXT, -- Makale görseli
  category VARCHAR(100), -- Sağlık, Estetik, Teknoloji, Tedavi, Çocuk Sağlığı, Önleme, Bilgilendirme, Röportaj, Uzman Görüşü
  tags TEXT[], -- Etiketler array olarak
  is_featured BOOLEAN DEFAULT false, -- Öne çıkan yayın
  is_active BOOLEAN DEFAULT true, -- Aktif/pasif durumu
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Kaynak bazında filtreleme için index
CREATE INDEX IF NOT EXISTS idx_media_publications_source ON media_publications(source_name);

-- Tarih bazında sıralama için index
CREATE INDEX IF NOT EXISTS idx_media_publications_date ON media_publications(publication_date DESC);

-- Öne çıkan yayınlar için index
CREATE INDEX IF NOT EXISTS idx_media_publications_featured ON media_publications(is_featured);

-- Aktif yayınlar için index
CREATE INDEX IF NOT EXISTS idx_media_publications_active ON media_publications(is_active);

-- Kategori bazında filtreleme için index
CREATE INDEX IF NOT EXISTS idx_media_publications_category ON media_publications(category);

-- Tam metin arama için index (title ve summary)
CREATE INDEX IF NOT EXISTS idx_media_publications_search ON media_publications USING gin(to_tsvector('turkish', title || ' ' || COALESCE(summary, '')));

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- RLS etkinleştir
ALTER TABLE media_publications ENABLE ROW LEVEL SECURITY;

-- Herkese aktif yayınları okuma izni ver
CREATE POLICY "Public can view active media publications" ON media_publications
  FOR SELECT USING (is_active = true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_media_publications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger oluştur
CREATE TRIGGER update_media_publications_updated_at
  BEFORE UPDATE ON media_publications
  FOR EACH ROW
  EXECUTE FUNCTION update_media_publications_updated_at();

-- =====================================================
-- USEFUL FUNCTIONS
-- =====================================================

-- Medya yayınlarını kaynak bazında getiren fonksiyon
CREATE OR REPLACE FUNCTION get_publications_by_source(source_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  id INTEGER,
  title VARCHAR(500),
  summary TEXT,
  source_name VARCHAR(100),
  source_url TEXT,
  publication_date DATE,
  image_url TEXT,
  category VARCHAR(100),
  tags TEXT[],
  is_featured BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.title,
    mp.summary,
    mp.source_name,
    mp.source_url,
    mp.publication_date,
    mp.image_url,
    mp.category,
    mp.tags,
    mp.is_featured,
    mp.created_at
  FROM media_publications mp
  WHERE mp.is_active = true
    AND (source_filter IS NULL OR mp.source_name = source_filter)
  ORDER BY mp.publication_date DESC, mp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Öne çıkan yayınları getiren fonksiyon
CREATE OR REPLACE FUNCTION get_featured_publications(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  id INTEGER,
  title VARCHAR(500),
  summary TEXT,
  source_name VARCHAR(100),
  source_url TEXT,
  publication_date DATE,
  image_url TEXT,
  category VARCHAR(100),
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.title,
    mp.summary,
    mp.source_name,
    mp.source_url,
    mp.publication_date,
    mp.image_url,
    mp.category,
    mp.tags
  FROM media_publications mp
  WHERE mp.is_active = true AND mp.is_featured = true
  ORDER BY mp.publication_date DESC, mp.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kategori bazında yayınları getiren fonksiyon
CREATE OR REPLACE FUNCTION get_publications_by_category(category_filter VARCHAR(100))
RETURNS TABLE (
  id INTEGER,
  title VARCHAR(500),
  summary TEXT,
  source_name VARCHAR(100),
  source_url TEXT,
  publication_date DATE,
  image_url TEXT,
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.title,
    mp.summary,
    mp.source_name,
    mp.source_url,
    mp.publication_date,
    mp.image_url,
    mp.tags
  FROM media_publications mp
  WHERE mp.is_active = true AND mp.category = category_filter
  ORDER BY mp.publication_date DESC, mp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Örnek medya yayınları verisi
INSERT INTO media_publications (title, summary, source_name, source_url, publication_date, category, tags, is_featured, image_url) VALUES
(
  'Diş Estetiğinde Yeni Teknolojiler ve Gelişmeler',
  'Dr. Şahin Durmuş, modern diş estetiği teknolojilerini ve hasta memnuniyetindeki artışları anlattı. Dijital gülüş tasarımı ve 3D teknolojilerin kullanımı hakkında detaylı bilgiler.',
  'Mynet',
  'https://www.mynet.com/saglik/dis-estetigi-teknolojiler-2024',
  '2024-01-15',
  'Teknoloji',
  ARRAY['diş estetiği', 'teknoloji', 'sağlık', 'dijital tasarım'],
  true,
  'https://example.com/images/dis-estetigi-teknoloji.jpg'
),
(
  'İmplant Tedavisinde Dikkat Edilmesi Gereken Noktalar',
  'Uzman diş hekimi Dr. Şahin Durmuş, implant tedavisi öncesi ve sonrası dikkat edilmesi gereken önemli noktaları paylaştı.',
  'CNN Türk',
  'https://www.cnnturk.com/saglik/implant-tedavisi-dikkat-noktalari',
  '2024-01-10',
  'Tedavi',
  ARRAY['implant', 'tedavi', 'sağlık', 'cerrahi'],
  false,
  'https://example.com/images/implant-tedavi.jpg'
),
(
  'Gülüş Tasarımında Altın Oran ve Estetik Yaklaşım',
  'Estetik diş hekimliğinde matematiksel yaklaşımlar ve kişiye özel gülüş tasarımı teknikleri hakkında uzman görüşleri.',
  'Sabah',
  'https://www.sabah.com.tr/saglik/guluş-tasarimi-altin-oran',
  '2024-01-05',
  'Estetik',
  ARRAY['gülüş tasarımı', 'estetik', 'altın oran', 'matematik'],
  true,
  'https://example.com/images/gulus-tasarim.jpg'
),
(
  'Çocuklarda Diş Sağlığı: Erken Yaşta Alınacak Önlemler',
  'Çocukların diş sağlığını korumak için anne babaların bilmesi gereken önemli bilgiler ve erken yaşta alınacak önlemler.',
  'Hürriyet',
  'https://www.hurriyet.com.tr/saglik/cocuk-dis-sagligi-onlemler',
  '2023-12-20',
  'Çocuk Sağlığı',
  ARRAY['çocuk', 'diş sağlığı', 'önleme', 'anne baba'],
  false,
  'https://example.com/images/cocuk-dis-sagligi.jpg'
),
(
  'Diş Beyazlatma: Güvenli Yöntemler ve Öneriler',
  'Profesyonel diş beyazlatma yöntemleri, evde uygulanabilecek güvenli teknikler ve dikkat edilmesi gereken noktalar.',
  'Milliyet',
  'https://www.milliyet.com.tr/saglik/dis-beyazlatma-yontemleri',
  '2023-12-15',
  'Estetik',
  ARRAY['beyazlatma', 'estetik', 'güvenlik', 'yöntemler'],
  false,
  'https://example.com/images/dis-beyazlatma.jpg'
),
(
  'Kadın Sağlığında Diş Bakımının Önemi',
  'Hamilelik döneminde diş sağlığı, hormonal değişikliklerin etkileri ve kadınlara özel diş bakım önerileri.',
  'Pembe Nar',
  'https://www.pembenar.com/saglik/kadin-dis-sagligi',
  '2023-12-01',
  'Sağlık',
  ARRAY['kadın sağlığı', 'hamilelik', 'diş bakımı', 'hormon'],
  true,
  'https://example.com/images/kadin-dis-sagligi.jpg'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- USEFUL QUERIES FOR DEVELOPMENT
-- =====================================================

-- Tüm aktif yayınları listele
-- SELECT * FROM media_publications WHERE is_active = true ORDER BY publication_date DESC;

-- Kaynak bazında yayın sayıları
-- SELECT source_name, COUNT(*) as yayin_sayisi FROM media_publications WHERE is_active = true GROUP BY source_name ORDER BY yayin_sayisi DESC;

-- Kategori bazında yayın sayıları
-- SELECT category, COUNT(*) as yayin_sayisi FROM media_publications WHERE is_active = true GROUP BY category ORDER BY yayin_sayisi DESC;

-- Öne çıkan yayınları listele
-- SELECT * FROM media_publications WHERE is_active = true AND is_featured = true ORDER BY publication_date DESC;

-- Son 30 günün yayınları
-- SELECT * FROM media_publications WHERE is_active = true AND publication_date >= CURRENT_DATE - INTERVAL '30 days' ORDER BY publication_date DESC;

-- Belirli bir etikete sahip yayınlar
-- SELECT * FROM media_publications WHERE is_active = true AND 'diş estetiği' = ANY(tags) ORDER BY publication_date DESC;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Eski yayınları pasif hale getir (2 yıldan eski)
-- UPDATE media_publications SET is_active = false WHERE publication_date < CURRENT_DATE - INTERVAL '2 years';

-- Boş summary alanlarını güncelle
-- UPDATE media_publications SET summary = 'Özet bilgisi yakında eklenecek.' WHERE summary IS NULL OR summary = '';

-- Duplicate kontrol sorgusu
-- SELECT title, source_name, COUNT(*) FROM media_publications GROUP BY title, source_name HAVING COUNT(*) > 1; 