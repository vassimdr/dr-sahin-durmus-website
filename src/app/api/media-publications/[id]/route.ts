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

// PUT - Medya yayınını güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServer();
    const body = await request.json();
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ 
        error: 'Geçersiz ID',
        details: 'ID sayı olmalıdır'
      }, { status: 400 });
    }

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

    const updateData = {
      title: title.trim(),
      summary: summary?.trim() || null,
      source_name: source_name.trim(),
      source_url: source_url.trim(),
      publication_date,
      image_url: image_url?.trim() || null,
      category: category?.trim() || null,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []),
      is_featured: Boolean(is_featured),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('media_publications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Media publication update error:', error);
      return NextResponse.json({ 
        error: 'Medya yayını güncellenemedi',
        details: error.message
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        error: 'Medya yayını bulunamadı',
        details: 'Belirtilen ID ile medya yayını bulunamadı'
      }, { status: 404 });
    }

    console.log('✅ Media publication updated successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Medya yayını başarıyla güncellendi',
      data
    });

  } catch (error) {
    console.error('❌ Media publication PUT error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// DELETE - Medya yayınını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServer();
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ 
        error: 'Geçersiz ID',
        details: 'ID sayı olmalıdır'
      }, { status: 400 });
    }

    // Önce medya yayınının var olup olmadığını kontrol et
    const { data: existingPublication, error: fetchError } = await supabase
      .from('media_publications')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existingPublication) {
      return NextResponse.json({ 
        error: 'Medya yayını bulunamadı',
        details: 'Belirtilen ID ile medya yayını bulunamadı'
      }, { status: 404 });
    }

    // Medya yayınını sil
    const { error: deleteError } = await supabase
      .from('media_publications')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Media publication delete error:', deleteError);
      return NextResponse.json({ 
        error: 'Medya yayını silinemedi',
        details: deleteError.message
      }, { status: 500 });
    }

    console.log('✅ Media publication deleted successfully:', existingPublication.title);

    return NextResponse.json({
      success: true,
      message: 'Medya yayını başarıyla silindi',
      data: { id, title: existingPublication.title }
    });

  } catch (error) {
    console.error('❌ Media publication DELETE error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// GET - Tek medya yayını getir
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
        error: 'Geçersiz medya yayını ID',
        details: 'Medya yayını ID sayı olmalıdır'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('media_publications')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ 
        error: 'Medya yayını bulunamadı',
        details: 'Belirtilen ID ile medya yayını bulunamadı'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('❌ Media publication GET error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

// PATCH - Medya yayını güncelle
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
        error: 'Geçersiz medya yayını ID',
        details: 'Medya yayını ID sayı olmalıdır'
      }, { status: 400 });
    }

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

    const updateData = {
      title: title.trim(),
      summary: summary?.trim() || null,
      source_name: source_name.trim(),
      source_url: source_url.trim(),
      publication_date,
      image_url: image_url?.trim() || null,
      category: category?.trim() || null,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []),
      is_featured: Boolean(is_featured),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('media_publications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Media publication update error:', error);
      return NextResponse.json({ 
        error: 'Medya yayını güncellenemedi',
        details: error.message
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        error: 'Medya yayını bulunamadı',
        details: 'Belirtilen ID ile medya yayını bulunamadı'
      }, { status: 404 });
    }

    console.log('✅ Media publication updated successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Medya yayını başarıyla güncellendi',
      data
    });

  } catch (error) {
    console.error('❌ Media publication PATCH error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 