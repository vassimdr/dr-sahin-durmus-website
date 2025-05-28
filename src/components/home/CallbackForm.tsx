"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const CallbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Mesajı temizle
    if (message) {
      setMessage(null);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // Türkiye telefon formatı (0XXX XXX XX XX)
    if (numbers.length <= 11) {
      if (numbers.length > 7) {
        return numbers.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
      } else if (numbers.length > 4) {
        return numbers.replace(/(\d{4})(\d{3})/, '$1 $2');
      } else {
        return numbers;
      }
    }
    return value;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({
        type: 'error',
        text: 'Lütfen adınızı giriniz'
      });
      return false;
    }

    if (!formData.phone.trim()) {
      setMessage({
        type: 'error',
        text: 'Lütfen telefon numaranızı giriniz'
      });
      return false;
    }

    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      setMessage({
        type: 'error',
        text: 'Lütfen geçerli bir telefon numarası giriniz'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/callback-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim()
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Talebiniz alındı! En kısa sürede sizi arayacağız.'
        });
        setSubmitted(true);
        setFormData({ name: '', phone: '' });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Bir hata oluştu. Lütfen tekrar deneyiniz.'
        });
      }
    } catch (error) {
      console.error('Callback request error:', error);
      setMessage({
        type: 'error',
        text: 'Bağlantı hatası. Lütfen tekrar deneyiniz.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setMessage(null);
    setFormData({ name: '', phone: '' });
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
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-blue-100"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Phone className="w-8 h-8 text-blue-600" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Siz Numaranızı Bırakın
        </h3>
        <p className="text-gray-600">
          <span className="font-semibold text-blue-600">Biz Sizi Arayalım!</span>
          <br />
          Randevu ve bilgi almak için iletişim bilgilerinizi bırakın
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adınız Soyadınız
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Adınızı ve soyadınızı giriniz"
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon Numaranız
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="0XXX XXX XX XX"
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={loading || !formData.name.trim() || !formData.phone.trim()}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Gönderiliyor...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Beni Arayın
            </div>
          )}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Bilgileriniz güvenli bir şekilde saklanır ve sadece iletişim amacıyla kullanılır.
        </p>
      </div>
    </motion.div>
  );
};

export default CallbackForm; 