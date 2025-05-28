// Video yönetimi için yardımcı fonksiyonlar

import { VideoService } from '@/lib/database/video-service'

export interface DoctorVideo {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // saniye cinsinden
  category: 'tanıtım' | 'tedavi' | 'bilgilendirme' | 'hasta-deneyimi' | 'teknoloji';
  isActive: boolean;
  createdDate: string;
  viewCount?: number;
}

export const videoUtils = {
  // Mock video verileri - database bağlantısı yoksa fallback olarak kullanılır
  getMockVideos: (): DoctorVideo[] => [
    {
      id: 1,
      title: "Diş Hekimliğinde Modern Teknoloji",
      description: "Kliniğimizde kullandığımız son teknoloji cihazları tanıtıyoruz",
      videoUrl: "/videos/teknoloji-tanitim.mp4",
      thumbnailUrl: "/images/video-thumbnails/teknoloji.jpg",
      duration: 45,
      category: 'tanıtım',
      isActive: true,
      createdDate: "2024-01-15",
      viewCount: 1250
    },
    {
      id: 2,
      title: "İmplant Tedavisi Süreci",
      description: "İmplant tedavisinin adım adım nasıl yapıldığını öğrenin",
      videoUrl: "/videos/implant-sureci.mp4",
      thumbnailUrl: "/images/video-thumbnails/implant.jpg",
      duration: 60,
      category: 'tedavi',
      isActive: true,
      createdDate: "2024-01-10",
      viewCount: 980
    },
    {
      id: 3,
      title: "Hasta Deneyimi - Ahmet Bey",
      description: "Ahmet Bey'in implant tedavisi deneyimini dinleyin",
      videoUrl: "/videos/hasta-deneyimi-1.mp4",
      thumbnailUrl: "/images/video-thumbnails/hasta-1.jpg",
      duration: 35,
      category: 'hasta-deneyimi',
      isActive: true,
      createdDate: "2024-01-08",
      viewCount: 750
    },
    {
      id: 4,
      title: "Diş Beyazlatma İpuçları",
      description: "Evde uygulayabileceğiniz diş beyazlatma yöntemleri",
      videoUrl: "/videos/beyazlatma-ipuclari.mp4",
      thumbnailUrl: "/images/video-thumbnails/beyazlatma.jpg",
      duration: 40,
      category: 'bilgilendirme',
      isActive: true,
      createdDate: "2024-01-05",
      viewCount: 1100
    },
    {
      id: 5,
      title: "Klinik Tanıtımı",
      description: "Modern kliniğimizi ve ekibimizi tanıyın",
      videoUrl: "/videos/klinik-tanitim.mp4",
      thumbnailUrl: "/images/video-thumbnails/klinik.jpg",
      duration: 55,
      category: 'tanıtım',
      isActive: true,
      createdDate: "2024-01-03",
      viewCount: 1500
    }
  ],

  // Database'den aktif videoları getir (async)
  getActiveVideos: async (): Promise<DoctorVideo[]> => {
    try {
      // Önce database'den dene
      const dbVideos = await VideoService.getActiveVideos()
      if (dbVideos.length > 0) {
        return dbVideos
      }
      
      // Database'de video yoksa mock data döndür
      console.log('Database\'de video bulunamadı, mock data kullanılıyor')
      return videoUtils.getMockVideos().filter(video => video.isActive)
    } catch (error) {
      console.error('Video getirme hatası:', error)
      // Hata durumunda mock data döndür
      return videoUtils.getMockVideos().filter(video => video.isActive)
    }
  },

  // En popüler videoları getir (async)
  getMostViewedVideos: async (limit: number = 5): Promise<DoctorVideo[]> => {
    try {
      // Önce database'den dene
      const dbVideos = await VideoService.getMostViewedVideos(limit)
      if (dbVideos.length > 0) {
        return dbVideos
      }
      
      // Database'de video yoksa mock data döndür
      console.log('Database\'de popüler video bulunamadı, mock data kullanılıyor')
      return videoUtils.getMockVideos()
        .filter(video => video.isActive)
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, limit)
    } catch (error) {
      console.error('Popüler video getirme hatası:', error)
      // Hata durumunda mock data döndür
      return videoUtils.getMockVideos()
        .filter(video => video.isActive)
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, limit)
    }
  },

  // Kategoriye göre videoları getir (async)
  getVideosByCategory: async (category: DoctorVideo['category']): Promise<DoctorVideo[]> => {
    try {
      // Önce database'den dene
      const dbVideos = await VideoService.getVideosByCategory(category)
      if (dbVideos.length > 0) {
        return dbVideos
      }
      
      // Database'de video yoksa mock data döndür
      console.log(`Database'de ${category} kategorisi bulunamadı, mock data kullanılıyor`)
      return videoUtils.getMockVideos()
        .filter(video => video.isActive && video.category === category)
    } catch (error) {
      console.error('Kategori video getirme hatası:', error)
      // Hata durumunda mock data döndür
      return videoUtils.getMockVideos()
        .filter(video => video.isActive && video.category === category)
    }
  },

  // Video ID'sine göre video getir (async)
  getVideoById: async (id: number): Promise<DoctorVideo | undefined> => {
    try {
      // Önce database'den dene
      const dbVideo = await VideoService.getVideoById(id)
      if (dbVideo) {
        return dbVideo
      }
      
      // Database'de video yoksa mock data'dan ara
      console.log(`Database'de video ${id} bulunamadı, mock data kullanılıyor`)
      return videoUtils.getMockVideos()
        .find(video => video.id === id && video.isActive)
    } catch (error) {
      console.error('Video by ID getirme hatası:', error)
      // Hata durumunda mock data döndür
      return videoUtils.getMockVideos()
        .find(video => video.id === id && video.isActive)
    }
  },

  // Video görüntülenme sayısını artır (async)
  incrementViewCount: async (videoId: number): Promise<void> => {
    try {
      await VideoService.incrementViewCount(videoId)
    } catch (error) {
      console.error('View count artırma hatası:', error)
      // Mock data için console log yeterli
      console.log(`Video ${videoId} görüntülenme sayısı artırıldı (mock)`)
    }
  },

  // Video kategorilerine göre renk kodları
  getCategoryColor: (category: DoctorVideo['category']): string => {
    const colors = {
      'tanıtım': '#3B82F6',      // Blue
      'tedavi': '#10B981',       // Green
      'bilgilendirme': '#F59E0B', // Yellow
      'hasta-deneyimi': '#EF4444', // Red
      'teknoloji': '#8B5CF6'     // Purple
    };
    return colors[category];
  },

  // Video kategorilerine göre arka plan rengi
  getCategoryBgColor: (category: DoctorVideo['category']): string => {
    const colors = {
      'tanıtım': '#EBF4FF',      // Light Blue
      'tedavi': '#D1FAE5',       // Light Green
      'bilgilendirme': '#FEF3C7', // Light Yellow
      'hasta-deneyimi': '#FEE2E2', // Light Red
      'teknoloji': '#EDE9FE'     // Light Purple
    };
    return colors[category];
  },

  // Video süresini formatla
  formatDuration: (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // Video başlığını kısalt
  truncateTitle: (title: string, maxLength: number = 50): string => {
    return title.length > maxLength 
      ? title.substring(0, maxLength) + '...' 
      : title;
  },

  // Video açıklamasını kısalt
  truncateDescription: (description: string, maxLength: number = 80): string => {
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  },

  // Video thumbnail'ı için placeholder oluştur
  generatePlaceholderThumbnail: (title: string, category: DoctorVideo['category']): string => {
    const bgColor = videoUtils.getCategoryBgColor(category);
    const textColor = videoUtils.getCategoryColor(category);
    
    // Gerçek uygulamada bu bir placeholder service olabilir
    return `https://via.placeholder.com/300x400/${bgColor.substring(1)}/${textColor.substring(1)}?text=${encodeURIComponent(title)}`;
  }
}; 