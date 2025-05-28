"use client";

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  ImageIcon, 
  Loader2, 
  AlertCircle,
  Check,
  Camera,
  FileImage,
  Trash2
} from 'lucide-react';
import { uploadImage, validateImageFile, extractPathFromUrl, deleteImage, createThumbnail } from '@/lib/storage';

interface AdvancedImageUploadProps {
  onImageUploaded: (url: string, thumbnailUrl?: string) => void;
  onImageRemoved?: () => void;
  currentImage?: string;
  currentThumbnail?: string;
  folder?: string;
  maxSize?: number; // MB cinsinden
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
  placeholder?: string;
  allowMultiple?: boolean;
  maxFiles?: number;
  showPreview?: boolean;
  className?: string;
}

export function AdvancedImageUpload({
  onImageUploaded,
  onImageRemoved,
  currentImage,
  currentThumbnail,
  folder = 'gallery',
  maxSize = 5,
  aspectRatio = 'auto',
  placeholder = 'Resim yüklemek için tıklayın veya sürükleyin',
  allowMultiple = false,
  maxFiles = 1,
  showPreview = true,
  className = ''
}: AdvancedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0]; // Şimdilik tek dosya
    setError(null);
    
    // Dosya validasyonu
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Geçersiz dosya');
      return;
    }

    // Dosya boyutu kontrolü
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Dosya boyutu ${maxSize}MB'dan büyük olamaz`);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Preview oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Progress simulation (Supabase gerçek progress vermiyor)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Dosyayı upload et
      const imageUrl = await uploadImage(file, folder);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (imageUrl) {
        // Thumbnail oluştur
        const thumbnailUrl = await createThumbnail(imageUrl);
        
        setTimeout(() => {
          onImageUploaded(imageUrl, thumbnailUrl);
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      } else {
        throw new Error('Upload başarısız');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload sırasında bir hata oluştu');
      setUploading(false);
      setUploadProgress(0);
      setPreview(null);
    }
  }, [folder, maxSize, onImageUploaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleRemove = async () => {
    if (currentImage && onImageRemoved) {
      // Supabase'den dosyayı sil
      const filePath = extractPathFromUrl(currentImage);
      if (filePath) {
        await deleteImage(filePath);
      }
      
      setPreview(null);
      onImageRemoved();
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'landscape': return 'aspect-video';
      case 'portrait': return 'aspect-[3/4]';
      default: return 'aspect-auto min-h-[200px]';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : error 
              ? 'border-red-300 bg-red-50'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
          }
          ${getAspectRatioClass()}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-sm text-slate-600 mb-2">Yükleniyor...</p>
              <div className="w-full max-w-xs">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-slate-500 mt-1 text-center">
                  %{uploadProgress}
                </p>
              </div>
            </motion.div>
          ) : preview || currentImage ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-full"
            >
              <Image
                src={preview || currentImage || ''}
                alt="Preview"
                fill
                className="object-cover rounded-lg"
              />
              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {/* Success Overlay */}
              {!uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-lg group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="mb-4">
                <FileImage className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              </div>
              <p className="text-sm text-slate-600 mb-1">{placeholder}</p>
              <p className="text-xs text-slate-500">
                PNG, JPG, WebP (maks. {maxSize}MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto h-auto p-1"
              onClick={() => setError(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {!uploading && !error && (preview || currentImage) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg"
          >
            <Check className="w-4 h-4" />
            Resim başarıyla yüklendi
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Info */}
      {(preview || currentImage) && showPreview && (
        <div className="text-xs text-slate-500">
          <p>Resim yüklendi ve kullanıma hazır</p>
        </div>
      )}
    </div>
  );
} 