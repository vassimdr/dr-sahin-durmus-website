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

    console.log('🎬 Getting doctor video:', id);

    const { data, error } = await supabase
      .from('doctor_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Doctor video fetch error:', error);
      return NextResponse.json({ 
        error: 'Video bulunamadı',
        details: error.message
      }, { status: 404 });
    }

    console.log('✅ Doctor video fetched:', data);

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Doctor Video GET error:', error);
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

    if (isNaN(id)) {
      return NextResponse.json({ 
        error: 'Geçersiz video ID',
        details: 'Video ID sayı olmalıdır'
      }, { status: 400 });
    }

    console.log('🎬 Updating doctor video:', id, body);

    const {
      title,
      description,
      video_url,
      thumbnail_url,
      duration,
      category,
      is_active,
      sort_order
    } = body;

    // Güncelleme verilerini hazırla
    const updateData: any = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (video_url !== undefined) updateData.video_url = video_url.trim();
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url?.trim() || null;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (category !== undefined) {
      // Kategori validasyonu
      const validCategories = ['tanıtım', 'tedavi', 'bilgilendirme', 'hasta-deneyimi', 'teknoloji'];
      if (!validCategories.includes(category)) {
        return NextResponse.json({ 
          error: 'Geçersiz kategori',
          details: `Kategori şunlardan biri olmalı: ${validCategories.join(', ')}`
        }, { status: 400 });
      }
      updateData.category = category;
    }
    if (is_active !== undefined) updateData.is_active = is_active;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    // updated_at otomatik olarak trigger tarafından güncellenir

    const { data, error } = await supabase
      .from('doctor_videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Doctor video update error:', error);
      return NextResponse.json({ 
        error: 'Video güncellenemedi',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Doctor video updated:', data);

    return NextResponse.json({
      success: true,
      message: 'Video başarıyla güncellendi',
      data
    });
  } catch (error) {
    console.error('❌ Doctor Video PATCH error:', error);
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

    console.log('🎬 Deleting doctor video:', id);

    // Önce video var mı kontrol et
    const { data: existingVideo, error: fetchError } = await supabase
      .from('doctor_videos')
      .select('id, title, video_url')
      .eq('id', id)
      .single();

    if (fetchError || !existingVideo) {
      return NextResponse.json({ 
        error: 'Video bulunamadı',
        details: 'Silinecek video mevcut değil'
      }, { status: 404 });
    }

    // Video dosyasını sil (TODO: Supabase Storage'dan silme)
    // if (existingVideo.video_url) {
    //   // Storage'dan dosya silme işlemi burada yapılabilir
    // }

    // Veritabanından sil
    const { error } = await supabase
      .from('doctor_videos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Doctor video delete error:', error);
      return NextResponse.json({ 
        error: 'Video silinemedi',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Doctor video deleted:', existingVideo.title);

    return NextResponse.json({
      success: true,
      message: 'Video başarıyla silindi'
    });
  } catch (error) {
    console.error('❌ Doctor Video DELETE error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 