import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Clock, Activity, Star, Zap, Shield, Wrench, Sparkles, MessageCircle } from 'lucide-react';
import { whatsappUtils } from '@/lib/whatsapp-utils';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 py-16">
          
          {/* Clinic Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Dr. Şahin DURMUŞ</h3>
                <p className="text-sm text-slate-300">Diş Hekimi Uzmanı</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              15+ yıl deneyim ile modern diş hekimliği uygulamaları. 
              İmplant, estetik ve oral cerrahi alanında uzman hizmet.
            </p>
            <div className="flex space-x-3">
              <Link href="#" className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Hizmetlerimiz</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/hizmetler/implant" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  İmplant Tedavisi
                </Link>
              </li>
              <li>
                <Link href="/hizmetler/estetik" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  Estetik Diş Hekimliği
                </Link>
              </li>
              <li>
                <Link href="/hizmetler/ortodonti" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Ortodonti Tedavisi
                </Link>
              </li>
              <li>
                <Link href="/hizmetler/oral-cerrahi" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <Wrench className="w-3 h-3" />
                  Oral Cerrahi
                </Link>
              </li>
              <li>
                <Link href="/hizmetler/dis-beyazlatma" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Diş Beyazlatma
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/hakkimizda" className="text-slate-300 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">
                  Blog & Makaleler
                </Link>
              </li>
              <li>
                <Link href="/hasta-deneyimleri" className="text-slate-300 hover:text-white transition-colors">
                  Hasta Deneyimleri
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="text-slate-300 hover:text-white transition-colors">
                  Galeri (Yakında)
                </Link>
              </li>
              <li>
                <a 
                  href={whatsappUtils.getQuickAppointmentURL('general')}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-3 h-3" />
                  WhatsApp Randevu
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">İletişim & Çalışma Saatleri</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">+90 (532) 123 45 67</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">info@dishekimi.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-1" />
                <span className="text-slate-300">
                  [Adres Bilgileri]<br />
                  İstanbul, Türkiye
                </span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-slate-700">
                <Clock className="w-4 h-4 text-blue-400 mt-1" />
                <div className="text-slate-300">
                  <p className="font-medium">Çalışma Saatleri:</p>
                  <p>Pzt-Cum: 09:00 - 18:00</p>
                  <p>Cumartesi: 09:00 - 16:00</p>
                  <p>Pazar: Kapalı</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-700 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} Dr. Şahin DURMUŞ Diş Kliniği. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/gizlilik-politikasi" className="hover:text-white transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/kullanim-sartlari" className="hover:text-white transition-colors">
              Kullanım Şartları
            </Link>
            <Link href="/cerez-politikasi" className="hover:text-white transition-colors">
              Çerez Politikası
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 