// WhatsApp randevu sistemi için yardımcı fonksiyonlar

export const whatsappUtils = {
  // WhatsApp telefon numarası (başında + olmadan, ülke kodu ile)
  phoneNumber: "905323907478", // Güncellenmiş telefon numarası
  
  // Temel randevu mesajı oluştur
  generateAppointmentMessage: (params?: {
    service?: string
    name?: string
    phone?: string
    preferredDate?: string
    message?: string
  }): string => {
    const { service, name, phone, preferredDate, message } = params || {}
    
    let messageText = "Merhaba Dr. Şahin DURMUŞ,\n\n"
    messageText += "Randevu almak istiyorum.\n\n"
    
    if (service) {
      messageText += `🦷 Hizmet: ${service}\n`
    }
    
    if (name) {
      messageText += `👤 Ad Soyad: ${name}\n`
    }
    
    if (phone) {
      messageText += `📞 Telefon: ${phone}\n`
    }
    
    if (preferredDate) {
      messageText += `📅 Tercih Edilen Tarih: ${preferredDate}\n`
    }
    
    if (message) {
      messageText += `💬 Mesaj: ${message}\n`
    }
    
    messageText += "\nSaygılarımla."
    
    return messageText
  },
  
  // WhatsApp URL'i oluştur
  generateWhatsAppURL: (message: string): string => {
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${whatsappUtils.phoneNumber}?text=${encodedMessage}`
  },
  
  // Hizmet bazlı randevu mesajları
  getServiceAppointmentMessage: (serviceName: string): string => {
    const messages: Record<string, string> = {
      'implant': whatsappUtils.generateAppointmentMessage({
        service: 'İmplant Tedavisi',
        message: 'İmplant tedavisi hakkında bilgi almak ve randevu planlamak istiyorum.'
      }),
      'estetik': whatsappUtils.generateAppointmentMessage({
        service: 'Estetik Diş Hekimliği',
        message: 'Gülüş tasarımı ve estetik tedaviler hakkında bilgi almak istiyorum.'
      }),
      'ortodonti': whatsappUtils.generateAppointmentMessage({
        service: 'Ortodonti (Diş Teli)',
        message: 'Diş düzeltme tedavisi için randevu almak istiyorum.'
      }),
      'cocuk': whatsappUtils.generateAppointmentMessage({
        service: 'Çocuk Diş Hekimliği',
        message: 'Çocuğum için diş kontrolü randevusu almak istiyorum.'
      }),
      'genel': whatsappUtils.generateAppointmentMessage({
        service: 'Genel Muayene',
        message: 'Genel diş kontrolü ve muayene için randevu almak istiyorum.'
      }),
      'beyazlatma': whatsappUtils.generateAppointmentMessage({
        service: 'Diş Beyazlatma',
        message: 'Diş beyazlatma işlemi için bilgi almak ve randevu planlamak istiyorum.'
      }),
      'kanal': whatsappUtils.generateAppointmentMessage({
        service: 'Kanal Tedavisi',
        message: 'Kanal tedavisi için randevu almak istiyorum.'
      }),
      'cekim': whatsappUtils.generateAppointmentMessage({
        service: 'Diş Çekimi',
        message: 'Diş çekimi işlemi için randevu almak istiyorum.'
      }),
      'protez': whatsappUtils.generateAppointmentMessage({
        service: 'Protez Tedavisi',
        message: 'Protez tedavisi için bilgi almak ve randevu planlamak istiyorum.'
      }),
      'temizlik': whatsappUtils.generateAppointmentMessage({
        service: 'Diş Temizliği',
        message: 'Diş temizliği ve tartarlık alımı için randevu almak istiyorum.'
      })
    }
    
    return messages[serviceName] || messages['genel']
  },
  
  // Hızlı randevu butonları için URL'ler
  getQuickAppointmentURL: (type: 'general' | 'emergency' | 'consultation' = 'general'): string => {
    const messages = {
      general: whatsappUtils.generateAppointmentMessage({
        message: 'Ücretsiz muayene için randevu almak istiyorum.'
      }),
      emergency: whatsappUtils.generateAppointmentMessage({
        service: 'Acil Müdahale',
        message: 'Acil diş problemi yaşıyorum, en kısa sürede randevu almak istiyorum.'
      }),
      consultation: whatsappUtils.generateAppointmentMessage({
        service: 'Ücretsiz Konsültasyon',
        message: 'Tedavi seçenekleri hakkında ücretsiz konsültasyon almak istiyorum.'
      })
    }
    
    return whatsappUtils.generateWhatsAppURL(messages[type])
  },
  
  // Blog sayfalarından randevu
  getBlogAppointmentURL: (blogTitle?: string): string => {
    const message = whatsappUtils.generateAppointmentMessage({
      message: blogTitle 
        ? `"${blogTitle}" blog yazısını okudum. Bu konuda bilgi almak ve randevu planlamak istiyorum.`
        : 'Blog yazınızı okudum, randevu almak istiyorum.'
    })
    
    return whatsappUtils.generateWhatsAppURL(message)
  }
} 