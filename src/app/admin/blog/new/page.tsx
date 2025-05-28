"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Save,
  FileText,
  Image,
  AlertCircle,
  CheckCircle,
  Settings,
  Globe,
  Tag,
  Eye,
  RefreshCw,
  Star,
  Bold,
  Italic,
  List,
  Link,
  Type,
  Quote,
  Sparkles,
  Calendar,
  Clock,
  Zap,
  BookOpen,
  User,
  Camera,
  Hash,
  Search
} from "lucide-react";
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageUploadSimple } from '@/components/ui/image-upload-simple';
import { ImageUploadAPI } from '@/components/ui/image-upload-api';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category: '',
    tags: '',
    is_published: false,
    is_featured: false,
    meta_title: '',
    meta_description: '',
    image_url: ''
  });

  // Form validation errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Blog kategorileri
  const categories = [
    'Genel Diş Sağlığı',
    'İmplant Tedavisi',
    'Ortodonti',
    'Estetik Diş Hekimliği',
    'Çocuk Diş Hekimliği',
    'Ağız ve Diş Sağlığı',
    'Tedavi Öncesi ve Sonrası',
    'Diş Bakımı İpuçları'
  ];

  // Rich text editor functions
  const insertText = (before: string, after: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = before + selectedText + after;
    
    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newValue }));
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatBold = () => insertText('**', '**');
  const formatItalic = () => insertText('*', '*');
  const formatHeading = () => insertText('\n\n## ', '\n\n');
  const formatList = () => insertText('\n\n- ', '\n- Öğe 2\n- Öğe 3\n\n');
  const formatQuote = () => insertText('\n\n> ', '\n\n');
  
  const insertLink = () => {
    const url = prompt('Link URL\'sini girin:');
    if (url) {
      const text = prompt('Link metni:') || url;
      insertText(`[${text}](${url})`);
    }
  };

  const insertImage = () => {
    const url = prompt('Görsel URL\'sini girin:');
    if (url) {
      const alt = prompt('Görsel açıklaması:') || 'Görsel';
      insertText(`\n\n![${alt}](${url})\n\n`);
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Başlık zorunludur';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'İçerik zorunludur';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Özet zorunludur';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori seçimi zorunludur';
    }

    if (formData.excerpt.length > 300) {
      newErrors.excerpt = 'Özet 300 karakterden uzun olamaz';
    }

    if (formData.meta_description && formData.meta_description.length > 160) {
      newErrors.meta_description = 'SEO açıklama 160 karakterden uzun olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        is_published: publishNow || formData.is_published
      };

      console.log('Gönderilecek veri:', payload);

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const result = await response.json();
      console.log('Response result:', result);

      if (response.ok) {
        alert('Blog yazısı başarıyla oluşturuldu!');
        router.push('/admin/blog');
      } else {
        console.error('Submit error:', result);
        alert(`Hata: ${result.error || 'Bilinmeyen hata'}\nDetay: ${result.details || 'Detay yok'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(`İstek hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setSaving(false);
    }
  };

  // Auto-generate excerpt from content
  const generateExcerpt = () => {
    if (formData.content && !formData.excerpt) {
      const excerpt = formData.content
        .replace(/[#*>\-\[\]()]/g, '') // Remove markdown characters
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim()
        .substring(0, 200) + '...';
      setFormData(prev => ({ ...prev, excerpt }));
    }
  };

  // Auto-generate meta description
  const generateMetaDescription = () => {
    if (formData.excerpt && !formData.meta_description) {
      const metaDesc = formData.excerpt.substring(0, 155) + '...';
      setFormData(prev => ({ ...prev, meta_description: metaDesc }));
    }
  };

  // Markdown to HTML converter (basic)
  const markdownToHtml = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img alt="$1" src="$2" />')
      .replace(/\n/g, '<br>')
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
  };

  const wordCount = formData.content.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Ortalama okuma hızı 200 kelime/dakika

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Blog Yazısı</h1>
            <p className="text-gray-500 mt-1">Yeni bir blog yazısı oluşturun</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Düzenle' : 'Önizle'}
          </Button>
          
          <Button
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
          </Button>
          
          <Button
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Globe className="w-4 h-4" />
            {saving ? 'Yayınlanıyor...' : 'Yayınla'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {!previewMode ? (
            <>
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Başlık ve İçerik
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Başlık *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Blog yazısının başlığını girin..."
                      className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Rich Text Toolbar */}
                  <div className="border-b pb-4">
                    <Label className="block mb-2">İçerik Araçları</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={formatBold}
                        className="flex items-center gap-1"
                      >
                        <Bold className="w-4 h-4" />
                        Kalın
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={formatItalic}
                        className="flex items-center gap-1"
                      >
                        <Italic className="w-4 h-4" />
                        İtalik
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={formatHeading}
                        className="flex items-center gap-1"
                      >
                        <Type className="w-4 h-4" />
                        Başlık
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={formatList}
                        className="flex items-center gap-1"
                      >
                        <List className="w-4 h-4" />
                        Liste
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={formatQuote}
                        className="flex items-center gap-1"
                      >
                        <Quote className="w-4 h-4" />
                        Alıntı
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={insertLink}
                        className="flex items-center gap-1"
                      >
                        <Link className="w-4 h-4" />
                        Link
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={insertImage}
                        className="flex items-center gap-1"
                      >
                        <Image className="w-4 h-4" />
                        Görsel
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content" className="flex items-center gap-2 justify-between">
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        İçerik * (Markdown destekli)
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        {wordCount} kelime • {readingTime} dk okuma
                      </span>
                    </Label>
                    <Textarea
                      id="content"
                      ref={contentTextareaRef}
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Blog yazısının içeriğini yazın... (Markdown kullanabilirsiniz)"
                      className={`mt-1 min-h-[400px] font-mono ${errors.content ? 'border-red-500' : ''}`}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.content}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="excerpt" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Özet *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateExcerpt}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Otomatik Oluştur
                      </Button>
                    </div>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Blog yazısının kısa özeti..."
                      className={`mt-1 ${errors.excerpt ? 'border-red-500' : ''}`}
                      rows={3}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.excerpt ? (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.excerpt}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Arama sonuçlarında görünecek</p>
                      )}
                      <p className="text-sm text-gray-500">{formData.excerpt.length}/300</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Preview Mode */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Önizleme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h1 className="text-3xl font-bold mb-4">{formData.title || 'Başlık'}</h1>
                  <p className="text-gray-600 mb-6 italic">{formData.excerpt || 'Özet'}</p>
                  <div 
                    className="content"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(formData.content || 'İçerik burada görünecek...') }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Yayın Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Kategori *
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`mt-1 w-full rounded-md border border-gray-300 px-3 py-2 ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Kategori seçin...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tags" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Etiketler
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="etiket1, etiket2, etiket3..."
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Virgülle ayırın</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="rounded"
                  />
                  <Star className="w-4 h-4" />
                  Öne Çıkarılmış
                </label>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                SEO Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">SEO Başlık</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="Arama motorları için başlık..."
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Boş bırakılırsa ana başlık kullanılır</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="meta_description">SEO Açıklama</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateMetaDescription}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Otomatik
                  </Button>
                </div>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Arama sonuçlarında görünecek açıklama..."
                  className={`mt-1 ${errors.meta_description ? 'border-red-500' : ''}`}
                  rows={3}
                />
                <div className="flex justify-between mt-1">
                  {errors.meta_description ? (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.meta_description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Google'da görünecek</p>
                  )}
                  <p className="text-sm text-gray-500">{formData.meta_description.length}/160</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Öne Çıkan Görsel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öne Çıkan Görsel
                </label>
                <ImageUploadAPI
                  onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  currentImage={formData.image_url}
                  maxSize={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                İstatistikler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Kelime Sayısı
                </span>
                <Badge variant="outline">{wordCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Okuma Süresi
                </span>
                <Badge variant="outline">{readingTime} dakika</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Oluşturulma
                </span>
                <Badge variant="outline">Şimdi</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 