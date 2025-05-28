import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase server client oluştur
async function createSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// GET - Medya yayınlarını listele
export async function GET(request: NextRequest) {
  try {
    console.log('📰 Media publications API GET request received');
    
    const supabase = await createSupabaseServer();
    const { searchParams } = new URL(request.url);
    
    const source = searchParams.get('source'); // Belirli kaynak filtresi
    const featured = searchParams.get('featured'); // Öne çıkan yayınlar
    const category = searchParams.get('category'); // Kategori filtresi
    const limit = searchParams.get('limit'); // Limit

    let query = supabase
      .from('media_publications')
      .select('*')
      .eq('is_active', true)
      .order('publication_date', { ascending: false });

    // Filtreler
    if (source) {
      query = query.eq('source_name', source);
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Media publications fetch error:', error);
      return NextResponse.json({ 
        error: 'Medya yayınları alınamadı', 
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Media publications fetched successfully:', data?.length || 0, 'publications');

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('❌ Media publications API error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// POST - Yeni medya yayını ekle
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const body = await request.json();
    
    const {
      title,
      summary,
      source_name,
      source_url,
      publication_date,
      image_url,
      category,
      tags,
      is_featured = false
    } = body;

    // Validasyon
    if (!title || !source_name || !source_url || !publication_date) {
      return NextResponse.json({ 
        error: 'Eksik alanlar',
        details: 'Başlık, kaynak, URL ve yayın tarihi zorunludur'
      }, { status: 400 });
    }

    const publicationData = {
      title: title.trim(),
      summary: summary?.trim() || null,
      source_name: source_name.trim(),
      source_url: source_url.trim(),
      publication_date,
      image_url: image_url?.trim() || null,
      category: category?.trim() || null,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []),
      is_featured: Boolean(is_featured)
    };

    const { data, error } = await supabase
      .from('media_publications')
      .insert([publicationData])
      .select()
      .single();

    if (error) {
      console.error('❌ Media publication creation error:', error);
      return NextResponse.json({ 
        error: 'Medya yayını oluşturulamadı',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Media publication created successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Medya yayını başarıyla oluşturuldu',
      data
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Media publication POST error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 