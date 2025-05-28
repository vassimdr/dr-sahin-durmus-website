import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Rate limiting için Map (production'da Redis kullanın)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// IP whitelist (production'da environment variable'dan alın)
const ADMIN_IP_WHITELIST = process.env.ADMIN_IP_WHITELIST?.split(',') || [];

function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const xClientIP = request.headers.get('x-client-ip');
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP) {
    return xRealIP.trim();
  }
  
  if (xClientIP) {
    return xClientIP.trim();
  }
  
  return 'unknown';
}

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const key = `${ip}`;
  
  // Development ortamında rate limiting'i devre dışı bırak
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const record = rateLimit.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Rate limit cache'ini temizleme fonksiyonu
function clearRateLimit(ip?: string) {
  if (ip) {
    rateLimit.delete(ip);
  } else {
    rateLimit.clear();
  }
}

function isIPAllowed(ip: string): boolean {
  // Development ortamında tüm IP'lere izin ver
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Localhost her zaman izinli
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return true;
  }
  
  // Whitelist kontrolü
  return ADMIN_IP_WHITELIST.length === 0 || ADMIN_IP_WHITELIST.includes(ip);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Supabase session management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.delete(name, options)
        },
      },
    }
  )

  // Refresh session if expired - important for Server Components
  await supabase.auth.getSession()

  const { pathname } = request.nextUrl;
  
  // Admin route'ları için güvenlik kontrolü
  if (pathname.startsWith('/admin')) {
    const clientIP = getClientIP(request);
    
    // IP whitelist kontrolü
    if (!isIPAllowed(clientIP)) {
      console.log(`Blocked access from unauthorized IP: ${clientIP}`);
      return new NextResponse('Access Denied', { status: 403 });
    }
    
    // Rate limiting (development'ta devre dışı)
    const maxRequests = process.env.NODE_ENV === 'development' ? 1000 : 30;
    if (!checkRateLimit(clientIP, maxRequests, 60000)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    
    // Security headers ekle
    // Admin sayfaları için güvenlik başlıkları
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self';"
    );
    
    // Cache kontrolü (admin sayfaları cache'lenmesin)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  }
  
  // API routes için genel güvenlik
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request);
    
    // API rate limiting (development'ta daha esnek)
    const maxRequests = process.env.NODE_ENV === 'development' ? 1000 : 100;
    if (!checkRateLimit(clientIP, maxRequests, 60000)) {
      return new NextResponse('API Rate Limit Exceeded', { status: 429 });
    }
    
    // API güvenlik başlıkları
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  }
  
  // Normal sayfalar için temel güvenlik
  // Genel güvenlik başlıkları
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    // API routes
    '/api/:path*',
    // Main pages (for basic security headers)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 