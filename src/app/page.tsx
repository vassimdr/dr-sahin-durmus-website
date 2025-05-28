// Sections will be imported from @/components/home/*
import HeroNew from "@/components/home/HeroNew";
import ServicesPreview from "@/components/home/ServicesPreview";
import DoctorIntroduction from "@/components/home/DoctorIntroduction";
import VideoSection from "@/components/home/VideoSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PublicationsSection from "@/components/home/PublicationsSection";
import BlogPreview from "@/components/home/BlogPreview";
import ContactSnippet from "@/components/home/ContactSnippet";
import Link from 'next/link'
import { Settings } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Admin Panel Giriş Linki (Dev için) */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link 
          href="/admin/login"
          className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          title="Admin Panel"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      <main className="flex flex-col items-center">
        <HeroNew />
        <ServicesPreview />
        <DoctorIntroduction />
        <VideoSection />
        <TestimonialsSection />
        <PublicationsSection />
        <BlogPreview />
        <ContactSnippet />
      </main>
    </div>
  );
}
