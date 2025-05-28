# 🔒 Güvenlik Dokümantasyonu

Dr. Şahin Durmuş Dental Website - Güvenlik İmplementasyonu

## 📋 Güvenlik Özellikleri

### 🔐 Admin Panel Güvenliği

#### 1. Multi-Layer Authentication
- **Device Fingerprinting**: Browser ve donanım özelliklerine dayalı benzersiz cihaz kimliği
- **Rate Limiting**: 15 dakikada 5 yanlış deneme sınırı
- **Account Lockout**: 5 yanlış denemeden sonra 5 dakika kilitleme
- **Session Management**: Güvenli token tabanlı oturum yönetimi
- **IP Whitelist**: Production ortamında IP kısıtlaması

#### 2. Session Security
- **Secure Session Storage**: Device ID ile şifrelenmiş session verisi
- **Auto Timeout**: 24 saat sonra otomatik çıkış
- **Activity Tracking**: Kullanıcı aktivitesi izleme
- **Session Hijacking Protection**: Device ID kontrolü ile korunma

### 🛡️ Network Security

#### 1. Rate Limiting
```typescript
// Admin routes: 30 request/minute
// API routes: 100 request/minute
// Client rate limiting: 5 login attempts/15 minutes
```

#### 2. HTTP Security Headers
```typescript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [Strict CSP rules]
```

#### 3. IP Protection
- **Geofencing**: IP tabanlı coğrafi kısıtlama (opsiyonel)
- **Whitelist**: İzin verilen IP adresleri
- **Blacklist**: Otomatik engelleme sistemi

### 📊 Audit & Monitoring

#### 1. Security Event Logging
```typescript
// Event Types
LOGIN_ATTEMPT, LOGIN_SUCCESS, LOGIN_FAILED
LOGOUT, SESSION_EXPIRED
RATE_LIMIT_EXCEEDED, UNAUTHORIZED_ACCESS
IP_BLOCKED, ADMIN_ACTION, SECURITY_VIOLATION
```

#### 2. Real-time Monitoring
- **Live Dashboard**: Gerçek zamanlı güvenlik olayları
- **Statistics**: 24 saat, 1 saat bazında istatistikler
- **Alert System**: Critical event'ler için anında uyarı
- **Export Capability**: JSON/CSV formatında log dışa aktarım

### 🔒 Database Security

#### 1. Row Level Security (RLS)
```sql
-- Her tablo için RLS politikaları
CREATE POLICY "Enable read access for active records" 
ON table_name FOR SELECT USING (is_active = true);
```

#### 2. Input Validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token validation

### 📱 Client-Side Security

#### 1. Content Security Policy
```typescript
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
```

#### 2. Storage Security
- **Secure Session Storage**: Encrypted data with checksum
- **No Sensitive Data**: Passwords never stored client-side
- **Auto Cleanup**: Session data auto-removal

## 🚀 Production Deployment

### 1. Environment Variables
```bash
# Güvenlik ayarları
ADMIN_PASSWORD_HASH=your_secure_hash
ADMIN_SALT=your_unique_salt
ADMIN_SESSION_SECRET=your_session_secret

# Rate limiting
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=5
SESSION_DURATION_HOURS=24

# IP Whitelist
ADMIN_IP_WHITELIST=ip1,ip2,ip3
```

### 2. SSL/TLS Konfigürasyonu
```nginx
# NGINX SSL config
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
add_header Strict-Transport-Security "max-age=63072000" always;
```

### 3. Firewall Rules
```bash
# UFW örnek kurallar
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw deny 3000/tcp    # Next.js dev port (production'da kapalı)
```

## 🔧 Maintenance

### 1. Security Updates
- **Monthly Security Review**: Güvenlik log'larının gözden geçirilmesi
- **Dependency Updates**: npm audit ile güvenlik güncellemeleri
- **Password Rotation**: 6 ayda bir admin şifre değişikliği

### 2. Monitoring Checklist
- [ ] Failed login attempts
- [ ] Rate limit violations
- [ ] Unusual IP activity
- [ ] Session anomalies
- [ ] Critical security events

### 3. Backup Security
```typescript
// Encrypted backups
BACKUP_ENCRYPTION_KEY=your_backup_key
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
```

## 🚨 Incident Response

### 1. Security Breach Protocol
1. **Immediate Actions**
   - Change all passwords
   - Revoke all active sessions
   - Enable IP whitelist
   - Review audit logs

2. **Investigation**
   - Analyze security logs
   - Identify attack vector
   - Assess damage scope
   - Document findings

3. **Recovery**
   - Patch vulnerabilities
   - Restore clean backups
   - Implement additional security
   - Monitor for re-attacks

### 2. Emergency Contacts
```
Security Team: security@dental-website.com
IT Admin: admin@dental-website.com
Emergency Phone: +90 XXX XXX XX XX
```

## 🛠️ Development Security

### 1. Secure Coding Practices
```typescript
// Input validation
const sanitizeInput = (input: string) => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Password hashing
const hashPassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password + salt, 12);
};
```

### 2. Testing Security
```bash
# Security test commands
npm audit                    # Dependency vulnerabilities
npm run test:security       # Security-specific tests
eslint --config security    # Security linting rules
```

## 📈 Security Metrics

### 1. KPIs
- **Mean Time to Detection (MTTD)**: < 5 minutes
- **Mean Time to Response (MTTR)**: < 15 minutes
- **False Positive Rate**: < 2%
- **Security Coverage**: > 95%

### 2. Reporting
- **Daily**: Automated security summary
- **Weekly**: Detailed security report
- **Monthly**: Security posture assessment
- **Quarterly**: Penetration testing

## 🔍 Security Tools

### 1. Automated Tools
- **ESLint Security Plugin**: Code security analysis
- **npm audit**: Dependency vulnerability scanning
- **OWASP ZAP**: Web application security testing
- **Snyk**: Real-time vulnerability monitoring

### 2. Manual Tools
- **Burp Suite**: Manual penetration testing
- **Nmap**: Network reconnaissance
- **Wireshark**: Network traffic analysis

## 📞 Support

### Güvenlik Desteği
- **Email**: security@dental-website.com
- **Phone**: +90 XXX XXX XX XX
- **Emergency**: 24/7 on-call support

### Dokümantasyon
- [Admin Panel Kullanım Kılavuzu](./docs/admin-guide.md)
- [API Güvenlik Dokümantasyonu](./docs/api-security.md)
- [Veritabanı Güvenlik Rehberi](./docs/database-security.md)

---

**Son Güncelleme**: 2024-01-XX  
**Versiyon**: 1.0.0  
**Güvenlik Seviyesi**: Production Ready 🔒 