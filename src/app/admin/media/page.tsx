"use client";

import MediaPublicationsManager from '@/components/admin/MediaPublicationsManager';

export default function AdminMediaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <MediaPublicationsManager />
      </div>
    </div>
  );
} 