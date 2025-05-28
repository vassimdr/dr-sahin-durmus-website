'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Key
} from 'lucide-react';
import { hashPassword, generateDeviceFingerprint } from '@/lib/security';
import { securityEvents } from '@/lib/audit-log';

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage({ type: 'error', text: 'Lütfen tüm alanları doldurun' });
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' });
        setLoading(false);
        return;
      }

      if (newPassword.length < 8) {
        setMessage({ type: 'error', text: 'Yeni şifre en az 8 karakter olmalı' });
        setLoading(false);
        return;
      }

      // Mevcut şifre kontrolü
      if (currentPassword !== 'admin123') {
        setMessage({ type: 'error', text: 'Mevcut şifre yanlış' });
        setLoading(false);
        return;
      }

      // Yeni şifre hash'le
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Burada normalde backend'e request gönderilir
      // Demo için localStorage'a kaydet
      localStorage.setItem('adminPasswordHash', hashedNewPassword);
      localStorage.setItem('adminPassword', newPassword); // Demo için
      
      // Audit log
      const deviceId = generateDeviceFingerprint();
      securityEvents.adminAction(
        deviceId, 
        'password_change', 
        'admin', 
        { timestamp: Date.now() }
      );

      setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi!' });
      
      // Formu temizle
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ type: 'error', text: 'Şifre değiştirme sırasında hata oluştu' });
    }
    
    setLoading(false);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength < 2) return { level: 'Zayıf', color: 'text-red-600' };
    if (strength < 4) return { level: 'Orta', color: 'text-yellow-600' };
    return { level: 'Güçlü', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Ayarları</h1>
          <p className="text-gray-600">Güvenlik ve hesap ayarlarını yönetin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Şifre Değiştir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Mevcut şifrenizi girin"
                    className="pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Yeni şifrenizi girin"
                    className="pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {newPassword && (
                  <p className={`text-sm ${passwordStrength.color}`}>
                    Şifre Gücü: {passwordStrength.level}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Yeni şifrenizi tekrar girin"
                    className="pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message */}
              {message && (
                <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Değiştiriliyor...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Key className="h-4 w-4 mr-2" />
                    Şifreyi Değiştir
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Güvenlik Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Session Süresi</span>
                <span className="text-sm text-blue-600">24 Saat</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Rate Limiting</span>
                <span className="text-sm text-green-600">Aktif</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Device Tracking</span>
                <span className="text-sm text-purple-600">Aktif</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Audit Logging</span>
                <span className="text-sm text-orange-600">Aktif</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Güvenli Şifre Önerileri:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• En az 8 karakter uzunluğunda</li>
                <li>• Büyük ve küçük harf içermeli</li>
                <li>• Sayı ve özel karakter kullanın</li>
                <li>• Kişisel bilgilerden kaçının</li>
                <li>• Düzenli olarak değiştirin</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 