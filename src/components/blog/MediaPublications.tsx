"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Tag, Star, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
}

const MediaPublications = () => {
  const [publications, setPublications] = useState<MediaPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>('all');

  // Medya kaynakları
  const mediaSources = [
    { value: 'all', label: 'Tüm Kaynaklar', icon: '📰' },
    { value: 'Mynet', label: 'Mynet', icon: '🌐' },
    { value: 'CNN Türk', label: 'CNN Türk', icon: '📺' },
    { value: 'Sabah', label: 'Sabah', icon: '📰' },
    { value: 'Hürriyet', label: 'Hürriyet', icon: '📰' },
    { value: 'Posta', label: 'Posta', icon: '📰' },
    { value: 'Cumhuriyet', label: 'Cumhuriyet', icon: '📰' },
    { value: 'Milli Gazete', label: 'Milli Gazete', icon: '📰' },
    { value: 'DHA', label: 'DHA', icon: '📡' },
    { value: 'Gazete Vatan', label: 'Gazete Vatan', icon: '📰' },
    { value: 'Kelebek', label: 'Kelebek', icon: '🦋' },
    { value: 'Elele', label: 'Elele', icon: '🤝' },
    { value: 'Milliyet', label: 'Milliyet', icon: '📰' },
    { value: 'Pembe Nar', label: 'Pembe Nar', icon: '🌸' }
  ];

  // Medya yayınlarını yükle
  useEffect(() => {
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
        } else {
          console.error('Medya yayınları yüklenemedi');
        }
      } catch (error) {
        console.error('Medya yayınları yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, [selectedSource]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSourceIcon = (sourceName: string) => {
    const source = mediaSources.find(s => s.value === sourceName);
    return source?.icon || '📰';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-2">Medya yayınları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Medyada Dr. Şahin Durmuş
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Ulusal medyada yer alan yazılar, röportajlar ve uzman görüşleri
        </p>
      </div>

      {/* Source Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {mediaSources.map((source) => (
          <Button
            key={source.value}
            variant={selectedSource === source.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSource(source.value)}
            className="text-xs"
          >
            <span className="mr-1">{source.icon}</span>
            {source.label}
          </Button>
        ))}
      </div>

      {/* Publications Grid */}
      {publications.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Henüz yayın eklenmemiş
          </h3>
          <p className="text-slate-600">
            {selectedSource === 'all' 
              ? 'Medya yayınları yakında eklenecek.'
              : `${selectedSource} kaynağında henüz yayın bulunmuyor.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((publication, index) => (
            <motion.div
              key={publication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                {publication.image_url && (
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={publication.image_url}
                      alt={publication.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {publication.is_featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Öne Çıkan
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      <span className="mr-1">{getSourceIcon(publication.source_name)}</span>
                      {publication.source_name}
                    </Badge>
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(publication.publication_date)}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {publication.title}
                  </h3>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {publication.summary && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {publication.summary}
                    </p>
                  )}
                  
                  {publication.category && (
                    <div className="mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {publication.category}
                      </Badge>
                    </div>
                  )}
                  
                  {publication.tags && publication.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {publication.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
                  >
                    <a
                      href={publication.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Orijinal Makaleyi Oku
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaPublications; 