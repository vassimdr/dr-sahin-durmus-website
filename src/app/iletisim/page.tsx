"use client";

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, Zap, Star, Shield } from 'lucide-react';
import { QuickAppointmentButton, EmergencyAppointmentButton, ConsultationButton } from '@/components/ui/WhatsAppButton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function IletisimPage() {
  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp Randevu",
      description: "En hızlı ve pratik yol - Anında randevu alın",
      value: "+90 (532) 123 45 67",
      action: "WhatsApp'tan Yaz",
      type: "whatsapp",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      icon: Phone,
      title: "Telefon Görüşmesi",
      description: "Direkt konuşarak bilgi alın",
      value: "+90 (532) 123 45 67",
      action: "Hemen Ara",
      type: "phone",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      icon: Mail,
      title: "E-posta",
      description: "Detaylı sorularınız için e-posta gönderin",
      value: "info@drakadiskliniği.com",
      action: "E-posta Gönder",
      type: "email",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    }
  ];

  const clinicInfo = [
    {
      icon: MapPin,
      title: "Klinik Adresi",
      value: "Merkez Mahallesi, Sağlık Caddesi No:15\nKadıköy/İstanbul"
    },
    {
      icon: Clock,
      title: "Çalışma Saatleri",
      value: "Pazartesi - Cumartesi: 09:00 - 18:00\nPazar: Kapalı"
    }
  ];

  const quickActions = [
    {
      title: "Genel Randevu",
      description: "Muayene ve kontrol için",
      component: <QuickAppointmentButton className="w-full bg-blue-600 hover:bg-blue-700 h-12" />
    },
    {
      title: "Acil Durum",
      description: "Ağrı ve acil müdahale",
      component: <EmergencyAppointmentButton className="w-full bg-red-600 hover:bg-red-700 h-12" />
    },
    {
      title: "Ücretsiz Konsültasyon",
      description: "Tedavi seçenekleri hakkında",
      component: <ConsultationButton className="w-full bg-green-600 hover:bg-green-700 h-12" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-slate-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Size Nasıl Yardımcı Olabiliriz?
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Diş sağlığınız için en hızlı ve kolay yoldan bize ulaşın. 
              WhatsApp ile anında randevu alabilir, sorularınızı sorabilirsiniz.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24 Saat</div>
                <div className="text-sm text-slate-500">İçinde Dönüş</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">%99</div>
                <div className="text-sm text-slate-500">Memnuniyet</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">15+</div>
                <div className="text-sm text-slate-500">Yıl Deneyim</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">5000+</div>
                <div className="text-sm text-slate-500">Mutlu Hasta</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              İletişim Yöntemleriniz
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Size en uygun olan yöntemi seçin ve hemen iletişime geçin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-slate-50 rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {method.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-4 text-sm">
                    {method.description}
                  </p>
                  
                  <div className="text-slate-800 font-medium mb-6">
                    {method.value}
                  </div>
                  
                  {method.type === 'whatsapp' ? (
                    <QuickAppointmentButton className={`w-full ${method.color} ${method.hoverColor} text-white h-12`}>
                      {method.action}
                    </QuickAppointmentButton>
                  ) : method.type === 'phone' ? (
                    <Button asChild className={`w-full ${method.color} ${method.hoverColor} text-white h-12`}>
                      <Link href="tel:+905321234567">{method.action}</Link>
                    </Button>
                  ) : (
                    <Button asChild className={`w-full ${method.color} ${method.hoverColor} text-white h-12`}>
                      <Link href="mailto:info@drakadiskliniği.com">{method.action}</Link>
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Hızlı Randevu Türleri
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              İhtiyacınıza göre randevu türünü seçin, size özel mesajla iletişime geçelim
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-slate-600 text-sm mb-6">
                  {action.description}
                </p>
                {action.component}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinic Info */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Klinik Bilgileri
              </h2>
              <p className="text-lg text-slate-600">
                Dr. Şahin DURMUŞ Diş Kliniği hakkında bilgiler
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {clinicInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className="bg-slate-50 rounded-xl p-8"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                          {info.title}
                        </h3>
                        <p className="text-slate-600 whitespace-pre-line">
                          {info.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Hemen WhatsApp'tan Randevu Alın!
            </h3>
            <p className="text-blue-100 text-lg mb-8">
              Sadece birkaç saniyede randevunuzu planlayın. Size özel tedavi planınızı oluşturalım.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <QuickAppointmentButton className="bg-white text-blue-600 hover:bg-blue-50 flex-1 h-12 font-semibold">
                WhatsApp Randevu
              </QuickAppointmentButton>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 flex-1">
                <Link href="tel:+905321234567">Hemen Ara</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-blue-500">
              <div className="flex items-center gap-2 text-blue-100">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Güvenli ve Kaliteli</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Hızlı Yanıt</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Star className="w-4 h-4" />
                <span className="text-sm">%98 Memnuniyet</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 