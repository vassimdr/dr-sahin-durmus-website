"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Eye, Clock, Loader2, FileVideo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConsultationButton } from '@/components/ui/WhatsAppButton';

interface DoctorVideo {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration: number;
  category: string;
  is_active: boolean;
  view_count: number;
  created_at: string;
}

const VideoCard = ({ video, index }: { video: DoctorVideo; index: number }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });

  // Video event handlers
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedData = () => {
      setVideoLoaded(true);
      // Video yüklendiğinde ses ayarlarını uygula
      videoElement.muted = isMuted;
      videoElement.volume = isMuted ? 0 : 0.8; // %80 volume
      console.log('🎬 Video yüklendi, ses ayarları:', { muted: videoElement.muted, volume: videoElement.volume });
    };

    const handlePlay = () => {
      setIsPlaying(true);
      console.log('▶️ Video oynatılıyor');
      
      // Video oynatılmaya başladığında view count artır
      incrementViewCount();
    };

    const handlePause = () => {
      setIsPlaying(false);
      console.log('⏸️ Video duraklatıldı');
    };

    const handleEnded = () => {
      setIsPlaying(false);
      console.log('🏁 Video bitti');
    };

    const handleError = (e: Event) => {
      console.error('❌ Video yükleme hatası:', e);
      setVideoLoaded(false);
    };
    
    // Ses durumu değişikliklerini dinle
    const handleVolumeChange = () => {
      const currentMuted = videoElement.muted || videoElement.volume === 0;
      setIsMuted(currentMuted);
      console.log('🔊 Ses durumu değişti:', { 
        muted: videoElement.muted, 
        volume: videoElement.volume,
        calculatedMuted: currentMuted 
      });
    };

    // Event listener'ları ekle
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('volumechange', handleVolumeChange);

    // Cleanup
    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [isMuted]);

  // Auto-play when video comes into view
  useEffect(() => {
    if (isInView && videoRef.current && videoLoaded && !isPlaying) {
      const playVideo = async () => {
        try {
          videoRef.current!.muted = true; // Başlangıçta sessiz
          await videoRef.current!.play();
          console.log('🎬 Video otomatik başlatıldı (görünüme girdi)');
        } catch (error) {
          console.warn('⚠️ Otomatik video oynatma başarısız:', error);
        }
      };
      
      // Küçük bir gecikme ile başlat
      const timer = setTimeout(playVideo, 200);
      return () => clearTimeout(timer);
    }
  }, [isInView, videoLoaded, isPlaying]);

  const togglePlay = async () => {
    if (!videoRef.current) return;

    try {
      setHasUserInteracted(true);
      
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // İlk kullanıcı etkileşiminde ses ayarlarını güncelle
        if (!hasUserInteracted) {
          videoRef.current.muted = isMuted;
          videoRef.current.volume = isMuted ? 0 : 0.8;
        }
        
        await videoRef.current.play();
        console.log('✅ Video başlatıldı');
      }
    } catch (error) {
      console.warn('⚠️ Video oynatma hatası (normal olabilir):', error);
    }
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;

    try {
      setHasUserInteracted(true);
      
      const newMutedState = !isMuted;
      
      // Önce muted durumunu değiştir
      videoRef.current.muted = newMutedState;
      
      // Sonra volume'u ayarla
      if (newMutedState) {
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = 0.8; // %80 volume
        
        // Eğer video oynatılmıyorsa, ses açıldığında otomatik başlat
        if (!isPlaying) {
          try {
            await videoRef.current.play();
          } catch (playError) {
            console.warn('⚠️ Otomatik oynatma başarısız:', playError);
          }
        }
      }
      
      setIsMuted(newMutedState);
      
      console.log('🔊 Ses butonu tıklandı:', {
        newMutedState,
        videoMuted: videoRef.current.muted,
        videoVolume: videoRef.current.volume,
        isPlaying
      });
      
    } catch (error) {
      console.error('❌ Ses değiştirme hatası:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = (category: string) => {
    const categoryMap: Record<string, { color: string; bgColor: string }> = {
      'tanıtım': { color: 'text-blue-700', bgColor: 'bg-blue-100' },
      'tedavi': { color: 'text-green-700', bgColor: 'bg-green-100' },
      'bilgilendirme': { color: 'text-purple-700', bgColor: 'bg-purple-100' },
      'hasta-deneyimi': { color: 'text-orange-700', bgColor: 'bg-orange-100' },
      'teknoloji': { color: 'text-yellow-700', bgColor: 'bg-yellow-100' }
    };
    return categoryMap[category] || { color: 'text-gray-700', bgColor: 'bg-gray-100' };
  };

  const categoryInfo = getCategoryInfo(video.category);

  // View count artırma fonksiyonu
  const incrementViewCount = async () => {
    if (viewCounted) return; // Zaten sayıldıysa tekrar sayma
    
    try {
      const response = await fetch(`/api/doctor-videos/${video.id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setViewCounted(true);
        console.log(`📊 Video ${video.id} görüntülenme sayısı artırıldı`);
      } else {
        console.warn(`⚠️ View count artırma başarısız: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ View count artırma hatası:', error);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative group"
    >
      {/* Video Container */}
      <div 
        className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[9/16] shadow-lg hover:shadow-xl transition-shadow duration-300"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video Element */}
        {video.video_url ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={video.thumbnail_url}
            muted={true}
            loop
            playsInline
            preload="metadata"
            controls={false}
            crossOrigin="anonymous"
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src={video.video_url} type="video/mp4" />
            <source src={video.video_url} type="video/webm" />
            <source src={video.video_url} type="video/avi" />
            {!videoLoaded && (
              <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                <div className="text-center p-4">
                  <Loader2 className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-slate-600">Video yükleniyor...</p>
                </div>
              </div>
            )}
          </video>
        ) : (
          <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
            <div className="text-center p-4">
              <FileVideo className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Video bulunamadı</p>
            </div>
          </div>
        )}

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`text-xs font-medium shadow-sm ${categoryInfo.bgColor} ${categoryInfo.color}`}>
            {video.category}
          </Badge>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </div>
        </div>

        {/* Video Controls */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            onClick={togglePlay}
            size="lg"
            className="bg-white/90 hover:bg-white text-slate-800 border-0 w-14 h-14 rounded-full shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
        </div>

        {/* Sound Control */}
        <div className={`absolute bottom-16 right-3 transition-all duration-300 ${
          showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
          <Button
            onClick={toggleMute}
            size="sm"
            className={`
              w-10 h-10 rounded-full p-0 transition-all duration-300 transform hover:scale-110
              ${isMuted 
                ? 'bg-black/60 hover:bg-black/80 border-white/20 text-white shadow-lg' 
                : 'bg-white/90 hover:bg-white border-white/30 text-slate-800 shadow-lg'
              }
            `}
            title={isMuted ? 'Sesi aç' : 'Sesi kapat'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Video Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-medium text-sm mb-2 leading-tight">
            {video.title.length > 35 ? video.title.substring(0, 35) + '...' : video.title}
          </h3>
          
          {/* View Count */}
          <div className="flex items-center gap-1 text-xs text-white/80">
            <Eye className="w-3 h-3" />
            <span>{video.view_count.toLocaleString()} görüntülenme</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VideoSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [videos, setVideos] = useState<DoctorVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Videos'ları API'den yükle
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🎬 Loading videos for homepage...');
        
        // Aktif videoları getir, view_count'a göre sırala, ilk 6'sını al
        const response = await fetch('/api/doctor-videos?active=true&limit=6');
        
        if (response.ok) {
          const result = await response.json();
          console.log('🎬 Videos loaded for homepage:', result);
          
          // View count'a göre sırala
          const sortedVideos = (result.data || []).sort((a: DoctorVideo, b: DoctorVideo) => 
            b.view_count - a.view_count
          );
          
          setVideos(sortedVideos);
        } else {
          const errorData = await response.json();
          console.error('❌ Video loading error:', errorData);
          setError('Videolar yüklenemedi');
        }
      } catch (err) {
        console.error('❌ Video loading error:', err);
        setError('Videolar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section ref={ref} className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-slate-600">Videolar yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state veya video yoksa
  if (error || videos.length === 0) {
    return (
      <section ref={ref} className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FileVideo className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Videolar</h2>
            {error ? (
              <p className="text-red-600 mb-4">{error}</p>
            ) : (
              <p className="text-slate-600 mb-4">Henüz video eklenmemiş.</p>
            )}
            <p className="text-slate-500 text-sm">
              Video sistemi kurulumu için admin panelini ziyaret edin.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative"
        >
          {/* Floating Social Icons */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex gap-3">
            <motion.div
              animate={{ 
                y: [0, -4, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-6 h-6 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center shadow-sm"
            >
              <svg className="w-3 h-3 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
              </svg>
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, -3, 0]
              }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8
              }}
              className="w-6 h-6 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center shadow-sm"
            >
              <svg className="w-3 h-3 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </motion.div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 mt-6">
            Doktor Videoları
            <span className="block text-base font-normal text-slate-500 mt-2">
              Sosyal medyada güncel içeriklerimizi takip edin
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Tedavi süreçlerimizi, teknolojimizi ve hasta deneyimlerini 
            videolarımızda keşfedin. Daha fazla içerik için sosyal medya hesaplarımızı ziyaret edin.
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-12">
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Videolarımızı Beğendiniz Mi?
          </h3>
          <p className="text-slate-600 mb-6">
            Tedavi süreçlerimiz hakkında daha fazla bilgi almak ve 
            randevunuzu planlamak için bizimle iletişime geçin.
          </p>
          
          {/* Social Media Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            {/* TikTok Button */}
            <motion.a
              href="https://www.tiktok.com/@drsahindurmus" // TikTok hesabınızı buraya ekleyin
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3 border border-slate-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
                </svg>
              </div>
              <span className="text-sm">TikTok'ta Takip Et</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.a>

            {/* Instagram Button */}
            <motion.a
              href="https://www.instagram.com/drsahindurmus" // Instagram hesabınızı buraya ekleyin
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3 border border-slate-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <span className="text-sm">Instagram'da Takip Et</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ConsultationButton className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection; 