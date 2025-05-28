/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Build sırasında ESLint hatalarını yoksay
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'weidladfcjiehgngsqgq.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Development modunda CSP'yi tamamen kapat
  async headers() {
    return []
  }
}

module.exports = nextConfig 