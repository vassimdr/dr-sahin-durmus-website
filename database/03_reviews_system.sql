-- Reviews System Database Schema - COMPLETE
-- Patient reviews tablosu, güvenlik, sample data - hepsi bir arada

-- Extensions (gerekirse)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patient reviews tablosu oluşturma
CREATE TABLE IF NOT EXISTS patient_reviews (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  treatment_category VARCHAR(50) NOT NULL CHECK (treatment_category IN (
    'implant', 'ortodonti', 'estetik', 'beyazlatma', 'kanal', 
    'cekim', 'dolgu', 'protez', 'cocuk-dis', 'periodontoloji', 'other'
  )),
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- IP ve güvenlik bilgileri
  ip_address INET,
  user_agent TEXT,
  device_fingerprint VARCHAR(255),
  
  -- Moderasyon bilgileri
  approved_by VARCHAR(255),
  moderation_notes TEXT
);

-- Reviews system indexes
CREATE INDEX IF NOT EXISTS idx_patient_reviews_approved ON patient_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_featured ON patient_reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_rating ON patient_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_category ON patient_reviews(treatment_category);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_created_at ON patient_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_email ON patient_reviews(patient_email);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_helpful ON patient_reviews(helpful_count DESC);

-- Reviews system security policies
ALTER TABLE patient_reviews ENABLE ROW LEVEL SECURITY;

-- Enable read access for approved reviews only
CREATE POLICY "Enable read access for approved reviews" ON patient_reviews
  FOR SELECT USING (is_approved = true);

-- Admin can see all reviews
CREATE POLICY "Admin can see all reviews" ON patient_reviews
  FOR ALL USING (current_user = 'admin_user');

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_patient_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_reviews_updated_at
  BEFORE UPDATE ON patient_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_reviews_updated_at();

-- Review onaylama fonksiyonu
CREATE OR REPLACE FUNCTION approve_review(
  review_id INTEGER,
  admin_user VARCHAR(255),
  make_featured BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE patient_reviews 
  SET 
    is_approved = true,
    is_featured = make_featured,
    approved_at = NOW(),
    approved_by = admin_user
  WHERE id = review_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helpful count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_helpful_count(review_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE patient_reviews 
  SET helpful_count = helpful_count + 1 
  WHERE id = review_id AND is_approved = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Review istatistikleri view'ı
CREATE OR REPLACE VIEW review_statistics AS
SELECT 
  COUNT(*) as total_reviews,
  COUNT(*) FILTER (WHERE is_approved = true) as approved_reviews,
  COUNT(*) FILTER (WHERE is_approved = false) as pending_reviews,
  COUNT(*) FILTER (WHERE is_featured = true) as featured_reviews,
  ROUND(AVG(rating) FILTER (WHERE is_approved = true), 2) as average_rating,
  COUNT(*) FILTER (WHERE rating = 5 AND is_approved = true) as five_star_count,
  COUNT(*) FILTER (WHERE rating = 4 AND is_approved = true) as four_star_count,
  COUNT(*) FILTER (WHERE rating = 3 AND is_approved = true) as three_star_count,
  COUNT(*) FILTER (WHERE rating = 2 AND is_approved = true) as two_star_count,
  COUNT(*) FILTER (WHERE rating = 1 AND is_approved = true) as one_star_count
FROM patient_reviews;

-- Email validation fonksiyonu
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Email validation constraint
ALTER TABLE patient_reviews 
ADD CONSTRAINT valid_email_format 
CHECK (is_valid_email(patient_email));

-- Sample review data
INSERT INTO patient_reviews (
  patient_name, 
  patient_email, 
  review_text, 
  rating, 
  treatment_category, 
  is_approved, 
  is_featured, 
  helpful_count,
  approved_at,
  approved_by
) VALUES
('Ayşe Kaya', 'ayse.kaya@email.com', 'İmplant tedavim için Dr. Şahin Durmuş''u tercih ettim. Hem işlem öncesi hem de sonrası çok ilgili davrandı. Kliniği çok temiz ve modern. Kesinlikle tavsiye ederim!', 5, 'implant', true, true, 12, NOW() - INTERVAL '5 days', 'admin'),
('Mehmet Öztürk', 'mehmet.ozturk@email.com', 'Diş beyazlatma işlemi için gittim. Sonuç harika oldu! Personel çok güler yüzlü ve profesyonel. Fiyatlar da makul seviyede.', 5, 'beyazlatma', true, false, 8, NOW() - INTERVAL '3 days', 'admin'),
('Fatma Demir', 'fatma.demir@email.com', 'Çocuğumun diş tedavisi için geldik. Doktor çocuklarla çok iyi ilgileniyor, hiç korkmadı. Teşekkür ederiz!', 5, 'cocuk-dis', true, false, 5, NOW() - INTERVAL '2 days', 'admin'),
('Ali Yılmaz', 'ali.yilmaz@email.com', 'Ortodonti tedavim devam ediyor. İlk aylarda biraz zorluk yaşasam da doktor ve ekip çok destekleyici. Sonuçları görmeye başladım.', 4, 'ortodonti', false, false, 0, NULL, NULL),
('Zeynep Arslan', 'zeynep.arslan@email.com', 'Acil durumda gittiğim için çok endişeliydim. Ağrım hemen geçti ve tedavi çok hızlı oldu. Personel çok ilgili.', 5, 'other', false, false, 0, NULL, NULL),
('Hasan Çelik', 'hasan.celik@email.com', 'Kanal tedavisi yaptırdım. Hiç acımadı ve çok profesyonel bir şekilde hallettik. Doktora çok teşekkürler!', 5, 'kanal', false, false, 0, NULL, NULL),
('Elif Şahin', 'elif.sahin@email.com', 'Diş dolgu işlemi için geldim. Çok hızlı ve kaliteli bir hizmet aldım. Personel çok nazik ve anlayışlı.', 4, 'dolgu', false, false, 0, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Review kategorileri için lookup tablosu
CREATE TABLE IF NOT EXISTS treatment_categories (
  category_key VARCHAR(50) PRIMARY KEY,
  category_name_tr VARCHAR(255) NOT NULL,
  category_name_en VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO treatment_categories (category_key, category_name_tr, category_name_en, description, sort_order) VALUES
('implant', 'İmplant Tedavisi', 'Implant Treatment', 'Eksik dişlerin yerine yapılan implant uygulamaları', 1),
('ortodonti', 'Ortodonti', 'Orthodontics', 'Diş teli ve diş düzeltme tedavileri', 2),
('estetik', 'Estetik Diş Hekimliği', 'Aesthetic Dentistry', 'Gülüş tasarımı ve estetik uygulamalar', 3),
('beyazlatma', 'Diş Beyazlatma', 'Teeth Whitening', 'Profesyonel diş beyazlatma işlemleri', 4),
('kanal', 'Kanal Tedavisi', 'Root Canal Treatment', 'Enfekte diş köklerinin tedavisi', 5),
('cekim', 'Diş Çekimi', 'Tooth Extraction', 'Basit ve cerrahi diş çekimi işlemleri', 6),
('dolgu', 'Dolgu', 'Filling', 'Çürük dişlerin dolgu ile tedavisi', 7),
('protez', 'Protez', 'Prosthetics', 'Sabit ve hareketli protez uygulamaları', 8),
('cocuk-dis', 'Çocuk Diş Hekimliği', 'Pediatric Dentistry', 'Çocuklara özel diş tedavileri', 9),
('periodontoloji', 'Diş Eti Tedavisi', 'Periodontal Treatment', 'Diş eti hastalıklarının tedavisi', 10),
('other', 'Diğer', 'Other', 'Diğer dental tedaviler', 11)
ON CONFLICT (category_key) DO NOTHING;

-- Review system complete! 💬
-- Bu şema production ortamında kullanılabilir
-- Email validation, güvenlik, indexler ve sample data dahil 