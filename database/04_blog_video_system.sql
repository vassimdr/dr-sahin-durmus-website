-- Blog ve Video Sistemleri Database Schema
-- Blog posts ve videos tabloları, güvenlik, sample data

-- Extensions (gerekirse)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blog posts tablosu
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  featured_image TEXT,
  category VARCHAR(100) NOT NULL,
  tags TEXT[], -- PostgreSQL array
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  author_name VARCHAR(255) DEFAULT 'Dr. Şahin Durmuş',
  meta_title VARCHAR(255),
  meta_description TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO ve sosyal medya
  og_title VARCHAR(255),
  og_description TEXT,
  og_image TEXT,
  
  -- İçerik yönetimi
  reading_time INTEGER, -- dakika cinsinden
  word_count INTEGER,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Videos tablosu
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  youtube_id VARCHAR(50) NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(100) NOT NULL,
  duration VARCHAR(20), -- "5:30" formatında
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Video metadata
  quality VARCHAR(10) DEFAULT 'HD',
  language VARCHAR(10) DEFAULT 'tr',
  tags TEXT[]
);

-- Blog kategorileri tablosu
CREATE TABLE IF NOT EXISTS blog_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- hex color
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video kategorileri tablosu
CREATE TABLE IF NOT EXISTS video_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#10B981', -- hex color
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog comments tablosu (gelecekte kullanım için)
CREATE TABLE IF NOT EXISTS blog_comments (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by VARCHAR(255)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING GIN(tags);

-- Updated_at otomatik güncelleme triggers
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_videos_updated_at();

-- Blog kategorileri sample data
INSERT INTO blog_categories (name, slug, description, color, sort_order) VALUES
('Genel Diş Sağlığı', 'genel-dis-sagligi', 'Genel ağız ve diş sağlığı konuları', '#3B82F6', 1),
('İmplant Tedavisi', 'implant-tedavisi', 'Diş implantı ve ilgili tedaviler', '#10B981', 2),
('Ortodonti', 'ortodonti', 'Diş teli ve diş düzeltme tedavileri', '#F59E0B', 3),
('Estetik Diş Hekimliği', 'estetik-dis-hekimligi', 'Gülüş tasarımı ve estetik uygulamalar', '#EF4444', 4),
('Çocuk Diş Hekimliği', 'cocuk-dis-hekimligi', 'Çocuklara özel diş tedavileri', '#8B5CF6', 5),
('Ağız ve Diş Sağlığı', 'agiz-dis-sagligi', 'Ağız hijyeni ve koruyucu tedaviler', '#06B6D4', 6),
('Tedavi Öncesi ve Sonrası', 'tedavi-oncesi-sonrasi', 'Tedavi süreçleri ve bakım', '#84CC16', 7),
('Diş Bakımı İpuçları', 'dis-bakimi-ipuclari', 'Günlük diş bakımı önerileri', '#F97316', 8)
ON CONFLICT (slug) DO NOTHING;

-- Video kategorileri sample data
INSERT INTO video_categories (name, slug, description, color, sort_order) VALUES
('Tedavi Süreçleri', 'tedavi-surecleri', 'Tedavi aşamalarını gösteren videolar', '#10B981', 1),
('Hasta Deneyimleri', 'hasta-deneyimleri', 'Hasta röportajları ve deneyimler', '#3B82F6', 2),
('Eğitim Videoları', 'egitim-videolari', 'Diş sağlığı eğitim içerikleri', '#F59E0B', 3),
('Kliniğimiz', 'klinik', 'Kliniğimiz ve ekibimiz tanıtımı', '#EF4444', 4),
('Teknoloji', 'teknoloji', 'Kullandığımız teknolojiler', '#8B5CF6', 5),
('Önce ve Sonra', 'once-sonra', 'Tedavi öncesi ve sonrası karşılaştırmalar', '#06B6D4', 6)
ON CONFLICT (slug) DO NOTHING;

-- Sample blog posts
INSERT INTO blog_posts (
  title, 
  slug, 
  content, 
  excerpt, 
  category, 
  tags, 
  is_published, 
  is_featured,
  published_at,
  reading_time,
  word_count
) VALUES
(
  'Diş İmplantı Nedir ve Nasıl Yapılır?',
  'dis-implanti-nedir-nasil-yapilir',
  'Diş implantı, kaybedilen dişlerin yerine yerleştirilen titanyum vidalar ve üzerine monte edilen protezlerdir. Bu yazıda implant tedavisinin tüm aşamalarını detaylı olarak açıklayacağız...',
  'Diş implantı tedavisi hakkında bilmeniz gereken her şey. Tedavi süreci, avantajları ve bakım önerileri.',
  'İmplant Tedavisi',
  ARRAY['implant', 'diş tedavisi', 'protez', 'titanyum'],
  true,
  true,
  NOW() - INTERVAL '5 days',
  8,
  1200
),
(
  'Çocuklarda Diş Bakımının Önemi',
  'cocuklarda-dis-bakiminin-onemi',
  'Çocukluk döneminde başlayan doğru diş bakımı alışkanlıkları, yaşam boyu sürecek sağlıklı dişlerin temelidir. Bu yazıda çocuklarda diş bakımının önemini ve doğru yöntemleri ele alacağız...',
  'Çocuklarda diş bakımı nasıl yapılmalı? Yaşa göre diş bakımı önerileri ve dikkat edilmesi gerekenler.',
  'Çocuk Diş Hekimliği',
  ARRAY['çocuk diş bakımı', 'süt dişi', 'diş fırçalama', 'florür'],
  true,
  false,
  NOW() - INTERVAL '3 days',
  6,
  900
),
(
  'Gülüş Tasarımı ile Hayalinizdeki Gülüşe Kavuşun',
  'gulus-tasarimi-hayalinizdeki-gulus',
  'Gülüş tasarımı, estetik diş hekimliğinin en popüler uygulamalarından biridir. Dijital teknolojiler sayesinde tedavi öncesinde sonucu görebilir, kişiye özel tasarım yapılabilir...',
  'Modern gülüş tasarımı teknikleri ile mükemmel gülüşe nasıl kavuşabilirsiniz? Tedavi süreci ve sonuçları.',
  'Estetik Diş Hekimliği',
  ARRAY['gülüş tasarımı', 'estetik', 'veneer', 'laminate'],
  false,
  false,
  NULL,
  10,
  1500
)
ON CONFLICT (slug) DO NOTHING;

-- Sample videos
INSERT INTO videos (
  title,
  description,
  youtube_url,
  youtube_id,
  thumbnail_url,
  category,
  duration,
  is_published,
  is_featured,
  published_at,
  tags
) VALUES
(
  'İmplant Tedavisi Nasıl Yapılır?',
  'Dr. Şahin Durmuş implant tedavisinin tüm aşamalarını anlatıyor. Tedavi süreci, iyileşme dönemi ve bakım önerileri.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'Tedavi Süreçleri',
  '8:45',
  true,
  true,
  NOW() - INTERVAL '7 days',
  ARRAY['implant', 'tedavi', 'cerrahi']
),
(
  'Hasta Deneyimi: Ayşe Hanım''ın İmplant Hikayesi',
  'Ayşe Hanım implant tedavisi deneyimini paylaşıyor. Tedavi öncesi endişeleri ve sonrasındaki memnuniyeti.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'Hasta Deneyimleri',
  '5:20',
  true,
  false,
  NOW() - INTERVAL '4 days',
  ARRAY['hasta deneyimi', 'implant', 'memnuniyet']
),
(
  'Kliniğimizin Modern Teknolojileri',
  'Kliniğimizde kullandığımız son teknoloji cihazlar ve bunların hasta konforu açısından avantajları.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  'Teknoloji',
  '6:15',
  false,
  false,
  NULL,
  ARRAY['teknoloji', 'klinik', 'modern cihazlar']
)
ON CONFLICT (youtube_id) DO NOTHING;

-- Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Public can read published content
CREATE POLICY "Enable read access for published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Enable read access for published videos" ON videos
  FOR SELECT USING (is_published = true);

-- Admin can manage all content
CREATE POLICY "Admin can manage all blog posts" ON blog_posts
  FOR ALL USING (current_user = 'admin_user');

CREATE POLICY "Admin can manage all videos" ON videos
  FOR ALL USING (current_user = 'admin_user');

-- View count update functions
CREATE OR REPLACE FUNCTION increment_blog_view_count(post_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts 
  SET view_count = view_count + 1 
  WHERE id = post_id AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_video_view_count(video_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE videos 
  SET view_count = view_count + 1 
  WHERE id = video_id AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Blog ve Video sistemleri hazır! 🎉
-- Admin panelinden blog yazısı ve video ekleyebilir, düzenleyebilir, yayınlayabilirsiniz 