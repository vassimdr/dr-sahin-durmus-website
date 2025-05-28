import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { status, notes } = await request.json();

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'called', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum' },
        { status: 400 }
      );
    }

    if (supabase) {
      const updateData: any = {};
      
      if (status) {
        updateData.status = status;
        if (status === 'called' || status === 'completed') {
          updateData.called_at = new Date().toISOString();
        }
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('callback_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Veritabanı hatası' },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Kayıt bulunamadı' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Güncelleme başarılı',
        data
      });
    } else {
      // Mock response
      return NextResponse.json({
        success: true,
        message: 'Güncelleme başarılı',
        data: {
          id,
          status,
          notes,
          updated_at: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Update callback request error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    if (supabase) {
      const { error } = await supabase
        .from('callback_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Veritabanı hatası' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Kayıt silindi'
      });
    } else {
      // Mock response
      return NextResponse.json({
        success: true,
        message: 'Kayıt silindi'
      });
    }
  } catch (error) {
    console.error('Delete callback request error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 