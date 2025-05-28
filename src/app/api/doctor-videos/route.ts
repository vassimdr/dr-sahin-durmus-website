import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side Supabase client oluştur
async function createSupabaseServer() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
}

// GET - Tüm videoları getir
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { searchParams } = new URL(request.url);
    
    // Query parametreleri
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const limit = searchParams.get('limit');

    console.log('🎬 Getting doctor videos with params:', { category, active, limit });

    let query = supabase
      .from('doctor_videos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    // Kategori filtresi
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Aktif durum filtresi
    if (active === 'true') {
      query = query.eq('is_active', true);
    } else if (active === 'false') {
      query = query.eq('is_active', false);
    }

    // Limit
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Doctor videos fetch error:', error);
      return NextResponse.json({ 
        error: 'Videolar getirilemedi',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Doctor videos fetched:', data?.length || 0, 'videos');

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Doctor Videos GET error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// POST - Yeni video oluştur
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const body = await request.json();

    console.log('🎬 Creating new doctor video:', body);

    const {
      title,
      description,
      video_url,
      thumbnail_url,
      duration,
      category,
      is_active = true,
      sort_order = 0
    } = body;

    // Validasyon
    if (!title?.trim()) {
      return NextResponse.json({ 
        error: 'Video başlığı zorunludur',
        details: 'title alanı boş olamaz'
      }, { status: 400 });
    }

    if (!description?.trim()) {
      return NextResponse.json({ 
        error: 'Video açıklaması zorunludur',
        details: 'description alanı boş olamaz'
      }, { status: 400 });
    }

    if (!video_url?.trim()) {
      return NextResponse.json({ 
        error: 'Video URL zorunludur',
        details: 'video_url alanı boş olamaz'
      }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ 
        error: 'Kategori zorunludur',
        details: 'category alanı boş olamaz'
      }, { status: 400 });
    }

    // Kategori validasyonu
    const validCategories = ['tanıtım', 'tedavi', 'bilgilendirme', 'hasta-deneyimi', 'teknoloji'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ 
        error: 'Geçersiz kategori',
        details: `Kategori şunlardan biri olmalı: ${validCategories.join(', ')}`
      }, { status: 400 });
    }

    if (!duration || duration <= 0) {
      return NextResponse.json({ 
        error: 'Geçerli video süresi zorunludur',
        details: 'duration 0\'dan büyük olmalı'
      }, { status: 400 });
    }

    // Video oluştur
    const { data, error } = await supabase
      .from('doctor_videos')
      .insert({
        title: title.trim(),
        description: description.trim(),
        video_url: video_url.trim(),
        thumbnail_url: thumbnail_url?.trim() || null,
        duration: parseInt(duration),
        category,
        is_active: Boolean(is_active),
        sort_order: parseInt(sort_order) || 0,
        view_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Doctor video creation error:', error);
      return NextResponse.json({ 
        error: 'Video oluşturulamadı',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Doctor video created:', data);

    return NextResponse.json({
      success: true,
      message: 'Video başarıyla oluşturuldu',
      data
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Doctor Video POST error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 