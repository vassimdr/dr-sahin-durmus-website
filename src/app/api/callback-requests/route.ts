import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json();

    // Validation
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'İsim ve telefon numarası gereklidir' },
        { status: 400 }
      );
    }

    // Telefon numarası formatını kontrol et
    const phoneRegex = /^[0-9\s\-\+\(\)]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Geçerli bir telefon numarası giriniz' },
        { status: 400 }
      );
    }

    // Supabase'e kaydet
    if (supabase) {
      const { data, error } = await supabase
        .from('callback_requests')
        .insert([
          {
            name: name.trim(),
            phone: phone.trim(),
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Veritabanı hatası' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Talebiniz alındı! En kısa sürede sizi arayacağız.',
        data
      });
    } else {
      // Supabase yoksa mock response
      return NextResponse.json({
        success: true,
        message: 'Talebiniz alındı! En kısa sürede sizi arayacağız.',
        data: {
          id: Date.now(),
          name,
          phone,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Callback request error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (supabase) {
      let query = supabase
        .from('callback_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Veritabanı hatası' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data || [],
        total: count || 0
      });
    } else {
      // Mock data
      return NextResponse.json({
        success: true,
        data: [],
        total: 0
      });
    }
  } catch (error) {
    console.error('Get callback requests error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 