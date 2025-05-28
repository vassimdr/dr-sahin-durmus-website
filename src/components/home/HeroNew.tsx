import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Activity, Star, Zap, Shield, Award, CheckCircle } from "lucide-react";
import { QuickAppointmentButton, EmergencyAppointmentButton, ConsultationButton } from "@/components/ui/WhatsAppButton";

const HeroNew = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Clean pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.5)_1px,transparent_0)]" style={{ backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div className="text-left space-y-8">
            {/* Trust indicator - clean */}
            <div className="inline-flex items-center px-4 py-2 bg-white border border-blue-100 rounded-full text-sm text-slate-600 shadow-sm">
              <Activity className="w-4 h-4 text-blue-600 mr-2" />
              Diş Hekimi Uzmanı • 15+ Yıl Deneyim • %98 Hasta Memnuniyeti
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Hayalinizdeki
                <br />
                <span className="text-blue-600">Gülüş Burada</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                İmplant, estetik diş hekimliği ve oral cerrahi alanlarında uzman ekibimizle, 
                size özel tedavi planları oluşturuyor, güvenli ve kaliteli hizmet sunuyoruz.
              </p>
            </div>

            {/* Clean service highlights */}
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-sm flex items-center gap-2">
                <Star className="w-3 h-3" />
                Estetik Diş Hekimliği
              </span>
              <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-sm flex items-center gap-2">
                <Activity className="w-3 h-3" />
                İmplant Tedavisi
              </span>
              <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-sm flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Hızlı Sonuç
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <QuickAppointmentButton className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg h-12" />
              <div className="flex gap-3">
                <EmergencyAppointmentButton className="flex-1 h-12 px-4" />
                <ConsultationButton className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 flex-1 h-12 bg-white border" />
              </div>
            </div>

            {/* Trust elements - clean */}
            <div className="flex items-center gap-8 pt-8 border-t border-slate-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">3500+</div>
                <div className="text-sm text-slate-500">Başarılı İmplant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">15+</div>
                <div className="text-sm text-slate-500">Yıl Diş Hekimi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">%100</div>
                <div className="text-sm text-slate-500">Steril Ortam</div>
              </div>
            </div>
          </div>

          {/* Right: Doctor Photo */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main photo container - clean */}
              <div className="w-80 h-96 bg-gradient-to-br from-blue-100 to-slate-100 rounded-2xl shadow-xl flex items-center justify-center text-slate-600 overflow-hidden relative">
                <div className="text-center relative z-10">
                  <Activity className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <div className="text-lg font-medium">Dr. Şahin DURMUŞ</div>
                  <div className="text-sm mt-2 text-blue-600">Diş Hekimi Uzmanı</div>
                </div>
              </div>
              
              {/* Floating card - clean */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg border border-slate-100 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">Sertifikalı Diş Hekimi</div>
                    <div className="text-xs text-slate-500">Avrupa & ABD Standartları</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroNew; 