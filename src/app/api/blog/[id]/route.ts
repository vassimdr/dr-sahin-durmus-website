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

// GET - Tek blog yazısını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    const { id } = await params;
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Blog post fetch error:', error);
      return NextResponse.json({ error: 'Blog yazısı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
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

// PATCH - Blog yazısını güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    const { id } = await params;
    const body = await request.json();
    
    console.log('📝 Blog post update request:', body);
    
    // Map to correct database column names and add processing
    const updateData: any = {};
    
    if (body.title) {
      updateData.title = body.title.trim();
      updateData.slug = createSlug(body.title);
    }
    
    if (body.content) updateData.content = body.content.trim();
    if (body.excerpt) updateData.excerpt = body.excerpt.trim();
    if (body.image_url !== undefined) updateData.image_url = body.image_url?.trim() || null;
    if (body.category) updateData.category = body.category.trim();
    if (body.meta_title !== undefined) updateData.meta_title = body.meta_title?.trim() || null;
    if (body.meta_description !== undefined) updateData.meta_description = body.meta_description?.trim() || null;
    if (body.tags) updateData.tags = Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    
    // Handle published status
    if (body.published !== undefined) {
      updateData.published = body.published;
      // Set published_date when publishing
      if (body.published && !body.published_date) {
        updateData.published_date = new Date().toISOString().split('T')[0];
      }
    }
    
    if (body.featured !== undefined) updateData.featured = body.featured;
    
    // Calculate reading time if content is updated
    if (body.content) {
      const wordCount = body.content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
      const readingTime = Math.ceil(wordCount / 200);
      updateData.read_time = `${readingTime} dk`;
    }

    console.log('📝 Mapped update data:', updateData);

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Blog post update error:', error);
      return NextResponse.json({ 
        error: 'Blog yazısı güncellenemedi',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Blog post updated successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Blog yazısı başarıyla güncellendi',
      data
    });
  } catch (error) {
    console.error('❌ Blog PATCH error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// DELETE - Blog yazısını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    const { id } = await params;
    
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Blog post delete error:', error);
      return NextResponse.json({ error: 'Blog yazısı silinemedi' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Blog yazısı başarıyla silindi' });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 