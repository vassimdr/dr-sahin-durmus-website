'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Check, X, Eye, MessageSquare, Clock, Users, EyeOff, Heart, Calendar, User, Filter, Search, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { 
  treatmentCategories,
  type Review
} from '@/lib/reviews';

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

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      // Tüm yorumları çek
      const reviewsResponse = await fetch('/api/reviews');
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      }
      
      // İstatistikleri çek
      const statsResponse = await fetch('/api/reviews/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    // Filter by status
    let statusMatch = true;
    if (filter === 'pending') statusMatch = !review.is_approved;
    if (filter === 'approved') statusMatch = review.is_approved;
    if (filter === 'featured') statusMatch = review.is_featured;

    // Filter by search term
    const searchMatch = !searchTerm || 
      review.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatmentCategories[review.treatment_category as keyof typeof treatmentCategories]?.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  const handleApprove = async (reviewId: number) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_approved: true }),
      });
      
      if (response.ok) {
        loadReviews();
      } else {
        console.error('Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_approved: false }),
      });
      
      if (response.ok) {
        loadReviews();
      } else {
        console.error('Failed to reject review');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleToggleFeatured = async (reviewId: number, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_featured: !isFeatured }),
      });
      
      if (response.ok) {
        loadReviews();
      } else {
        console.error('Failed to toggle featured status');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (confirm('Bu yorumu kalıcı olarak silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          loadReviews();
        } else {
          console.error('Failed to delete review');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (selectedReview) {
      try {
        const response = await fetch(`/api/reviews/${selectedReview.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ admin_notes: adminNotes }),
        });
        
        if (response.ok) {
          setSelectedReview(null);
          setAdminNotes('');
          loadReviews();
        } else {
          console.error('Failed to save notes');
        }
      } catch (error) {
        console.error('Error saving notes:', error);
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Yorum Yönetimi</h1>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold">{reviews.length} Toplam Yorum</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tümü ({reviews.length})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Bekleyen ({stats?.pending || 0})
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('approved')}
              >
                Onaylanan ({stats?.approved || 0})
              </Button>
              <Button
                variant={filter === 'featured' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('featured')}
              >
                Öne Çıkan ({stats?.featured || 0})
              </Button>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Hasta adı, yorum veya tedavi türü ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          // Loading state
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Yorumlar yükleniyor...</p>
          </div>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <Badge variant={review.is_approved ? 'default' : 'secondary'}>
                        {review.is_approved ? 'Onaylı' : 'Bekliyor'}
                      </Badge>
                      {review.is_featured && (
                        <Badge variant="outline" className="border-purple-300 text-purple-700">
                          Öne Çıkan
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {review.patient_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {review.patient_email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(review.created_at).toLocaleDateString('tr-TR')}
                      </div>
                      <Badge variant="outline">
                        {treatmentCategories[review.treatment_category as keyof typeof treatmentCategories]}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      "{review.review_text}"
                    </p>
                    
                    {review.admin_notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Admin Notları:</strong> {review.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {!review.is_approved ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(review.id)}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reddet
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(review.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <EyeOff className="h-4 w-4 mr-1" />
                        Gizle
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleFeatured(review.id, review.is_featured)}
                      className={review.is_featured ? "border-purple-300 text-purple-700" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${review.is_featured ? 'fill-current' : ''}`} />
                      {review.is_featured ? 'Çıkar' : 'Öne Çıkar'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReview(review);
                        setAdminNotes(review.admin_notes || '');
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Not
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(review.id)}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Arama kriterlerinize uygun yorum bulunamadı.' : 'Henüz yorum bulunmuyor.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Admin Notes Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Admin Notları</CardTitle>
              <p className="text-sm text-gray-600">
                {selectedReview.patient_name} - {treatmentCategories[selectedReview.treatment_category as keyof typeof treatmentCategories]}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Bu yorum hakkında notlarınızı ekleyin..."
                rows={4}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedReview(null);
                    setAdminNotes('');
                  }}
                >
                  İptal
                </Button>
                <Button onClick={handleSaveNotes}>
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 