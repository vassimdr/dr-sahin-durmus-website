"use client";

import { Button } from "@/components/ui/button";
import { whatsappUtils } from "@/lib/whatsapp-utils";
import { MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  children?: React.ReactNode;
}

export const WhatsAppButton = ({ 
  message, 
  className, 
  variant = "default",
  size = "default",
  children 
}: WhatsAppButtonProps) => {
  const handleClick = () => {
    const finalMessage = message || whatsappUtils.generateAppointmentMessage();
    const url = whatsappUtils.generateWhatsAppURL(finalMessage);
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn(
        "bg-green-600 hover:bg-green-700 text-white",
        className
      )}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {children || "WhatsApp ile İletişim"}
    </Button>
  );
};

export const ConsultationButton = ({ 
  className, 
  variant = "outline",
  size = "default",
  children
}: Omit<WhatsAppButtonProps, 'message'>) => {
  const handleClick = () => {
    const url = whatsappUtils.getQuickAppointmentURL('consultation');
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn(className)}
    >
      <Phone className="w-4 h-4 mr-2" />
      {children || "Ücretsiz Konsültasyon"}
    </Button>
  );
};

export const AppointmentButton = ({ 
  className,
  variant = "default",
  size = "default",
  serviceType,
  children
}: Omit<WhatsAppButtonProps, 'message'> & { 
  serviceType?: string 
}) => {
  const handleClick = () => {
    const message = serviceType 
      ? whatsappUtils.getServiceAppointmentMessage(serviceType)
      : whatsappUtils.generateAppointmentMessage();
    const url = whatsappUtils.generateWhatsAppURL(message);
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn(
        "bg-blue-600 hover:bg-blue-700 text-white",
        className
      )}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {children || "Randevu Al"}
    </Button>
  );
};

export const EmergencyButton = ({ 
  className,
  variant = "default",
  size = "default",
  children
}: Omit<WhatsAppButtonProps, 'message'>) => {
  const handleClick = () => {
    const url = whatsappUtils.getQuickAppointmentURL('emergency');
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn(
        "bg-red-600 hover:bg-red-700 text-white",
        className
      )}
    >
      <Phone className="w-4 h-4 mr-2" />
      {children || "Acil Randevu"}
    </Button>
  );
};

// Quick Appointment Button - genel hızlı randevu için
export const QuickAppointmentButton = ({ 
  className,
  variant = "default",
  size = "default",
  children
}: Omit<WhatsAppButtonProps, 'message'>) => {
  const handleClick = () => {
    const url = whatsappUtils.getQuickAppointmentURL('general');
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn(
        "bg-blue-600 hover:bg-blue-700 text-white",
        className
      )}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {children || "Hızlı Randevu"}
    </Button>
  );
};

// Emergency Appointment Button - acil randevu için  
export const EmergencyAppointmentButton = ({ 
  className,
  variant = "default",
  size = "default",
  children
}: Omit<WhatsAppButtonProps, 'message'>) => {
  const handleClick = () => {
    const url = whatsappUtils.getQuickAppointmentURL('emergency');
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn(
        "bg-red-600 hover:bg-red-700 text-white",
        className
      )}
    >
      <Phone className="w-4 h-4 mr-2" />
      {children || "Acil Randevu"}
    </Button>
  );
};

// Blog Appointment Button - blog sayfalarından randevu için
export const BlogAppointmentButton = ({ 
  className,
  variant = "default",
  size = "default",
  blogTitle,
  children
}: Omit<WhatsAppButtonProps, 'message'> & { 
  blogTitle?: string 
}) => {
  const handleClick = () => {
    const url = whatsappUtils.getBlogAppointmentURL(blogTitle);
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn(
        "bg-green-600 hover:bg-green-700 text-white",
        className
      )}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {children || "Bu Konuda Randevu Al"}
    </Button>
  );
}; 