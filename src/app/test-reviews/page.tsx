"use client";

import { useState, useEffect } from 'react';

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
}

export default function TestReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        console.log('🔄 Test sayfası - Yorumlar yükleniyor...');
        
        const response = await fetch('/api/reviews?approved=true');
        console.log('📡 Test - API response:', response.status, response.ok);
        
        if (!response.ok) {
          throw new Error('API hatası');
        }
        
        const data = await response.json();
        console.log('📝 Test - Gelen veri:', data);
        console.log('📝 Test - Veri tipi:', typeof data);
        console.log('📝 Test - Array mi?:', Array.isArray(data));
        console.log('📝 Test - Keys:', Object.keys(data));
        
        // Eğer data bir object ise ve reviews property'si varsa
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if (data.reviews) {
            console.log('📝 Test - data.reviews kullanılıyor');
            setReviews(data.reviews);
          } else if (data.data) {
            console.log('📝 Test - data.data kullanılıyor');
            setReviews(data.data);
          } else {
            console.log('📝 Test - Veri yapısı beklenmedik:', data);
            setReviews([]);
          }
        } else if (Array.isArray(data)) {
          console.log('📝 Test - Direkt array kullanılıyor');
          setReviews(data);
        } else {
          console.log('📝 Test - Veri formatı tanınmıyor');
          setReviews([]);
        }
        
        console.log('✅ Test - State güncellendi');
        
      } catch (err) {
        console.error('❌ Test - Hata:', err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  console.log('🎯 Test Render:', { 
    reviewsCount: reviews.length, 
    loading, 
    error,
    reviews: reviews.slice(0, 2) // İlk 2 yorumu göster
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-2xl font-bold mb-4">Test Sayfası - Yükleniyor...</h1>
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Test Sayfası - Hata</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">Test Sayfası - Yorumlar</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <strong>Debug Bilgisi:</strong>
        <br />
        Toplam Yorum: {reviews.length}
        <br />
        Öne Çıkan: {reviews.filter(r => r.is_featured).length}
        <br />
        Normal: {reviews.filter(r => !r.is_featured).length}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-xl">Hiç yorum bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{review.patient_name}</h3>
                  <p className="text-sm text-gray-600">{review.treatment_category}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                  <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                </div>
              </div>
              
              <p className="text-gray-700 italic mb-4">"{review.review_text}"</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Faydalı: {review.helpful_count}</span>
                <span>{review.is_featured ? '⭐ Öne Çıkan' : 'Normal'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 