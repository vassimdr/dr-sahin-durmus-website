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

export function ImageUploadAPI({ 
  onImageUploaded, 
  currentImage, 
  maxSize = 5,
  accept = ['image/jpeg', 'image/png', 'image/webp']
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [base64Preview, setBase64Preview] = useState<string | null>(null);

  // Varsayılan placeholder fotoğraf - Diş hekimliği temalı
  const defaultPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e0f2fe'/%3E%3Cstop offset='100%25' style='stop-color:%23f0f9ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='200' fill='url(%23bg)'/%3E%3Cg transform='translate(150, 100)'%3E%3C!-- Diş ikonu --%3E%3Cpath d='M-15 -20 Q-20 -30 -10 -30 Q0 -30 10 -30 Q20 -30 15 -20 L15 10 Q15 20 5 20 L-5 20 Q-15 20 -15 10 Z' fill='%23ffffff' stroke='%2306b6d4' stroke-width='2'/%3E%3Cpath d='M-8 -15 Q-3 -20 3 -15 Q8 -10 3 -5 Q-3 0 -8 -5 Q-13 -10 -8 -15' fill='%2306b6d4'/%3E%3C/g%3E%3Ctext x='150' y='140' text-anchor='middle' font-family='system-ui, sans-serif' font-size='14' font-weight='600' fill='%230369a1'%3EDr. Şahin Durmuş%3C/text%3E%3Ctext x='150' y='160' text-anchor='middle' font-family='system-ui, sans-serif' font-size='12' fill='%23075985'%3EBlog Görseli%3C/text%3E%3C/svg%3E";

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Base64 preview oluştur (CSP sorunları için)
      const reader = new FileReader();
      reader.onload = (e) => {
        setBase64Preview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Dosya boyutu kontrolü
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`Dosya boyutu ${maxSize}MB'dan büyük olamaz`);
      }

      // Dosya tipi kontrolü
      if (!accept.includes(file.type)) {
        throw new Error('Desteklenmeyen dosya formatı. Sadece JPG, PNG ve WebP kabul edilir.');
      }

      console.log('Uploading file:', file.name);
      setUploadProgress(25);

      // FormData oluştur
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(50);

      // Kendi API endpoint'imizi kullan
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      setUploadProgress(75);

      const result = await response.json();

      if (!response.ok) {
        console.error('Upload error:', result);
        throw new Error(result.error || `Yükleme hatası: ${response.status}`);
      }

      console.log('Upload success:', result);

      setPreview(result.url);
      onImageUploaded(result.url);
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
    setBase64Preview(null);
    onImageUploaded('');
    setError(null);
  };

  const usePlaceholder = () => {
    setPreview(defaultPlaceholder);
    setBase64Preview(null);
    onImageUploaded(defaultPlaceholder);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!preview && !base64Preview ? (
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
              
              {/* Placeholder seçeneği */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Veya varsayılan görseli kullanın:
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={usePlaceholder}
                  className="text-xs"
                  disabled={uploading}
                >
                  Dr. Şahin Durmuş Logo Kullan
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={base64Preview || preview || ''}
            alt="Yüklenen görsel"
            className="w-full h-48 object-cover rounded-lg border"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => {
              console.error('Image load error:', e);
              // Fallback: Base64 preview kullan
              const target = e.target as HTMLImageElement;
              if (base64Preview && target.src !== base64Preview) {
                target.src = base64Preview;
              } else {
                target.style.display = 'none';
              }
            }}
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