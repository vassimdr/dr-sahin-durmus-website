import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client (environment variables'dan alınacak)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Tüm yorumları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'approved', 'pending', 'all'
    const approved = searchParams.get('approved'); // 'true', 'false'
    const featured = searchParams.get('featured'); // 'true', 'false'
    
    let query = supabase
      .from('patient_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    // Status filtresi
    if (status === 'approved' || approved === 'true') {
      query = query.eq('is_approved', true);
    } else if (status === 'pending' || approved === 'false') {
      query = query.eq('is_approved', false);
    }

    // Featured filtresi
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Yeni yorum ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient_name, patient_email, review_text, rating, treatment_category } = body;

    // Validation
    if (!patient_name || !patient_email || !review_text || !rating || !treatment_category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patient_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // IP ve User Agent bilgilerini al
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Database'e ekle
    const { data, error } = await supabase
      .from('patient_reviews')
      .insert({
        patient_name,
        patient_email,
        review_text,
        rating,
        treatment_category,
        ip_address: ip,
        user_agent: userAgent,
        is_approved: false, // Default olarak onay bekliyor
        is_featured: false,
        helpful_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Review submitted successfully',
      review: data 
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Yorum durumunu güncelle (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_approved, is_featured, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    
    if (typeof is_approved === 'boolean') {
      updateData.is_approved = is_approved;
      if (is_approved) {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = 'admin'; // Bu gerçek uygulamada session'dan alınacak
      }
    }
    
    if (typeof is_featured === 'boolean') {
      updateData.is_featured = is_featured;
    }
    
    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes;
    }

    const { data, error } = await supabase
      .from('patient_reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Review updated successfully',
      review: data 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Yorumu sil (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('patient_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database delete error:', error);
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 