"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Search,
  FileVideo,
  Clock,
  Play,
  CheckCircle,
  Tag,
  Users,
  TrendingUp,
  ArrowLeft,
  AlertCircle
} from "lucide-react";

interface DoctorVideo {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  view_count: number;
  sort_order?: number;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<DoctorVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [systemNotSetup, setSystemNotSetup] = useState(false);

  const router = useRouter();

  // Kategori listesi
  const categories = [
    { value: 'tanıtım', label: 'Tanıtım', icon: '🏥' },
    { value: 'tedavi', label: 'Tedavi', icon: '🦷' },
    { value: 'bilgilendirme', label: 'Bilgilendirme', icon: '📚' },
    { value: 'hasta-deneyimi', label: 'Hasta Deneyimi', icon: '👥' },
    { value: 'teknoloji', label: 'Teknoloji', icon: '⚡' }
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setSystemNotSetup(false);
      console.log('🎬 Loading doctor videos...');
      
      const response = await fetch('/api/doctor-videos');
      console.log('🎬 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🎬 Doctor videos loaded:', result);
        setVideos(result.data || result || []);
      } else {
        const error = await response.json();
        console.error('❌ Load doctor videos error:', error);
        
        // Video tabloları henüz oluşturulmamışsa özel durum işaretle
        if (error.details && error.details.includes('relation "doctor_videos" does not exist')) {
          setSystemNotSetup(true);
        } else {
          alert(`Hata: ${error.error || 'Videolar yüklenemedi'}\nDetay: ${error.details || 'Bilinmeyen hata'}`);
        }
      }
    } catch (error) {
      console.error('❌ Doctor videos loading error:', error);
      alert(`Videolar yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video: DoctorVideo) => {
    router.push(`/admin/videos/edit/${video.id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu videoyu silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/doctor-videos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await loadVideos();
        alert('Video silindi!');
      } else {
        const error = await response.json();
        alert(`Silme hatası: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi başarısız');
    }
  };

  const toggleActive = async (video: DoctorVideo) => {
    try {
      const response = await fetch(`/api/doctor-videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !video.is_active })
      });
      
      if (response.ok) {
        await loadVideos();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  // Filtreleme
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && video.is_active) ||
                         (filterStatus === 'inactive' && !video.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || { label: category, icon: '📹' };
  };

  // Video önizleme bileşeni
  const VideoPreview = ({ video }: { video: DoctorVideo }) => {
    if (video.thumbnail_url) {
      return (
        <div className="relative w-24 h-16 bg-gray-100 rounded-md overflow-hidden">
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play className="w-6 h-6 text-white" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-24 h-16 bg-gray-100 rounded-md flex items-center justify-center">
        <FileVideo className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  // Statistics
  const stats = {
    total: videos.length,
    active: videos.filter(v => v.is_active).length,
    inactive: videos.filter(v => !v.is_active).length,
    totalViews: videos.reduce((sum, v) => sum + v.view_count, 0)
  };

  // Video sistemi kurulmamışsa
  if (systemNotSetup) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Video Sistemi Kurulumu Gerekli</h1>
          <p className="text-slate-600 mb-6">
            Video sistemi henüz kurulmamış. Lütfen veritabanı şemasını oluşturun.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
            <h3 className="font-medium mb-2">Kurulum Adımları:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Supabase SQL Editor'ı açın</li>
              <li>new_simple_video_system.sql dosyasını çalıştırın</li>
              <li>Bu sayfayı yenileyin</li>
            </ol>
          </div>
          <Button onClick={() => window.location.reload()} className="mr-4">
            Sayfayı Yenile
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin')}>
            Admin Panele Dön
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Videolar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin Panel
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Video Yönetimi</h1>
            <p className="text-slate-600 mt-1">Doktor videolarınızı yönetin</p>
          </div>
        </div>
        <Button
          onClick={() => router.push('/admin/videos/new')}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yeni Video Ekle
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Toplam Video</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <FileVideo className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pasif</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inactive}</p>
              </div>
              <EyeOff className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Toplam Görüntülenme</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Video ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Durum</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterStatus('all');
                }}
                variant="outline"
                className="w-full"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos List */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileVideo className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {videos.length === 0 ? 'Henüz video eklenmemiş' : 'Filtreye uygun video bulunamadı'}
            </h3>
            <p className="text-slate-600 mb-6">
              {videos.length === 0 
                ? 'İlk videonuzu ekleyerek başlayın.'
                : 'Farklı filtreler deneyebilir veya arama terimini değiştirebilirsiniz.'
              }
            </p>
            {videos.length === 0 && (
              <Button
                onClick={() => router.push('/admin/videos/new')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk Videoyu Ekle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredVideos.map((video) => {
            const categoryInfo = getCategoryInfo(video.category);
            
            return (
              <Card key={video.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Video Preview */}
                    <VideoPreview video={video} />

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
                            {video.title}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {video.description}
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        <Badge 
                          className={`ml-4 ${
                            video.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {video.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          <span>{categoryInfo.icon} {categoryInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{video.view_count.toLocaleString()} görüntülenme</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(video.created_at)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEdit(video)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Düzenle
                        </Button>

                        <Button
                          onClick={() => toggleActive(video)}
                          size="sm"
                          variant="outline"
                          className={`flex items-center gap-1 ${
                            video.is_active 
                              ? 'text-orange-600 hover:text-orange-700' 
                              : 'text-green-600 hover:text-green-700'
                          }`}
                        >
                          {video.is_active ? (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Pasif Yap
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" />
                              Aktif Yap
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleDelete(video.id)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 