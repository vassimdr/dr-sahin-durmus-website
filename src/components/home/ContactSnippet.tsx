"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { QuickAppointmentButton, ConsultationButton } from "@/components/ui/WhatsAppButton";

const ContactSnippet = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const contactInfo = [
    {
      icon: Phone,
      label: "Telefon",
      value: "+90 (532) 123 45 67",
      href: "tel:+905321234567",
      action: "Hemen Arayın"
    },
    {
      icon: Mail,
      label: "E-posta",
      value: "info@drakadiskliniği.com",
      href: "mailto:info@drakadiskliniği.com",
      action: "E-posta Gönderin"
    },
    {
      icon: MapPin,
      label: "Adres",
      value: "Merkez Mahallesi, Sağlık Caddesi No:15, İstanbul",
      href: "#",
      action: "Harita ile Görün"
    },
    {
      icon: Clock,
      label: "Çalışma Saatleri",
      value: "Pazartesi - Cumartesi: 09:00 - 18:00",
      href: "#",
      action: "Randevu Alın"
    }
  ];

  return (
    <section ref={ref} className="w-full py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Sağlıklı Bir Gülüşe Hazır Mısınız?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Randevunuzu hemen alın ve diş sağlığınız için uzman desteği alın. 
            Size en uygun tedavi planını birlikte oluşturalım.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Dr. Şahin DURMUŞ Diş Kliniği</h3>
                <p className="text-slate-600">
                  Modern diş hekimliği uygulamaları ile sağlıklı gülüşler
                </p>
              </div>

              <div className="grid gap-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{info.label}</div>
                        <div className="text-slate-600 text-sm mt-1">{info.value}</div>
                        {info.href !== "#" && (
                          <Link href={info.href} className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block">
                            {info.action}
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right: CTA Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="text-center space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-3">Hemen Randevu Alın</h4>
                  <p className="text-slate-600">
                    Ücretsiz muayene ile tedavi sürecinizi başlatın. 
                    Size özel tedavi planınızı oluşturalım.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24 Saat</div>
                    <div className="text-xs text-slate-500">İçinde Dönüş</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">Ücretsiz</div>
                    <div className="text-xs text-slate-500">İlk Muayene</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <QuickAppointmentButton className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12" />
                  
                  <div className="flex gap-3">
                    <ConsultationButton className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 h-12 bg-white border" />
                    <Button asChild variant="outline" size="lg" className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50">
                      <Link href="tel:+905321234567">Ara</Link>
                    </Button>
                  </div>
                </div>

                {/* Trust Indicator */}
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Güvenli ve profesyonel hizmet garantisi
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSnippet; 