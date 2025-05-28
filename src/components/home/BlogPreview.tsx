"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ConsultationButton } from "@/components/ui/WhatsAppButton";

const BlogPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Featured blog posts
  const posts = [
    {
      id: 1,
      title: "Diş Beyazlatma: Güvenli Yöntemler ve İpuçları",
      excerpt: "Diş beyazlatma yöntemleri ve dikkat edilmesi gerekenler hakkında uzman görüşleri.",
      slug: "dis-beyazlatma-rehberi",
      date: "15 Mart 2024",
      category: "Estetik Diş Hekimliği",
      readTime: "5 dk"
    },
    {
      id: 2,
      title: "Çocuklarda Diş Sağlığı ve Koruyucu Hekimlik",
      excerpt: "Çocuğunuzun diş sağlığını korumak için aileler ne yapmalı? Uzman önerileri.",
      slug: "cocuklarda-dis-sagligi",
      date: "10 Mart 2024",
      category: "Çocuk Diş Hekimliği",
      readTime: "4 dk"
    },
    {
      id: 3,
      title: "İmplant Tedavisi: Modern Çözümler",
      excerpt: "Eksik dişler için implant tedavisi süreçleri ve beklentiler.",
      slug: "implant-tedavisi-detaylari",
      date: "5 Mart 2024",
      category: "İmplant",
      readTime: "6 dk"
    },
  ];

  return (
    <section ref={ref} className="w-full py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Diş Sağlığı Blog
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ağız ve diş sağlığı konularında güncel bilgiler, uzman önerileri ve 
            tedavi süreçleri hakkında faydalı içerikler.
          </p>
        </motion.div>

        {/* Blog Posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-slate-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Post Content */}
              <div className="p-6">
                {/* Category & Read Time */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-500">{post.readTime}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-slate-900 mb-3 leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                    {post.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                {/* Date & Read More */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">{post.date}</span>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Devamını Oku →
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-slate-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Daha Fazla Bilgi</h3>
            <p className="text-slate-600 mb-6">
              Diş sağlığı konularında güncel blog yazılarımızı okuyun ve 
              sağlıklı gülüş için gerekli bilgilere ulaşın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                <Link href="/blog">Tüm Yazılar</Link>
              </Button>
              <ConsultationButton className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-12 bg-white border" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogPreview; 