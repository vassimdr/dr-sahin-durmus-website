import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Galeri item tipi
interface GalleryItem {
  id?: number;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category: string;
  treatment_type?: string;
  patient_age_group?: string;
  is_before_after?: boolean;
  sort_order?: number;
  is_featured?: boolean;
  is_active?: boolean;
  alt_text?: string;
  tags?: string[];
}

// Supabase client oluşturma fonksiyonu
async function createSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component'ta cookie set edilemez
          }
        },
      },
    }
  );
}

// GET - Galeri öğelerini getir
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    // Query parametreleri
    const category = searchParams.get('category');
    const treatment = searchParams.get('treatment');
    const featured = searchParams.get('featured');
    const beforeAfter = searchParams.get('before_after');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page') || '1';
    
    // Base query
    let query = supabase
      .from('gallery')
      .select('*')
      .eq('is_active', true);
    
    // Filtreleme
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (treatment && treatment !== 'all') {
      query = query.eq('treatment_type', treatment);
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
    if (beforeAfter === 'true') {
      query = query.eq('is_before_after', true);
    }
    
    // Sıralama
    query = query.order('sort_order', { ascending: true })
                 .order('created_at', { ascending: false });
    
    // Sayfalama
    if (limit) {
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      const offset = (pageNum - 1) * limitNum;
      query = query.range(offset, offset + limitNum - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Gallery fetch error:', error);
      return NextResponse.json(
        { error: 'Galeri öğeleri alınamadı', details: error.message },
        { status: 500 }
      );
    }
    
    // Kategori ve tedavi istatistikleri
    const { data: categoryStats } = await supabase
      .from('gallery')
      .select('category')
      .eq('is_active', true);
    
    const { data: treatmentStats } = await supabase
      .from('gallery')
      .select('treatment_type')
      .eq('is_active', true)
      .not('treatment_type', 'is', null);
    
    const categories = categoryStats?.reduce((acc: any, item: any) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}) || {};
    
    const treatments = treatmentStats?.reduce((acc: any, item: any) => {
      if (item.treatment_type) {
        acc[item.treatment_type] = (acc[item.treatment_type] || 0) + 1;
      }
      return acc;
    }, {}) || {};
    
    return NextResponse.json({
      success: true,
      data,
      pagination: limit ? {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0
      } : null,
      stats: {
        categories,
        treatments,
        total: data?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}

// POST - Yeni galeri öğesi ekle
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const body: GalleryItem = await request.json();
    
    // Gerekli alanları kontrol et
    if (!body.title || !body.image_url || !body.category) {
      return NextResponse.json(
        { error: 'Başlık, görsel URL ve kategori gereklidir' },
        { status: 400 }
      );
    }
    
    // Veri hazırlığı
    const galleryData = {
      title: body.title,
      description: body.description || null,
      image_url: body.image_url,
      thumbnail_url: body.thumbnail_url || null,
      category: body.category,
      treatment_type: body.treatment_type || null,
      patient_age_group: body.patient_age_group || null,
      is_before_after: body.is_before_after || false,
      sort_order: body.sort_order || 0,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== false, // Default true
      alt_text: body.alt_text || body.title,
      tags: body.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('gallery')
      .insert([galleryData])
      .select()
      .single();
    
    if (error) {
      console.error('Gallery insert error:', error);
      return NextResponse.json(
        { error: 'Galeri öğesi eklenemedi', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Galeri öğesi başarıyla eklendi'
    });
    
  } catch (error) {
    console.error('Gallery POST error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
} 