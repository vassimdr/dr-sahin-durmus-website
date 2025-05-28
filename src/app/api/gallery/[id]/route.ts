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

// GET - Belirli bir galeri öğesini getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Gallery item fetch error:', error);
      return NextResponse.json(
        { error: 'Galeri öğesi bulunamadı', details: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}

// PUT - Galeri öğesini güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    const id = parseInt(params.id);
    const body: Partial<GalleryItem> = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }
    
    // Mevcut öğeyi kontrol et
    const { data: existing, error: fetchError } = await supabase
      .from('gallery')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Galeri öğesi bulunamadı' },
        { status: 404 }
      );
    }
    
    // Güncellenecek verileri hazırla
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Sadece gönderilen alanları güncelle
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.thumbnail_url !== undefined) updateData.thumbnail_url = body.thumbnail_url;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.treatment_type !== undefined) updateData.treatment_type = body.treatment_type;
    if (body.patient_age_group !== undefined) updateData.patient_age_group = body.patient_age_group;
    if (body.is_before_after !== undefined) updateData.is_before_after = body.is_before_after;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.alt_text !== undefined) updateData.alt_text = body.alt_text;
    if (body.tags !== undefined) updateData.tags = body.tags;
    
    const { data, error } = await supabase
      .from('gallery')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Gallery update error:', error);
      return NextResponse.json(
        { error: 'Galeri öğesi güncellenemedi', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Galeri öğesi başarıyla güncellendi'
    });
    
  } catch (error) {
    console.error('Gallery PUT error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}

// DELETE - Galeri öğesini sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }
    
    // Soft delete (is_active = false) kullan
    const { data, error } = await supabase
      .from('gallery')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Gallery delete error:', error);
      return NextResponse.json(
        { error: 'Galeri öğesi silinemedi', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Galeri öğesi başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Gallery DELETE error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
} 