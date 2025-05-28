# Video Sistemi Kurulum Rehberi

## 🎬 Basit Video Yönetim Sistemi

Bu rehber, diş hekimi sitesi için basitleştirilmiş video yönetim sisteminin kurulumunu açıklar.

## 📋 Kurulum Adımları

### 1. Veritabanı Kurulumu

#### Adım 1: Eski Sistemi Temizle (Opsiyonel)
Eğer daha önce video sistemi kurduysanız:

1. Supabase Dashboard'a gidin
2. SQL Editor'ı açın
3. `cleanup_old_video_system.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'da çalıştırın

#### Adım 2: Yeni Sistemi Kur
1. Supabase Dashboard'a gidin
2. SQL Editor'ı açın
3. `new_simple_video_system.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'da çalıştırın

### 2. Uygulama Testi

1. Uygulamayı başlatın:
   ```bash
   npm run dev
   ```

2. Admin panele gidin: `http://localhost:3000/admin/login`

3. Video yönetim sayfasını test edin: `http://localhost:3000/admin/videos`

4. Anasayfada video bölümünü kontrol edin: `http://localhost:3000`

## 🗂️ Sistem Yapısı

### Veritabanı Tablosu: `doctor_videos`

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | SERIAL | Birincil anahtar |
| `title` | VARCHAR(255) | Video başlığı |
| `description` | TEXT | Video açıklaması |
| `video_url` | TEXT | Video dosyası URL'si |
| `thumbnail_url` | TEXT | Önizleme resmi URL'si (opsiyonel) |
| `duration` | INTEGER | Video süresi (saniye) |
| `category` | VARCHAR(50) | Video kategorisi (enum) |
| `is_active` | BOOLEAN | Aktif/pasif durumu |
| `view_count` | INTEGER | Görüntülenme sayısı |
| `sort_order` | INTEGER | Sıralama |
| `created_at` | TIMESTAMP | Oluşturulma tarihi |
| `updated_at` | TIMESTAMP | Güncellenme tarihi |

### Kategoriler (Enum)

- 🏥 **tanıtım** - Klinik ve hizmet tanıtımları
- 🦷 **tedavi** - Tedavi süreçleri ve prosedürler
- 📚 **bilgilendirme** - Eğitici ve bilgilendirici içerikler
- 👥 **hasta-deneyimi** - Hasta görüşleri ve deneyimleri
- ⚡ **teknoloji** - Modern teknoloji ve cihazlar

## 🔧 API Endpoint'leri

### Video Listesi
```
GET /api/doctor-videos
Query Parameters:
- category: Kategori filtresi
- active: true/false (aktif durum filtresi)
- limit: Sonuç sayısı limiti
```

### Yeni Video Ekleme
```
POST /api/doctor-videos
Body: {
  title: string,
  description: string,
  video_url: string,
  thumbnail_url?: string,
  duration: number,
  category: string,
  is_active?: boolean,
  sort_order?: number
}
```

### Video Detayı
```
GET /api/doctor-videos/[id]
```

### Video Güncelleme
```
PATCH /api/doctor-videos/[id]
Body: Güncellenecek alanlar
```

### Video Silme
```
DELETE /api/doctor-videos/[id]
```

## 📱 Frontend Sayfaları

### Admin Panel
- `/admin/videos` - Video listesi ve yönetim
- `/admin/videos/new` - Yeni video ekleme
- `/admin/videos/edit/[id]` - Video düzenleme

### Kullanıcı Sayfaları
- `/` - Anasayfa (video bölümü)
- `/videos` - Tüm videolar (gelecekte eklenebilir)

## 🎯 Özellikler

### ✅ Mevcut Özellikler
- Drag & drop video upload
- Otomatik video metadata çıkarma
- Kategori bazlı filtreleme
- Aktif/pasif durum yönetimi
- Görüntülenme sayısı takibi
- Responsive tasarım
- Hata yönetimi
- Türkçe arayüz

### 🔄 Video Upload Süreci
1. Admin video upload sayfasına gider
2. Video dosyasını drag & drop ile yükler
3. Sistem otomatik olarak süre ve metadata çıkarır
4. Kullanıcı başlık, açıklama ve kategori ekler
5. Video kaydedilir ve anasayfada görünür

### 🎮 Video Oynatma
- Hover ile kontroller görünür
- Play/pause butonları
- Ses açma/kapama
- Otomatik loop
- Mobile uyumlu

## 🚨 Sorun Giderme

### Video Oynatma Hatası
```
Error: The play() request was interrupted by a call to pause().
```
**Çözüm**: Bu normal bir durumdur. Modern tarayıcılar autoplay'i kısıtlar. Kullanıcı etkileşimi gereklidir.

### Veritabanı Bağlantı Hatası
```
relation "doctor_videos" does not exist
```
**Çözüm**: `new_simple_video_system.sql` dosyasını Supabase'de çalıştırın.

### Video Upload Hatası
**Çözüm**: 
1. Supabase Storage bucket'ının oluşturulduğundan emin olun
2. RLS politikalarının doğru ayarlandığından emin olun
3. Dosya boyutu limitlerini kontrol edin (max 500MB)

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Supabase logs'ları inceleyin
3. API response'larını kontrol edin

## 🔄 Güncelleme Notları

### v1.0 (Mevcut)
- Basit video sistemi
- 5 kategori
- Temel CRUD işlemleri
- Anasayfa entegrasyonu

### Gelecek Güncellemeler
- Video thumbnail otomatik oluşturma
- Video compression
- Playlist sistemi
- Video analytics
- Yorum sistemi 