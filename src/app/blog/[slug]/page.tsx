"use client";

import { use } from 'react'
import { useBlogPost } from '@/hooks/useBlog'
import { blogUtils } from '@/lib/blog-utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogAppointmentButton } from '@/components/ui/WhatsAppButton'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = use(params)
  const { post, loading, error } = useBlogPost(slug)

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded mb-4"></div>
              <div className="h-64 bg-slate-200 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Link href="/blog" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Blog'a Dön
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category badge */}
              <Badge 
                className="mb-4"
                style={{ 
                  backgroundColor: blogUtils.getCategoryBgColor(post.category),
                  color: blogUtils.getCategoryColor(post.category)
                }}
              >
                {post.category}
              </Badge>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{blogUtils.formatDate(post.published_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{blogUtils.formatReadTime(post.read_time)}</span>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Share2 className="w-4 h-4 mr-2" />
                  Paylaş
                </Button>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  {post.excerpt}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.image_url && (
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative h-64 md:h-96 rounded-xl overflow-hidden"
              >
                <Image
                  src={post.image_url || blogUtils.generatePlaceholderImage(post.title, post.category)}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="prose prose-lg prose-slate max-w-none"
            >
              <div 
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Blog CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center bg-white p-8 rounded-xl shadow-sm"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Daha Fazla Blog Yazısı
                </h3>
                <p className="text-slate-600 mb-6">
                  Diş sağlığı hakkında daha fazla bilgi için blog sayfamızı ziyaret edin.
                </p>
                <Link href="/blog">
                  <Button size="lg" variant="outline" className="w-full">
                    Tüm Blog Yazıları
                  </Button>
                </Link>
              </motion.div>

              {/* Appointment CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center bg-blue-50 p-8 rounded-xl shadow-sm"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Bu Konuda Randevu Alın
                </h3>
                <p className="text-slate-600 mb-6">
                  Okuduğunuz konu hakkında detaylı bilgi almak için randevunuzu planlayın.
                </p>
                <BlogAppointmentButton 
                  blogTitle={post.title}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                >
                  WhatsApp Randevu Al
                </BlogAppointmentButton>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 