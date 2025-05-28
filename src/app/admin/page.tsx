import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Video, FileText, Newspaper, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Dr. Şahin Durmuş web sitesi yönetim paneline hoş geldiniz
        </p>
      </div>

      {/* Management Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Yönetim Paneli</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Hasta Yorumları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Hasta değerlendirmelerini onaylayın, reddedin veya öne çıkarın
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/reviews">Yorumları Yönet</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Video Sistemi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Klinik videolarını ekleyin, düzenleyin ve yönetin
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/videos">Video Yönetimi</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Blog Sistemi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Blog yazılarını ekleyin, düzenleyin ve yayınlayın
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/blog">Blog Yönetimi</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Newspaper className="h-5 w-5 mr-2" />
                Medya Yayınları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gazete ve dergi yayınlarını ekleyin ve yönetin
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/media">Medya Yönetimi</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Galeri Sistemi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Klinik fotoğraflarını ve tedavi görsellerini yönetin
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/gallery">Galeri Yönetimi</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 