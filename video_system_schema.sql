-- Video Yönetim Sistemi için Supabase Schema
-- Dr. Şahin Durmuş Diş Hekimi Sitesi

-- 1. Video kategorileri tablosu
CREATE TABLE IF NOT EXISTS video_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ana videolar tablosu
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  content TEXT, -- Video açıklaması, markdown destekli
  
  -- Video dosya bilgileri
  video_url TEXT, -- Supabase Storage URL
  thumbnail_url TEXT, -- Küçük resim URL
  duration INTEGER, -- Saniye cinsinden süre
  file_size BIGINT, -- Byte cinsinden dosya boyutu
  video_format VARCHAR(20), -- mp4, webm, etc.
  resolution VARCHAR(20), -- 1080p, 720p, etc.
  
  -- Kategori ve etiketler
  category_id INTEGER REFERENCES video_categories(id) ON DELETE SET NULL,
  tags TEXT[], -- Video etiketleri
  
  -- Durum ve görünürlük
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true, -- Herkese açık mı?
  
  -- SEO alanları
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- İstatistikler
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Tarihler
  published_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İndeksler için
  CONSTRAINT videos_slug_check CHECK (slug ~ '^[a-z0-9-]+$')
);

-- 3. Video izleme geçmişi (analytics için)
CREATE TABLE IF NOT EXISTS video_views (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  viewer_ip INET,
  user_agent TEXT,
  watch_duration INTEGER, -- İzlenen süre (saniye)
  completed BOOLEAN DEFAULT false, -- Video sonuna kadar izlendi mi?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Video yorumları (opsiyonel)
CREATE TABLE IF NOT EXISTS video_comments (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  parent_id INTEGER REFERENCES video_comments(id) ON DELETE CASCADE, -- Yanıt sistemi için
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Video playlists (opsiyonel)
CREATE TABLE IF NOT EXISTS video_playlists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Playlist-Video ilişki tablosu
CREATE TABLE IF NOT EXISTS playlist_videos (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER REFERENCES video_playlists(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, video_id)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published, published_date);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_created_at ON video_views(created_at);
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_approved ON video_comments(is_approved);

-- Trigger'lar
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_categories_updated_at BEFORE UPDATE ON video_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Slug oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_video_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Türkçe karakterleri dönüştür ve slug oluştur
    base_slug := lower(title);
    base_slug := replace(base_slug, 'ç', 'c');
    base_slug := replace(base_slug, 'ğ', 'g');
    base_slug := replace(base_slug, 'ı', 'i');
    base_slug := replace(base_slug, 'ö', 'o');
    base_slug := replace(base_slug, 'ş', 's');
    base_slug := replace(base_slug, 'ü', 'u');
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Benzersizlik kontrolü
    WHILE EXISTS (SELECT 1 FROM videos WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Politikaları
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni (yayınlanan içerikler için)
CREATE POLICY "Public can view published videos" ON videos
    FOR SELECT USING (is_published = true AND is_public = true);

CREATE POLICY "Public can view active categories" ON video_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view public playlists" ON video_playlists
    FOR SELECT USING (is_public = true);

CREATE POLICY "Public can view playlist videos" ON playlist_videos
    FOR SELECT USING (true);

-- Service role için tam erişim (API'ler için)
CREATE POLICY "Service role can manage video_categories" ON video_categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage videos" ON videos
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage video_views" ON video_views
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage video_comments" ON video_comments
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage video_playlists" ON video_playlists
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage playlist_videos" ON playlist_videos
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Video görüntüleme için herkese izin
CREATE POLICY "Anyone can add video views" ON video_views
    FOR INSERT WITH CHECK (true);

-- Onaylanmış yorumları herkes görebilir
CREATE POLICY "Public can view approved comments" ON video_comments
    FOR SELECT USING (is_approved = true);

-- Yorum ekleme için herkese izin
CREATE POLICY "Anyone can add comments" ON video_comments
    FOR INSERT WITH CHECK (true);

-- Varsayılan kategoriler
INSERT INTO video_categories (name, slug, description, icon, sort_order) VALUES
('Genel Bilgiler', 'genel-bilgiler', 'Diş sağlığı hakkında genel bilgiler', '📚', 1),
('Tedavi Süreçleri', 'tedavi-surecleri', 'Tedavi süreçlerinin anlatıldığı videolar', '🦷', 2),
('İmplant Tedavisi', 'implant-tedavisi', 'İmplant tedavisi ile ilgili videolar', '🔧', 3),
('Ortodonti', 'ortodonti', 'Diş teli ve ortodontik tedaviler', '📐', 4),
('Estetik Diş Hekimliği', 'estetik-dis-hekimligi', 'Gülüş tasarımı ve estetik uygulamalar', '✨', 5),
('Çocuk Diş Hekimliği', 'cocuk-dis-hekimligi', 'Çocuklar için diş sağlığı', '👶', 6),
('Ağız ve Diş Bakımı', 'agiz-dis-bakimi', 'Günlük ağız ve diş bakım ipuçları', '🪥', 7),
('Hasta Deneyimleri', 'hasta-deneyimleri', 'Hasta görüşleri ve deneyimler', '💬', 8)
ON CONFLICT (slug) DO NOTHING;

-- Örnek videolar (test için)
INSERT INTO videos (
    title, slug, description, content, category_id, 
    is_published, is_featured, meta_title, meta_description,
    published_date, tags
) VALUES
(
    'Doğru Diş Fırçalama Tekniği',
    'dogru-dis-firçalama-teknigi',
    'Diş sağlığınız için doğru fırçalama tekniklerini öğrenin',
    '# Doğru Diş Fırçalama Tekniği\n\nBu videoda diş sağlığınız için en önemli adımlardan biri olan doğru diş fırçalama tekniklerini detaylı olarak anlatıyoruz.\n\n## İçerik:\n- Doğru fırça seçimi\n- Fırçalama süresi\n- Teknik detaylar\n- Yaygın hatalar',
    (SELECT id FROM video_categories WHERE slug = 'agiz-dis-bakimi'),
    true, true,
    'Doğru Diş Fırçalama Tekniği - Dr. Şahin Durmuş',
    'Diş sağlığınız için doğru fırçalama tekniklerini öğrenin. Uzman diş hekimi Dr. Şahin Durmuş anlatıyor.',
    CURRENT_DATE,
    ARRAY['diş fırçalama', 'ağız bakımı', 'diş sağlığı', 'hijyen']
),
(
    'İmplant Tedavisi Süreci',
    'implant-tedavisi-sureci',
    'İmplant tedavisinin aşamalarını detaylı olarak inceleyin',
    '# İmplant Tedavisi Süreci\n\nİmplant tedavisinin tüm aşamalarını bu videoda bulabilirsiniz.\n\n## Tedavi Aşamaları:\n1. İlk muayene\n2. Planlama\n3. Cerrahi işlem\n4. İyileşme süreci\n5. Protez takılması',
    (SELECT id FROM video_categories WHERE slug = 'implant-tedavisi'),
    true, false,
    'İmplant Tedavisi Nasıl Yapılır? - Dr. Şahin Durmuş',
    'İmplant tedavisinin tüm aşamalarını uzman diş hekimi Dr. Şahin Durmuş anlatıyor.',
    CURRENT_DATE,
    ARRAY['implant', 'tedavi', 'cerrahi', 'protez']
)
ON CONFLICT (slug) DO NOTHING;

-- Storage bucket oluşturma (Supabase Dashboard'da manuel olarak yapılacak)
-- Bucket adı: 'videos'
-- Public: false (güvenlik için)
-- File size limit: 500MB
-- Allowed mime types: video/mp4, video/webm, video/avi, video/mov

COMMENT ON TABLE video_categories IS 'Video kategorileri tablosu';
COMMENT ON TABLE videos IS 'Ana videolar tablosu - tüm video bilgileri';
COMMENT ON TABLE video_views IS 'Video izleme istatistikleri';
COMMENT ON TABLE video_comments IS 'Video yorumları';
COMMENT ON TABLE video_playlists IS 'Video oynatma listeleri';
COMMENT ON TABLE playlist_videos IS 'Playlist-video ilişki tablosu'; 