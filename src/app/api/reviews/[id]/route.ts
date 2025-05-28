import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// PATCH - Yorum durumunu güncelle (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { is_approved, is_featured, admin_notes } = body;

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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

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