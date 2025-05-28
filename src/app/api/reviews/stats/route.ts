import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Review istatistiklerini getir
export async function GET(request: NextRequest) {
  try {
    // Review statistics view'ından veri al
    const { data: stats, error: statsError } = await supabase
      .from('review_statistics')
      .select('*')
      .single();

    if (statsError) {
      console.error('Stats error:', statsError);
      // View yoksa manuel hesaplama yap
      const { data: reviews, error: reviewsError } = await supabase
        .from('patient_reviews')
        .select('rating, is_approved, is_featured, treatment_category');

      if (reviewsError) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      // Manuel istatistik hesaplama
      const approvedReviews = reviews.filter(r => r.is_approved);
      const totalReviews = reviews.length;
      const pendingReviews = reviews.filter(r => !r.is_approved).length;
      const featuredReviews = reviews.filter(r => r.is_featured).length;
      
      const averageRating = approvedReviews.length > 0 
        ? parseFloat((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1))
        : 0;

      const ratingCounts = {
        five_star_count: approvedReviews.filter(r => r.rating === 5).length,
        four_star_count: approvedReviews.filter(r => r.rating === 4).length,
        three_star_count: approvedReviews.filter(r => r.rating === 3).length,
        two_star_count: approvedReviews.filter(r => r.rating === 2).length,
        one_star_count: approvedReviews.filter(r => r.rating === 1).length,
      };

      // Kategori bazında istatistikler
      const categoryCounts = approvedReviews.reduce((acc: any, review: any) => {
        acc[review.treatment_category] = (acc[review.treatment_category] || 0) + 1;
        return acc;
      }, {});

      // Treatment kategorileri mapping
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

      const byCategory = Object.keys(treatmentCategories).map(key => ({
        category: key,
        name: treatmentCategories[key],
        count: categoryCounts[key] || 0
      }));

      return NextResponse.json({
        total_reviews: totalReviews,
        approved_reviews: approvedReviews.length,
        pending_reviews: pendingReviews,
        featured_reviews: featuredReviews,
        average_rating: averageRating,
        ...ratingCounts,
        byCategory
      });
    }

    // Kategori bazında istatistikler
    const { data: categoryStats, error: categoryError } = await supabase
      .from('patient_reviews')
      .select('treatment_category')
      .eq('is_approved', true);

    let byCategory: Array<{category: string, name: string, count: number}> = [];
    if (!categoryError && categoryStats) {
      const categoryCounts = categoryStats.reduce((acc: any, review: any) => {
        acc[review.treatment_category] = (acc[review.treatment_category] || 0) + 1;
        return acc;
      }, {});

      // Treatment kategorileri mapping
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

      byCategory = Object.keys(treatmentCategories).map(key => ({
        category: key,
        name: treatmentCategories[key],
        count: categoryCounts[key] || 0
      }));
    }

    return NextResponse.json({
      total_reviews: stats.total_reviews || 0,
      approved_reviews: stats.approved_reviews || 0,
      pending_reviews: stats.pending_reviews || 0,
      featured_reviews: stats.featured_reviews || 0,
      average_rating: stats.average_rating || 0,
      five_star_count: stats.five_star_count || 0,
      four_star_count: stats.four_star_count || 0,
      three_star_count: stats.three_star_count || 0,
      two_star_count: stats.two_star_count || 0,
      one_star_count: stats.one_star_count || 0,
      byCategory
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 