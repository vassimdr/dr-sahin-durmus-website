// Reviews (Yorumlar) yönetim sistemi

export interface Review {
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

// Treatment kategorileri
export const treatmentCategories = {
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

// Sample reviews (başlangıç için)
const sampleReviews: Review[] = [
  {
    id: 1,
    patient_name: 'Ayşe Kaya',
    patient_email: 'ayse@example.com',
    review_text: 'İmplant tedavim için Dr. Şahin Durmuş\'u tercih ettim. Hem işlem öncesi hem de sonrası çok ilgili davrandı. Kliniği çok temiz ve modern. Kesinlikle tavsiye ederim!',
    rating: 5,
    treatment_category: 'implant',
    is_approved: true,
    is_featured: true,
    helpful_count: 12,
    created_at: '2024-03-01T10:00:00Z',
    approved_at: '2024-03-01T14:00:00Z'
  },
  {
    id: 2,
    patient_name: 'Mehmet Öztürk',
    patient_email: 'mehmet@example.com',
    review_text: 'Diş beyazlatma işlemi için gittim. Sonuç harika oldu! Personel çok güler yüzlü ve profesyonel. Fiyatlar da makul seviyede.',
    rating: 5,
    treatment_category: 'beyazlatma',
    is_approved: true,
    is_featured: false,
    helpful_count: 8,
    created_at: '2024-03-03T14:30:00Z',
    approved_at: '2024-03-03T16:00:00Z'
  },
  {
    id: 3,
    patient_name: 'Fatma Demir',
    patient_email: 'fatma@example.com',
    review_text: 'Çocuğumun diş tedavisi için geldik. Doktor çocuklarla çok iyi ilgileniyor, hiç korkmadı. Teşekkür ederiz!',
    rating: 5,
    treatment_category: 'cocuk-dis',
    is_approved: false, // Onay bekliyor
    is_featured: false,
    helpful_count: 0,
    created_at: '2024-03-05T09:15:00Z'
  },
  {
    id: 4,
    patient_name: 'Ali Yılmaz',
    patient_email: 'ali@example.com',
    review_text: 'Ortodonti tedavim devam ediyor. İlk aylarda biraz zorluk yaşasam da doktor ve ekip çok destekleyici. Sonuçları görmeye başladım.',
    rating: 4,
    treatment_category: 'ortodonti',
    is_approved: false, // Onay bekliyor
    is_featured: false,
    helpful_count: 0,
    created_at: '2024-03-06T16:20:00Z'
  },
  {
    id: 5,
    patient_name: 'Zeynep Arslan',
    patient_email: 'zeynep@example.com',
    review_text: 'Acil durumda gittiğim için çok endişeliydim. Ağrım hemen geçti ve tedavi çok hızlı oldu. Personel çok ilgili.',
    rating: 5,
    treatment_category: 'other',
    is_approved: false, // Onay bekliyor
    is_featured: false,
    helpful_count: 0,
    created_at: '2024-03-07T11:45:00Z'
  }
];

// LocalStorage key
const REVIEWS_STORAGE_KEY = 'dental_reviews';
const REVIEWS_COUNTER_KEY = 'dental_reviews_counter';

// Initialize reviews in localStorage
export function initializeReviews(): void {
  if (typeof window === 'undefined') return;
  
  const existing = localStorage.getItem(REVIEWS_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(sampleReviews));
    localStorage.setItem(REVIEWS_COUNTER_KEY, '5');
  }
}

// Get all reviews
export function getAllReviews(): Review[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!stored) {
      initializeReviews();
      return sampleReviews;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [];
  }
}

// Add new review
export function addReview(reviewData: {
  patient_name: string;
  patient_email: string;
  review_text: string;
  rating: number;
  treatment_category: string;
}): Review {
  if (typeof window === 'undefined') throw new Error('Window not available');
  
  const reviews = getAllReviews();
  let counter = parseInt(localStorage.getItem(REVIEWS_COUNTER_KEY) || '0');
  counter++;
  
  const newReview: Review = {
    id: counter,
    ...reviewData,
    is_approved: false,
    is_featured: false,
    helpful_count: 0,
    created_at: new Date().toISOString()
  };
  
  reviews.push(newReview);
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  localStorage.setItem(REVIEWS_COUNTER_KEY, counter.toString());
  
  // Event gönder
  notifyReviewsUpdated();
  
  return newReview;
}

// Event gönderme fonksiyonu
const notifyReviewsUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('reviewsUpdated'));
  }
};

// Update review status
export function updateReviewStatus(
  reviewId: number, 
  updates: {
    is_approved?: boolean;
    is_featured?: boolean;
    admin_notes?: string;
  }
): boolean {
  if (typeof window === 'undefined') return false;
  
  const reviews = getAllReviews();
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) return false;
  
  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    ...updates,
    approved_at: updates.is_approved ? new Date().toISOString() : reviews[reviewIndex].approved_at
  };
  
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  
  // Event gönder
  notifyReviewsUpdated();
  
  return true;
}

// Delete review
export function deleteReview(reviewId: number): boolean {
  if (typeof window === 'undefined') return false;
  
  const reviews = getAllReviews();
  const filteredReviews = reviews.filter(r => r.id !== reviewId);
  
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(filteredReviews));
  
  // Event gönder
  notifyReviewsUpdated();
  
  return true;
}

// Get approved reviews for public display
export function getApprovedReviews(): Review[] {
  return getAllReviews().filter(review => review.is_approved);
}

// Get featured reviews
export function getFeaturedReviews(): Review[] {
  return getAllReviews().filter(review => review.is_featured && review.is_approved);
}

// Get pending reviews
export function getPendingReviews(): Review[] {
  return getAllReviews().filter(review => !review.is_approved);
}

// Get reviews by category
export function getReviewsByCategory(category: string): Review[] {
  return getApprovedReviews().filter(review => review.treatment_category === category);
}

// Get review statistics
export function getReviewStats() {
  const allReviews = getAllReviews();
  const approvedReviews = getApprovedReviews();
  
  return {
    total: allReviews.length,
    pending: allReviews.filter(r => !r.is_approved).length,
    approved: approvedReviews.length,
    featured: allReviews.filter(r => r.is_featured).length,
    averageRating: approvedReviews.length > 0 
      ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
      : '0',
    totalHelpful: approvedReviews.reduce((sum, r) => sum + r.helpful_count, 0),
    byCategory: Object.keys(treatmentCategories).map(key => ({
      category: key,
      name: treatmentCategories[key as keyof typeof treatmentCategories],
      count: approvedReviews.filter(r => r.treatment_category === key).length
    }))
  };
} 