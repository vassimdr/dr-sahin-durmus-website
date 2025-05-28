# 🗄️ Database Schema Documentation

Bu klasörde sitenin database şemaları **COMPLETE modüler** olarak organize edilmiştir. Her dosya kendi başına çalışan bağımsız bir sistemdir.

## 📁 Dosya Yapısı

```
database/
├── 01_blog_system.sql       # Blog sistemi COMPLETE (tablo+güvenlik+data)
├── 02_video_system.sql      # Video sistemi COMPLETE (tablo+güvenlik+data) ⭐
├── 07_reviews_system.sql    # Hasta Değerlendirme IP-tabanlı COMPLETE ⭐
├── schema.sql               # TEK DOSYA (eski versiyon)
└── README.md                # Bu dosya
```

## 🚀 Kurulum - Süper Basit!

### ✅ Sadece Video Sistemi İstiyorum
```sql
-- Supabase SQL Editor'da sadece bunu çalıştır:
-- 02_video_system.sql dosyasının içeriğini kopyala/yapıştır
```
**O kadar!** Video sistemi hazır 🎬

### ✅ Sadece Blog Sistemi İstiyorum  
```sql
-- Supabase SQL Editor'da sadece bunu çalıştır:
-- 01_blog_system.sql dosyasının içeriğini kopyala/yapıştır
```
**O kadar!** Blog sistemi hazır 📝

### ✅ Sadece Hasta Değerlendirme Sistemi İstiyorum
```sql
-- Supabase SQL Editor'da sadece bunu çalıştır:
-- 07_reviews_system.sql dosyasının içeriğini kopyala/yapıştır
```
**O kadar!** IP-tabanlı yorum sistemi hazır ⭐

### ✅ Hepsini İstiyorum
```sql
-- 1. Blog sistemi
-- 01_blog_system.sql → RUN

-- 2. Video sistemi
-- 02_video_system.sql → RUN

-- 3. Hasta değerlendirme sistemi
-- 07_reviews_system.sql → RUN
```

## ⚙️ COMPLETE Modüler Avantajlar

### 🎯 **Her Dosya Bağımsız**
- **`01_blog_system.sql`** → Blog tabloları + blog güvenlik + blog sample data
- **`02_video_system.sql`** → Video tablosu + video güvenlik + video sample data
- **`07_reviews_system.sql`** → Hasta değerlendirme + IP kontrolü + moderasyon sistemi

### ✅ **Tek Dosya = Tek Sistem**
- Video sistemi mi lazım? → Sadece `02_video_system.sql`
- Blog sistemi mi lazım? → Sadece `01_blog_system.sql`
- Hasta yorumları mı lazım? → Sadece `07_reviews_system.sql`
- Hepsi mi lazım? → Hepsini çalıştır

### 🚀 **Süper Pratik**
- Sayfa sayfa gezmek yok
- Dependency yok
- Kafan karışmaz
- Her dosya complete

## 📋 İçerik Özeti

### 🎬 Video Sistemi (`02_video_system.sql`)
```sql
✅ doctor_videos tablosu
✅ Video indexleri
✅ Video güvenlik politikaları  
✅ Video fonksiyonları (view count)
✅ Sample video veriler (5 adet)
```

### 📝 Blog Sistemi (`01_blog_system.sql`)
```sql
✅ categories tablosu
✅ blog_posts tablosu
✅ blog_comments tablosu
✅ Blog indexleri
✅ Blog güvenlik politikaları
✅ Sample blog veriler (4 yazı + 6 kategori)
```

### ⭐ Hasta Değerlendirme Sistemi (`07_reviews_system.sql`)
```sql
✅ patient_reviews tablosu (IP-tabanlı)
✅ review_ip_tracking tablosu  
✅ review_moderation_log tablosu
✅ IP kontrolü fonksiyonları
✅ Otomatik moderasyon sistemi
✅ Sample hasta yorumları (6 adet)
```

## 🎬 Video Sistemi Özellikleri

### 📋 Video Kategorileri
- `tanıtım` - Klinik ve hizmet tanıtımları
- `tedavi` - Tedavi süreçleri  
- `bilgilendirme` - Eğitici içerikler
- `hasta-deneyimi` - Hasta röportajları
- `teknoloji` - Teknoloji tanıtımları

### ⚡ Video Özellikleri
- TikTok/Instagram Reels style (9:16)
- Otomatik play/pause
- View count tracking
- Kategori filtreleme
- Manual sıralama (sort_order)
- RLS güvenlik

## ⭐ Hasta Değerlendirme Sistemi Özellikleri

### 🚀 **YENİLİKÇİ IP-TABANLI SİSTEM**
- **Hesap açmaya gerek yok!** 🎯
- **Her cihaz sadece 1 yorum** yapabilir
- **Otomatik IP kontrolü** (güvenli hash ile)
- **Anında moderasyon** sistemi

### 📋 Tedavi Kategorileri
- `implant` - İmplant tedavileri
- `estetik` - Estetik işlemler
- `ortodonti` - Diş teli tedavileri
- `cocuk-dis` - Çocuk diş hekimliği
- `genel-tedavi` - Genel tedaviler
- `temizlik` - Diş temizleme
- `protez` - Protez işlemleri
- `kanal-tedavisi` - Kanal tedavileri

### ⚡ Özellikler
- **IP-tabanlı tek yorum sistemi** (hesap açmadan)
- **1-5 yıldız puanlama** sistemi
- **Otomatik moderasyon** (admin onayı)
- **Spam koruması** (IP + User Agent kontrolü)
- **Öne çıkan yorumlar** sistemi
- **İstatistik dashboard** (ortalama puan, kategori bazında)

### 🛡️ Güvenlik Özellikleri
- IP adresi **güvenli hash** ile saklanır
- **User Agent** kontrolü (ek güvenlik)
- **RLS güvenlik** politikaları
- **Spam engelleme** sistemi
- **IP bazlı engelleme** özelliği

## 🔧 Kullanım Örnekleri

### Yeni Yorum Ekleme (Frontend'den)
```javascript
// IP adresini hash'le (frontend'de)
const ipHash = await hashIP(userIP);

// Yorum ekle
const result = await supabase.rpc('add_patient_review', {
  p_name: 'Ahmet Yılmaz',
  p_review: 'Harika bir deneyimdi!',
  p_rating: 5,
  p_treatment: 'implant',
  p_ip_hash: ipHash
});
```

### Yorum Onaylama (Admin Panel)
```javascript
// Yorumu onayla ve öne çıkar
const result = await supabase.rpc('approve_review', {
  review_id: 123,
  admin_user: 'Dr. Şahin',
  make_featured: true
});
```

### İstatistikleri Görme
```javascript
// Review istatistiklerini getir
const { data } = await supabase
  .from('review_statistics')
  .select('*');

console.log(`Ortalama puan: ${data.average_rating}`);
console.log(`Toplam yorum: ${data.total_reviews}`);
```

## 🔧 Yeni Kategori Eklemek

### Video Kategorisi Ekle
`02_video_system.sql` dosyasını güncelle:
```sql
category VARCHAR(50) NOT NULL CHECK (category IN (
  'tanıtım', 'tedavi', 'bilgilendirme', 
  'hasta-deneyimi', 'teknoloji', 'yeni-kategori'
))
```

### Blog Kategorisi Ekle
`01_blog_system.sql` dosyasındaki INSERT'e ekle:
```sql
INSERT INTO categories (name, slug, description) VALUES
('Yeni Kategori', 'yeni-kategori', 'Açıklama');
```

### Tedavi Kategorisi Ekle
`07_reviews_system.sql` dosyasını güncelle:
```sql
treatment_category VARCHAR(50) CHECK (treatment_category IN (
  'implant', 'estetik', 'ortodonti', 'cocuk-dis', 
  'genel-tedavi', 'temizlik', 'protez', 'kanal-tedavisi', 'yeni-kategori'
))
```

## 🛠️ Migration & Maintenance

### Video Sistemi Backup
```bash
pg_dump -t doctor_videos database_name > video_backup.sql
```

### Blog Sistemi Backup
```bash
pg_dump -t blog_posts -t categories database_name > blog_backup.sql
```

### Hasta Değerlendirme Backup
```bash
pg_dump -t patient_reviews -t review_ip_tracking database_name > reviews_backup.sql
```

### Test Environment
```sql
-- Test için sadece gerekli sistemi yükle
-- Production'da aynı dosyayı kullan
```

## 💡 Örnek Kullanım Senaryoları

### 🎯 Senaryo 1: Sadece Video Sitesi
```sql
-- Sadece 02_video_system.sql çalıştır
-- Blog tabloları oluşturulmaz
-- Clean & minimal setup
```

### 🎯 Senaryo 2: Blog + Video  
```sql
-- 01_blog_system.sql → RUN
-- 02_video_system.sql → RUN
-- Complete website ready!
```

### 🎯 Senaryo 3: Full Website (Blog + Video + Yorumlar)
```sql
-- 01_blog_system.sql → RUN
-- 02_video_system.sql → RUN  
-- 07_reviews_system.sql → RUN
-- Complete dental website with reviews!
```

### 🎯 Senaryo 4: Sadece Hasta Yorumları
```sql
-- Sadece 07_reviews_system.sql çalıştır
-- Hesap açmadan yorum sistemi hazır!
-- Modern IP-based approach
```

## 🚨 Troubleshooting

### Video Gözükmüyor?
1. `02_video_system.sql` çalışırıldı mı?
2. `is_active = true` kontrol et
3. Sample data geldi mi?

### Blog Gözükmüyor?
1. `01_blog_system.sql` çalıştırıldı mı?
2. `published = true` kontrol et
3. Sample data geldi mi?

### Hasta Yorumları Gözükmüyor?
1. `07_reviews_system.sql` çalıştırıldı mı?
2. `is_approved = true` kontrol et
3. Sample data geldi mi?
4. IP kontrolü çalışıyor mu?

### "Bu Cihazdan Daha Önce Yorum Yapılmış" Hatası
- Normal! Her IP sadece 1 yorum yapabilir
- Test için farklı IP kullan
- Admin panelden IP engelini kaldırabilirsin

Her sistem bağımsız! Artık kafanız karışmaz 🎉 

# Database Documentation

Bu klasör Dr. Şahin Durmuş web sitesi için gerekli veritabanı dosyalarını içerir.

## Dosya Yapısı

### `schema.sql`
Ana veritabanı şeması dosyası. Tüm tabloları, indexleri ve temel konfigürasyonları içerir:
- Blog sistemi (categories, blog_posts, blog_comments)
- Video sistemi (doctor_videos)
- Medya yayınları sistemi (media_publications)
- RLS (Row Level Security) politikaları
- Trigger'lar ve fonksiyonlar

### `media-publications.sql`
Medya yayınları sistemi için özel SQL dosyası. İçeriği:
- Media publications tablosu
- Performans indexleri
- Özel fonksiyonlar (kaynak/kategori bazında filtreleme)
- Örnek veriler
- Bakım sorguları

## Kurulum

### 1. Ana Şema Kurulumu
```sql
-- Supabase SQL Editor'da çalıştırın
\i schema.sql
```

### 2. Medya Yayınları Sistemi Kurulumu
```sql
-- Supabase SQL Editor'da çalıştırın
\i media-publications.sql
```

## Medya Yayınları Sistemi

### Desteklenen Medya Kaynakları
- Mynet
- CNN Türk
- Sabah
- Hürriyet
- Posta
- Cumhuriyet
- Milli Gazete
- DHA
- Gazete Vatan
- Kelebek
- Elele
- Milliyet
- Pembe Nar

### Kategoriler
- Sağlık
- Estetik
- Teknoloji
- Tedavi
- Çocuk Sağlığı
- Önleme
- Bilgilendirme
- Röportaj
- Uzman Görüşü

### Özel Fonksiyonlar

#### `get_publications_by_source(source_filter)`
Belirli bir kaynaktan yayınları getirir.
```sql
SELECT * FROM get_publications_by_source('Mynet');
```

#### `get_featured_publications(limit_count)`
Öne çıkan yayınları getirir.
```sql
SELECT * FROM get_featured_publications(5);
```

#### `get_publications_by_category(category_filter)`
Belirli bir kategorideki yayınları getirir.
```sql
SELECT * FROM get_publications_by_category('Estetik');
```

## API Endpoints

Medya yayınları sistemi aşağıdaki API endpoint'lerini kullanır:

- `GET /api/media-publications` - Tüm yayınları listele
- `GET /api/media-publications?source=Mynet` - Kaynak bazında filtrele
- `POST /api/media-publications` - Yeni yayın ekle
- `PUT /api/media-publications/[id]` - Yayın güncelle
- `DELETE /api/media-publications/[id]` - Yayın sil

## Güvenlik

- RLS (Row Level Security) etkin
- Sadece aktif yayınlar herkese açık
- Admin işlemleri için ayrı yetkilendirme gerekli

## Bakım

### Performans İzleme
```sql
-- Yavaş sorguları kontrol et
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%media_publications%' 
ORDER BY mean_time DESC;
```

### Veri Temizliği
```sql
-- Eski yayınları pasif hale getir
UPDATE media_publications 
SET is_active = false 
WHERE publication_date < CURRENT_DATE - INTERVAL '2 years';
```

### Index Kullanımı
```sql
-- Index kullanımını kontrol et
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'media_publications';
```

## Yedekleme

Önemli veriler için düzenli yedekleme yapılması önerilir:

```bash
# Sadece medya yayınları tablosunu yedekle
pg_dump -h hostname -U username -t media_publications database_name > media_publications_backup.sql
``` 