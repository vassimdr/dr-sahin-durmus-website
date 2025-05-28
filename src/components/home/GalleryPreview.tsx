import { Button } from "@/components/ui/button";
// import Image from "next/image"; // Temporarily comment out
import Link from "next/link";

const GalleryPreview = () => {
  // Placeholder images - replace with actual image paths or Supabase URLs later
  const images = [
    { id: 1, src: "https://via.placeholder.com/400x300/E0E7FF/4338CA?text=Klinik+Görseli+1", alt: "Klinik görseli 1" },
    { id: 2, src: "https://via.placeholder.com/400x300/D1FAE5/059669?text=Çalışma+Anı+1", alt: "Çalışma anı 1" },
    { id: 3, src: "https://via.placeholder.com/400x300/FEF3C7/D97706?text=Ekip+Fotoğrafı", alt: "Ekip fotoğrafı" },
  ];

  return (
    <section id="gallery-preview" className="w-full py-16 lg:py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Klinik Ortamımız ve Çalışmalarımızdan Kareler
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
            Modern ve hijyenik kliniğimizden bazı kesitler.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {images.map((image) => (
            <div key={image.id} className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg shadow-lg group bg-slate-200 flex items-center justify-center">
              {/* <Image 
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              /> */}
              <span className="text-slate-500 text-sm">{image.alt}</span> {/* Placeholder text */}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/galeri">Tüm Galeriyi Görüntüle</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview; 