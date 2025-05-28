"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Tag, 
  Star,
  Newspaper,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MediaPublication {
  id: number;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  publication_date: string;
  image_url?: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

const MediaPublicationsManager = () => {
  const [publications, setPublications] = useState<MediaPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<MediaPublication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    source_name: '',
    source_url: '',
    publication_date: '',
    image_url: '',
    category: '',
    tags: '',
    is_featured: false
  });

  // Medya kaynakları
  const mediaSources = [
    'Mynet', 'CNN Türk', 'Sabah', 'Hürriyet', 'Posta', 
    'Cumhuriyet', 'Milli Gazete', 'DHA', 'Gazete Vatan', 
    'Kelebek', 'Elele', 'Milliyet', 'Pembe Nar'
  ];

  // Kategoriler
  const categories = [
    'Sağlık', 'Estetik', 'Teknoloji', 'Tedavi', 'Çocuk Sağlığı',
    'Önleme', 'Bilgilendirme', 'Röportaj', 'Uzman Görüşü'
  ];

  // Medya yayınlarını yükle
  const loadPublications = async () => {
    try {
      setLoading(true);
      const url = selectedSource === 'all' 
        ? '/api/media-publications'
        : `/api/media-publications?source=${encodeURIComponent(selectedSource)}`;
        
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        setPublications(result.data || []);
      }
    } catch (error) {
      console.error('Medya yayınları yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, [selectedSource]);

  // Form reset
  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      source_name: '',
      source_url: '',
      publication_date: '',
      image_url: '',
      category: '',
      tags: '',
      is_featured: false
    });
    setEditingPublication(null);
  };

  // Yayın ekleme/güncelleme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingPublication ? 'PUT' : 'POST';
      const url = editingPublication 
        ? `/api/media-publications/${editingPublication.id}`
        : '/api/media-publications';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }),
      });

      if (response.ok) {
        await loadPublications();
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
  const handleEdit = (publication: MediaPublication) => {
    setFormData({
      title: publication.title,
      summary: publication.summary,
      source_name: publication.source_name,
      source_url: publication.source_url,
      publication_date: publication.publication_date,
      image_url: publication.image_url || '',
      category: publication.category,
      tags: publication.tags.join(', '),
      is_featured: publication.is_featured
    });
    setEditingPublication(publication);
    setIsDialogOpen(true);
  };

  // Yayın silme
  const handleDelete = async (id: number) => {
    if (!confirm('Bu medya yayınını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/media-publications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadPublications();
      } else {
        alert('Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  // Filtrelenmiş yayınlar
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pub.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medya Yayınları</h2>
          <p className="text-slate-600">Gazete ve dergi yayınlarını yönetin</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Yayın Ekle
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPublication ? 'Medya Yayınını Düzenle' : 'Yeni Medya Yayını Ekle'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="source_name">Kaynak *</Label>
                  <Select 
                    value={formData.source_name} 
                    onValueChange={(value) => setFormData({...formData, source_name: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kaynak seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaSources.map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="publication_date">Yayın Tarihi *</Label>
                  <Input
                    id="publication_date"
                    type="date"
                    value={formData.publication_date}
                    onChange={(e) => setFormData({...formData, publication_date: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="diş estetiği, teknoloji, sağlık"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="source_url">Orijinal Makale URL'si *</Label>
                  <Input
                    id="source_url"
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({...formData, source_url: e.target.value})}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="image_url">Görsel URL'si</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="summary">Özet</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                    />
                    <Label htmlFor="is_featured">Öne çıkan yayın</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  {editingPublication ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Yayınlarda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kaynaklar</SelectItem>
            {mediaSources.map(source => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Publications List */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPublications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Newspaper className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Henüz medya yayını yok
            </h3>
            <p className="text-slate-600">
              İlk medya yayınını eklemek için yukarıdaki butonu kullanın.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPublications.map((publication, index) => (
            <motion.div
              key={publication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{publication.source_name}</Badge>
                        {publication.category && (
                          <Badge variant="secondary">{publication.category}</Badge>
                        )}
                        {publication.is_featured && (
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Öne Çıkan
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {publication.title}
                      </h3>
                      
                      {publication.summary && (
                        <p className="text-slate-600 mb-3 line-clamp-2">
                          {publication.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(publication.publication_date)}
                        </div>
                        
                        {publication.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {publication.tags.slice(0, 2).join(', ')}
                            {publication.tags.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={publication.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(publication)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(publication.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaPublicationsManager; 