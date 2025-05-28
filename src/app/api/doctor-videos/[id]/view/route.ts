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

// POST - Video görüntülenme sayısını artır
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id);
    
    if (isNaN(videoId)) {
      return NextResponse.json({ 
        error: 'Geçersiz video ID' 
      }, { status: 400 });
    }

    console.log(`📊 Incrementing view count for video ${videoId}`);

    const supabase = await createSupabaseServer();

    // Video var mı kontrol et
    const { data: video, error: fetchError } = await supabase
      .from('doctor_videos')
      .select('id, view_count, title')
      .eq('id', videoId)
      .eq('is_active', true)
      .single();

    if (fetchError || !video) {
      console.error('❌ Video not found:', fetchError);
      return NextResponse.json({ 
        error: 'Video bulunamadı' 
      }, { status: 404 });
    }

    // View count artır
    const { data, error } = await supabase
      .from('doctor_videos')
      .update({ 
        view_count: video.view_count + 1 
      })
      .eq('id', videoId)
      .select('view_count')
      .single();

    if (error) {
      console.error('❌ View count increment error:', error);
      return NextResponse.json({ 
        error: 'Görüntülenme sayısı artırılamadı',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ View count incremented for "${video.title}": ${video.view_count} -> ${data.view_count}`);

    return NextResponse.json({
      success: true,
      message: 'Görüntülenme sayısı artırıldı',
      data: {
        video_id: videoId,
        new_view_count: data.view_count
      }
    });

  } catch (error) {
    console.error('❌ View count increment error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 