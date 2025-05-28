"use client";

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QuickAppointmentButton } from "@/components/ui/WhatsAppButton";

const credentials = [
  { title: "Diş Hekimliği Doktorası", institution: "İstanbul Üniversitesi", year: "2008" },
  { title: "Estetik Diş Hekimliği", institution: "Avrupa Estetik Derneği", year: "2012" },
  { title: "İmplant Sertifikası", institution: "ITI International", year: "2015" },
  { title: "Ortodonti Uzmanlaşma", institution: "Amerikan Ortodonti Derneği", year: "2018" }
];

export default function DoctorIntroduction() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="w-full py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Doctor Photo */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative">
              {/* Photo container */}
              <div className="w-80 h-96 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl shadow-lg flex items-center justify-center text-slate-600 overflow-hidden">
                <div className="text-center">
                  <div className="text-lg font-medium">Dr. Şahin DURMUŞ</div>
                  <div className="text-sm text-blue-600 mt-1">Diş Hekimi Uzmanı</div>
                </div>
              </div>
              
              {/* Simple badge */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-lg border border-slate-100">
                <div className="text-sm font-medium text-slate-800">15+ Yıl Deneyim</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Deneyim ve Uzmanlık
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                15 yıllık deneyimimle, modern diş hekimliğinin tüm alanlarında uzmanlaşmış olarak, 
                size en kaliteli tedavi seçeneklerini sunuyorum. Her hastamın ihtiyaçları farklıdır 
                ve ben de buna uygun kişiselleştirilmiş tedavi planları hazırlıyorum.
              </p>
            </div>

            {/* Credentials - Simple list */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Eğitim & Sertifikalar</h3>
              <div className="space-y-3">
                {credentials.map((cred, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0"
                  >
                    <div>
                      <div className="font-medium text-slate-800">{cred.title}</div>
                      <div className="text-sm text-slate-600">{cred.institution}</div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">{cred.year}</Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Simple stats */}
            <div className="grid grid-cols-3 gap-6 py-6 border-t border-slate-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">5000+</div>
                <div className="text-sm text-slate-600">Mutlu Hasta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">15+</div>
                <div className="text-sm text-slate-600">Yıl Deneyim</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">12</div>
                <div className="text-sm text-slate-600">Sertifika</div>
              </div>
            </div>

            {/* Simple CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <QuickAppointmentButton className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 