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

// GET - Video kategorilerini listele
export async function GET(request: NextRequest) {
  try {
    console.log('📂 Video categories API GET request received');
    
    const supabase = await createSupabaseServer();
    console.log('📂 Supabase client created');
    
    const { searchParams } = new URL(request.url);
    
    const active = searchParams.get('active');
    const withCounts = searchParams.get('with_counts');

    console.log('📂 Query params:', { active, withCounts });

    let query = supabase
      .from('video_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    console.log('📂 Executing query...');
    const { data, error } = await query;

    if (error) {
      console.error('❌ Video categories fetch error:', error);
      return NextResponse.json({ 
        error: 'Video kategorileri alınamadı', 
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ Video categories fetched successfully:', data?.length || 0, 'categories');

    // Video sayılarını da getir (istenirse)
    if (withCounts === 'true' && data) {
      console.log('📂 Fetching video counts for categories...');
      const categoriesWithCounts = await Promise.all(
        data.map(async (category) => {
          const { count } = await supabase
            .from('videos')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_published', true);
          
          return {
            ...category,
            video_count: count || 0
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: categoriesWithCounts,
        count: categoriesWithCounts.length
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('❌ Video categories API error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// POST - Yeni video kategorisi ekle
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const body = await request.json();
    console.log('📂 Video category creation request:', body);

    const {
      name,
      slug,
      description,
      icon,
      sort_order = 0,
      is_active = true
    } = body;

    // Validasyon
    if (!name || !slug) {
      return NextResponse.json({ 
        error: 'Eksik alanlar',
        details: 'Kategori adı ve slug zorunludur'
      }, { status: 400 });
    }

    // Slug benzersizlik kontrolü
    const { data: existingCategory } = await supabase
      .from('video_categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingCategory) {
      return NextResponse.json({ 
        error: 'Bu slug zaten kullanılıyor',
        details: 'Farklı bir slug seçin'
      }, { status: 400 });
    }

    const categoryData = {
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
      icon: icon?.trim() || null,
      sort_order,
      is_active
    };

    console.log('📂 Creating video category:', categoryData);

    const { data, error } = await supabase
      .from('video_categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      console.error('❌ Video category creation error:', error);
      return NextResponse.json({ 
        error: 'Video kategorisi oluşturulamadı',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Video category created successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Video kategorisi başarıyla oluşturuldu',
      data
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Video category POST error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 