"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Award, 
  Users, 
  Calendar, 
  Heart,
  Star,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Trophy,
  Target,
  Stethoscope,
  Globe
} from "lucide-react";
import { QuickAppointmentButton, ConsultationButton } from '@/components/ui/WhatsAppButton';

export default function HakkimizdaPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  // Education & Certifications
  const education = [
    {
      year: "2010",
      degree: "Diş Hekimliği Doktorası",
      institution: "İstanbul Üniversitesi Diş Hekimliği Fakültesi",
      type: "Lisans"
    },
    {
      year: "2013",
      degree: "Oral ve Maksillofasiyal Cerrahi Uzmanlığı",
      institution: "Hacettepe Üniversitesi",
      type: "Uzmanlık"
    },
    {
      year: "2015",
      degree: "İmplantoloji Sertifikası",
      institution: "Nobel Biocare Institute",
      type: "Sertifika"
    },
    {
      year: "2018",
      degree: "Estetik Diş Hekimliği Diploması",
      institution: "New York University",
      type: "Diploma"
    },
    {
      year: "2020",
      degree: "Digital Dentistry Certificate",
      institution: "Harvard School of Dental Medicine",
      type: "Sertifika"
    }
  ];

  // Specialties
  const specialties = [
    {
      icon: "🦷",
      title: "İmplant Tedavisi",
      description: "En son teknolojiyi kullanarak güvenli ve başarılı implant uygulamaları",
      experience: "10+ yıl"
    },
    {
      icon: "✨",
      title: "Estetik Diş Hekimliği",
      description: "Laminate veneer, diş beyazlatma ve gülüş tasarımı konularında uzman",
      experience: "8+ yıl"
    },
    {
      icon: "🔧",
      title: "Oral Cerrahi",
      description: "Çekim, kist operasyonları ve cerrahi müdahaleler",
      experience: "12+ yıl"
    },
    {
      icon: "📐",
      title: "Ortodonti",
      description: "Geleneksel ve Invisalign diş düzleştirme tedavileri",
      experience: "6+ yıl"
    }
  ];

  // Achievements & Awards
  const achievements = [
    {
      year: "2023",
      title: "Yılın En İyi Diş Hekimi",
      organization: "Türk Diş Hekimleri Birliği",
      type: "Ödül"
    },
    {
      year: "2022",
      title: "İmplantoloji Mükemmellik Ödülü",
      organization: "Avrupa İmplant Derneği",
      type: "Ödül"
    },
    {
      year: "2021",
      title: "En İyi Hasta Memnuniyeti",
      organization: "Sağlık Bakanlığı",
      type: "Sertifika"
    },
    {
      year: "2020",
      title: "Dijital Dönüşüm Öncüsü",
      organization: "TDB İstanbul Şubesi",
      type: "Ödül"
    }
  ];

  // Publications & Research
  const publications = [
    {
      title: "Modern İmplant Teknikleri ve Başarı Oranları",
      journal: "Türk Diş Hekimliği Dergisi",
      year: "2023"
    },
    {
      title: "Estetik Diş Hekimliğinde Digital Yaklaşımlar",
      journal: "International Journal of Dentistry",
      year: "2022"
    },
    {
      title: "Minimal İnvaziv Cerrahi Teknikleri",
      journal: "Oral Surgery Today",
      year: "2021"
    }
  ];

  // Philosophy & Values
  const values = [
    {
      icon: Heart,
      title: "Hasta Öncelikli",
      description: "Her hastamızın bireysel ihtiyaçlarını önceleyerek kişiselleştirilmiş tedavi planları oluşturuyoruz."
    },
    {
      icon: Star,
      title: "Mükemmellik",
      description: "En yüksek kalitede hizmet sunmak için sürekli kendimizi geliştiriyor ve yenilikleri takip ediyoruz."
    },
    {
      icon: CheckCircle,
      title: "Güven",
      description: "Şeffaf iletişim ve dürüst yaklaşımımızla hastalarımızın güvenini kazanıyoruz."
    },
    {
      icon: Target,
      title: "Sonuç Odaklı",
      description: "Her tedavide en iyi sonuçları alabilmek için titizlikle çalışıyor ve detayları önemsiyoruz."
    }
  ];

  // Statistics
  const stats = [
    { icon: Users, value: "3500+", label: "Mutlu Hasta" },
    { icon: Calendar, value: "15+", label: "Yıl Deneyim" },
    { icon: Award, value: "25+", label: "Ödül & Sertifika" },
    { icon: Globe, value: "12", label: "Ülkede Eğitim" }
  ];

  return (
    <div ref={ref} className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Doctor Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-blue-100 text-blue-700 mb-4">Diş Hekimi</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Dr. Şahin DURMUŞ
              </h1>
              <p className="text-xl text-slate-600 mb-6">
                15 yılı aşkın deneyimiyle modern diş hekimliği alanında uzman. 
                İmplantoloji, estetik diş hekimliği ve oral cerrahi konularında 
                uluslararası sertifikalara sahip.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-2xl font-bold text-blue-600">3500+</div>
                  <div className="text-sm text-slate-600">Başarılı Tedavi</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-2xl font-bold text-blue-600">98%</div>
                  <div className="text-sm text-slate-600">Hasta Memnuniyeti</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <QuickAppointmentButton className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8" />
                <ConsultationButton className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-12 bg-white border" />
              </div>
            </motion.div>

            {/* Right: Doctor Photo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-slate-100 rounded-2xl overflow-hidden">
                {/* Placeholder for doctor photo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-16 h-16 text-blue-600" />
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-blue-200 rounded-full opacity-20"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-300 rounded-full opacity-30"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index} 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Education & Experience */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Eğitim ve Sertifikalar</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Sürekli gelişim ve uluslararası standartlarda eğitim almaya verdiğim önem
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-6 mb-8 last:mb-0"
              >
                <div className="flex-shrink-0 w-20 text-center">
                  <div className="text-blue-600 font-bold text-lg">{edu.year}</div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs mt-1">
                    {edu.type}
                  </Badge>
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">{edu.degree}</h3>
                  <p className="text-slate-600">{edu.institution}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Uzmanlık Alanları</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Odaklandığım ana tedavi alanları ve bu konulardaki deneyimim
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {specialties.map((specialty, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{specialty.icon}</div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-900">{specialty.title}</h3>
                  <Badge className="bg-blue-100 text-blue-700">{specialty.experience}</Badge>
                </div>
                <p className="text-slate-600 leading-relaxed">{specialty.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values & Philosophy */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Değerlerim ve Felsefem</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Hastalarıma yaklaşımımı şekillendiren temel değerler ve çalışma felsefem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{value.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements & Publications */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Achievements */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Ödüller ve Başarılar</h2>
              <div className="space-y-6">
                {achievements.map((achievement, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start gap-4 bg-white rounded-lg p-6"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  >
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-blue-600 font-medium">{achievement.year}</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
                          {achievement.type}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">{achievement.title}</h3>
                      <p className="text-slate-600 text-sm">{achievement.organization}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Publications */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Yayınlar ve Araştırmalar</h2>
              <div className="space-y-6">
                {publications.map((publication, index) => (
                  <motion.div 
                    key={index} 
                    className="bg-white rounded-lg p-6 border-l-4 border-blue-600"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">{publication.title}</h3>
                        <p className="text-slate-600 text-sm mb-1">{publication.journal}</p>
                        <span className="text-blue-600 text-sm font-medium">{publication.year}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
            <Stethoscope className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Sağlıklı Gülüşünüz İçin Buradayım
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              15 yıllık deneyimim ve uluslararası standartlardaki yaklaşımımla 
              size en iyi tedaviyi sunmak için buradayım. Hemen randevunuzu alın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <QuickAppointmentButton className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12" />
              <ConsultationButton className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-12 bg-white border" />
            </div>
            
            {/* Contact Info */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+90 (532) 123 45 67</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@drakadiskliniği.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">İstanbul, Türkiye</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 