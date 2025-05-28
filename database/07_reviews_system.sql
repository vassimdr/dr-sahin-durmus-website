-- Patient Reviews System Database Schema - COMPLETE
-- IP-based review system (no registration required) - Modern & User-friendly

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patient reviews tablosu (IP tabanlı tek yorum sistemi)
CREATE TABLE IF NOT EXISTS patient_reviews (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(100) NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  treatment_category VARCHAR(50) CHECK (treatment_category IN (
    'implant', 'estetik', 'ortodonti', 'cocuk-dis', 'genel-tedavi', 'temizlik', 'protez', 'kanal-tedavisi'
  )),
  patient_ip_hash VARCHAR(64) UNIQUE NOT NULL, -- IP'nin hash'i (güvenlik için)
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  -- Meta bilgiler
  user_agent_hash VARCHAR(64), -- Browser bilgisi (ek güvenlik)
  review_source VARCHAR(20) DEFAULT 'website' CHECK (review_source IN ('website', 'google', 'manual')),
  admin_notes TEXT
);

-- IP tracking tablosu (yedek kontrol için)
CREATE TABLE IF NOT EXISTS review_ip_tracking (
  id SERIAL PRIMARY KEY,
  ip_hash VARCHAR(64) UNIQUE NOT NULL,
  review_count INTEGER DEFAULT 1,
  last_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review moderation log (admin işlemleri)
CREATE TABLE IF NOT EXISTS review_moderation_log (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES patient_reviews(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'featured', 'unfeatured', 'edited')),
  admin_user VARCHAR(100),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review system indexes
CREATE INDEX IF NOT EXISTS idx_patient_reviews_ip_hash ON patient_reviews(patient_ip_hash);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_approved ON patient_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_featured ON patient_reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_rating ON patient_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_created_at ON patient_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_reviews_treatment ON patient_reviews(treatment_category);
CREATE INDEX IF NOT EXISTS idx_review_ip_tracking_hash ON review_ip_tracking(ip_hash);
CREATE INDEX IF NOT EXISTS idx_review_moderation_review_id ON review_moderation_log(review_id);

-- Review system security policies
ALTER TABLE patient_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_ip_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_moderation_log ENABLE ROW LEVEL SECURITY;

-- Public read access for approved reviews
CREATE POLICY "Enable read access for approved reviews" ON patient_reviews
  FOR SELECT USING (is_approved = true);

-- Public insert for new reviews (will be moderated)
CREATE POLICY "Enable insert for new reviews" ON patient_reviews
  FOR INSERT WITH CHECK (true);

-- IP kontrolü fonksiyonu (aynı IP'den tekrar yorum yapılmasını engeller)
CREATE OR REPLACE FUNCTION check_ip_review_limit(input_ip_hash VARCHAR(64))
RETURNS BOOLEAN AS $$
DECLARE
  existing_review_count INTEGER;
  ip_blocked BOOLEAN;
BEGIN
  -- IP'nin engellenip engellenmediğini kontrol et
  SELECT is_blocked INTO ip_blocked 
  FROM review_ip_tracking 
  WHERE ip_hash = input_ip_hash;
  
  IF ip_blocked = true THEN
    RETURN false;
  END IF;
  
  -- Bu IP'den daha önce yorum yapılmış mı kontrol et
  SELECT COUNT(*) INTO existing_review_count 
  FROM patient_reviews 
  WHERE patient_ip_hash = input_ip_hash;
  
  -- IP başına sadece 1 yorum hakkı
  RETURN existing_review_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yeni yorum ekleme fonksiyonu (IP kontrolü ile)
CREATE OR REPLACE FUNCTION add_patient_review(
  p_name VARCHAR(100),
  p_review TEXT,
  p_rating INTEGER,
  p_treatment VARCHAR(50),
  p_ip_hash VARCHAR(64),
  p_user_agent_hash VARCHAR(64) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  can_review BOOLEAN;
  new_review_id INTEGER;
  result JSON;
BEGIN
  -- IP kontrolü yap
  SELECT check_ip_review_limit(p_ip_hash) INTO can_review;
  
  IF NOT can_review THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Bu cihazdan daha önce değerlendirme yapılmış. Her cihaz sadece bir defa yorum yapabilir.',
      'error_code', 'IP_LIMIT_EXCEEDED'
    );
  END IF;
  
  -- Yorum uzunluğu kontrolü
  IF length(trim(p_review)) < 10 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Yorum en az 10 karakter olmalıdır.',
      'error_code', 'REVIEW_TOO_SHORT'
    );
  END IF;
  
  -- Yeni yorumu ekle
  INSERT INTO patient_reviews (
    patient_name, review_text, rating, treatment_category, 
    patient_ip_hash, user_agent_hash
  ) VALUES (
    trim(p_name), trim(p_review), p_rating, p_treatment, 
    p_ip_hash, p_user_agent_hash
  ) RETURNING id INTO new_review_id;
  
  -- IP tracking tablosunu güncelle
  INSERT INTO review_ip_tracking (ip_hash, review_count)
  VALUES (p_ip_hash, 1)
  ON CONFLICT (ip_hash) 
  DO UPDATE SET 
    review_count = review_ip_tracking.review_count + 1,
    last_review_date = NOW();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Değerlendirmeniz başarıyla gönderildi! Onaylandıktan sonra yayınlanacaktır.',
    'review_id', new_review_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yorumu beğenme fonksiyonu (helpful_count artırma)
CREATE OR REPLACE FUNCTION mark_review_helpful(review_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE patient_reviews 
  SET helpful_count = helpful_count + 1 
  WHERE id = review_id AND is_approved = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin yorum onaylama fonksiyonu
CREATE OR REPLACE FUNCTION approve_review(
  review_id INTEGER,
  admin_user VARCHAR(100) DEFAULT 'system',
  make_featured BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
  review_exists BOOLEAN;
BEGIN
  -- Yorumun var olduğunu kontrol et
  SELECT EXISTS(SELECT 1 FROM patient_reviews WHERE id = review_id) INTO review_exists;
  
  IF NOT review_exists THEN
    RETURN json_build_object('success', false, 'message', 'Yorum bulunamadı');
  END IF;
  
  -- Yorumu onayla
  UPDATE patient_reviews 
  SET 
    is_approved = true,
    is_featured = make_featured,
    approved_at = NOW()
  WHERE id = review_id;
  
  -- Moderation log'a kaydet
  INSERT INTO review_moderation_log (review_id, action, admin_user)
  VALUES (review_id, 'approved', admin_user);
  
  IF make_featured THEN
    INSERT INTO review_moderation_log (review_id, action, admin_user)
    VALUES (review_id, 'featured', admin_user);
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Yorum onaylandı');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- İstatistik view'ı
CREATE OR REPLACE VIEW review_statistics AS
SELECT 
  COUNT(*) as total_reviews,
  COUNT(*) FILTER (WHERE is_approved = true) as approved_reviews,
  COUNT(*) FILTER (WHERE is_approved = false) as pending_reviews,
  COUNT(*) FILTER (WHERE is_featured = true) as featured_reviews,
  ROUND(AVG(rating), 2) as average_rating,
  COUNT(*) FILTER (WHERE rating = 5) as five_star_count,
  COUNT(*) FILTER (WHERE rating = 4) as four_star_count,
  COUNT(*) FILTER (WHERE rating = 3) as three_star_count,
  COUNT(*) FILTER (WHERE rating = 2) as two_star_count,
  COUNT(*) FILTER (WHERE rating = 1) as one_star_count
FROM patient_reviews
WHERE is_approved = true;

-- Sample review data (moderasyona tabi)
INSERT INTO patient_reviews (
  patient_name, review_text, rating, treatment_category, 
  patient_ip_hash, is_approved, is_featured, created_at
) VALUES
(
  'Ayşe Kaya', 
  'İmplant tedavim için Dr. Şahin Durmuş''u tercih ettim. Hem işlem öncesi hem de sonrası çok ilgili davrandı. Kliniği çok temiz ve modern. Kesinlikle tavsiye ederim!', 
  5, 
  'implant', 
  'hash_ip_1234567890abcdef1', 
  true, 
  true,
  NOW() - INTERVAL '15 days'
),
(
  'Mehmet Öztürk', 
  'Diş beyazlatma işlemi için gittim. Sonuç harika oldu! Personel çok güler yüzlü ve profesyonel. Fiyatlar da makul seviyede.', 
  5, 
  'estetik', 
  'hash_ip_2345678901bcdef12', 
  true, 
  true,
  NOW() - INTERVAL '12 days'
),
(
  'Fatma Demir', 
  'Çocuğumun diş tedavisi için geldik. Doktor çocuklarla çok iyi ilgileniyor, hiç korkmadı. Teşekkür ederiz!', 
  5, 
  'cocuk-dis', 
  'hash_ip_3456789012cdef123', 
  true, 
  false,
  NOW() - INTERVAL '8 days'
),
(
  'Ali Yılmaz', 
  'Diş teli takımı için buraya geldim. Açıklama çok detaylı, süreç hakkında her şeyi anlattılar. Memnunum.', 
  4, 
  'ortodonti', 
  'hash_ip_456789013def1234a', 
  true, 
  false,
  NOW() - INTERVAL '5 days'
),
(
  'Zehra Aktaş', 
  'Rutin kontrolüm için gittim. Çok dikkatli muayene ettiler ve gerekli tavsiyeleri verdiler. Temiz bir klinik.', 
  4, 
  'genel-tedavi', 
  'hash_ip_56789014ef1234ab5', 
  true, 
  false,
  NOW() - INTERVAL '3 days'
),
(
  'Onur Şen', 
  'Kanal tedavisi yaptırdım. Hiç acımadı ve çok hızlı hallettik. Doktora teşekkürler!', 
  5, 
  'kanal-tedavisi', 
  'hash_ip_6789015f1234abc56', 
  false, 
  false,
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (patient_ip_hash) DO NOTHING;

-- Sample IP tracking data
INSERT INTO review_ip_tracking (ip_hash, review_count, last_review_date) VALUES
('hash_ip_1234567890abcdef1', 1, NOW() - INTERVAL '15 days'),
('hash_ip_2345678901bcdef12', 1, NOW() - INTERVAL '12 days'),
('hash_ip_3456789012cdef123', 1, NOW() - INTERVAL '8 days'),
('hash_ip_456789013def1234a', 1, NOW() - INTERVAL '5 days'),
('hash_ip_56789014ef1234ab5', 1, NOW() - INTERVAL '3 days'),
('hash_ip_6789015f1234abc56', 1, NOW() - INTERVAL '1 day')
ON CONFLICT (ip_hash) DO NOTHING;

-- Patient review system complete! ⭐ 
-- Modern IP-based review system (no registration needed!) 