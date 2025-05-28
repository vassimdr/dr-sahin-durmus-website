// Sections will be imported from @/components/home/*
import HeroNew from "@/components/home/HeroNew";
import ServicesPreview from "@/components/home/ServicesPreview";
import DoctorIntroduction from "@/components/home/DoctorIntroduction";
import VideoSection from "@/components/home/VideoSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PublicationsSection from "@/components/home/PublicationsSection";
import BlogPreview from "@/components/home/BlogPreview";
import ContactSnippet from "@/components/home/ContactSnippet";
import CallbackForm from "@/components/home/CallbackForm";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main className="flex flex-col items-center">
        <HeroNew />
        <ServicesPreview />
        <DoctorIntroduction />
        <VideoSection />
        <TestimonialsSection />
        
        {/* Geri Arama Formu */}
        <section className="py-20 bg-white w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
              <CallbackForm />
            </div>
          </div>
        </section>
        
        <PublicationsSection />
        <BlogPreview />
        <ContactSnippet />
      </main>
    </div>
  );
}
