// Blog için yardımcı fonksiyonlar

export const blogUtils = {
  // Tarihi Türkçe formatta göster
  formatDate: (dateString: string): string => {
    const date = new Date(dateString)
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]
    
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} ${month} ${year}`
  },

  // Okuma süresini formatla
  formatReadTime: (readTime: string): string => {
    return readTime.includes('dk') ? readTime : `${readTime} dk`
  },

  // Başlıktan slug oluştur
  generateSlug: (title: string): string => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri kaldır
      .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
      .replace(/-+/g, '-') // Çoklu tireleri tek tire yap
      .trim()
      .replace(/^-|-$/g, '') // Başındaki ve sonundaki tireleri kaldır
  },

  // Metni belirtilen uzunlukta kes
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  },

  // İçerikten ilk resim URL'ini çıkar
  extractImageUrl: (content: string): string | null => {
    const imgRegex = /<img[^>]+src="([^">]+)"/
    const match = content.match(imgRegex)
    return match ? match[1] : null
  },

  // Kategoriden renk seç
  getCategoryColor: (category: string): string => {
    const colors: Record<string, string> = {
      'Estetik Diş Hekimliği': '#d97706', // amber
      'İmplant': '#1e40af', // blue
      'Çocuk Diş Hekimliği': '#15803d', // green
      'Ortodonti': '#7c3aed', // purple
      'Diş Bakımı': '#dc2626', // red
      'Genel Bilgiler': '#ea580c', // orange
    }
    return colors[category] || '#64748b' // slate default
  },

  // Kategoriden arka plan rengi seç
  getCategoryBgColor: (category: string): string => {
    const colors: Record<string, string> = {
      'Estetik Diş Hekimliği': '#fef3c7', // amber-100
      'İmplant': '#dbeafe', // blue-100
      'Çocuk Diş Hekimliği': '#dcfce7', // green-100
      'Ortodonti': '#f3e8ff', // purple-100
      'Diş Bakımı': '#fef2f2', // red-100
      'Genel Bilgiler': '#fff7ed', // orange-100
    }
    return colors[category] || '#f1f5f9' // slate-100 default
  },

  // İçerikten düz metin çıkar (HTML etiketlerini kaldır)
  stripHtml: (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim()
  },

  // Okuma süresini hesapla (kelime sayısına göre)
  calculateReadTime: (content: string): string => {
    const wordsPerMinute = 200 // Ortalama okuma hızı
    const words = blogUtils.stripHtml(content).split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} dk`
  },

  // SEO dostu excerpt oluştur
  generateExcerpt: (content: string, maxLength: number = 160): string => {
    const plainText = blogUtils.stripHtml(content)
    return blogUtils.truncateText(plainText, maxLength)
  },

  // Göreceli tarih göster (Örn: "2 gün önce")
  getRelativeTime: (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Bugün'
    if (diffInDays === 1) return 'Dün'
    if (diffInDays < 7) return `${diffInDays} gün önce`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} hafta önce`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} ay önce`
    return `${Math.floor(diffInDays / 365)} yıl önce`
  },

  // URL'den placeholder resim oluştur
  generatePlaceholderImage: (title: string, category: string): string => {
    const bgColor = blogUtils.getCategoryBgColor(category).replace('#', '')
    const textColor = blogUtils.getCategoryColor(category).replace('#', '')
    
    // Türkçe karakterleri Latin karakterlere çevir (btoa uyumluluğu için)
    const cleanTitle = title
      .substring(0, 25)
      .replace(/ğ/g, 'g')
      .replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'U')
      .replace(/ş/g, 's')
      .replace(/Ş/g, 'S')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'I')
      .replace(/ö/g, 'o')
      .replace(/Ö/g, 'O')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'C')
      .replace(/[<>&"']/g, '') // XML'de sorun çıkarabilecek karakterleri temizle
      .trim()
    
    const cleanCategory = category
      .replace(/ğ/g, 'g')
      .replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'U')
      .replace(/ş/g, 's')
      .replace(/Ş/g, 'S')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'I')
      .replace(/ö/g, 'o')
      .replace(/Ö/g, 'O')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'C')
    
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
      <rect width="400" height="250" fill="#${bgColor}"/>
      <text x="200" y="125" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#${textColor}">
        <tspan x="200" dy="0">${cleanTitle}</tspan>
      </text>
      <text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#${textColor}" opacity="0.8">
        ${cleanCategory}
      </text>
    </svg>`
    
    return `data:image/svg+xml;base64,${btoa(svgContent)}`
  }
} 