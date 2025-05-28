"use client";

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity, Star, Wrench, Shield } from "lucide-react";
import { ConsultationButton } from "@/components/ui/WhatsAppButton";

const services = [
  {
    title: "Genel Diş Hekimliği",
    description: "Rutin kontrollerden başlayarak, diş çürükleri, kanal tedavileri ve diş çekimi işlemlerinizi güvenle gerçekleştiriyoruz.",
    icon: Activity,
    features: ["Dolgu Tedavileri", "Kanal Tedavisi", "Diş Çekimi"]
  },
  {
    title: "Estetik Diş Hekimliği",
    description: "Diş beyazlatma, veneer kaplama ve gülüş tasarımı ile hayalinizdeki gülüşe kavuşun.",
    icon: Star,
    features: ["Diş Beyazlatma", "Veneer", "Gülüş Tasarımı"]
  },
  {
    title: "İmplant Tedavisi",
    description: "Eksik dişlerinizi en doğal görünümde yeniden kazanmanız için modern implant sistemleri kullanıyoruz.",
    icon: Wrench,
    features: ["Tek Diş İmplant", "Çoklu İmplant", "All-on-4"]
  },
  {
    title: "Ortodonti",
    description: "Diş tel tedavileri ve şeffaf plak sistemiyle dişlerinizi düzeltip mükemmel bir gülüş elde edin.",
    icon: Shield,
    features: ["Metal Braket", "Seramik Braket", "Şeffaf Plak"]
  }
];

export default function ServicesPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="w-full py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Kapsamlı Diş Sağlığı Hizmetleri
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Modern teknoloji ve uzman kadromuzla, diş sağlığınızın her alanında size hizmet veriyoruz.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-slate-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{service.description}</p>
                
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <div className="bg-blue-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Size Uygun Tedavi Planı</h3>
            <p className="text-slate-600 mb-6">
              Ücretsiz muayene ile kişisel tedavi planınızı oluşturalım ve sorularınızı yanıtlayalım.
            </p>
            <div className="flex justify-center">
              <ConsultationButton className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 