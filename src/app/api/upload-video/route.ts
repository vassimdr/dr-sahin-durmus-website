import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side Supabase client oluştur
async function createSupabaseServer() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key kullan
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

// Video metadata çıkarma fonksiyonu
function getVideoMetadata(file: File) {
  return new Promise<{duration?: number, resolution?: string}>((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      const resolution = `${video.videoWidth}x${video.videoHeight}`;
      URL.revokeObjectURL(url);
      resolve({ duration, resolution });
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    
    video.src = url;
  });
}

// Dosya formatını kontrol et
function getVideoFormat(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'mp4': return 'mp4';
    case 'webm': return 'webm';
    case 'avi': return 'avi';
    case 'mov': return 'mov';
    case 'mkv': return 'mkv';
    default: return 'unknown';
  }
}

// Benzersiz dosya adı oluştur
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${cleanName}-${timestamp}-${random}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Video upload request received');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        error: 'Dosya bulunamadı' 
      }, { status: 400 });
    }

    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Dosya boyutu kontrolü (500MB = 524,288,000 bytes)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Dosya boyutu çok büyük. Maksimum ${maxSize / (1024 * 1024)}MB olabilir.` 
      }, { status: 400 });
    }

    // Dosya tipi kontrolü
    const allowedTypes = [
      'video/mp4',
      'video/webm', 
      'video/avi',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/x-matroska' // .mkv
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Desteklenmeyen video formatı. Sadece MP4, WebM, AVI, MOV, MKV formatları kabul edilir.' 
      }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    // Benzersiz dosya adı oluştur
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = `videos/${uniqueFilename}`;

    console.log('📤 Uploading to Supabase Storage:', filePath);

    // Dosyayı ArrayBuffer'a çevir
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Supabase Storage'a yükle
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        duplex: 'half'
      });

    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Video yükleme hatası',
        details: uploadError.message 
      }, { status: 500 });
    }

    console.log('✅ Upload successful:', uploadData);

    // Public URL oluştur
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    const videoUrl = urlData.publicUrl;

    // Video metadata
    const videoFormat = getVideoFormat(file.name);
    
    // Thumbnail oluşturma (opsiyonel - client-side yapılabilir)
    // Bu kısım daha karmaşık olduğu için şimdilik atlıyoruz

    const result = {
      success: true,
      url: videoUrl,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      format: videoFormat,
      path: filePath
    };

    console.log('🎉 Video upload completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Video upload error:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 