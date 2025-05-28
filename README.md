# Dr. Şahin Durmuş Diş Hekimi Sitesi

Modern, güvenli ve kullanıcı dostu diş hekimi web sitesi. Next.js 14, TypeScript ve Tailwind CSS ile geliştirilmiştir.

## 🚀 Özellikler

### Ana Özellikler
- **Modern Tasarım**: Responsive ve kullanıcı dostu arayüz
- **Güvenlik Sistemi**: Çok katmanlı güvenlik ve oturum yönetimi
- **Admin Paneli**: Kapsamlı yönetim sistemi
- **Blog Sistemi**: İçerik yönetimi ve SEO optimizasyonu
- **Video Sistemi**: Video galeri ve yönetimi
- **Galeri Sistemi**: Supabase Storage ile entegre resim yönetimi
- **Yorum Sistemi**: Hasta deneyimleri ve moderasyon
- **WhatsApp Entegrasyonu**: Hızlı iletişim ve randevu
- **Medya Yayınları**: Gazete ve dergi haberleri yönetimi

### Güvenlik Özellikleri
- Device fingerprinting
- Rate limiting (30 req/min admin, 100 req/min API)
- IP whitelist
- Secure session management (24 saat timeout)
- Comprehensive audit logging
- Real-time security monitoring dashboard
- Multi-layer authentication
- CSRF/XSS protection

### Admin Dashboard Özellikleri
- **Hasta Yorumları**: Moderasyon ve onay sistemi
- **Video Yönetimi**: Drag & drop upload, kategori sistemi
- **Blog Yönetimi**: Rich text editor, SEO optimizasyonu
- **Galeri Yönetimi**: Advanced image upload, otomatik thumbnail
- **Medya Yayınları**: Harici yayın linklerini yönetimi
- **Güvenlik Dashboard**: Real-time monitoring, audit logs

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Custom secure session system
- **UI Components**: Radix UI, Shadcn/UI
- **Icons**: Lucide React
- **Form Handling**: Native React hooks
- **File Upload**: React Dropzone

## 🔧 Kurulum

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/your-username/dr-sahin-durmus-website.git
cd dr-sahin-durmus-website/dishekimi-sitesi
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Variables Ayarlayın
```bash
cp env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=gallery-images
NEXT_PUBLIC_MAX_FILE_SIZE=5242880

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Database Kurulumu
Supabase dashboard'da SQL Editor'ı açın ve sırasıyla çalıştırın:

```bash
# 1. Blog sistemi
database/01_blog_system.sql

# 2. Video sistemi
database/new_simple_video_system.sql

# 3. Review sistemi
database/03_reviews_system.sql

# 4. Galeri sistemi
database/gallery.sql

# 5. Storage kurulumu
database/storage-setup.sql
```

### 5. Development Server'ı Başlatın
```bash
npm run dev
```

Tarayıcınızda `http://localhost:3000` adresini açın.

## 📊 Database Şeması

### Ana Tablolar
- `blog_posts`: Blog yazıları
- `categories`: Blog kategorileri
- `doctor_videos`: Video sistemi
- `patient_reviews`: Hasta yorumları
- `gallery`: Galeri resim sistemi
- `media_publications`: Medya yayınları

### Güvenlik Tabloları
- Comprehensive audit logging
- IP tracking
- Session management
- Rate limiting

## 🔒 Güvenlik

### Production Deployment
1. **Environment Variables**: Güvenli şifreler ve API anahtarları
2. **HTTPS**: SSL/TLS zorunlu
3. **Rate Limiting**: Production'da aktif
4. **IP Whitelist**: Admin panel için
5. **Security Headers**: Tam güvenlik header seti
6. **Audit Logging**: Tüm aktiviteler kaydedilir

### Admin Panel Erişimi
- URL: `/admin/login`
- Multi-layer authentication
- Device fingerprinting
- Session timeout: 24 saat
- Failed login protection

## 🚀 Production Deployment

### Vercel Deployment
1. **GitHub'a Push**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Vercel'e Deploy**:
   - Vercel dashboard'da GitHub repo'su bağlayın
   - Environment variables'ları ekleyin
   - Deploy butonuna tıklayın

### Environment Variables (Production)
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
NEXT_PUBLIC_STORAGE_BUCKET=gallery-images
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

## 📱 Kullanım Kılavuzu

### Admin Panel Özellikleri
1. **Dashboard**: Genel istatistikler ve hızlı erişim
2. **Blog Yönetimi**: Yazı ekleme, düzenleme, yayınlama
3. **Video Yönetimi**: Video upload, kategorizasyon
4. **Galeri Yönetimi**: Resim upload, filtering, kategorileme
5. **Yorum Moderasyonu**: Onaylama, reddetme, öne çıkarma
6. **Medya Yönetimi**: Harici yayın linklerini ekleme
7. **Güvenlik Monitoring**: Real-time güvenlik dashboard

### API Endpoints
```typescript
// Blog API
GET /api/blog - Blog listesi
POST /api/blog - Yeni blog
GET /api/blog/[slug] - Blog detayı

// Video API
GET /api/doctor-videos - Video listesi
POST /api/doctor-videos - Video upload

// Gallery API
GET /api/gallery - Galeri listesi
POST /api/gallery - Resim upload

// Reviews API
GET /api/reviews - Yorum listesi
POST /api/reviews - Yeni yorum
```

## 📈 Performans

- **Lighthouse Score**: 95+ tüm kategorilerde
- **Core Web Vitals**: Optimized
- **SEO**: Tam optimizasyon
- **Accessibility**: WCAG 2.1 AA uyumlu
- **Image Optimization**: Next.js Image component
- **CDN**: Supabase CDN entegrasyonu

## 🔧 Development Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

## 📞 İletişim Bilgileri

- **Telefon**: +90 532 390 74 78
- **Instagram**: @drsahindurmus
- **TikTok**: @drsahindurmus

## 📄 Dokümantasyon

- [Database Setup](./DATABASE_SETUP.md)
- [Security Documentation](./SECURITY.md)
- [Storage Setup](./STORAGE-SETUP.md)
- [Video System Setup](./VIDEO_SYSTEM_SETUP.md)

## 📋 Todo / Roadmap

- [ ] 2FA Authentication
- [ ] Push Notifications
- [ ] Advanced Analytics
- [ ] Multi-language Support
- [ ] PWA Implementation

## 📄 Lisans

Bu proje özel lisans altındadır. Tüm hakları saklıdır.

---

**Geliştirici**: Dr. Şahin Durmuş Web Development Team  
**Son Güncelleme**: 2024-01-XX  
**Versiyon**: 1.0.0
