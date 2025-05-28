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
  Star, 
  Calendar,
  Search,
  FileText,
  Clock,
  BookOpen,
  CheckCircle,
  Camera,
  Tag
} from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url?: string;
  category: string;
  tags?: string[];
  published: boolean;
  featured: boolean;
  author: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  published_date: string;
  view_count?: number;
  read_time?: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const router = useRouter();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog');
      if (response.ok) {
        const result = await response.json();
        setPosts(result.data || result || []);
      } else {
        const error = await response.json();
        console.error('Load posts error:', error);
        alert(`Hata: ${error.error || 'Blog yazıları yüklenemedi'}`);
      }
    } catch (error) {
      console.error('Blog posts loading error:', error);
      alert('Blog yazıları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    router.push(`/admin/blog/edit/${post.id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await loadPosts();
        alert('Blog yazısı silindi!');
      } else {
        const error = await response.json();
        alert(`Silme hatası: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi başarısız');
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published })
      });
      
      if (response.ok) {
        await loadPosts();
      }
    } catch (error) {
      console.error('Toggle publish error:', error);
    }
  };

  const toggleFeatured = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !post.featured })
      });
      
      if (response.ok) {
        await loadPosts();
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
    }
  };

  // Filtreleme
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && post.published) ||
                         (filterStatus === 'draft' && !post.published);
    
    return matchesSearch && matchesFilter;
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

  // Image display component with fallback
  const BlogImagePreview = ({ post }: { post: BlogPost }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Varsayılan placeholder fotoğraf - Diş hekimliği temalı
    const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='64' viewBox='0 0 96 64'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e0f2fe'/%3E%3Cstop offset='100%25' style='stop-color:%23f0f9ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='96' height='64' fill='url(%23bg)'/%3E%3Cg transform='translate(48, 32)'%3E%3C!-- Diş ikonu --%3Cpath d='M-6 -8 Q-8 -12 -4 -12 Q0 -12 4 -12 Q8 -12 6 -8 L6 4 Q6 8 2 8 L-2 8 Q-6 8 -6 4 Z' fill='%23ffffff' stroke='%2306b6d4' stroke-width='1'/%3E%3Cpath d='M-3 -6 Q-1 -8 1 -6 Q3 -4 1 -2 Q-1 0 -3 -2 Q-5 -4 -3 -6' fill='%2306b6d4'/%3E%3C/g%3E%3Ctext x='48' y='50' text-anchor='middle' font-family='system-ui, sans-serif' font-size='7' font-weight='500' fill='%230369a1'%3EDr. Şahin Durmuş%3C/text%3E%3C/svg%3E";

    if (!post.image_url || imageError) {
      return (
        <div className="flex-shrink-0">
          <img
            src={defaultImage}
            alt="Varsayılan blog görseli"
            className="w-24 h-16 object-cover rounded-md border bg-gray-50"
          />
        </div>
      );
    }

    return (
      <div className="flex-shrink-0">
        <div className="relative w-24 h-16">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 rounded-md border flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
          <img
            src={post.image_url}
            alt={post.title}
            className={`w-24 h-16 object-cover rounded-md border transition-opacity ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </div>
    );
  };

  // Statistics
  const stats = {
    total: posts.length,
    published: posts.filter(p => p.published).length,
    draft: posts.filter(p => !p.published).length,
    featured: posts.filter(p => p.featured).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Blog yazıları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blog Yönetimi</h1>
          <p className="text-slate-600 mt-2">Profesyonel blog yazılarını yönetin ve yeni içerik oluşturun</p>
        </div>
        <Button 
          onClick={() => router.push('/admin/blog/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Blog Yazısı
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Toplam Yazı</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Yayınlanan</p>
                <p className="text-2xl font-bold text-slate-900">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Taslak</p>
                <p className="text-2xl font-bold text-slate-900">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Öne Çıkan</p>
                <p className="text-2xl font-bold text-slate-900">{stats.featured}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Blog yazılarında ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tümü ({stats.total})</option>
          <option value="published">Yayınlanan ({stats.published})</option>
          <option value="draft">Taslak ({stats.draft})</option>
        </select>
      </div>

      {/* Blog Listesi */}
      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Fotoğraf Önizlemesi */}
                <BlogImagePreview post={post} />
                
                {/* İçerik */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">{post.title}</h3>
                        {post.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 flex-shrink-0">
                            <Star className="h-3 w-3 mr-1" />
                            Öne Çıkan
                          </Badge>
                        )}
                        <Badge variant={post.published ? "default" : "secondary"} className="flex-shrink-0">
                          {post.published ? 'Yayınlandı' : 'Taslak'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.created_at)}
                        </span>
                        {post.read_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.read_time}
                          </span>
                        )}
                        {post.view_count !== undefined && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.view_count} görüntüleme
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Aksiyon Butonları */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublished(post)}
                        title={post.published ? 'Yayından kaldır' : 'Yayınla'}
                      >
                        {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatured(post)}
                        className={post.featured ? 'bg-yellow-50' : ''}
                        title={post.featured ? 'Öne çıkarmayı kaldır' : 'Öne çıkar'}
                      >
                        <Star className={`h-4 w-4 ${post.featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">
            {searchTerm ? 'Arama kriterlerine uygun blog yazısı bulunamadı' : 'Henüz blog yazısı yok'}
          </p>
          <p className="text-slate-400">
            {searchTerm ? 'Farklı anahtar kelimeler deneyin' : 'İlk blog yazınızı oluşturmak için yukarıdaki butona tıklayın'}
          </p>
        </div>
      )}
    </div>
  );
} 