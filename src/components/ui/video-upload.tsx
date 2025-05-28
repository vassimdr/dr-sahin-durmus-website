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
  Loader2,
  Play,
  FileVideo,
  Clock,
  HardDrive
} from 'lucide-react';

interface VideoUploadProps {
  onVideoUploaded: (data: {
    url: string;
    filename: string;
    size: number;
    format: string;
    duration?: number;
    resolution?: string;
  }) => void;
  currentVideo?: string;
  maxSize?: number; // MB cinsinden
  accept?: string[];
}

export function VideoUpload({ 
  onVideoUploaded, 
  currentVideo, 
  maxSize = 500,
  accept = ['video/mp4', 'video/webm', 'video/avi', 'video/quicktime', 'video/x-msvideo']
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentVideo || null);
  const [videoMetadata, setVideoMetadata] = useState<{
    duration?: number;
    resolution?: string;
    size?: number;
    format?: string;
  }>({});

  // Video metadata çıkarma
  const extractVideoMetadata = (file: File): Promise<{duration?: number, resolution?: string}> => {
    return new Promise((resolve) => {
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
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Süreyi formatla
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadVideo = async (file: File) => {
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
        throw new Error('Desteklenmeyen video formatı. Sadece MP4, WebM, AVI, MOV formatları kabul edilir.');
      }

      console.log('Uploading video:', file.name);
      setUploadProgress(10);

      // Video metadata çıkar
      const metadata = await extractVideoMetadata(file);
      setVideoMetadata({
        ...metadata,
        size: file.size,
        format: file.name.split('.').pop()?.toLowerCase()
      });

      setUploadProgress(25);

      // FormData oluştur
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(50);

      // Video upload API'sini kullan
      const response = await fetch('/api/upload-video', {
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
      setUploadProgress(100);

      // Callback'i çağır
      onVideoUploaded({
        url: result.url,
        filename: result.filename,
        size: result.size,
        format: result.format,
        duration: metadata.duration,
        resolution: metadata.resolution
      });

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
      uploadVideo(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.avi', '.mov', '.mkv']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const removeVideo = () => {
    setPreview(null);
    setVideoMetadata({});
    onVideoUploaded({
      url: '',
      filename: '',
      size: 0,
      format: ''
    });
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
              <FileVideo className="w-12 h-12 text-gray-400" />
            )}
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {uploading ? 'Video yükleniyor...' : 'Video yükleyin'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isDragActive 
                  ? 'Video dosyasını buraya bırakın...' 
                  : `Sürükle-bırak yapın veya tıklayın (Max ${maxSize}MB)`
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                MP4, WebM, AVI, MOV formatları desteklenir
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="bg-gray-100 rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Video yüklendi
                </p>
                <div className="mt-1 space-y-1">
                  {videoMetadata.duration && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDuration(videoMetadata.duration)}
                    </div>
                  )}
                  {videoMetadata.resolution && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FileVideo className="w-3 h-3" />
                      {videoMetadata.resolution}
                    </div>
                  )}
                  {videoMetadata.size && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <HardDrive className="w-3 h-3" />
                      {formatFileSize(videoMetadata.size)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeVideo}
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
            Video yükleniyor... %{uploadProgress}
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
          <p className="text-sm text-green-700">Video başarıyla yüklendi!</p>
        </div>
      )}
    </div>
  );
} 