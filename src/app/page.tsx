// Sections will be imported from @/components/home/*
import HeroNew from "@/components/home/HeroNew";
import ServicesPreview from "@/components/home/ServicesPreview";
import DoctorIntroduction from "@/components/home/DoctorIntroduction";
import VideoSection from "@/components/home/VideoSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PublicationsSection from "@/components/home/PublicationsSection";
import BlogPreview from "@/components/home/BlogPreview";
import ContactSnippet from "@/components/home/ContactSnippet";

export default function HomePage() {
  return (
    <div className="min-h-screen">
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
