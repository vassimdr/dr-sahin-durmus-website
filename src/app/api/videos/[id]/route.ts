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

// GET - Tek video getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ 
        error: 'Geçersiz video ID',
        details: 'Video ID sayı olmalıdır'
      }, { status: 400 });
    }

    console.log('🎬 Getting video:', id);

    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        video_categories (
          id,
          name,
          slug,
          icon
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Video fetch error:', error);
      return NextResponse.json({ 
        error: 'Video bulunamadı',
        details: error.message 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Video GET error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// PATCH - Video güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    console.log('🎬 Video update request:', { id, body });

    if (isNaN(id)) {
      return NextResponse.json({ 
        error: 'Geçersiz video ID',
        details: 'Video ID sayı olmalıdır'
      }, { status: 400 });
    }

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
      is_published,
      is_featured,
      is_public,
      meta_title,
      meta_description
    } = body;

    // Mevcut videoyu kontrol et
    const { data: existingVideo, error: fetchError } = await supabase
      .from('videos')
      .select('id, title, slug, published_date')
      .eq('id', id)
      .single();

    if (fetchError || !existingVideo) {
      return NextResponse.json({ 
        error: 'Video bulunamadı' 
      }, { status: 404 });
    }

    // Slug güncelleme (başlık değiştiyse)
    let slug = existingVideo.slug;
    if (title && title !== existingVideo.title) {
      let baseSlug = createSlug(title);
      let newSlug = baseSlug;
      let counter = 1;

      // Slug benzersizlik kontrolü (mevcut video hariç)
      while (true) {
        const { data: conflictVideo } = await supabase
          .from('videos')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', id)
          .single();

        if (!conflictVideo) break;
        
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      slug = newSlug;
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (slug !== existingVideo.slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description.trim();
    if (content !== undefined) updateData.content = content?.trim() || null;
    if (video_url !== undefined) updateData.video_url = video_url.trim();
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url?.trim() || null;
    if (duration !== undefined) updateData.duration = duration;
    if (file_size !== undefined) updateData.file_size = file_size;
    if (video_format !== undefined) updateData.video_format = video_format;
    if (resolution !== undefined) updateData.resolution = resolution;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []);
    }
    if (is_published !== undefined) updateData.is_published = is_published;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (is_public !== undefined) updateData.is_public = is_public;
    if (meta_title !== undefined) updateData.meta_title = meta_title?.trim() || null;
    if (meta_description !== undefined) updateData.meta_description = meta_description?.trim() || null;

    // Yayın tarihi güncelleme
    if (is_published !== undefined) {
      if (is_published && !existingVideo.published_date) {
        updateData.published_date = new Date().toISOString().split('T')[0];
      } else if (!is_published) {
        updateData.published_date = null;
      }
    }

    updateData.updated_at = new Date().toISOString();

    console.log('🎬 Updating video with data:', updateData);

    const { data, error } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Video update error:', error);
      return NextResponse.json({ 
        error: 'Video güncellenemedi',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Video updated successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Video başarıyla güncellendi',
      data
    });

  } catch (error) {
    console.error('❌ Video PATCH error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// DELETE - Video sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ 
        error: 'Geçersiz video ID',
        details: 'Video ID sayı olmalıdır'
      }, { status: 400 });
    }

    console.log('🗑️ Deleting video:', id);

    // Önce videoyu kontrol et
    const { data: existingVideo, error: fetchError } = await supabase
      .from('videos')
      .select('id, video_url')
      .eq('id', id)
      .single();

    if (fetchError || !existingVideo) {
      return NextResponse.json({ 
        error: 'Video bulunamadı' 
      }, { status: 404 });
    }

    // Video dosyasını Supabase Storage'dan sil (opsiyonel)
    if (existingVideo.video_url) {
      try {
        // URL'den dosya yolunu çıkar
        const url = new URL(existingVideo.video_url);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const filePath = `videos/${fileName}`;

        const { error: storageError } = await supabase.storage
          .from('videos')
          .remove([filePath]);

        if (storageError) {
          console.warn('Storage file deletion warning:', storageError);
          // Storage silme hatası kritik değil, devam et
        }
      } catch (storageError) {
        console.warn('Storage deletion error:', storageError);
        // Storage silme hatası kritik değil, devam et
      }
    }

    // Veritabanından videoyu sil
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Video deletion error:', error);
      return NextResponse.json({ 
        error: 'Video silinemedi',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Video deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Video başarıyla silindi'
    });

  } catch (error) {
    console.error('❌ Video DELETE error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 