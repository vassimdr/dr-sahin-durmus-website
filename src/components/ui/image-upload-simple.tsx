"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { Progress } from './progress';
import { 
  Upload, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  maxSize?: number; // MB cinsinden
  accept?: string[];
}

export function ImageUploadSimple({ 
  onImageUploaded, 
  currentImage, 
  maxSize = 5,
  accept = ['image/jpeg', 'image/png', 'image/webp']
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Dosya boyutu kontrolü
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`Dosya boyutu ${maxSize}MB'dan büyük olamaz`);
      }

      // Dosya tipi kontrolü
      if (!accept.includes(file.type)) {
        throw new Error('Desteklenmeyen dosya formatı. Sadece JPG, PNG ve WebP kabul edilir.');
      }

      // Benzersiz dosya adı oluştur
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('Uploading file:', fileName);
      setUploadProgress(25);

      // FormData oluştur
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(50);

      // Supabase Storage API'sine doğrudan fetch ile yükle
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/blog-images/${fileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: formData
        }
      );

      setUploadProgress(75);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Upload error:', errorData);
        throw new Error(`Yükleme hatası: ${response.status} ${response.statusText}`);
      }

      // Public URL oluştur
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-images/${fileName}`;

      console.log('Public URL:', publicUrl);

      setPreview(publicUrl);
      onImageUploaded(publicUrl);
      setUploadProgress(100);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Yükleme hatası');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadImage(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const removeImage = () => {
    setPreview(null);
    onImageUploaded('');
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {uploading ? (
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {uploading ? 'Yükleniyor...' : 'Görsel yükleyin'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isDragActive 
                  ? 'Dosyayı buraya bırakın...' 
                  : `Sürükle-bırak yapın veya tıklayın (Max ${maxSize}MB)`
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP formatları desteklenir
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Yüklenen görsel"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeImage}
            className="absolute top-2 right-2"
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-500 text-center">
            Yükleniyor... %{uploadProgress}
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {preview && !uploading && !error && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-sm text-green-700">Görsel başarıyla yüklendi!</p>
        </div>
      )}
    </div>
  );
} 