"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  User, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Star, 
  Globe, 
  Circle,
  AlertTriangle,
  Zap,
  Flame,
  Monitor,
  PhoneCall,
  MessageCircle,
  Users,
  Share2,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface CallbackFormProps {
  className?: string;
}

// Icon component type
type IconComponent = LucideIcon | React.ComponentType<{ className?: string }>;

// Priority option type
interface PriorityOption {
  value: number;
  label: string;
  icon: IconComponent;
  iconColor: string;
}

// Source option type
interface SourceOption {
  value: string;
  label: string;
  icon: IconComponent;
  selectedColor: string;
}

// Dinamik konfigürasyon - İnce butonlar ve yeni renk sistemi
const PRIORITY_OPTIONS: PriorityOption[] = [
  { 
    value: 1, 
    label: 'Normal', 
    icon: Circle, 
    iconColor: 'text-gray-500'
  },
  { 
    value: 2, 
    label: 'Önemli', 
    icon: Star, 
    iconColor: 'text-amber-500'
  },
  { 
    value: 3, 
    label: 'Yüksek', 
    icon: AlertTriangle, 
    iconColor: 'text-orange-500'
  },
  { 
    value: 4, 
    label: 'Acil', 
    icon: Zap, 
    iconColor: 'text-red-500'
  },
  { 
    value: 5, 
    label: 'Kritik', 
    icon: Flame, 
    iconColor: 'text-red-600'
  }
];

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
  </svg>
);

// Custom Instagram Icon Component  
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const SOURCE_OPTIONS: SourceOption[] = [
  { value: 'website', label: 'Website', icon: Monitor, selectedColor: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'phone', label: 'Telefon', icon: PhoneCall, selectedColor: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, selectedColor: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'instagram', label: 'Instagram', icon: InstagramIcon, selectedColor: 'bg-pink-100 text-pink-700 border-pink-300' },
  { value: 'tiktok', label: 'TikTok', icon: TikTokIcon, selectedColor: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'social', label: 'Diğer Sosyal Medya', icon: Share2, selectedColor: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'referral', label: 'Tavsiye', icon: Users, selectedColor: 'bg-orange-100 text-orange-700 border-orange-300' }
];

export default function CallbackForm({ className = '' }: CallbackFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: '',
    priority: 1,
    source: 'website'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Mesajı temizle
    if (message) {
      setMessage(null);
    }
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('İsim gereklidir');
    }
    
    if (!formData.phone || formData.phone.length < 10) {
      errors.push('Geçerli bir telefon numarası giriniz');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Dinamik validasyon kontrolü
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors.join(', '));
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/callback-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          notes: formData.notes.trim() || null,
          priority: formData.priority,
          source: formData.source
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setSubmitted(true);
        // Form'u sıfırla
        setFormData({
          name: '',
          phone: '',
          notes: '',
          priority: 1,
          source: 'website'
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setMessage(null);
    setSubmitStatus('idle');
    setErrorMessage('');
    setFormData({
      name: '',
      phone: '',
      notes: '',
      priority: 1,
      source: 'website'
    });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 shadow-lg border border-blue-100"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Talebiniz Alındı! 📞
          </h3>
          <p className="text-gray-600 mb-6">
            En kısa sürede sizi arayacağız. Teşekkür ederiz!
          </p>
          
          <Button
            onClick={resetForm}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            Yeni Talep Oluştur
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl ${className}`}
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Geri Arama Talep Formu
        </h3>
        <p className="text-gray-600">
          Bilgilerinizi bırakın, sizi arayalım
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* İsim */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            İsim Soyisim *
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Adınız ve soyadınız"
            className="bg-white/70 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
            disabled={isSubmitting}
          />
        </div>

        {/* Telefon */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Telefon Numarası *
          </Label>
          <div className="phone-input-wrapper">
            <PhoneInput
              international
              countryCallingCodeEditable={false}
              defaultCountry="TR"
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value || '')}
              disabled={isSubmitting}
              placeholder="Telefon numaranızı giriniz"
              className="phone-input-custom"
            />
          </div>
        </div>

        {/* Öncelik Durumu - İnce Butonlar */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Öncelik Durumu
          </Label>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isSelected = formData.priority === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('priority', option.value)}
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? `bg-white text-gray-700 border-gray-400 shadow-sm`
                      : `bg-white text-gray-600 border-gray-200 hover:border-gray-300`
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <IconComponent className={`w-4 h-4 ${option.iconColor}`} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bizi Nereden Duydunuz - İnce Butonlar */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Bizi Nereden Duydunuz?
          </Label>
          <div className="flex flex-wrap gap-2">
            {SOURCE_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isSelected = formData.source === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('source', option.value)}
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? option.selectedColor
                      : `bg-white text-gray-600 border-gray-200 hover:border-gray-300`
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <IconComponent className={`w-4 h-4 ${isSelected ? '' : 'text-gray-500'}`} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notlar */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Ek Notlar (Opsiyonel)
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Özel bir durumunuz varsa belirtebilirsiniz..."
            className="bg-white/70 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 min-h-[80px]"
            disabled={isSubmitting}
          />
        </div>

        {/* Hata mesajı */}
        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Submit butonu */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Gönderiliyor...
            </div>
          ) : (
            'Geri Arama Talep Et'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          * Zorunlu alanlar. Bilgileriniz güvenli şekilde saklanır.
        </p>
      </div>

      <style jsx global>{`
        .phone-input-wrapper {
          position: relative;
        }
        
        .phone-input-custom {
          width: 100%;
        }
        
        .phone-input-custom .PhoneInputInput {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 8px 12px;
          font-size: 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .phone-input-custom .PhoneInputInput:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }
        
        .phone-input-custom .PhoneInputCountrySelect {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          margin-right: 8px;
          padding: 4px 8px;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .phone-input-custom .PhoneInputCountrySelect:focus {
          border-color: #60a5fa;
        }
        
        .phone-input-custom .PhoneInputCountrySelectArrow {
          color: #6b7280;
          margin-left: 4px;
        }
        
        .phone-input-custom .PhoneInputCountryIcon {
          margin-right: 4px;
        }
      `}</style>
    </motion.div>
  );
} 