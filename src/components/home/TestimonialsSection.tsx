"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { MessageSquare, X, Star, Send } from 'lucide-react';
import { QuickAppointmentButton, ConsultationButton } from "@/components/ui/WhatsAppButton";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  initializeReviews, 
  addReview, 
  getApprovedReviews, 
  treatmentCategories 
} from '@/lib/reviews';

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    treatment: '',
    rating: 5,
    comment: ''
  });
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Component mount edildiğinde reviews'u yükle
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        
        // Onaylanmış ve öne çıkan yorumları çek
        const response = await fetch('/api/reviews?approved=true&featured=true');
        
        if (response.ok) {
          const reviews = await response.json();
          
          // Ana sayfada gösterilecek öne çıkan yorumları al (en fazla 3 tane)
          const featuredTestimonials = reviews
            .slice(0, 3)
            .map((review: any) => ({
              id: review.id,
              name: review.patient_name,
              title: treatmentCategories[review.treatment_category as keyof typeof treatmentCategories] || review.treatment_category,
              comment: review.review_text,
              rating: review.rating
            }));

          setTestimonials(featuredTestimonials);
        } else {
          console.error('Failed to load testimonials');
        }
      } catch (error) {
        console.error('Error loading testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-500' : 'text-slate-300'}`}>
        ★
      </span>
    ));
  };

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

  return (
    <section ref={ref} className="w-full py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Hasta Deneyimleri
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tedavi gören hastalarımızın deneyimlerini okuyun ve güvenle randevunuzu alın.
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {loading ? (
            // Loading state
            [1, 2, 3, 4, 5, 6].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300"
              >
                <div className="animate-pulse">
                  <div className="flex mb-4">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className="text-sm text-slate-300">★</span>
                    ))}
                  </div>
                  <div className="h-20 bg-slate-100 rounded-lg mb-6"></div>
                  <div className="border-t border-slate-100 pt-4">
                    <div className="h-4 bg-slate-100 rounded-lg mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded-lg w-1/2"></div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : testimonials.length > 0 ? testimonials.concat(
            // Ek örnek yorumlar ekle
            [
              {
                id: 'sample1',
                name: 'Ayşe Kaya',
                title: 'Diş Beyazlatma',
                comment: 'Harika bir deneyimdi. Diş beyazlatma işlemi çok profesyonelce yapıldı ve sonuç beklentimin üzerinde çıktı.',
                rating: 5
              },
              {
                id: 'sample2', 
                name: 'Mehmet Öz',
                title: 'İmplant Tedavisi',
                comment: 'İmplant tedavim çok başarılı geçti. Doktor çok deneyimli ve klinikte kendimi güvende hissettim.',
                rating: 5
              },
              {
                id: 'sample3',
                name: 'Zeynep Ak',
                title: 'Ortodonti',
                comment: 'Şeffaf plak tedavim 8 ayda tamamlandı. Dişlerim artık çok düzgün ve gülüşüme çok güveniyorum.',
                rating: 4
              }
            ]
          ).slice(0, 6).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 group"
            >
              {/* Rating */}
              <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
              
              {/* Comment */}
              <p className="text-slate-700 mb-6 leading-relaxed text-sm font-light italic">
                "{testimonial.comment}"
              </p>
              
              {/* Author */}
              <div className="border-t border-slate-100 pt-4">
                <div className="font-medium text-slate-900 text-sm">{testimonial.name}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">{testimonial.title}</div>
              </div>
              
              {/* Subtle accent */}
              <div className="absolute top-4 right-4 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          )) : (
            // Fallback testimonialler
            [1, 2, 3, 4, 5, 6].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">Henüz öne çıkan yorum yok</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

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

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Siz de Randevunuzu Alın</h3>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            Ücretsiz muayene için randevunuzu alın, tedavi seçeneklerinizi birlikte değerlendirelim.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <QuickAppointmentButton className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12" />
            <ConsultationButton className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-12 bg-white border" />
            
            {/* Review Button */}
            <Button
              onClick={() => setShowReviewForm(true)}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50 px-8 h-12 bg-white border flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Yorumunuzu Paylaşın
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 