// Audit logging system for security events
export type AuditEventType = 
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED_ACCESS'
  | 'IP_BLOCKED'
  | 'ADMIN_ACTION'
  | 'SECURITY_VIOLATION';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  eventType: AuditEventType;
  userId?: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    pathname: string;
    search?: string;
  };
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs: number = 1000;

  // Log bir güvenlik olayı
  log(event: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...event
    };

    this.logs.unshift(entry);
    
    // Maksimum log sayısını kontrol et
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console'a yazdır (development için)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUDIT] ${event.eventType}:`, {
        severity: event.severity,
        deviceId: event.deviceId.substring(0, 8),
        ip: event.ipAddress,
        details: event.details
      });
    }

    // Critical seviyedeki olayları localStorage'a da kaydet
    if (event.severity === 'critical') {
      this.saveCriticalEvent(entry);
    }

    // Production'da bu noktada external logging service'e gönder
    this.sendToExternalService(entry);
  }

  // Critical event'leri localStorage'a kaydet
  private saveCriticalEvent(entry: AuditLogEntry): void {
    try {
      const criticalLogs = JSON.parse(localStorage.getItem('criticalSecurityLogs') || '[]');
      criticalLogs.unshift(entry);
      
      // Son 50 critical event'i sakla
      if (criticalLogs.length > 50) {
        criticalLogs.splice(50);
      }
      
      localStorage.setItem('criticalSecurityLogs', JSON.stringify(criticalLogs));
    } catch (error) {
      console.error('Failed to save critical security log:', error);
    }
  }

  // External logging service'e gönder (production için)
  private sendToExternalService(entry: AuditLogEntry): void {
    // Production'da burada external service'e gönder
    // Örnek: Sentry, LogRocket, CloudWatch, vb.
    
    if (process.env.NODE_ENV === 'production') {
      // fetch('/api/audit-log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // }).catch(error => console.error('Failed to send audit log:', error));
    }
  }

  // Log'ları getir
  getLogs(limit: number = 100): AuditLogEntry[] {
    return this.logs.slice(0, limit);
  }

  // Belirli bir event type'ın log'larını getir
  getLogsByType(eventType: AuditEventType, limit: number = 50): AuditLogEntry[] {
    return this.logs
      .filter(log => log.eventType === eventType)
      .slice(0, limit);
  }

  // Son X dakikadaki log'ları getir
  getRecentLogs(minutes: number = 30): AuditLogEntry[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.logs.filter(log => log.timestamp > cutoff);
  }

  // Belirli bir IP'den gelen log'ları getir
  getLogsByIP(ipAddress: string, limit: number = 50): AuditLogEntry[] {
    return this.logs
      .filter(log => log.ipAddress === ipAddress)
      .slice(0, limit);
  }

  // Critical security events'leri getir
  getCriticalEvents(limit: number = 20): AuditLogEntry[] {
    return this.logs
      .filter(log => log.severity === 'critical')
      .slice(0, limit);
  }

  // İstatistikler
  getStatistics() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last1h = now - (60 * 60 * 1000);

    const recentLogs = this.logs.filter(log => log.timestamp > last24h);
    const hourlyLogs = this.logs.filter(log => log.timestamp > last1h);

    const stats = {
      total: this.logs.length,
      last24h: recentLogs.length,
      lastHour: hourlyLogs.length,
      byType: {} as Record<AuditEventType, number>,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      uniqueIPs: new Set(recentLogs.map(log => log.ipAddress)).size,
      uniqueDevices: new Set(recentLogs.map(log => log.deviceId)).size
    };

    // Event type'lara göre sayı
    recentLogs.forEach(log => {
      stats.byType[log.eventType] = (stats.byType[log.eventType] || 0) + 1;
      stats.bySeverity[log.severity]++;
    });

    return stats;
  }

  // Log'ları temizle
  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('criticalSecurityLogs');
  }

  // Log'ları export et
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['Timestamp', 'Event Type', 'Severity', 'Device ID', 'IP Address', 'Details'];
      const rows = this.logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.eventType,
        log.severity,
        log.deviceId,
        log.ipAddress,
        JSON.stringify(log.details)
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();

// Helper fonksiyonlar
export function logSecurityEvent(
  eventType: AuditEventType,
  details: Record<string, any>,
  severity: AuditLogEntry['severity'] = 'medium',
  deviceId: string = 'unknown',
  ipAddress: string = 'unknown',
  userAgent: string = 'unknown'
): void {
  auditLogger.log({
    eventType,
    deviceId,
    ipAddress,
    userAgent: userAgent.substring(0, 200), // Truncate long user agents
    details,
    severity,
    location: {
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      search: typeof window !== 'undefined' ? window.location.search : undefined
    }
  });
}

// Browser bilgilerini otomatik topla
export function getSecurityContext(): {
  deviceId: string;
  ipAddress: string;
  userAgent: string;
} {
  if (typeof window === 'undefined') {
    return {
      deviceId: 'server',
      ipAddress: 'server',
      userAgent: 'server'
    };
  }

  // Device fingerprint (import edebiliriz)
  const deviceId = sessionStorage.getItem('deviceFingerprint') || 'unknown';
  
  return {
    deviceId,
    ipAddress: 'client', // Client-side'da gerçek IP alamayız
    userAgent: navigator.userAgent
  };
}

// Hızlı güvenlik event'leri
export const securityEvents = {
  loginAttempt: (deviceId: string, ipAddress: string, success: boolean, details?: any) => {
    logSecurityEvent(
      success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      { success, ...details },
      success ? 'low' : 'medium',
      deviceId,
      ipAddress,
      navigator.userAgent
    );
  },

  rateLimitExceeded: (deviceId: string, ipAddress: string, endpoint: string) => {
    logSecurityEvent(
      'RATE_LIMIT_EXCEEDED',
      { endpoint, action: 'blocked' },
      'high',
      deviceId,
      ipAddress,
      navigator.userAgent
    );
  },

  unauthorizedAccess: (deviceId: string, ipAddress: string, attemptedPath: string) => {
    logSecurityEvent(
      'UNAUTHORIZED_ACCESS',
      { attemptedPath, action: 'blocked' },
      'critical',
      deviceId,
      ipAddress,
      navigator.userAgent
    );
  },

  sessionExpired: (deviceId: string, reason: string) => {
    const context = getSecurityContext();
    logSecurityEvent(
      'SESSION_EXPIRED',
      { reason },
      'low',
      deviceId,
      context.ipAddress,
      context.userAgent
    );
  },

  adminAction: (deviceId: string, action: string, targetId?: string, details?: any) => {
    const context = getSecurityContext();
    logSecurityEvent(
      'ADMIN_ACTION',
      { action, targetId, ...details },
      'medium',
      deviceId,
      context.ipAddress,
      context.userAgent
    );
  }
}; 