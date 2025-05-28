'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Shield, AlertTriangle, Timer } from 'lucide-react';
import { 
  generateDeviceFingerprint, 
  checkRateLimit, 
  clearLoginAttempts, 
  secureSession,
  hashPassword,
  generateSessionToken
} from '@/lib/security';
import { securityEvents } from '@/lib/audit-log';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();

  // Güvenli admin şifresi hash'i (production'da environment variable olmalı)
  const ADMIN_PASSWORD_HASH = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'; // "hello" için örnek

  useEffect(() => {
    // Device fingerprint oluştur
    const fingerprint = generateDeviceFingerprint();
    setDeviceId(fingerprint);

    // Mevcut lockout durumunu kontrol et
    const lockStatus = checkRateLimit(fingerprint);
    if (!lockStatus.allowed && lockStatus.retryAfter) {
      setIsLocked(true);
      setLockTimeRemaining(lockStatus.retryAfter);
      setError(lockStatus.message || '');
    }
  }, []);

  // Geri sayım timer'ı
  useEffect(() => {
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockTimeRemaining]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Rate limiting kontrolü
      const rateCheck = checkRateLimit(deviceId);
      if (!rateCheck.allowed) {
        setError(rateCheck.message || 'Çok fazla deneme yapıldı');
        if (rateCheck.retryAfter) {
          setIsLocked(true);
          setLockTimeRemaining(rateCheck.retryAfter);
        }
        setLoading(false);
        return;
      }

      // Şifre uzunluk kontrolü
      if (password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır');
        setLoading(false);
        return;
      }

      // Şifre hash'le ve kontrol et
      const hashedPassword = await hashPassword(password);
      
      // Demo için basit kontrol (production'da daha güvenli olmalı)
      const isValidPassword = password === 'admin123' || hashedPassword === ADMIN_PASSWORD_HASH;
      
      if (isValidPassword) {
        // Başarılı login - attempts temizle
        clearLoginAttempts(deviceId);
        
        // Audit log - başarılı giriş
        securityEvents.loginAttempt(deviceId, 'client', true, { 
          method: 'password',
          timestamp: Date.now()
        });
        
        // Güvenli session storage'a kaydet
        const sessionToken = generateSessionToken();
        secureSession.setItem('adminLoggedIn', 'true', deviceId);
        secureSession.setItem('adminToken', sessionToken, deviceId);
        secureSession.setItem('adminLoginTime', Date.now().toString(), deviceId);
        
        // Admin paneline yönlendir
        router.push('/admin');
      } else {
        // Başarısız login
        const newRateCheck = checkRateLimit(deviceId);
        setAttempts(prev => prev + 1);
        
        // Audit log - başarısız giriş
        securityEvents.loginAttempt(deviceId, 'client', false, { 
          method: 'password',
          timestamp: Date.now(),
          remainingAttempts: 5 - (attempts + 1)
        });
        
        if (!newRateCheck.allowed) {
          setError(newRateCheck.message || 'Çok fazla yanlış deneme');
          if (newRateCheck.retryAfter) {
            setIsLocked(true);
            setLockTimeRemaining(newRateCheck.retryAfter);
          }
        } else {
          setError(`Yanlış şifre! (${5 - (attempts + 1)} deneme hakkınız kaldı)`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Bir hata oluştu. Tekrar deneyin.');
    }
    
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLocked ? 'Hesap Geçici Kilitli' : 'Admin Paneli Girişi'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Dr. Şahin Durmuş Web Sitesi
          </p>
          {deviceId && (
            <p className="text-xs text-gray-400 mt-1">
              Cihaz ID: {deviceId.substring(0, 8)}...
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLocked ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Timer className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <p className="text-gray-700 mb-2">
                  Çok fazla yanlış deneme yapıldı
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                  <p className="text-sm text-orange-800">
                    Kalan süre: <strong>{formatTime(lockTimeRemaining)}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Admin Şifresi</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifrenizi girin..."
                    className="pr-10"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {attempts > 0 && (
                  <p className="text-xs text-orange-600">
                    {5 - attempts} deneme hakkınız kaldı
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !password.trim()}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Doğrulanıyor...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Güvenli Giriş
                  </div>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 space-y-2">
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>Demo Şifre:</strong> admin123
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Güvenlik için gerçek ortamda bu şifreyi değiştirin!
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-xs text-green-800 font-medium mb-1">
                🔒 Aktif Güvenlik Önlemleri:
              </p>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Rate limiting (5 deneme/15dk)</li>
                <li>• Device fingerprinting</li>
                <li>• Session token doğrulama</li>
                <li>• Otomatik lockout (5dk)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 