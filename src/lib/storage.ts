import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket adı
export const STORAGE_BUCKET = 'gallery-images';

// Dosya upload fonksiyonu
export async function uploadImage(file: File, path?: string): Promise<string | null> {
  try {
    // Dosya adını benzersiz yap
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    // Dosyayı upload et
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Public URL'i al
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

// Dosya silme fonksiyonu
export async function deleteImage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

// Thumbnail oluşturma fonksiyonu
export async function createThumbnail(imageUrl: string): Promise<string> {
  // Supabase'in image transformation özelliğini kullan
  return `${imageUrl}?tr=w-300,h-300,c-force`;
}

// Dosya boyutu kontrol fonksiyonu
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Dosya türü kontrolü
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Sadece resim dosyaları yüklenebilir' };
  }

  // Boyut kontrolü (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Dosya boyutu 5MB\'dan büyük olamaz' };
  }

  // Desteklenen formatlar
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return { isValid: false, error: 'Desteklenen formatlar: JPEG, PNG, WebP' };
  }

  return { isValid: true };
}

// URL'den dosya yolunu çıkarma
export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Supabase storage URL format: /storage/v1/object/public/bucket-name/file-path
    const bucketIndex = pathParts.indexOf(STORAGE_BUCKET);
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    return null;
  } catch {
    return null;
  }
} 