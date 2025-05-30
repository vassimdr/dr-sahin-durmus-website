"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  MessageSquare, 
  Star, 
  Globe, 
  Instagram, 
  Music,
  Circle,
  AlertTriangle,
  Zap,
  Flame,
  Siren,
  Monitor,
  PhoneCall,
  MessageCircle,
  Camera,
  Users,
  Share2
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

// Dinamik konfigürasyon - Daha zarif ikonlar ve renkler
const PRIORITY_OPTIONS = [
  { 
    value: 1, 
    label: 'Normal', 
    icon: Circle, 
    color: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300',
    selectedColor: 'bg-slate-100 text-slate-700 border-slate-400 shadow-sm'
  },
  { 
    value: 2, 
    label: 'Önemli', 
    icon: Star, 
    color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:border-amber-300',
    selectedColor: 'bg-amber-100 text-amber-700 border-amber-400 shadow-sm'
  },
  { 
    value: 3, 
    label: 'Yüksek', 
    icon: AlertTriangle, 
    color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
    selectedColor: 'bg-orange-100 text-orange-700 border-orange-400 shadow-sm'
  },
  { 
    value: 4, 
    label: 'Acil', 
    icon: Zap, 
    color: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300',
    selectedColor: 'bg-red-100 text-red-700 border-red-400 shadow-sm'
  },
  { 
    value: 5, 
    label: 'Kritik', 
    icon: Flame, 
    color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200 hover:border-red-400',
    selectedColor: 'bg-red-200 text-red-800 border-red-500 shadow-md'
  }
];

const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website', icon: Monitor, color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' },
  { value: 'phone', label: 'Telefon', icon: PhoneCall, color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' },
  { value: 'instagram', label: 'Instagram', icon: Camera, color: 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100' },
  { value: 'tiktok', label: 'TikTok', icon: Music, color: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100' },
  { value: 'social', label: 'Diğer Sosyal Medya', icon: Share2, color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100' },
  { value: 'referral', label: 'Tavsiye', icon: Users, color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' }
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
          <div className="phone-input-container">
            <PhoneInput
              international
              countryCallingCodeEditable={false}
              defaultCountry="TR"
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value || '')}
              className="bg-white/70 border border-gray-200 rounded-md focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400/20"
              disabled={isSubmitting}
              placeholder="Telefon numaranızı giriniz"
            />
          </div>
        </div>

        {/* Öncelik Durumu - Zarif Butonlar */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Öncelik Durumu
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PRIORITY_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isSelected = formData.priority === option.value;
              
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('priority', option.value)}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 text-sm font-medium min-h-[80px] ${
                    isSelected
                      ? `${option.selectedColor} ring-2 ring-blue-400 ring-offset-2 transform scale-105`
                      : `${option.color} hover:transform hover:scale-102`
                  } disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs leading-tight text-center">{option.label}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Bizi Nereden Duydunuz - Zarif Butonlar */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Bizi Nereden Duydunuz?
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SOURCE_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isSelected = formData.source === option.value;
              
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('source', option.value)}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 text-sm font-medium min-h-[80px] ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700 border-blue-400 ring-2 ring-blue-400 ring-offset-2 shadow-md transform scale-105'
                      : `${option.color} hover:transform hover:scale-102 hover:shadow-md`
                  } disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none shadow-sm`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs leading-tight text-center">{option.label}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                    />
                  )}
                </motion.button>
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
        .phone-input-container .PhoneInputInput {
          background: rgba(255, 255, 255, 0.7);
          border: none;
          outline: none;
          padding: 8px 12px;
          font-size: 14px;
        }
        .phone-input-container .PhoneInputCountrySelect {
          background: rgba(255, 255, 255, 0.7);
          border: none;
          outline: none;
          margin-right: 8px;
        }
        .phone-input-container .PhoneInputCountrySelectArrow {
          color: #6b7280;
        }
      `}</style>
    </motion.div>
  );
} 