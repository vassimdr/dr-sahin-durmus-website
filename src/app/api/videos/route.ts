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

// Türkçe karakterleri destekleyen slug oluşturma fonksiyonu
function createSlug(text: string): string {
  const turkishMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I',
    'İ': 'i', 'i': 'i',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };

  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

// GET - Videoları listele
export async function GET(request: NextRequest) {
  try {
    console.log('🎬 Videos API GET request received');
    
    const supabase = await createSupabaseServer();
    console.log('🎬 Supabase client created');
    
    const { searchParams } = new URL(request.url);
    
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    console.log('🎬 Query params:', { published, featured, category, limit, offset });

    let query = supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (published === 'true') {
      query = query.eq('is_published', true);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (category) {
      query = query.eq('category_id', parseInt(category));
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (parseInt(limit || '10') - 1));
    }

    console.log('🎬 Executing query...');
    const { data, error } = await query;

    if (error) {
      console.error('❌ Videos fetch error:', error);
      return NextResponse.json({ 
        error: 'Videolar alınamadı', 
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ Videos fetched successfully:', data?.length || 0, 'videos');

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('❌ Videos API error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// POST - Yeni video ekle
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const body = await request.json();
    console.log('🎬 Video creation request:', body);

    const {
      title,
      description,
      content,
      video_url,
      thumbnail_url,
      duration,
      file_size,
      video_format,
      resolution,
      category_id,
      tags,
      is_published = false,
      is_featured = false,
      is_public = true,
      meta_title,
      meta_description
    } = body;

    // Validasyon
    if (!title || !description || !video_url) {
      return NextResponse.json({ 
        error: 'Eksik alanlar',
        details: 'Başlık, açıklama ve video URL zorunludur'
      }, { status: 400 });
    }

    // Slug oluştur ve benzersizlik kontrolü
    let baseSlug = createSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Slug benzersizlik kontrolü
    while (true) {
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existingVideo) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Video kaydını oluştur
    const videoData = {
      title: title.trim(),
      slug,
      description: description.trim(),
      content: content?.trim() || null,
      video_url: video_url.trim(),
      thumbnail_url: thumbnail_url?.trim() || null,
      duration: duration || null,
      file_size: file_size || null,
      video_format: video_format || null,
      resolution: resolution || null,
      category_id: category_id || null,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []),
      is_published,
      is_featured,
      is_public,
      meta_title: meta_title?.trim() || title.trim(),
      meta_description: meta_description?.trim() || description.trim(),
      published_date: is_published ? new Date().toISOString().split('T')[0] : null,
      view_count: 0,
      like_count: 0,
      download_count: 0
    };

    console.log('🎬 Creating video:', videoData);

    const { data, error } = await supabase
      .from('videos')
      .insert([videoData])
      .select()
      .single();

    if (error) {
      console.error('❌ Video creation error:', error);
      return NextResponse.json({ 
        error: 'Video oluşturulamadı',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Video created successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Video başarıyla oluşturuldu',
      data
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Video POST error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 