'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Settings, Video, MessageSquare, FileText, Home, LogOut, User, Shield, Newspaper, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  generateDeviceFingerprint, 
  secureSession,
  securityConfig 
} from '@/lib/security';
import { securityEvents } from '@/lib/audit-log';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState('');
  const [sessionValid, setSessionValid] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Giriş sayfasındaysak kontrol etme
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    // Device fingerprint oluştur
    const fingerprint = generateDeviceFingerprint();
    setDeviceId(fingerprint);

    // Login durumunu kontrol et
    const checkAuth = () => {
      const loggedIn = secureSession.getItem('adminLoggedIn', fingerprint);
      const adminToken = secureSession.getItem('adminToken', fingerprint);
      const loginTime = secureSession.getItem('adminLoginTime', fingerprint);
      
      if (!loggedIn || loggedIn !== 'true' || !adminToken || !loginTime) {
        router.push('/admin/login');
        return;
      }

      // Session süre kontrolü
      const now = Date.now();
      const loginTimestamp = parseInt(loginTime);
      const timeDiff = now - loginTimestamp;
      
      if (timeDiff > securityConfig.maxSessionDuration) {
        // Session süresi dolmuş
        handleLogout('Session süresi doldu');
        return;
      }

      // Activity kontrolü (5 dakikada bir)
      const activityDiff = now - lastActivity;
      if (activityDiff > securityConfig.sessionCheckInterval) {
        setLastActivity(now);
        // Session'ı yenile
        secureSession.setItem('adminLoginTime', now.toString(), fingerprint);
      }

      setIsLoggedIn(true);
      setSessionValid(true);
      setLoading(false);
    };

    checkAuth();

    // Periyodik kontrol
    const interval = setInterval(checkAuth, securityConfig.sessionCheckInterval);
    
    return () => clearInterval(interval);
  }, [pathname, router, lastActivity]);

  // Activity tracking
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    // Mouse ve keyboard aktivitelerini izle
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  const handleLogout = (reason?: string) => {
    if (deviceId) {
      // Audit log - çıkış
      securityEvents.sessionExpired(deviceId, reason || 'Manual logout');
      
      secureSession.removeItem('adminLoggedIn');
      secureSession.removeItem('adminToken');
      secureSession.removeItem('adminLoginTime');
    }
    
    if (reason) {
      console.log('Logout reason:', reason);
    }
    
    router.push('/admin/login');
  };

  // Login sayfasındaysak sadece children'ı render et
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading göster
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Güvenlik kontrolü yapılıyor...</p>
        </div>
      </div>
    );
  }

  // Login olmamışsa hiçbir şey render etme (redirect edilecek)
  if (!isLoggedIn || !sessionValid) {
    return null;
  }

  const getSessionTimeRemaining = () => {
    if (!deviceId) return 0;
    
    const loginTime = secureSession.getItem('adminLoginTime', deviceId);
    if (!loginTime) return 0;
    
    const now = Date.now();
    const loginTimestamp = parseInt(loginTime);
    const remaining = securityConfig.maxSessionDuration - (now - loginTimestamp);
    
    return Math.max(0, Math.floor(remaining / (1000 * 60))); // dakika cinsinden
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Dr. Şahin Durmuş - Admin Panel
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Session bilgisi */}
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Güvenli Oturum</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                Admin
              </div>
              <div className="text-xs text-gray-500">
                {getSessionTimeRemaining()}dk kaldı
              </div>
              <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Ana Siteye Dön</span>
              </Link>
              <Button 
                onClick={() => handleLogout('Manuel çıkış')}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Güvenli Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/admin"
                    className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                      pathname === '/admin' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/reviews"
                    className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                      pathname === '/admin/reviews' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <MessageSquare className="h-5 w-5 mr-3" />
                    Yorumlar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/callback-requests"
                    className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                      pathname === '/admin/callback-requests' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <Phone className="h-5 w-5 mr-3" />
                    Geri Arama Talepleri
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/videos"
                    className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                      pathname === '/admin/videos' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <Video className="h-5 w-5 mr-3" />
                    Video Yönetimi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/blog"
                    className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                      pathname === '/admin/blog' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    Blog Yönetimi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/media"
                    className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                      pathname === '/admin/media' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <Newspaper className="h-5 w-5 mr-3" />
                    Medya Yayınları
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/security"
                    className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                      pathname === '/admin/security' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <Shield className="h-5 w-5 mr-3" />
                    Güvenlik
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/settings"
                    className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${
                      pathname === '/admin/settings' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Ayarlar
                  </Link>
                </li>
              </ul>

              {/* Güvenlik Info */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="px-4 py-2">
                  <p className="text-xs text-gray-500 mb-2">Güvenlik Durumu</p>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">Session Aktif</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-600">
                        {deviceId ? `${deviceId.substring(0, 8)}...` : 'Cihaz ID'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {getSessionTimeRemaining()}dk oturum süresi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 