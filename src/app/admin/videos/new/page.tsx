"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VideoUpload } from '@/components/ui/video-upload';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Loader2,
  FileVideo,
  Tag,
  Globe,
  Star
} from "lucide-react";

interface DoctorVideoFormData {
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export default function NewVideoPage() {
  const [formData, setFormData] = useState<DoctorVideoFormData>({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: 0,
    category: '',
    is_active: true,
    sort_order: 0
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  // Kategori listesi - enum değerler
  const categories = [
    { value: 'tanıtım', label: 'Tanıtım', icon: '🏥', description: 'Klinik ve hizmet tanıtımları' },
    { value: 'tedavi', label: 'Tedavi', icon: '🦷', description: 'Tedavi süreçleri ve prosedürler' },
    { value: 'bilgilendirme', label: 'Bilgilendirme', icon: '📚', description: 'Eğitici ve bilgilendirici içerikler' },
    { value: 'hasta-deneyimi', label: 'Hasta Deneyimi', icon: '👥', description: 'Hasta görüşleri ve deneyimleri' },
    { value: 'teknoloji', label: 'Teknoloji', icon: '⚡', description: 'Modern teknoloji ve cihazlar' }
  ];

  const handleInputChange = (field: keyof DoctorVideoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleVideoUploaded = (videoData: {
    url: string;
    filename: string;
    size: number;
    format: string;
    duration?: number;
    resolution?: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      video_url: videoData.url,
      duration: videoData.duration || 0
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Video başlığı zorunludur';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Video açıklaması zorunludur';
    }

    if (!formData.video_url.trim()) {
      newErrors.video_url = 'Video dosyası yüklenmesi zorunludur';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori seçimi zorunludur';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Video süresi geçerli olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setSaving(true);
      setErrors({});

      const submitData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        video_url: formData.video_url.trim(),
        thumbnail_url: formData.thumbnail_url?.trim() || null,
        duration: Math.round(formData.duration),
        sort_order: formData.sort_order || 0
      };

      console.log('Submitting doctor video:', submitData);

      const response = await fetch('/api/doctor-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();
      console.log('Submit response:', result);

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/videos');
        }, 2000);
      } else {
        console.error('Submit error:', result);
        alert(`Hata: ${result.error || 'Video kaydedilemedi'}\n${result.details || ''}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Submit error: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'Bilinmiyor';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Video Başarıyla Oluşturuldu!</h2>
          <p className="text-slate-600 mb-4">Video yönetim sayfasına yönlendiriliyorsunuz...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/videos')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Yeni Video Ekle</h1>
          <p className="text-slate-600 mt-1">Doktor videolarınızı yükleyin ve yönetin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ana Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileVideo className="h-5 w-5" />
                Video Dosyası
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VideoUpload
                onVideoUploaded={handleVideoUploaded}
                currentVideo={formData.video_url}
              />
              {errors.video_url && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errors.video_url}</span>
                </div>
              )}
              
              {/* Video Metadata Display */}
              {formData.video_url && formData.duration > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Video Bilgileri</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Süre:</span> {formatDuration(formData.duration)}
                    </div>
                    <div>
                      <span className="font-medium">URL:</span> {formData.video_url.substring(0, 50)}...
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Video Başlığı *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Video başlığını girin..."
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <div className="flex items-center gap-2 mt-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{errors.title}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Video Açıklaması *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Video hakkında açıklama..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <div className="flex items-center gap-2 mt-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{errors.description}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Video Süresi (saniye) *
                </label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  placeholder="Video süresi (saniye)..."
                  min="1"
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && (
                  <div className="flex items-center gap-2 mt-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{errors.duration}</span>
                  </div>
                )}
                {formData.duration > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Süre: {formatDuration(formData.duration)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Thumbnail URL (Opsiyonel)
                </label>
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                  placeholder="Video önizleme resmi URL'si..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Kategori */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Kategori
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Video Kategorisi *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Kategori seçin...</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div className="flex items-center gap-2 mt-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{errors.category}</span>
                  </div>
                )}
                
                {/* Kategori Açıklaması */}
                {formData.category && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getCategoryInfo(formData.category)?.icon}</span>
                      <span className="font-medium text-blue-900">
                        {getCategoryInfo(formData.category)?.label}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {getCategoryInfo(formData.category)?.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ayarlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Video Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Aktif Durumda
                </label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sıralama (Opsiyonel)
                </label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  placeholder="Sıralama numarası..."
                  min="0"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Düşük sayılar önce gösterilir
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Aksiyon Butonları */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Video Kaydet
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => router.push('/admin/videos')}
                  disabled={saving}
                  variant="outline"
                  className="w-full"
                >
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 