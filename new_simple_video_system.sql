-- Video System Database Schema - COMPLETE
-- Video tablosu, güvenlik, sample data - hepsi bir arada

-- Extensions (gerekirse)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Video tablosu oluşturma
CREATE TABLE IF NOT EXISTS doctor_videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(50) NOT NULL CHECK (category IN ('tanıtım', 'tedavi', 'bilgilendirme', 'hasta-deneyimi', 'teknoloji')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video system indexes
CREATE INDEX IF NOT EXISTS idx_doctor_videos_category ON doctor_videos(category);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_is_active ON doctor_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_view_count ON doctor_videos(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_sort_order ON doctor_videos(sort_order);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_created_at ON doctor_videos(created_at DESC);

-- Video system security policies
ALTER TABLE doctor_videos ENABLE ROW LEVEL SECURITY;

-- Enable read access for active videos
CREATE POLICY "Anyone can view active videos" ON doctor_videos
  FOR SELECT USING (is_active = true);

-- Admin kullanıcıları için tam erişim (authenticated users)
CREATE POLICY "Authenticated users can do everything" ON doctor_videos
  FOR ALL USING (auth.role() = 'authenticated');

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_doctor_videos_updated_at ON doctor_videos;
CREATE TRIGGER update_doctor_videos_updated_at
  BEFORE UPDATE ON doctor_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_video_view_count(video_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE doctor_videos 
  SET view_count = view_count + 1 
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Sample video data
INSERT INTO doctor_videos (title, description, video_url, duration, category, is_active, view_count, sort_order) VALUES
('Klinik Tanıtımı', 'Modern diş hekimliği kliniğimizin tanıtım videosu', 'https://example.com/video1.mp4', 120, 'tanıtım', true, 150, 1),
('İmplant Tedavisi', 'Diş implantı tedavi sürecinin detaylı anlatımı', 'https://example.com/video2.mp4', 300, 'tedavi', true, 89, 2),
('Ağız Hijyeni', 'Doğru diş fırçalama teknikleri ve ağız bakımı', 'https://example.com/video3.mp4', 180, 'bilgilendirme', true, 234, 3),
('Hasta Deneyimi - Ahmet Bey', 'İmplant tedavisi gören hastamızın deneyimleri', 'https://example.com/video4.mp4', 90, 'hasta-deneyimi', true, 67, 4),
('3D Görüntüleme Teknolojisi', 'Kliniğimizde kullandığımız modern teknolojiler', 'https://example.com/video5.mp4', 240, 'teknoloji', true, 112, 5)
ON CONFLICT (id) DO NOTHING;

-- Video system complete! 🎬 

-- Kontrol sorguları
DO $$
BEGIN
    RAISE NOTICE 'Video sistemi başarıyla kuruldu!';
    RAISE NOTICE 'Toplam % video eklendi.', (SELECT COUNT(*) FROM doctor_videos);
    RAISE NOTICE 'Sistem kullanıma hazır.';
END $$;

SELECT 'Video sistemi başarıyla kuruldu!' as status;
SELECT COUNT(*) as video_count FROM doctor_videos;
SELECT category, COUNT(*) as count FROM doctor_videos GROUP BY category; 