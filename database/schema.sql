-- Supabase Database Schema for Blog System
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories tablosu
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Blog posts tablosu
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  published_date DATE NOT NULL,
  read_time VARCHAR(50),
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Blog comments tablosu (gelecek için)
CREATE TABLE IF NOT EXISTS blog_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Video tablosu oluşturma
CREATE TABLE IF NOT EXISTS doctor_videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration INTEGER NOT NULL, -- saniye cinsinden
  category VARCHAR(50) NOT NULL CHECK (category IN ('tanıtım', 'tedavi', 'bilgilendirme', 'hasta-deneyimi', 'teknoloji')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  sort_order INTEGER
);

-- Media Publications tablosu (gazete ve dergi yayınları için)
CREATE TABLE IF NOT EXISTS media_publications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  source_name VARCHAR(100) NOT NULL, -- Mynet, CNN Türk, Sabah, etc.
  source_url TEXT NOT NULL, -- Orijinal makale linki
  publication_date DATE NOT NULL,
  image_url TEXT, -- Makale görseli
  category VARCHAR(100), -- Sağlık, Estetik, Teknoloji, etc.
  tags TEXT[], -- Etiketler
  is_featured BOOLEAN DEFAULT false, -- Öne çıkan yayın
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON blog_posts(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_category ON doctor_videos(category);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_is_active ON doctor_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_view_count ON doctor_videos(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_sort_order ON doctor_videos(sort_order);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_created_at ON doctor_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_publications_source ON media_publications(source_name);
CREATE INDEX IF NOT EXISTS idx_media_publications_date ON media_publications(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_media_publications_featured ON media_publications(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_publications_active ON media_publications(is_active);

-- RLS (Row Level Security) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_publications ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);

-- Public read access for published blog posts
CREATE POLICY "Allow public read access on blog_posts" ON blog_posts 
  FOR SELECT USING (published = true);

-- Public read access for approved comments
CREATE POLICY "Allow public read access on approved comments" ON blog_comments 
  FOR SELECT USING (approved = true);

-- Insert policy for comments (anyone can add comments)
CREATE POLICY "Allow public insert on comments" ON blog_comments 
  FOR INSERT WITH CHECK (true);

-- Enable read access for active videos
CREATE POLICY "Enable read access for active videos" ON doctor_videos
  FOR SELECT USING (is_active = true);

-- Public can view active media publications
CREATE POLICY "Public can view active media publications" ON media_publications
  FOR SELECT USING (is_active = true);

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_videos_updated_at
  BEFORE UPDATE ON doctor_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_publications_updated_at
  BEFORE UPDATE ON media_publications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_video_view_count(video_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE doctor_videos 
  SET view_count = view_count + 1 
  WHERE id = video_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data
INSERT INTO categories (name, slug, description) VALUES
('Estetik Diş Hekimliği', 'estetik-dis-hekimligi', 'Gülüş tasarımı, veneer, diş beyazlatma ve estetik tedaviler'),
('İmplant', 'implant', 'Diş implantı tedavileri ve cerrahi işlemler'),
('Çocuk Diş Hekimliği', 'cocuk-dis-hekimligi', 'Çocukların diş sağlığı ve pediatrik tedaviler'),
('Ortodonti', 'ortodonti', 'Diş teli, şeffaf plak ve diş düzeltme tedavileri'),
('Diş Bakımı', 'dis-bakimi', 'Günlük diş bakımı, hijyen ve koruyucu tedaviler'),
('Genel Bilgiler', 'genel-bilgiler', 'Diş sağlığı hakkında genel bilgiler ve ipuçları')
ON CONFLICT (slug) DO NOTHING;

-- Sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, author, category, published_date, read_time, featured) VALUES
(
  'İmplant Tedavisi: Modern Çözümler ve Faydaları',
  'implant-tedavisi-modern-cozumler',
  'Eksik dişlerinizi en doğal görünümde yeniden kazanmanın yolları ve implant tedavisinin avantajları hakkında bilmeniz gerekenler.',
  '<h2>İmplant Tedavisi Nedir?</h2><p>Diş implantı, kaybedilen dişlerin yerine konulan titanyum vida şeklindeki yapay diş kökleridir. Bu modern tedavi yöntemi, eksik dişlerin en doğal ve kalıcı çözümünü sunar.</p><h2>İmplant Tedavisinin Avantajları</h2><ul><li>Doğal diş görünümü ve hissi</li><li>Uzun ömürlü çözüm</li><li>Çiğneme fonksiyonunu tam olarak geri kazandırır</li><li>Komşu dişlere zarar vermez</li></ul><h2>Tedavi Süreci</h2><p>İmplant tedavisi genellikle 3-6 ay sürer ve aşağıdaki aşamalardan oluşur:</p><ol><li>Detaylı muayene ve planlama</li><li>İmplant yerleştirme cerrahi</li><li>İyileşme süreci (osseointegrasyon)</li><li>Protez uygulaması</li></ol>',
  'Dr. Şahin DURMUŞ',
  'İmplant',
  '2024-03-15',
  '8 dk',
  true
),
(
  'Estetik Diş Hekimliği ile Gülüş Tasarımı',
  'estetik-dis-hekimligi-gulus-tasarimi',
  'Hollywood gülüşü elde etmenin sırları, veneer kaplama ve diş beyazlatma işlemleri hakkında uzman görüşler.',
  '<h2>Gülüş Tasarımı Nedir?</h2><p>Gülüş tasarımı, kişinin yüz yapısına ve kişilik özelliklerine uygun olarak dişlerinin şekil, boyut ve renginin düzenlenmesi işlemidir.</p><h2>Veneer Kaplama</h2><p>Veneer kaplamalar, dişlerin ön yüzeyine yapıştırılan ince porselen ya da kompozit tabakalarıdır. Bu yöntemle:</p><ul><li>Diş rengi değiştirilebilir</li><li>Diş şekli düzeltilebilir</li><li>Çarpık dişler düzeltilebilir</li><li>Aralıklar kapatılabilir</li></ul><h2>Diş Beyazlatma</h2><p>Profesyonel diş beyazlatma, dişlerin doğal rengini açarak daha beyaz bir görünüm elde etme işlemidir.</p>',
  'Dr. Şahin DURMUŞ',
  'Estetik Diş Hekimliği',
  '2024-03-12',
  '6 dk',
  true
),
(
  'Çocuklarda Diş Sağlığı: Anne Babaların Rehberi',
  'cocuklarda-dis-sagligi-rehberi',
  'Çocukların diş sağlığını korumak için erken yaşta alınması gereken önlemler ve doktor kontrollerinin önemi.',
  '<h2>Erken Yaşta Diş Bakımı</h2><p>Çocuklarda diş bakımı, ilk dişin çıkmasıyla birlikte başlamalıdır. Bu dönemde yapılması gerekenler:</p><ul><li>İlk diş çıkmadan önce bezle dişeti temizliği</li><li>İlk dişle birlikte fırçalama başlangıcı</li><li>2 yaşından sonra florid diş macunu kullanımı</li></ul><h2>Beslenme Alışkanlıkları</h2><p>Çocukların diş sağlığını etkileyen faktörler:</p><ul><li>Şekerli ve asitli içeceklerden kaçınma</li><li>Biberonla uyuma alışkanlığından kurtulma</li><li>Kalsiyum ve vitamin açısından zengin beslenme</li></ul>',
  'Dr. Şahin DURMUŞ',
  'Çocuk Diş Hekimliği',
  '2024-03-10',
  '7 dk',
  false
),
(
  'Ortodonti Tedavisi: Tel Takma ve Sonrası',
  'ortodonti-tedavisi-tel-takma',
  'Diş teli tedavisi süreci, modern ortodonti yöntemleri ve tedavi sonrası bakım önerileri.',
  '<h2>Ortodonti Tedavisi Kimler İçin Uygundur?</h2><p>Ortodonti tedavisi aşağıdaki durumlarda uygulanır:</p><ul><li>Çarpık veya döük dişler</li><li>Dişler arası aşırı boşluklar</li><li>Üst ve alt çenenin uyumsuzluğu</li><li>Kapanış bozuklukları</li></ul><h2>Tedavi Seçenekleri</h2><p>Modern ortodonti çeşitli tedavi seçenekleri sunar:</p><ul><li>Geleneksel metal braketler</li><li>Seramik braketler</li><li>Şeffaf plaklar (Invisalign)</li><li>Lingual braketler</li></ul>',
  'Dr. Şahin DURMUŞ',
  'Ortodonti',
  '2024-03-08',
  '9 dk',
  false
)
ON CONFLICT (slug) DO NOTHING;

-- Sample video data
INSERT INTO doctor_videos (title, description, video_url, thumbnail_url, duration, category, view_count, sort_order) VALUES
('Diş Hekimliğinde Modern Teknoloji', 'Kliniğimizde kullandığımız son teknoloji cihazları tanıtıyoruz', '/videos/teknoloji-tanitim.mp4', '/images/video-thumbnails/teknoloji.jpg', 45, 'tanıtım', 1250, 1),
('İmplant Tedavisi Süreci', 'İmplant tedavisinin adım adım nasıl yapıldığını öğrenin', '/videos/implant-sureci.mp4', '/images/video-thumbnails/implant.jpg', 60, 'tedavi', 980, 2),
('Hasta Deneyimi - Ahmet Bey', 'Ahmet Bey''in implant tedavisi deneyimini dinleyin', '/videos/hasta-deneyimi-1.mp4', '/images/video-thumbnails/hasta-1.jpg', 35, 'hasta-deneyimi', 750, 3),
('Diş Beyazlatma İpuçları', 'Evde uygulayabileceğiniz diş beyazlatma yöntemleri', '/videos/beyazlatma-ipuclari.mp4', '/images/video-thumbnails/beyazlatma.jpg', 40, 'bilgilendirme', 1100, 4),
('Klinik Tanıtımı', 'Modern kliniğimizi ve ekibimizi tanıyın', '/videos/klinik-tanitim.mp4', '/images/video-thumbnails/klinik.jpg', 55, 'tanıtım', 1500, 5);

-- Sample media publications data
INSERT INTO media_publications (title, summary, source_name, source_url, publication_date, category, tags, is_featured) VALUES
('Diş Estetiğinde Yeni Teknolojiler', 'Dr. Şahin Durmuş modern diş estetiği teknolojilerini anlattı', 'Mynet', 'https://www.mynet.com/saglik/dis-estetigi-teknolojiler', '2024-01-15', 'Teknoloji', ARRAY['diş estetiği', 'teknoloji', 'sağlık'], true),
('İmplant Tedavisinde Dikkat Edilmesi Gerekenler', 'Uzman görüşleri ve hasta deneyimleri', 'CNN Türk', 'https://www.cnnturk.com/saglik/implant-tedavisi', '2024-01-10', 'Tedavi', ARRAY['implant', 'tedavi', 'sağlık'], false),
('Gülüş Tasarımında Altın Oran', 'Estetik diş hekimliğinde matematiksel yaklaşım', 'Sabah', 'https://www.sabah.com.tr/saglik/guluş-tasarimi', '2024-01-05', 'Estetik', ARRAY['gülüş tasarımı', 'estetik'], true),
('Çocuklarda Diş Sağlığı', 'Erken yaşta diş bakımının önemi', 'Hürriyet', 'https://www.hurriyet.com.tr/saglik/cocuk-dis-sagligi', '2023-12-20', 'Çocuk Sağlığı', ARRAY['çocuk', 'diş sağlığı', 'önleme'], false),
('Diş Beyazlatma Yöntemleri', 'Güvenli beyazlatma teknikleri', 'Posta', 'https://www.posta.com.tr/saglik/dis-beyazlatma', '2023-12-15', 'Estetik', ARRAY['beyazlatma', 'estetik'], false)
ON CONFLICT DO NOTHING; 