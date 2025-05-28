# 🎬 Video Sistemi Sorun Giderme Rehberi

## 🚨 Video Çalışmama Sebepleri ve Çözümleri

### 1. **Supabase Bağlantısı Eksik**

#### Problem:
- Videolar yüklenmiyor
- API hataları alıyorsunuz
- Console'da Supabase bağlantı hataları

#### Çözüm:
1. **Environment Variables Oluşturun:**
   ```bash
   # Proje klasöründe .env.local dosyası oluşturun
   touch .env.local
   ```

2. **Supabase Bilgilerini Ekleyin:**
   ```env
   # .env.local dosyasına ekleyin:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Supabase Bilgilerini Nereden Alacağınız:**
   - [supabase.com](https://supabase.com) → Project Dashboard
   - Settings → API → Project URL ve API Keys

### 2. **Supabase Storage Bucket Eksik**

#### Problem:
- Video upload hatası: "bucket does not exist"
- 404 hataları

#### Çözüm:
1. **Storage Bucket Oluşturun:**
   - Supabase Dashboard → Storage
   - "Create bucket" → Name: `videos`
   - Public: ✅ (checked)
   - File size limit: 500MB

2. **SQL ile Otomatik Kurulum:**
   - Supabase Dashboard → SQL Editor
   - `video_storage_setup.sql` dosyasını çalıştırın

### 3. **Database Tablosu Eksik**

#### Problem:
- "relation doctor_videos does not exist" hatası
- Video listesi boş

#### Çözüm:
1. **Database Schema Oluşturun:**
   - Supabase Dashboard → SQL Editor
   - `new_simple_video_system.sql` dosyasını çalıştırın

2. **Kontrol Edin:**
   ```sql
   SELECT COUNT(*) FROM doctor_videos;
   ```

### 4. **RLS (Row Level Security) Politikaları**

#### Problem:
- Video upload başarılı ama görünmüyor
- Permission denied hataları

#### Çözüm:
1. **Storage Politikalarını Kontrol Edin:**
   - Supabase Dashboard → Storage → videos bucket → Policies
   - `video_storage_setup.sql` dosyasını çalıştırın

2. **Database Politikalarını Kontrol Edin:**
   ```sql
   -- Aktif videoları herkes görebilir
   SELECT * FROM doctor_videos WHERE is_active = true;
   ```

### 5. **Video Formatı Sorunları**

#### Problem:
- Video yükleniyor ama oynatılmıyor
- Browser'da video görünmüyor

#### Çözüm:
1. **Desteklenen Formatlar:**
   - ✅ MP4 (önerilen)
   - ✅ WebM
   - ✅ AVI
   - ✅ MOV
   - ❌ MKV (bazı browser'larda sorun)

2. **Video Optimizasyonu:**
   - H.264 codec kullanın
   - Max 500MB boyut
   - 1080p veya daha düşük çözünürlük

### 6. **Browser Autoplay Kısıtlamaları**

#### Problem:
- "The play() request was interrupted" hatası
- Video otomatik başlamıyor

#### Çözüm:
- **Bu normal bir durumdur!**
- Modern browser'lar autoplay'i kısıtlar
- Kullanıcı etkileşimi gereklidir
- Play butonuna tıklayarak başlatın

## 🔧 Adım Adım Kurulum

### 1. Environment Variables
```bash
# .env.local dosyası oluşturun ve doldurun
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
```

### 2. Database Setup
```sql
-- Supabase SQL Editor'da çalıştırın:
-- 1. new_simple_video_system.sql
-- 2. video_storage_setup.sql
```

### 3. Test
```bash
# Uygulamayı başlatın
npm run dev

# Test edin:
# - http://localhost:3000/admin/videos
# - Video upload
# - Anasayfa video bölümü
```

## 🐛 Debug Adımları

### 1. Console Logları
```javascript
// Browser Console'da kontrol edin:
// - Network tab → API calls
// - Console tab → Error messages
```

### 2. Supabase Logs
```
// Supabase Dashboard → Logs
// - API logs
// - Database logs
// - Storage logs
```

### 3. API Test
```bash
# API endpoint'lerini test edin:
curl http://localhost:3000/api/doctor-videos
```

## 📞 Hala Çalışmıyorsa

### Kontrol Listesi:
- [ ] .env.local dosyası var mı?
- [ ] Supabase project aktif mi?
- [ ] Storage bucket oluşturuldu mu?
- [ ] Database tabloları var mı?
- [ ] RLS politikaları kuruldu mu?
- [ ] npm run dev çalışıyor mu?

### Yaygın Hatalar:
1. **"Failed to fetch"** → Environment variables eksik
2. **"Bucket not found"** → Storage setup eksik  
3. **"Table doesn't exist"** → Database schema eksik
4. **"Permission denied"** → RLS politikaları eksik
5. **"Video won't play"** → Format sorunu veya autoplay kısıtlaması

### Son Çare:
```sql
-- Tüm sistemi sıfırlayın:
-- 1. drop_video_system.sql
-- 2. new_simple_video_system.sql  
-- 3. video_storage_setup.sql
```

## ✅ Başarılı Kurulum Kontrolü

Video sistemi doğru çalışıyorsa:
- ✅ Admin panelde video listesi görünür
- ✅ Yeni video ekleyebilirsiniz
- ✅ Videolar anasayfada görünür
- ✅ Video oynatma çalışır (kullanıcı etkileşimi ile)
- ✅ Console'da hata yok 