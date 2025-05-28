# 🗄️ Database Kurulumu - Video Sistemi

Bu dokümanda videoları gerçek database'den çekmek için gerekli adımları bulacaksınız.

## 📋 Seçenekler

### 🌟 1. Supabase (Önerilen)
- ✅ **Ücretsiz**: 500MB database + 50GB bandwidth
- ✅ **Kolay kurulum**: 5 dakikada hazır
- ✅ **PostgreSQL**: Modern ve güvenilir
- ✅ **Real-time**: Otomatik güncellemeler
- ✅ **TypeScript**: Tam tip desteği

### 2. Diğer Seçenekler
- **Vercel Postgres**: $20/ay, serverless
- **PlanetScale**: MySQL, limited free tier
- **Railway**: PostgreSQL, pay-as-you-go

## 🚀 Supabase Kurulumu

### Adım 1: Supabase Hesabı Oluştur
1. [supabase.com](https://supabase.com) adresine git
2. "Start your project" tıkla
3. GitHub ile giriş yap
4. "New Project" oluştur

### Adım 2: Database Bilgilerini Al
1. Project dashboard'ta **Settings** > **API** sayfasına git
2. Bu bilgileri kopyala:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Adım 3: Environment Variables Ayarla
Proje klasöründe `.env.local` dosyası oluştur:

```bash
# .env.local dosyası oluştur
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Adım 4: Database Schema Oluştur

#### 🔥 YENİ: Modüler Yaklaşım (Önerilen)
Artık SQL dosyaları modüler olarak organize edildi! `database/` klasöründe:

```
database/
├── 01_blog_system.sql      # Blog sistemi
├── 02_video_system.sql     # Video sistemi ⭐
├── 03_security_policies.sql # Güvenlik
├── 04_sample_data.sql      # Test veriler
└── README.md               # Detaylı açıklamalar
```

**Kurulum Sırası:**
1. Supabase dashboard'ta **SQL Editor** sayfasına git
2. Dosyaları sırayla kopyala/yapıştır:
   - `01_blog_system.sql` → **RUN**
   - `02_video_system.sql` → **RUN** ⭐
   - `03_security_policies.sql` → **RUN**
   - `04_sample_data.sql` → **RUN**

#### 📁 Alternatif: Tek Dosya (Eski)
Eğer tek dosya ile kurmak istiyorsanız:
- `database/schema.sql` dosyasının tüm içeriğini kopyala/yapıştır

### Adım 5: Test Et
```bash
npm run dev
```

Ana sayfada videolar gözükecek! 🎉

## 📊 Database Şeması

### 🎬 Video Sistemi (`02_video_system.sql`)
```sql
doctor_videos tablosu:
├── id (SERIAL PRIMARY KEY)
├── title (VARCHAR(255))
├── description (TEXT)
├── video_url (VARCHAR(500))
├── thumbnail_url (VARCHAR(500))
├── duration (INTEGER) -- saniye
├── category (VARCHAR(50)) -- enum
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── view_count (INTEGER)
└── sort_order (INTEGER)
```

### 📝 Blog Sistemi (`01_blog_system.sql`)
- `categories` - Blog kategorileri
- `blog_posts` - Blog yazıları
- `blog_comments` - Yorumlar

### 🔒 Güvenlik (`03_security_policies.sql`)
- Row Level Security (RLS)
- Auto-update triggers
- Public read policies

## 🔧 Video Yönetimi

### Yeni Video Ekle
```typescript
import { VideoService } from '@/lib/database/video-service'

const newVideo = await VideoService.createVideo({
  title: "Yeni Video",
  description: "Video açıklaması",
  videoUrl: "/videos/yeni-video.mp4",
  thumbnailUrl: "/images/thumbnails/yeni.jpg",
  duration: 120, // 2 dakika
  category: "tanıtım",
  isActive: true
})
```

### Video Güncelle
```typescript
const updated = await VideoService.updateVideo(1, {
  title: "Güncellenmiş Başlık",
  viewCount: 1000
})
```

### Video Sil
```typescript
const deleted = await VideoService.deleteVideo(1)
```

## 📈 Özellikler

### ✨ Otomatik Özellikler
- **View Count**: Otomatik izlenme sayısı
- **Real-time**: Canlı güncellemeler
- **Caching**: Performans optimizasyonu
- **Error Handling**: Hata durumunda mock data

### 🔍 Sorgular
- En popüler videolar
- Kategoriye göre filtreleme
- Aktif/pasif durumu
- Sıralama (sort_order)

## 🎬 Video Dosyaları

### Dosya Organizasyonu
```
public/
├── videos/
│   ├── teknoloji-tanitim.mp4
│   ├── implant-sureci.mp4
│   └── hasta-deneyimi-1.mp4
└── images/
    └── video-thumbnails/
        ├── teknoloji.jpg
        ├── implant.jpg
        └── hasta-1.jpg
```

### Video Formatları
- **Format**: MP4 (H.264)
- **Çözünürlük**: 720p (1280x720) önerilen
- **Aspect Ratio**: 9:16 (dikey, TikTok style)
- **Boyut**: Max 50MB per video
- **Süre**: 30-120 saniye ideal

## 🔒 Güvenlik

### Row Level Security (RLS)
- Sadece aktif videolar görünür
- Admin erişimi ayrıca konfigüre edilebilir
- Public read, protected write

### API Keys
- **ANON KEY**: Frontend için güvenli
- **SERVICE ROLE**: Backend/admin için

## 🚨 Sorun Giderme

### Database Bağlantı Hatası
1. `.env.local` dosyasını kontrol et
2. Supabase project aktif mi?
3. API keys doğru mu?

### Video Gözükmüyor
1. `is_active = true` kontrol et
2. Video dosyaları mevcut mu?
3. Browser console hatalarını kontrol et

### Mock Data Gözüküyor
- Database bağlantısı yok
- Fallback olarak çalışıyor
- Production'da gerçek data gelecek

## ⚙️ Modüler Avantajlar

### ✅ Yeni Yapının Faydaları
- **Modüler**: Sadece video sistemi güncellenebilir
- **Temiz**: Her dosya kendi sorumluluğuna odaklanır
- **Güvenli**: Sadece gerekli kısmı değiştirilir
- **Organize**: Hangi tablonun nerede olduğu belli
- **Scalable**: Yeni özellikler için yeni dosya ekle

### 📁 Dosya İçerikleri
| Dosya | İçerik | Ana Tablo |
|-------|--------|-----------|
| `01_blog_system.sql` | Blog sistemi | `blog_posts`, `categories` |
| `02_video_system.sql` | **Video sistemi** | `doctor_videos` ⭐ |
| `03_security_policies.sql` | Güvenlik | RLS policies |
| `04_sample_data.sql` | Test data | INSERT'ler |

## 📞 Destek

Sorun yaşıyorsanız:
1. Terminal'de hata mesajlarını kontrol edin
2. Browser console'u kontrol edin  
3. Supabase logs'ları kontrol edin
4. `database/README.md` dosyasına bakın

Şimdi videolarınızı modüler database'den çekebilirsiniz! 🎯 