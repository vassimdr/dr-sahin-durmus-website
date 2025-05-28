'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Activity, Calendar, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuickAppointmentButton } from '@/components/ui/WhatsAppButton';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Set current date
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    setCurrentDate(today.toLocaleDateString('tr-TR', options));

    // Handle scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar - Disappears on scroll */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'}`}>
        <div className="bg-slate-50 border-b border-slate-200 text-slate-600 py-1.5 text-xs">
          <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Left: Date */}
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>{currentDate}</span>
              </div>

              {/* Center: Contact Info */}
              <div className="hidden md:flex items-center space-x-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>+90 532 390 74 78</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span>info@dishekimi.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>İstanbul, Türkiye</span>
                </div>
              </div>

              {/* Right: Social Media */}
              <div className="flex items-center space-x-1">
                {/* TikTok Button */}
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-200 text-slate-400 hover:text-slate-600" asChild>
                  <Link 
                    href="https://www.tiktok.com/@drsahindurmus" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
                    </svg>
                  </Link>
                </Button>
                
                {/* Instagram Button */}
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-200 text-slate-400 hover:text-slate-600" asChild>
                  <Link 
                    href="https://www.instagram.com/drsahindurmus/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </Link>
                </Button>

                {/* WhatsApp Button */}
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-200 text-slate-400 hover:text-green-600" asChild>
                  <Link 
                    href="https://wa.me/905323907478" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-14 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Left Side: Logo + Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">
                  Dr. Şahin DURMUŞ
                </span>
                <span className="text-xs text-blue-600 font-medium">
                  Diş Hekimi & Estetik Uzmanı
                </span>
              </div>
            </Link>
            
            {/* Navigation Links - Desktop */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="text-foreground/80 transition-colors hover:text-foreground">
                Anasayfa
              </Link>
              <div className="relative">
                <Link href="/galeri" className="text-foreground/60 transition-colors hover:text-foreground/80 flex items-center gap-2">
                  Galeri
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                    Yakında
                  </Badge>
                </Link>
              </div>
              <Link href="/blog" className="text-foreground/60 transition-colors hover:text-foreground/80">
                Blog
              </Link>
              <Link href="/medya-yayinlari" className="text-foreground/60 transition-colors hover:text-foreground/80">
                Medya Yayınları
              </Link>
              <Link href="/hasta-deneyimleri" className="text-foreground/60 transition-colors hover:text-foreground/80">
                Hasta Deneyimleri
              </Link>
              <Link href="/hakkimizda" className="text-foreground/60 transition-colors hover:text-foreground/80">
                Hakkımızda
              </Link>
            </nav>
          </div>

          {/* Right Side: Mobile Menu + CTA Button */}
          <div className="flex items-center gap-2">
            {/* Desktop CTA Button */}
            <QuickAppointmentButton className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs px-3" />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <nav className="container mx-auto px-4 py-4 space-y-3">
              <Link 
                href="/" 
                className="block text-foreground/80 py-2 transition-colors hover:text-foreground"
                onClick={closeMobileMenu}
              >
                Anasayfa
              </Link>
              <Link 
                href="/galeri" 
                className="block text-foreground/60 py-2 transition-colors hover:text-foreground/80"
                onClick={closeMobileMenu}
              >
                Galeri
              </Link>
              <Link 
                href="/blog" 
                className="block text-foreground/60 py-2 transition-colors hover:text-foreground/80"
                onClick={closeMobileMenu}
              >
                Blog
              </Link>
              <Link 
                href="/medya-yayinlari" 
                className="block text-foreground/60 py-2 transition-colors hover:text-foreground/80"
                onClick={closeMobileMenu}
              >
                Medya Yayınları
              </Link>
              <Link 
                href="/hasta-deneyimleri" 
                className="block text-foreground/60 py-2 transition-colors hover:text-foreground/80"
                onClick={closeMobileMenu}
              >
                Hasta Deneyimleri
              </Link>
              <Link 
                href="/hakkimizda" 
                className="block text-foreground/60 py-2 transition-colors hover:text-foreground/80"
                onClick={closeMobileMenu}
              >
                Hakkımızda
              </Link>
              
              {/* Mobile Contact Info */}
              <div className="pt-4 border-t border-border/40 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>+90 532 390 74 78</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  {/* WhatsApp */}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                    <Link href="https://wa.me/905323907478" target="_blank">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </Link>
                  </Button>
                  
                  {/* Instagram */}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                    <Link href="https://www.instagram.com/drsahindurmus/" target="_blank">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </Link>
                  </Button>
                  
                  {/* TikTok */}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                    <Link href="https://www.tiktok.com/@drsahindurmus" target="_blank">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
                      </svg>
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Mobile CTA Button */}
              <div className="pt-4">
                <QuickAppointmentButton className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10" />
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar; 