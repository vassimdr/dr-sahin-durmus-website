// Security utilities for admin panel

// Rate limiting için storage
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

// IP adresi alma fonksiyonu (client-side için browser fingerprinting)
export function generateDeviceFingerprint(): string {
  if (typeof document === 'undefined') return 'server';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0
  ].join('|');
  
  return btoa(fingerprint).substring(0, 32);
}

// Şifre hash'leme (browser-compatible)
export async function hashPassword(password: string, salt: string = 'admin_salt'): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side fallback (basit hash)
    return btoa(password + salt);
  }
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    // Fallback: basit hash
    console.warn('crypto.subtle not available, using fallback hash');
    return btoa(password + salt);
  }
}

// Rate limiting kontrolü
export function checkRateLimit(deviceId: string): { allowed: boolean; message?: string; retryAfter?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(deviceId);
  
  if (!attempt) {
    loginAttempts.set(deviceId, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  // 5 dakikalık kilitleme kontrolü
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    const retryAfter = Math.ceil((attempt.lockedUntil - now) / 1000);
    return { 
      allowed: false, 
      message: `Çok fazla yanlış deneme. ${Math.ceil(retryAfter / 60)} dakika sonra tekrar deneyin.`,
      retryAfter 
    };
  }
  
  // 15 dakikalık window'da 5'ten fazla deneme
  if (now - attempt.lastAttempt < 15 * 60 * 1000 && attempt.count >= 5) {
    const lockUntil = now + 5 * 60 * 1000; // 5 dakika kilitle
    loginAttempts.set(deviceId, { 
      count: attempt.count + 1, 
      lastAttempt: now, 
      lockedUntil: lockUntil 
    });
    return { 
      allowed: false, 
      message: 'Çok fazla yanlış deneme. 5 dakika sonra tekrar deneyin.',
      retryAfter: 300 
    };
  }
  
  // Window sıfırlama (15 dakika geçmişse)
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(deviceId, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  // Normal artırma
  loginAttempts.set(deviceId, { 
    count: attempt.count + 1, 
    lastAttempt: now 
  });
  
  return { allowed: true };
}

// Başarılı login sonrası temizleme
export function clearLoginAttempts(deviceId: string): void {
  loginAttempts.delete(deviceId);
}

// Session token oluşturma (browser-safe)
export function generateSessionToken(): string {
  if (typeof window === 'undefined') {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback için random string
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// IP whitelist kontrolü (production için)
export function isIPAllowed(ip: string): boolean {
  const allowedIPs = [
    '127.0.0.1',
    'localhost',
    // Buraya izin verilen IP'leri ekle
  ];
  
  return process.env.NODE_ENV === 'development' || allowedIPs.includes(ip);
}

// Güvenli session storage
export const secureSession = {
  setItem: (key: string, value: string, deviceId: string) => {
    const data = {
      value,
      deviceId,
      timestamp: Date.now(),
      checksum: btoa(value + deviceId + Date.now())
    };
    sessionStorage.setItem(key, JSON.stringify(data));
  },
  
  getItem: (key: string, deviceId: string): string | null => {
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      
      // Device ID kontrolü
      if (data.deviceId !== deviceId) {
        sessionStorage.removeItem(key);
        return null;
      }
      
      // Timestamp kontrolü (24 saat)
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem(key);
        return null;
      }
      
      return data.value;
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  },
  
  removeItem: (key: string) => {
    sessionStorage.removeItem(key);
  }
};

// Security headers ve yapılandırma
export const securityConfig = {
  maxSessionDuration: 24 * 60 * 60 * 1000, // 24 saat
  maxLoginAttempts: 5,
  lockoutDuration: 5 * 60 * 1000, // 5 dakika
  requiredPasswordLength: 8,
  sessionCheckInterval: 5 * 60 * 1000, // 5 dakika
}; 