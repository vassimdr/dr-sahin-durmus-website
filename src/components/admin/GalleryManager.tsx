"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { AdvancedImageUpload } from '@/components/ui/advanced-image-upload';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Loader2,
  Grid,
  Calendar,
  Tag,
  Camera
} from 'lucide-react';

// Galeri item tipi
interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category: string;
  treatment_type?: string;
  patient_age_group?: string;
  is_before_after: boolean;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  alt_text?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const GalleryManager = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState<any>({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    thumbnail_url: '',
    category: '',
    treatment_type: '',
    patient_age_group: '',
    is_before_after: false,
    sort_order: 0,
    is_featured: false,
    is_active: true,
    alt_text: '',
    tags: ''
  });

  // Kategoriler ve tedavi türleri
  const categories = [
    'Klinik Ortamı',
    'Tedavi Öncesi/Sonrası',
    'Ekip',
    'Teknoloji',
    'Hasta Deneyimleri',
    'Başarı Hikayeleri'
  ];

  const treatmentTypes = [
    'İmplant',
    'Ortodonti',
    'Diş Beyazlatma',
    'Kanal Tedavisi',
    'Çekim',
    'Estetik Dolgu',
    'Protez',
    'Cerrahi'
  ];

  const ageGroups = [
    'Çocuk',
    'Genç',
    'Yetişkin',
    'Yaşlı'
  ];

  // Galeri öğelerini yükle
  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === 'all' 
        ? '/api/gallery'
        : `/api/gallery?category=${encodeURIComponent(selectedCategory)}`;
        
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        setGalleryItems(result.data || []);
        setStats(result.stats || {});
      }
    } catch (error) {
      console.error('Galeri öğeleri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryItems();
  }, [selectedCategory]);

  // Form reset
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      thumbnail_url: '',
      category: '',
      treatment_type: '',
      patient_age_group: '',
      is_before_after: false,
      sort_order: 0,
      is_featured: false,
      is_active: true,
      alt_text: '',
      tags: ''
    });
    setEditingItem(null);
  };

  // Resim upload callback
  const handleImageUpload = (imageUrl: string, thumbnailUrl?: string) => {
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl || imageUrl
    }));
  };

  // Resim silme callback
  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      image_url: '',
      thumbnail_url: ''
    }));
  };

  // Galeri öğesi ekleme/güncelleme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url) {
      alert('Lütfen bir resim yükleyin');
      return;
    }
    
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem 
        ? `/api/gallery/${editingItem.id}`
        : '/api/gallery';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          alt_text: formData.alt_text || formData.title
        }),
      });

      if (response.ok) {
        await loadGalleryItems();
        setIsDialogOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(`Hata: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  // Düzenleme için formu doldur
  const handleEdit = (item: GalleryItem) => {
    setFormData({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url,
      thumbnail_url: item.thumbnail_url || '',
      category: item.category,
      treatment_type: item.treatment_type || '',
      patient_age_group: item.patient_age_group || '',
      is_before_after: item.is_before_after,
      sort_order: item.sort_order,
      is_featured: item.is_featured,
      is_active: item.is_active,
      alt_text: item.alt_text || '',
      tags: item.tags.join(', ')
    });
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  // Silme
  const handleDelete = async (id: number) => {
    if (confirm('Bu galeri öğesini silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/gallery/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadGalleryItems();
        } else {
          alert('Silme işlemi başarısız');
        }
      } catch (error) {
        console.error('Silme hatası:', error);
        alert('Bir hata oluştu');
      }
    }
  };

  // Durum değiştirme (aktif/pasif, öne çıkan)
  const toggleStatus = async (id: number, field: 'is_active' | 'is_featured', currentValue: boolean) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: !currentValue
        }),
      });

      if (response.ok) {
        await loadGalleryItems();
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  // Filtreleme
  const filteredItems = galleryItems.filter(item => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(query) ||
             item.description?.toLowerCase().includes(query) ||
             item.tags.some(tag => tag.toLowerCase().includes(query));
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Galeri Yönetimi</h2>
          <p className="text-slate-600">Klinik fotoğraflarını ve görselleri yönetin</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Görsel Ekle
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Galeri Öğesini Düzenle' : 'Yeni Galeri Öğesi Ekle'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Başlık */}
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Görsel başlığı"
                  required
                />
              </div>

              {/* Açıklama */}
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Görsel açıklaması"
                  rows={3}
                />
              </div>

              {/* Görsel Upload */}
              <div>
                <Label>Görsel *</Label>
                <AdvancedImageUpload
                  onImageUploaded={handleImageUpload}
                  onImageRemoved={handleImageRemove}
                  currentImage={formData.image_url}
                  currentThumbnail={formData.thumbnail_url}
                  folder="gallery"
                  maxSize={5}
                  aspectRatio="auto"
                  placeholder="Galeri görseli yükleyin"
                />
              </div>

              {/* Kategori ve Tedavi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="treatment_type">Tedavi Türü</Label>
                  <select
                    id="treatment_type"
                    value={formData.treatment_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatment_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tedavi türü seçin</option>
                    {treatmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Yaş Grubu ve Sıralama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_age_group">Hasta Yaş Grubu</Label>
                  <select
                    id="patient_age_group"
                    value={formData.patient_age_group}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_age_group: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Yaş grubu seçin</option>
                    {ageGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="sort_order">Sıralama</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Alt Text ve Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alt_text">Alt Text (SEO)</Label>
                  <Input
                    id="alt_text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="SEO için alternatif metin"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Etiketler</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Etiketler (virgülle ayırın)"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="is_before_after"
                    type="checkbox"
                    checked={formData.is_before_after}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_before_after: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="is_before_after" className="text-sm">Öncesi/Sonrası</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="is_featured"
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="is_featured" className="text-sm">Öne Çıkan</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="is_active" className="text-sm">Aktif</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  {editingItem ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Toplam</p>
                <p className="text-xl font-bold">{stats.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Öne Çıkan</p>
                <p className="text-xl font-bold">
                  {galleryItems.filter(item => item.is_featured).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Grid className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Kategoriler</p>
                <p className="text-xl font-bold">
                  {Object.keys(stats.categories || {}).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Camera className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Öncesi/Sonrası</p>
                <p className="text-xl font-bold">
                  {galleryItems.filter(item => item.is_before_after).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Galeri öğelerinde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Galeri Listesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="group relative overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={item.image_url}
                  alt={item.alt_text || item.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(item)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {item.is_featured && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Öne Çıkan
                    </Badge>
                  )}
                  {item.is_before_after && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Önce/Sonra
                    </Badge>
                  )}
                  {!item.is_active && (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      Pasif
                    </Badge>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-white/20 hover:bg-white/30 text-white p-1 h-auto"
                    onClick={() => toggleStatus(item.id, 'is_active', item.is_active)}
                  >
                    {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-white/20 hover:bg-white/30 text-white p-1 h-auto"
                    onClick={() => toggleStatus(item.id, 'is_featured', item.is_featured)}
                  >
                    {item.is_featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{item.title}</h3>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.category}</span>
                  <span>#{item.sort_order}</span>
                </div>
                {item.treatment_type && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {item.treatment_type}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Galeri öğesi bulunamadı</h3>
          <p className="text-slate-600">Arama kriterlerinize uygun galeri öğesi bulunamadı.</p>
        </div>
      )}
    </div>
  );
};

export default GalleryManager; 