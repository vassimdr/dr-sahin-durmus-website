# Supabase Storage Kurulum Rehberi

Dr. Şahin Durmuş web sitesi galeri sistemi için Supabase Storage konfigürasyonu.

## 🚀 Hızlı Başlangıç

### 1. Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. Proje adını girin: `dishekimi-sitesi`
4. Güçlü bir veritabanı şifresi oluşturun
5. Proje oluşturulmasını bekleyin (2-3 dakika)

### 2. Environment Variables Ayarlama

`dishekimi-sitesi` klasöründe `.env.local` dosyası oluşturun:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Değerleri nerede bulabilirsiniz:**
- Supabase Dashboard > Settings > API
- `URL` ve `anon` key'i kopyalayın
- `service_role` key'ini de kopyalayın

### 3. Veritabanı Tablosu Oluşturma

Supabase Dashboard > SQL Editor'de şu dosyaları çalıştırın:

1. `database/gallery.sql` - Gallery tablosunu oluşturur
2. `database/storage-setup.sql` - Storage bucket ve politikalarını kurar

### 4. Storage Bucket Oluşturma

**Otomatik Yöntem (Önerilen):**
`database/storage-setup.sql` dosyasını SQL Editor'de çalıştırın.

**Manuel Yöntem:**
1. Supabase Dashboard > Storage'a gidin
2. "Create Bucket" butonuna tıklayın
3. Bucket adı: `gallery-images`
4. "Public bucket" olarak işaretleyin
5. "Create bucket" butonuna tıklayın

### 5. Storage Policies (Güvenlik Kuralları)

```sql
-- Herkese okuma izni
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery-images');

-- Kimlik doğrulaması yapılmış kullanıcılara yazma izni
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery-images' 
  AND auth.role() = 'authenticated'
);
```

## 📁 Klasör Yapısı

Storage'da şu klasör yapısı kullanılacak:

```
gallery-images/
├── gallery/          # Genel galeri görselleri
├── treatments/       # Tedavi görselleri
├── clinic/          # Klinik ortam fotoğrafları
├── team/            # Ekip fotoğrafları
├── technology/      # Teknoloji/cihaz fotoğrafları
└── thumbnails/      # Otomatik oluşturulan küçük resimler
```

## 🔧 Yapılandırma Ayarları

### Dosya Boyutu Limiti
- Maksimum: 5MB
- Önerilen: 1-2MB (optimum performans için)

### Desteklenen Formatlar
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### Otomatik Thumbnail
- Boyut: 300x300 piksel
- Format: Orijinal ile aynı
- Kalite: 80%

## 🖼️ Resim Upload Süreci

1. **Admin Panel**: `/admin/gallery` adresine gidin
2. **Yeni Görsel Ekle** butonuna tıklayın
3. **Drag & Drop** veya tıklayarak resim seçin
4. **Otomatik Upload**: Supabase Storage'a yüklenir
5. **Thumbnail**: Otomatik olarak oluşturulur
6. **Database**: URL'ler veritabanına kaydedilir

## 🔒 Güvenlik Önlemleri

### File Validation
- Dosya türü kontrolü
- Boyut kontrolü (5MB limit)
- Zararlı içerik koruması

### Access Control
- Public read (herkes görebilir)
- Authenticated write (sadece admin yükleyebilir)
- Automatic backup

## 📊 Performans Optimizasyonu

### CDN
- Supabase CDN otomatik aktif
- Global cache network
- 99.9% uptime garantisi

### Image Transformation
```javascript
// Otomatik thumbnail
const thumbnailUrl = `${imageUrl}?tr=w-300,h-300,c-force`;

// Farklı boyutlar
const smallUrl = `${imageUrl}?tr=w-400,h-300`;
const mediumUrl = `${imageUrl}?tr=w-800,h-600`;
const largeUrl = `${imageUrl}?tr=w-1200,h-900`;
```

### Lazy Loading
- Next.js Image component
- Intersection Observer API
- Progressive loading

## 🚨 Sorun Giderme

### Upload Başarısız
1. Network bağlantısını kontrol edin
2. Dosya boyutunu kontrol edin (max 5MB)
3. Dosya formatını kontrol edin
4. Browser console'da hata mesajlarını inceleyin

### Resim Görünmüyor
1. Bucket'ın public olduğunu kontrol edin
2. Storage policies'in doğru olduğunu kontrol edin
3. Environment variables'ı kontrol edin
4. Network tab'da 404/403 hatalarını inceleyin

### Yavaş Yükleme
1. Resim boyutlarını optimize edin
2. WebP format kullanın
3. CDN cache'i kontrol edin
4. Internet bağlantı hızını test edin

## 📝 Bakım ve Temizlik

### Kullanılmayan Dosyaları Silme
```sql
-- 30 günden eski pasif görselleri sil
DELETE FROM gallery 
WHERE is_active = false 
AND created_at < NOW() - INTERVAL '30 days';
```

### Storage Kullanımı Kontrolü
```sql
-- Storage istatistikleri
SELECT 
  COUNT(*) as total_files,
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_files,
  SUM(CASE WHEN is_featured THEN 1 ELSE 0 END) as featured_files
FROM gallery;
```

### Backup
```bash
# Veritabanı backup
pg_dump -h your-db-host -U postgres -d postgres > gallery_backup.sql

# Storage backup (manuel)
# Supabase Dashboard > Storage > Download
```

## 🆘 Destek

Sorun yaşıyorsanız:

1. **Dokümantasyon**: [Supabase Docs](https://supabase.com/docs)
2. **Community**: [Discord](https://discord.supabase.com)
3. **Issues**: GitHub Issues
4. **Email**: support@supabase.io

## ✅ Checklist

Kurulum tamamlandıktan sonra kontrol edin:

- [ ] Supabase projesi oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Gallery tablosu oluşturuldu
- [ ] Storage bucket oluşturuldu
- [ ] Storage policies ayarlandı
- [ ] Test upload yapıldı
- [ ] Galeri sayfası çalışıyor
- [ ] Admin panel çalışıyor
- [ ] Thumbnail'lar oluşturuluyor

## 🎯 Sonraki Adımlar

1. **Gerçek Fotoğrafları Yükleyin**: Admin panel'den klinik fotoğraflarınızı yükleyin
2. **SEO Optimizasyonu**: Alt text ve açıklamaları doldurun
3. **Kategorileri Organize Edin**: Mantıklı kategori yapısı oluşturun
4. **Backup Stratejisi**: Düzenli backup planı yapın

---

**⚡ Pro Tip**: İlk kurulumda birkaç test fotoğrafı yükleyerek sistemi test edin! 