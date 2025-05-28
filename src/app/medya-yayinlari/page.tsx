import { Metadata } from 'next';
import MediaPublications from '@/components/blog/MediaPublications';

export const metadata: Metadata = {
  title: 'Medya Yayınları | Dr. Şahin Durmuş',
  description: 'Dr. Şahin Durmuş\'un ulusal medyada yer alan yazıları, röportajları ve uzman görüşleri. Diş sağlığı ve estetik diş hekimliği konularında medya yayınları.',
  keywords: 'Dr. Şahin Durmuş, medya yayınları, diş hekimi röportaj, basında çıkan haberler, diş sağlığı haberleri, estetik diş hekimliği medya',
};

export default function MediaPublicationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <MediaPublications />
      </div>
    </div>
  );
} 