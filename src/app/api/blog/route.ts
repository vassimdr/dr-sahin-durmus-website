import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side Supabase client oluştur
async function createSupabaseServer() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

// Kelime sayısı hesaplama
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Okuma süresi hesaplama (dakika)
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200; // Ortalama okuma hızı
  const wordCount = countWords(text);
  return Math.ceil(wordCount / wordsPerMinute);
}

// GET - Blog yazılarını listele
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (published === 'true') {
      query = query.eq('is_published', true);
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

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (parseInt(limit || '10') - 1));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Blog posts fetch error:', error);
      return NextResponse.json({ 
        error: 'Blog yazıları alınamadı', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// POST - Yeni blog yazısı ekle
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const body = await request.json();
    console.log('📝 Blog post creation request:', body);

    const {
      title,
      content,
      excerpt,
      image_url,
      category,
      tags,
      is_published = false,
      is_featured = false,
      author_name = 'Dr. Şahin Durmuş',
      meta_title,
      meta_description
    } = body;

    // Validasyon
    if (!title || !content || !excerpt || !category) {
      return NextResponse.json({ 
        error: 'Eksik alanlar',
        details: 'Başlık, içerik, özet ve kategori zorunludur'
      }, { status: 400 });
    }

    // Slug oluştur ve benzersizlik kontrolü
    let baseSlug = createSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Slug benzersizlik kontrolü
    while (true) {
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existingPost) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // İçerik analizi
    const wordCount = countWords(content);
    const readingTime = calculateReadingTime(content);

    // Blog yazısını oluştur - mevcut database schema'ya uygun
    const blogPost = {
      title: title.trim(),
      slug,
      content: content.trim(),
      excerpt: excerpt.trim(),
      image_url: image_url?.trim() || null,
      category: category.trim(),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []),
      published: is_published, // is_published -> published
      featured: is_featured, // is_featured -> featured
      author: author_name.trim(), // author_name -> author
      meta_title: meta_title?.trim() || title.trim(),
      meta_description: meta_description?.trim() || excerpt.trim(),
      published_date: is_published ? new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // published_date gerekli
      read_time: `${readingTime} dk`, // reading_time -> read_time string formatında
      view_count: 0
    };

    console.log('📝 Creating blog post:', blogPost);

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogPost])
      .select()
      .single();

    if (error) {
      console.error('❌ Blog post creation error:', error);
      return NextResponse.json({ 
        error: 'Blog yazısı oluşturulamadı',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Blog post created successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Blog yazısı başarıyla oluşturuldu',
      data
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Blog POST error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 