"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Filter, 
  Grid, 
  List, 
  Search, 
  X, 
  ZoomIn, 
  ChevronLeft, 
  ChevronRight,
  Camera,
  Eye,
  Heart,
  Share2,
  Download,
  Loader2
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
  alt_text?: string;
  tags: string[];
  created_at: string;
}

// Kategori renkleri
const categoryColors: Record<string, string> = {
  'Klinik Ortamı': 'bg-blue-100 text-blue-800',
  'Tedavi Öncesi/Sonrası': 'bg-green-100 text-green-800',
  'Ekip': 'bg-purple-100 text-purple-800',
  'Teknoloji': 'bg-orange-100 text-orange-800',
  'Hasta Deneyimleri': 'bg-pink-100 text-pink-800',
  'Başarı Hikayeleri': 'bg-yellow-100 text-yellow-800',
};

export default function GaleriPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [stats, setStats] = useState<any>({});

  // Galeri öğelerini yükle
  useEffect(() => {
    const loadGallery = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/gallery');
        
        if (response.ok) {
          const result = await response.json();
          setGalleryItems(result.data || []);
          setStats(result.stats || {});
        } else {
          console.error('Galeri yüklenemedi');
        }
      } catch (error) {
        console.error('Galeri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  // Filtreleme
  useEffect(() => {
    let filtered = galleryItems;

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Tedavi filtresi
    if (selectedTreatment !== 'all') {
      filtered = filtered.filter(item => item.treatment_type === selectedTreatment);
    }

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredItems(filtered);
  }, [galleryItems, selectedCategory, selectedTreatment, searchQuery]);

  // Kategorileri al
  const categories = Object.keys(stats.categories || {});
  const treatments = Object.keys(stats.treatments || {});

  // Lightbox fonksiyonları
  const openLightbox = (item: GalleryItem) => {
    setSelectedImage(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
    } else {
      newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(filteredItems[newIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, filteredItems]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Galeri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Başlık */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Galeri
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({filteredItems.length} fotoğraf)
                </span>
              </h1>
              <p className="text-slate-600">
                Kliniğimizden ve başarılı tedavilerimizden kareler
              </p>
            </div>

            {/* Kontroller */}
            <div className="flex items-center gap-3">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Filtre Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrele
              </Button>

              {/* View Mode */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('masonry')}
                  className="rounded-none border-l"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filtreler */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-slate-200 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Kategori Filtresi */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kategori
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Tüm Kategoriler</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category} ({stats.categories[category]})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tedavi Filtresi */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tedavi Türü
                      </label>
                      <select
                        value={selectedTreatment}
                        onChange={(e) => setSelectedTreatment(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Tüm Tedaviler</option>
                        {treatments.map(treatment => (
                          <option key={treatment} value={treatment}>
                            {treatment} ({stats.treatments[treatment]})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCategory('all');
                          setSelectedTreatment('all');
                          setSearchQuery('');
                        }}
                        className="w-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Filtreleri Temizle
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* İçerik */}
      <div className="container mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Fotoğraf bulunamadı
            </h3>
            <p className="text-slate-600">
              Arama kriterlerinize uygun fotoğraf bulunamadı. Filtreleri değiştirmeyi deneyin.
            </p>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6'
            }
          `}>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`
                  ${viewMode === 'masonry' ? 'break-inside-avoid' : ''}
                `}
              >
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="relative">
                    <div className={`
                      ${viewMode === 'grid' ? 'aspect-square' : 'aspect-auto'}
                      overflow-hidden
                    `}>
                      <Image
                        src={item.image_url}
                        alt={item.alt_text || item.title}
                        width={400}
                        height={viewMode === 'grid' ? 400 : 600}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onClick={() => openLightbox(item)}
                      />
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                      <Button
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => openLightbox(item)}
                      >
                        <ZoomIn className="w-4 h-4 mr-2" />
                        Büyüt
                      </Button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge className={categoryColors[item.category] || 'bg-gray-100 text-gray-800'}>
                        {item.category}
                      </Badge>
                      {item.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Heart className="w-3 h-3 mr-1" />
                          Öne Çıkan
                        </Badge>
                      )}
                      {item.is_before_after && (
                        <Badge className="bg-green-100 text-green-800">
                          Önce/Sonra
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    {item.treatment_type && (
                      <Badge variant="outline" className="text-xs">
                        {item.treatment_type}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-6xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
                onClick={() => navigateImage('prev')}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
                onClick={() => navigateImage('next')}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Image */}
              <div className="relative">
                <Image
                  src={selectedImage.image_url}
                  alt={selectedImage.alt_text || selectedImage.title}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-white/90 mb-3">{selectedImage.description}</p>
                )}
                <div className="flex items-center gap-3">
                  <Badge className={categoryColors[selectedImage.category] || 'bg-gray-100 text-gray-800'}>
                    {selectedImage.category}
                  </Badge>
                  {selectedImage.treatment_type && (
                    <Badge variant="outline" className="border-white/30 text-white">
                      {selectedImage.treatment_type}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 