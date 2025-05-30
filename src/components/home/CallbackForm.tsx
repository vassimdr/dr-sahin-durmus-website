"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, User, CheckCircle, AlertCircle, Loader2, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CallbackFormProps {
  className?: string;
}

// Dinamik konfigürasyon
const PRIORITY_OPTIONS = [
  { value: 1, label: 'Normal', icon: '⚪', color: 'text-gray-600' },
  { value: 2, label: 'Önemli', icon: '🟡', color: 'text-yellow-600' },
  { value: 3, label: 'Yüksek', icon: '🟠', color: 'text-orange-600' },
  { value: 4, label: 'Acil', icon: '🔴', color: 'text-red-600' },
  { value: 5, label: 'Kritik', icon: '🚨', color: 'text-red-800' }
];

const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'phone', label: 'Telefon' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'social', label: 'Sosyal Medya' },
  { value: 'referral', label: 'Tavsiye' }
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

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.replace(/[^\d]/g, '').length <= 10) {
      setFormData(prev => ({ ...prev, phone: formatted }));
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('İsim gereklidir');
    }
    
    const phoneDigits = formData.phone.replace(/[^\d]/g, '');
    if (phoneDigits.length < 10) {
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
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="5XX XXX XX XX"
            className="bg-white/70 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
            disabled={isSubmitting}
          />
        </div>

        {/* Öncelik */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Öncelik Durumu
          </Label>
          <div className={isSubmitting ? 'opacity-50 pointer-events-none' : ''}>
            <Select 
              value={formData.priority.toString()} 
              onValueChange={(value) => handleInputChange('priority', parseInt(value))}
            >
              <SelectTrigger className="bg-white/70 border-gray-200 focus:border-blue-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span className={option.color}>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Kaynak */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Bizi Nereden Duydunuz?
          </Label>
          <div className={isSubmitting ? 'opacity-50 pointer-events-none' : ''}>
            <Select 
              value={formData.source} 
              onValueChange={(value) => handleInputChange('source', value)}
            >
              <SelectTrigger className="bg-white/70 border-gray-200 focus:border-blue-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    </motion.div>
  );
} 