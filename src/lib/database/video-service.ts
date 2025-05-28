import { supabase } from '@/lib/supabase'
import { DoctorVideo } from '@/lib/video-utils'

export class VideoService {
  // Tüm aktif videoları getir
  static async getActiveVideos(): Promise<DoctorVideo[]> {
    // Supabase bağlantısı yoksa boş array döndür
    if (!supabase) {
      console.log('Supabase bağlantısı yok, mock data kullanılacak')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('doctor_videos')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Videolar getirilirken hata:', error)
        return []
      }

      return data.map(this.mapDatabaseToVideo)
    } catch (error) {
      console.error('Video service hatası:', error)
      return []
    }
  }

  // En çok izlenen videoları getir
  static async getMostViewedVideos(limit: number = 5): Promise<DoctorVideo[]> {
    // Supabase bağlantısı yoksa boş array döndür
    if (!supabase) {
      console.log('Supabase bağlantısı yok, mock data kullanılacak')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('doctor_videos')
        .select('*')
        .eq('is_active', true)
        .order('view_count', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Popüler videolar getirilirken hata:', error)
        return []
      }

      return data.map(this.mapDatabaseToVideo)
    } catch (error) {
      console.error('Popüler video service hatası:', error)
      return []
    }
  }

  // Kategoriye göre videoları getir
  static async getVideosByCategory(
    category: DoctorVideo['category']
  ): Promise<DoctorVideo[]> {
    // Supabase bağlantısı yoksa boş array döndür
    if (!supabase) {
      console.log('Supabase bağlantısı yok, mock data kullanılacak')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('doctor_videos')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Kategori videoları getirilirken hata:', error)
        return []
      }

      return data.map(this.mapDatabaseToVideo)
    } catch (error) {
      console.error('Kategori video service hatası:', error)
      return []
    }
  }

  // Video ID'sine göre video getir
  static async getVideoById(id: number): Promise<DoctorVideo | null> {
    // Supabase bağlantısı yoksa null döndür
    if (!supabase) {
      console.log('Supabase bağlantısı yok, mock data kullanılacak')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('doctor_videos')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Video getirilirken hata:', error)
        return null
      }

      return this.mapDatabaseToVideo(data)
    } catch (error) {
      console.error('Video by ID service hatası:', error)
      return null
    }
  }

  // Video görüntülenme sayısını artır
  static async incrementViewCount(videoId: number): Promise<void> {
    // Supabase bağlantısı yoksa sadece log yap
    if (!supabase) {
      console.log(`Video ${videoId} görüntülenme sayısı artırıldı (mock mode)`)
      return
    }

    try {
      const { error } = await supabase.rpc('increment_video_view_count', {
        video_id: videoId
      })

      if (error) {
        console.error('Görüntülenme sayısı artırılırken hata:', error)
      }
    } catch (error) {
      console.error('View count service hatası:', error)
    }
  }

  // Yeni video ekle (admin için)
  static async createVideo(video: Omit<DoctorVideo, 'id' | 'createdDate' | 'viewCount'>): Promise<DoctorVideo | null> {
    // Supabase bağlantısı yoksa null döndür
    if (!supabase) {
      console.log('Supabase bağlantısı yok, video oluşturulamadı')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('doctor_videos')
        .insert({
          title: video.title,
          description: video.description,
          video_url: video.videoUrl,
          thumbnail_url: video.thumbnailUrl,
          duration: video.duration,
          category: video.category,
          is_active: video.isActive
        })
        .select()
        .single()

      if (error) {
        console.error('Video oluşturulurken hata:', error)
        return null
      }

      return this.mapDatabaseToVideo(data)
    } catch (error) {
      console.error('Create video service hatası:', error)
      return null
    }
  }

  // Video güncelle (admin için)
  static async updateVideo(id: number, updates: Partial<DoctorVideo>): Promise<DoctorVideo | null> {
    // Supabase bağlantısı yoksa null döndür
    if (!supabase) {
      console.log('Supabase bağlantısı yok, video güncellenemedi')
      return null
    }

    try {
      const updateData: any = {}
      
      if (updates.title) updateData.title = updates.title
      if (updates.description) updateData.description = updates.description
      if (updates.videoUrl) updateData.video_url = updates.videoUrl
      if (updates.thumbnailUrl !== undefined) updateData.thumbnail_url = updates.thumbnailUrl
      if (updates.duration) updateData.duration = updates.duration
      if (updates.category) updateData.category = updates.category
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive

      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('doctor_videos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Video güncellenirken hata:', error)
        return null
      }

      return this.mapDatabaseToVideo(data)
    } catch (error) {
      console.error('Update video service hatası:', error)
      return null
    }
  }

  // Video sil (admin için)
  static async deleteVideo(id: number): Promise<boolean> {
    // Supabase bağlantısı yoksa false döndür
    if (!supabase) {
      console.log('Supabase bağlantısı yok, video silinemedi')
      return false
    }

    try {
      const { error } = await supabase
        .from('doctor_videos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Video silinirken hata:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Delete video service hatası:', error)
      return false
    }
  }

  // Database formatından DoctorVideo formatına dönüştür
  private static mapDatabaseToVideo(dbVideo: any): DoctorVideo {
    return {
      id: dbVideo.id,
      title: dbVideo.title,
      description: dbVideo.description,
      videoUrl: dbVideo.video_url,
      thumbnailUrl: dbVideo.thumbnail_url || '',
      duration: dbVideo.duration,
      category: dbVideo.category,
      isActive: dbVideo.is_active,
      createdDate: dbVideo.created_at,
      viewCount: dbVideo.view_count || 0
    }
  }
}

// Real-time updates için hook
export function useVideoUpdates() {
  // Real-time güncellemeler için Supabase subscription kullanılabilir
  // Bu gelecekte implement edilebilir
} 