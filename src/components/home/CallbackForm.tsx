"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, User, CheckCircle, AlertCircle, Loader2, MessageSquare, Star, Globe, Instagram, Music } from 'lucide-react';
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

// Dinamik konfigürasyon
const PRIORITY_OPTIONS = [
  { value: 1, label: 'Normal', icon: '⚪', color: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' },
  { value: 2, label: 'Önemli', icon: '🟡', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200' },
  { value: 3, label: 'Yüksek', icon: '🟠', color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' },
  { value: 4, label: 'Acil', icon: '🔴', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
  { value: 5, label: 'Kritik', icon: '🚨', color: 'bg-red-200 text-red-800 border-red-300 hover:bg-red-300' }
];

const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'phone', label: 'Telefon', icon: '📞' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'social', label: 'Diğer Sosyal Medya', icon: '📱' },
  { value: 'referral', label: 'Tavsiye', icon: '👥' }
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

        {/* Öncelik Durumu - Butonlar */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Öncelik Durumu
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('priority', option.value)}
                disabled={isSubmitting}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                  formData.priority === option.value
                    ? `${option.color} ring-2 ring-blue-400 ring-offset-1`
                    : `${option.color} opacity-60 hover:opacity-100`
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <span className="text-base">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bizi Nereden Duydunuz - Butonlar */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Bizi Nereden Duydunuz?
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SOURCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('source', option.value)}
                disabled={isSubmitting}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                  formData.source === option.value
                    ? 'bg-blue-100 text-blue-700 border-blue-300 ring-2 ring-blue-400 ring-offset-1'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <span className="text-base">{option.icon}</span>
                <span className="text-xs leading-tight">{option.label}</span>
              </button>
            ))}
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