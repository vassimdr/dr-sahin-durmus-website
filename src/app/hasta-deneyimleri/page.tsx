"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Star, Quote, Heart, Award, Users, Calendar, CheckCircle, MessageSquare, X, Send } from "lucide-react";
import { QuickAppointmentButton, ConsultationButton } from '@/components/ui/WhatsAppButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Veritabanından veri çekmek için gerekli tipler
interface Review {
  id: number;
  patient_name: string;
  patient_email: string;
  review_text: string;
  rating: number;
  treatment_category: string;
  is_approved: boolean;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  approved_at?: string;
  admin_notes?: string;
}

interface ReviewStats {
  total_reviews: number;
  approved_reviews: number;
  pending_reviews: number;
  featured_reviews: number;
  average_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
}

// Tedavi kategorileri çevirisi
const treatmentCategories: { [key: string]: string } = {
  'implant': 'İmplant Tedavisi',
  'ortodonti': 'Ortodonti',
  'estetik': 'Estetik Diş Hekimliği',
  'beyazlatma': 'Diş Beyazlatma',
  'kanal': 'Kanal Tedavisi',
  'cekim': 'Diş Çekimi',
  'dolgu': 'Dolgu',
  'protez': 'Protez',
  'cocuk-dis': 'Çocuk Diş Hekimliği',
  'periodontoloji': 'Diş Eti Tedavisi',
  'other': 'Diğer'
};

export default function HastaDeneyimleriPage() {
  const ref = useRef(null);
  // useInView yerine basit bir state kullanıyoruz
  const [isVisible, setIsVisible] = useState(true); // Her zaman true
  
  // State'ler
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Yorum formu state'leri
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    treatment: '',
    rating: 5,
    comment: ''
  });

  // Verileri yükle
  useEffect(() => {
    loadReviews();
  }, []);

  // Veriler değiştiğinde yeniden render için
  useEffect(() => {
    console.log('🔄 State değişti, yeniden render:', {
      reviewsLength: reviews.length,
      statsExists: !!stats,
      loading,
      error
    });
  }, [reviews, stats, loading, error]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      console.log('🔄 Yorumlar yükleniyor...');
      
      // Onaylanmış yorumları çek
      const reviewsResponse = await fetch('/api/reviews?approved=true');
      console.log('📡 Reviews API response:', reviewsResponse.status, reviewsResponse.ok);
      
      if (!reviewsResponse.ok) {
        throw new Error('Yorumlar yüklenemedi');
      }
      const reviewsData = await reviewsResponse.json();
      console.log('📝 Reviews data:', reviewsData);
      console.log('📝 Reviews data type:', typeof reviewsData, Array.isArray(reviewsData));
      
      // İstatistikleri çek
      const statsResponse = await fetch('/api/reviews/stats');
      console.log('📊 Stats API response:', statsResponse.status, statsResponse.ok);
      
      if (!statsResponse.ok) {
        throw new Error('İstatistikler yüklenemedi');
      }
      const statsData = await statsResponse.json();
      console.log('📈 Stats data:', statsData);
      
      // Veri formatını kontrol et ve doğru şekilde set et
      if (Array.isArray(reviewsData)) {
        setReviews(reviewsData);
      } else if (reviewsData && reviewsData.reviews) {
        setReviews(reviewsData.reviews);
      } else if (reviewsData && reviewsData.data) {
        setReviews(reviewsData.data);
      } else {
        console.warn('⚠️ Beklenmedik veri formatı:', reviewsData);
        setReviews([]);
      }
      
      setStats(statsData);
      console.log('✅ Veriler state\'e kaydedildi');
      
    } catch (err) {
      console.error('❌ Veri yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
      console.log('🏁 Loading tamamlandı');
    }
  };

  // Öne çıkan yorumlar (featured)
  const featuredReviews = reviews.filter(review => review.is_featured);
  
  // Diğer onaylanmış yorumlar
  const regularReviews = reviews.filter(review => !review.is_featured);

  console.log('🎯 Render durumu:', {
    totalReviews: reviews.length,
    featuredReviews: featuredReviews.length,
    regularReviews: regularReviews.length,
    loading,
    error
  });

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Yıldızları render et
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
        }`}
      />
    ));
  };

  // Yorum gönderme fonksiyonu
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // API'ye yorum gönder
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: reviewForm.name,
          patient_email: reviewForm.email,
          review_text: reviewForm.comment,
          rating: reviewForm.rating,
          treatment_category: reviewForm.treatment
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Yorum gönderilemedi');
      }

      const result = await response.json();
      console.log('Review submitted successfully:', result);
      
      alert('Yorumunuz başarıyla gönderildi! İnceleme sonrası yayınlanacaktır.');
      
      // Form'u temizle ve kapat
      setReviewForm({ name: '', email: '', treatment: '', rating: 5, comment: '' });
      setShowReviewForm(false);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error instanceof Error ? error.message : 'Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Yorumlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Hata: {error}</p>
          <Button onClick={loadReviews}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  // İstatistikler (varsayılan değerler)
  const defaultStats = [
    { icon: Users, value: stats?.approved_reviews?.toString() || "0", label: "Mutlu Hasta" },
    { icon: Star, value: stats?.average_rating?.toFixed(1) || "0.0", label: "Ortalama Puan" },
    { icon: Award, value: "98%", label: "Tavsiye Oranı" },
    { icon: CheckCircle, value: "100%", label: "Başarı Oranı" }
  ];

  return (
    <div ref={ref} className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Hasta Deneyimleri
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Hastalarımızın gerçek deneyimleri ve tedavi süreçleriyle ilgili yorumları. 
              Her bir gülüş hikayesi bizim için değerli.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 text-center"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Hasta Memnuniyeti</h2>
            <p className="text-slate-600">Hastalarımızın deneyimlerinden çıkan rakamlar</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {defaultStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="bg-slate-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Öne Çıkan Deneyimler</h2>
            <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto">
              Hastalarımızın yaşamlarını değiştiren tedavi hikayeleri
            </p>
          </motion.div>

          {featuredReviews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              {featuredReviews.slice(0, 2).map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="bg-slate-50 rounded-xl p-8 relative"
                >
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-200" />
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {review.patient_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{review.patient_name}</div>
                        <div className="text-sm text-slate-500">{formatDate(review.created_at)}</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Öne Çıkan
                    </Badge>
                  </div>

                  {/* Treatment & Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {treatmentCategories[review.treatment_category] || review.treatment_category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-slate-600 leading-relaxed italic">
                    "{review.review_text}"
                  </p>

                  {/* Helpful count */}
                  {review.helpful_count > 0 && (
                    <div className="flex items-center gap-1 mt-4 text-sm text-slate-500">
                      <Heart className="w-4 h-4" />
                      {review.helpful_count} kişi faydalı buldu
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Öne çıkan deneyim yükleniyor...</p>
            </div>
          )}
        </div>
      </section>

      {/* All Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Tüm Yorumlar</h2>
            <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto">
              Hastalarımızın tedavi süreçleri hakkındaki samimi görüşleri
            </p>
          </motion.div>

          {regularReviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-slate-600 font-medium text-sm">
                          {review.patient_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{review.patient_name}</div>
                        <div className="text-xs text-slate-500">{formatDate(review.created_at)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Treatment */}
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 mb-3">
                    {treatmentCategories[review.treatment_category] || review.treatment_category}
                  </Badge>

                  {/* Content */}
                  <p className="text-slate-600 text-sm leading-relaxed italic mb-4">
                    "{review.review_text}"
                  </p>

                  {/* Helpful count */}
                  {review.helpful_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Heart className="w-3 h-3" />
                      {review.helpful_count} faydalı
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Yorumlar yükleniyor...</p>
            </div>
          )}
        </div>
      </section>

      {/* Yorum yoksa mesaj */}
      {reviews.length === 0 && !loading && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Henüz Onaylanmış Yorum Yok</h2>
            <p className="text-slate-600 mb-8">İlk yorumu siz bırakın!</p>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-slate-50 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto"
          >
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Siz de Hikayenizin Parçası Olun
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Binlerce hastamız gibi siz de sağlıklı ve güzel bir gülüşe kavuşun. 
              Ücretsiz muayenenizi hemen ayırtın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <QuickAppointmentButton className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12" />
              <ConsultationButton className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-12 bg-white border" />
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Güvenli Tedavi
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Deneyimli Kadro
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Modern Teknoloji
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Review Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        {/* Call to Action Text Bubble */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="absolute bottom-20 right-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 p-3 max-w-48 animate-pulse"
        >
          <div className="text-sm font-medium text-slate-900 mb-1">
            💬 Siz de yorumunuzu yapın!
          </div>
          <div className="text-xs text-slate-600">
            Deneyiminizi paylaşarak diğer hastalara yardım edin
          </div>
          {/* Arrow pointing to button */}
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-200 translate-y-px"></div>
          
          {/* Close button for the bubble */}
          <button 
            className="absolute top-1 right-1 w-4 h-4 text-slate-400 hover:text-slate-600 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.parentElement?.classList.add('hidden');
            }}
          >
            ×
          </button>
        </motion.div>

        {/* Pulse Ring Animation */}
        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
        <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-50"></div>
        
        <Button
          onClick={() => setShowReviewForm(true)}
          className="relative bg-green-600 hover:bg-green-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full w-16 h-16 p-0 group animate-bounce"
          title="Yorumunuzu Paylaşın"
          style={{
            animation: 'bounce 2s infinite, glow 2s ease-in-out infinite alternate'
          }}
        >
          <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
          
          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            Yorumunuzu Paylaşın
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      </motion.div>

      {/* Custom CSS for glow animation */}
      <style jsx>{`
        @keyframes glow {
          from {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
          }
          to {
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.6);
          }
        }
      `}</style>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Yorumunuzu Paylaşın
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviewForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Adınız</Label>
                    <Input
                      id="name"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Adınızı girin"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="E-posta adresinizi girin"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="treatment">Aldığınız Tedavi</Label>
                    <select
                      value={reviewForm.treatment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, treatment: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tedavi türünü seçin</option>
                      {Object.entries(treatmentCategories).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Değerlendirme</Label>
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: i + 1 }))}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              i < reviewForm.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment">Yorumunuz</Label>
                    <Textarea
                      id="comment"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Deneyiminizi detaylı olarak paylaşın..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="text-xs text-gray-500">
                    Yorumunuz inceleme sonrası yayınlanacaktır.
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Yorumu Gönder
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
} 