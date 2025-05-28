-- Video System Database Schema - COMPLETE
-- Video tablosu, güvenlik, sample data - hepsi bir arada

-- Extensions (gerekirse)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Video system indexes
CREATE INDEX IF NOT EXISTS idx_doctor_videos_category ON doctor_videos(category);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_is_active ON doctor_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_view_count ON doctor_videos(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_sort_order ON doctor_videos(sort_order);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_created_at ON doctor_videos(created_at DESC);

-- Video system security policies
ALTER TABLE doctor_videos ENABLE ROW LEVEL SECURITY;

-- Enable read access for active videos
CREATE POLICY "Enable read access for active videos" ON doctor_videos
  FOR SELECT USING (is_active = true);

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_doctor_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doctor_videos_updated_at
  BEFORE UPDATE ON doctor_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_videos_updated_at();

-- View count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_video_view_count(video_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE doctor_videos 
  SET view_count = view_count + 1 
  WHERE id = video_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample video data
INSERT INTO doctor_videos (title, description, video_url, thumbnail_url, duration, category, view_count, sort_order) VALUES
('Diş Hekimliğinde Modern Teknoloji', 'Kliniğimizde kullandığımız son teknoloji cihazları tanıtıyoruz', '/videos/teknoloji-tanitim.mp4', '/images/video-thumbnails/teknoloji.jpg', 45, 'tanıtım', 1250, 1),
('İmplant Tedavisi Süreci', 'İmplant tedavisinin adım adım nasıl yapıldığını öğrenin', '/videos/implant-sureci.mp4', '/images/video-thumbnails/implant.jpg', 60, 'tedavi', 980, 2),
('Hasta Deneyimi - Ahmet Bey', 'Ahmet Bey''in implant tedavisi deneyimini dinleyin', '/videos/hasta-deneyimi-1.mp4', '/images/video-thumbnails/hasta-1.jpg', 35, 'hasta-deneyimi', 750, 3),
('Diş Beyazlatma İpuçları', 'Evde uygulayabileceğiniz diş beyazlatma yöntemleri', '/videos/beyazlatma-ipuclari.mp4', '/images/video-thumbnails/beyazlatma.jpg', 40, 'bilgilendirme', 1100, 4),
('Klinik Tanıtımı', 'Modern kliniğimizi ve ekibimizi tanıyın', '/videos/klinik-tanitim.mp4', '/images/video-thumbnails/klinik.jpg', 55, 'tanıtım', 1500, 5)
ON CONFLICT (id) DO NOTHING;

-- Video system complete! 🎬 