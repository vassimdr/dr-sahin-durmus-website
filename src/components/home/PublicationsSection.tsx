"use client";

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

const publications = [
  { name: "Hürriyet Gazetesi", category: "Gazete", year: "2023" },
  { name: "Milliyet Sağlık", category: "Dergi", year: "2023" },
  { name: "Sabah Gazetesi", category: "Gazete", year: "2022" },
  { name: "Sağlık Dergisi", category: "Dergi", year: "2022" },
  { name: "Diş Hekimliği Dergisi", category: "Akademik", year: "2021" },
  { name: "Anadolu Ajansı", category: "Haber Ajansı", year: "2021" }
];

export default function PublicationsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="w-full py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Medya Yayınları
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Uzmanlığımız ve başarılarımız ulusal medyada yer alıyor. 
            Diş sağlığı konusundaki bilgi birikimimizi toplumla paylaşıyoruz.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Publications List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publications.map((publication, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {publication.category}
                    </span>
                    <span className="text-xs text-slate-500">{publication.year}</span>
                  </div>
                  <h4 className="font-medium text-slate-900 text-sm">{publication.name}</h4>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Medyada Yer Alan Başarılarımız</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Kliniğimiz ve tedavi başarılarımız, çeşitli ulusal medya organlarında yer almıştır. 
                Diş sağlığı alanındaki yenilikçi yaklaşımlarımız ve hasta memnuniyetimiz 
                medyanın dikkatini çekmeye devam ediyor.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Bu yayınlar, hastalarımızı bilgilendirme ve toplumu ağız ve diş sağlığı 
                konusunda bilinçlendirme misyonumuzun bir parçasıdır.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-slate-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">15+</div>
                <div className="text-sm text-slate-600">Medya Haberi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">5</div>
                <div className="text-sm text-slate-600">Akademik Yayın</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">3</div>
                <div className="text-sm text-slate-600">Ödül</div>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                <Link href="/medya-yayinlari">Tüm Yayınları Gör</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 