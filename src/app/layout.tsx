import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dr. Şahin DURMUŞ - Diş Hekimi | İmplant & Estetik Diş Hekimliği",
  description: "İstanbul'da uzman diş hekimi. İmplant tedavisi, estetik diş hekimliği, oral cerrahi ve ortodonti alanlarında 15+ yıl deneyim. Ücretsiz muayene için randevu alın.",
  keywords: "diş hekimi, istanbul diş hekimi, implant tedavisi, estetik diş hekimliği, diş kliniği, oral cerrahi, ortodonti, diş beyazlatma",
  authors: [{ name: "Dr. Şahin DURMUŞ" }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: "Dr. Şahin DURMUŞ - Uzman Diş Hekimi",
    description: "İmplant, estetik diş hekimliği ve oral cerrahi uzmanı. 15+ yıl deneyim, %98 hasta memnuniyeti.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Development modunda CSP'yi devre dışı bırak */}
        {process.env.NODE_ENV === 'development' && (
          <meta httpEquiv="Content-Security-Policy" content="" />
        )}
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
