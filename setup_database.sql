-- Reviews System Database Schema
-- Patient reviews tablosu ve gerekli yapılar

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
('Zeynep Arslan', 'zeynep.arslan@email.com', 'Acil durumda gittiğim için çok endişeliydim. Ağrım hemen geçti ve tedavi çok hızlı oldu. Personel çok ilgili.', 5, 'other', false, false, 0, NULL, NULL)
ON CONFLICT (id) DO NOTHING; 