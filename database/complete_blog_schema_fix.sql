-- Complete Blog System Database Schema Fix
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- Dr. Şahin Durmuş Diş Hekimi Sitesi için Blog Sistemi

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories tablosu (eğer yoksa oluştur)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Blog posts tablosu (eğer yoksa oluştur)
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON blog_posts(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);

-- RLS (Row Level Security) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow public read access on approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow public insert on comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow authenticated insert on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow authenticated update on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow all operations for service role" ON blog_posts;

-- Yeni politikalar oluştur
-- Categories için public read access
CREATE POLICY "Allow public read access on categories" ON categories 
  FOR SELECT USING (true);

-- Blog posts için public read access (sadece yayınlanan yazılar)
CREATE POLICY "Allow public read access on blog_posts" ON blog_posts 
  FOR SELECT USING (published = true);

-- Blog posts için service role tüm işlemler (API'ler için)
CREATE POLICY "Allow all operations for service role" ON blog_posts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments için public read access (sadece onaylanan yorumlar)
CREATE POLICY "Allow public read access on approved comments" ON blog_comments 
  FOR SELECT USING (approved = true);

-- Comments için public insert (herkes yorum ekleyebilir)
CREATE POLICY "Allow public insert on comments" ON blog_comments 
  FOR INSERT WITH CHECK (true);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at (eğer yoksa oluştur)
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample categories (Dr. Şahin Durmuş'un uzmanlık alanları)
INSERT INTO categories (name, slug, description) VALUES
('Genel Diş Sağlığı', 'genel-dis-sagligi', 'Ağız ve diş sağlığı, koruyucu tedaviler ve genel bilgiler'),
('İmplant Tedavisi', 'implant-tedavisi', 'Diş implantı, cerrahi işlemler ve protez uygulamaları'),
('Ortodonti', 'ortodonti', 'Diş teli, şeffaf plak ve diş düzeltme tedavileri'),
('Estetik Diş Hekimliği', 'estetik-dis-hekimligi', 'Gülüş tasarımı, veneer, diş beyazlatma ve estetik uygulamalar'),
('Çocuk Diş Hekimliği', 'cocuk-dis-hekimligi', 'Çocukların diş sağlığı ve pediatrik tedaviler'),
('Ağız ve Diş Sağlığı', 'agiz-dis-sagligi', 'Ağız hijyeni, diş eti hastalıkları ve koruyucu tedaviler'),
('Tedavi Öncesi ve Sonrası', 'tedavi-oncesi-sonrasi', 'Tedavi süreçleri, bakım önerileri ve iyileşme'),
('Diş Bakımı İpuçları', 'dis-bakimi-ipuclari', 'Günlük diş bakımı, beslenme önerileri ve hijyen')
ON CONFLICT (slug) DO NOTHING;

-- Sample blog posts (Dr. Şahin Durmuş'un uzmanlık alanlarına uygun)
INSERT INTO blog_posts (title, slug, excerpt, content, author, category, published_date, read_time, featured, published) VALUES
(
  'Diş İmplantı Tedavisi: Modern Çözümler ve Avantajları',
  'dis-implanti-tedavisi-modern-cozumler',
  'Eksik dişlerinizi en doğal görünümde yeniden kazanmanın yolları ve implant tedavisinin avantajları hakkında uzman görüşler.',
  '<h2>Diş İmplantı Nedir?</h2><p>Diş implantı, kaybedilen dişlerin yerine yerleştirilen titanyum vida şeklindeki yapay diş kökleridir. Bu modern tedavi yöntemi, eksik dişlerin en doğal ve kalıcı çözümünü sunar.</p><h2>İmplant Tedavisinin Avantajları</h2><ul><li>Doğal diş görünümü ve hissi sağlar</li><li>Uzun ömürlü ve kalıcı çözümdür</li><li>Çiğneme fonksiyonunu tam olarak geri kazandırır</li><li>Komşu dişlere zarar vermez</li><li>Kemik kaybını önler</li></ul><h2>Tedavi Süreci</h2><p>İmplant tedavisi genellikle 3-6 ay sürer ve şu aşamalardan oluşur:</p><ol><li>Detaylı muayene ve 3D görüntüleme</li><li>Cerrahi planlama</li><li>İmplant yerleştirme operasyonu</li><li>İyileşme süreci (osseointegrasyon)</li><li>Protez uygulaması</li></ol><p>Kliniğimizde en son teknoloji implant sistemleri kullanarak hastalarımıza en iyi sonuçları sunuyoruz.</p>',
  'Dr. Şahin Durmuş',
  'İmplant Tedavisi',
  '2024-03-15',
  '8 dk',
  true,
  true
),
(
  'Estetik Diş Hekimliği ile Gülüş Tasarımı',
  'estetik-dis-hekimligi-gulus-tasarimi',
  'Hollywood gülüşü elde etmenin sırları, veneer kaplama ve diş beyazlatma işlemleri hakkında uzman görüşler.',
  '<h2>Gülüş Tasarımı Nedir?</h2><p>Gülüş tasarımı, kişinin yüz yapısına, yaşına ve kişilik özelliklerine uygun olarak dişlerinin şekil, boyut ve renginin düzenlenmesi işlemidir.</p><h2>Veneer Kaplama Tedavisi</h2><p>Veneer kaplamalar, dişlerin ön yüzeyine yapıştırılan ince porselen ya da kompozit tabakalarıdır:</p><ul><li>Diş rengi değiştirilebilir</li><li>Diş şekli düzeltilebilir</li><li>Çarpık dişler düzeltilebilir</li><li>Aralıklar kapatılabilir</li><li>Kırık dişler onarılabilir</li></ul><h2>Profesyonel Diş Beyazlatma</h2><p>Kliniğimizde uygulanan profesyonel diş beyazlatma yöntemleri:</p><ul><li>Office bleaching (klinik beyazlatma)</li><li>Home bleaching (ev tipi beyazlatma)</li><li>Kombinasyon tedaviler</li></ul><p>Gülüş tasarımında estetik ve fonksiyonu bir arada sunarak hastalarımızın özgüvenini artırıyoruz.</p>',
  'Dr. Şahin Durmuş',
  'Estetik Diş Hekimliği',
  '2024-03-12',
  '6 dk',
  true,
  true
),
(
  'Çocuklarda Diş Sağlığı: Anne Babaların Kapsamlı Rehberi',
  'cocuklarda-dis-sagligi-anne-baba-rehberi',
  'Çocukların diş sağlığını korumak için erken yaşta alınması gereken önlemler ve düzenli doktor kontrollerinin önemi.',
  '<h2>Erken Yaşta Diş Bakımının Önemi</h2><p>Çocuklarda diş bakımı, ilk dişin çıkmasıyla birlikte başlamalıdır. Bu kritik dönemde yapılması gerekenler:</p><ul><li>İlk diş çıkmadan önce bezle dişeti temizliği</li><li>İlk dişle birlikte yumuşak fırçayla temizlik</li><li>2 yaşından sonra az miktarda florid diş macunu</li><li>3 yaşından itibaren düzenli diş hekimi kontrolü</li></ul><h2>Beslenme ve Diş Sağlığı</h2><p>Çocukların diş sağlığını etkileyen beslenme faktörleri:</p><ul><li>Şekerli ve asitli içeceklerden kaçınma</li><li>Biberonla uyuma alışkanlığından kurtulma</li><li>Kalsiyum ve vitamin D açısından zengin beslenme</li><li>Ara öğünlerde sağlıklı atıştırmalıklar</li></ul><h2>Süt Dişlerinin Önemi</h2><p>Süt dişleri sadece geçici değildir, daimi dişlerin sağlıklı çıkması için kritik öneme sahiptir.</p>',
  'Dr. Şahin Durmuş',
  'Çocuk Diş Hekimliği',
  '2024-03-10',
  '7 dk',
  false,
  true
),
(
  'Ortodonti Tedavisi: Modern Diş Düzeltme Yöntemleri',
  'ortodonti-tedavisi-modern-dis-duzeltme',
  'Diş teli tedavisi süreci, şeffaf plak sistemleri ve modern ortodonti yöntemleri hakkında detaylı bilgiler.',
  '<h2>Ortodonti Tedavisi Kimler İçin Gereklidir?</h2><p>Ortodonti tedavisi aşağıdaki durumlarda uygulanır:</p><ul><li>Çarpık veya döük dişler</li><li>Dişler arası aşırı boşluklar</li><li>Üst ve alt çenenin uyumsuzluğu</li><li>Kapanış bozuklukları</li><li>Çene eklemi problemleri</li></ul><h2>Modern Tedavi Seçenekleri</h2><p>Kliniğimizde sunduğumuz ortodonti tedavi seçenekleri:</p><ul><li>Geleneksel metal braketler</li><li>Estetik seramik braketler</li><li>Şeffaf plak sistemleri (Invisalign)</li><li>Lingual braketler (dişin iç yüzeyinde)</li><li>Kendini bağlayan braket sistemleri</li></ul><h2>Tedavi Süreci</h2><p>Ortodonti tedavisi kişiye özel planlanır ve genellikle 12-24 ay sürer. Düzenli kontroller ve hasta uyumu başarının anahtarıdır.</p>',
  'Dr. Şahin Durmuş',
  'Ortodonti',
  '2024-03-08',
  '9 dk',
  false,
  true
),
(
  'Günlük Diş Bakımı: Sağlıklı Dişler İçin Altın Kurallar',
  'gunluk-dis-bakimi-saglikli-disler',
  'Evde yapabileceğiniz doğru diş bakımı teknikleri, diş fırçalama yöntemleri ve ağız hijyeni önerileri.',
  '<h2>Doğru Diş Fırçalama Tekniği</h2><p>Etkili diş fırçalama için dikkat edilmesi gerekenler:</p><ul><li>Günde en az 2 kez, 2 dakika süreyle fırçalama</li><li>Yumuşak kıllı diş fırçası kullanma</li><li>Florid diş macunu tercih etme</li><li>Dairesel hareketlerle nazikçe fırçalama</li><li>Dil ve damak temizliğini unutmama</li></ul><h2>Diş İpi Kullanımının Önemi</h2><p>Diş ipi kullanımı neden kritiktir:</p><ul><li>Diş aralarındaki plakları temizler</li><li>Diş eti hastalıklarını önler</li><li>Ağız kokusunu azaltır</li><li>Çürük oluşumunu engeller</li></ul><h2>Ağız Gargarası ve Tamamlayıcı Bakım</h2><p>Günlük bakım rutininizi tamamlayan ürünler ve doğru kullanım şekilleri hakkında öneriler.</p>',
  'Dr. Şahin Durmuş',
  'Diş Bakımı İpuçları',
  '2024-03-05',
  '5 dk',
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Test sorgusu (başarılı olmalı)
-- SELECT COUNT(*) FROM blog_posts WHERE published = true;

-- Başarı mesajı
SELECT 'Blog sistemi başarıyla kuruldu! 🎉' as message; 