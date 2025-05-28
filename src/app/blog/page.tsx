"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Search, Calendar, User, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useBlogPosts, useFeaturedPosts, useCategories, useSearchPosts } from '@/hooks/useBlog'
import { blogUtils } from '@/lib/blog-utils'

export default function BlogPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  
  // Hooks for data fetching
  const { posts: allPosts, loading: postsLoading, error: postsError } = useBlogPosts()
  const { posts: featuredPosts, loading: featuredLoading, error: featuredError } = useFeaturedPosts()
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories()
  const { posts: searchResults, loading: searchLoading, searchPosts, clearSearch } = useSearchPosts()
  
  // Prepare categories for display
  const displayCategories = ['Tümü', ...(categories?.map(cat => cat.name) || [])]
  
  // Filter posts based on selected category
  const filteredPosts = selectedCategory === 'Tümü' 
    ? allPosts 
    : allPosts?.filter(post => post.category === selectedCategory) || []
  
  // Determine which posts to show
  const postsToShow = searchQuery ? searchResults : filteredPosts
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim()) {
      searchPosts(query)
    } else {
      clearSearch()
    }
  }
  
  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setSearchQuery('')
    clearSearch()
  }

  return (
    <div ref={ref} className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Diş Sağlığı Blog
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Ağız ve diş sağlığı konularında güncel bilgiler, uzman önerileri ve 
              tedavi süreçleri hakkında faydalı içerikler.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Blog yazılarında ara..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {categoriesLoading ? (
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              displayCategories.map((category, index) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "secondary"}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    selectedCategory === category 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </Badge>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {!searchQuery && selectedCategory === 'Tümü' && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Öne Çıkan Yazılar</h2>
              <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto">
                En popüler ve güncel blog yazılarımız
              </p>
            </motion.div>

            {featuredLoading ? (
              <div className="grid md:grid-cols-2 gap-8 mb-20">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl overflow-hidden">
                    <div className="h-64 bg-slate-200 animate-pulse"></div>
                    <div className="p-8 space-y-4">
                      <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-16 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredError ? (
              <div className="text-center py-8">
                <p className="text-red-600">{featuredError}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8 mb-20">
                {featuredPosts?.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="group bg-slate-50 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Featured Image */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={post.image_url || blogUtils.generatePlaceholderImage(post.title, post.category)}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <Badge 
                        className="absolute top-4 left-4 text-white hover:bg-blue-600"
                        style={{ 
                          backgroundColor: blogUtils.getCategoryBgColor(post.category),
                          color: blogUtils.getCategoryColor(post.category)
                        }}
                      >
                        {post.category}
                      </Badge>
                    </div>

                    <div className="p-8">
                      {/* Meta Info */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          {blogUtils.formatReadTime(post.read_time)}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          {blogUtils.formatDate(post.created_at)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-slate-600 mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Read More */}
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="outline" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          Devamını Oku
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
              {searchQuery ? `"${searchQuery}" için arama sonuçları` : 
               selectedCategory === 'Tümü' ? 'Tüm Blog Yazıları' : `${selectedCategory} Kategorisi`}
            </h2>
            {!searchQuery && (
              <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto">
                Diş sağlığı konularında detaylı bilgiler ve uzman önerileri
              </p>
            )}
          </motion.div>

          {/* Loading State */}
          {(postsLoading || searchLoading) && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="h-48 bg-slate-200 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-12 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {(postsError && !searchQuery) && (
            <div className="text-center py-8">
              <p className="text-red-600">{postsError}</p>
            </div>
          )}

          {/* No Results */}
          {!postsLoading && !searchLoading && postsToShow?.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz blog yazısı yok'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery 
                  ? `"${searchQuery}" için herhangi bir sonuç bulunamadı. Farklı anahtar kelimeler deneyin.`
                  : selectedCategory === 'Tümü' 
                    ? 'Blog yazıları yakında eklenecek.'
                    : `${selectedCategory} kategorisinde henüz yazı bulunmuyor.`
                }
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('')
                    clearSearch()
                  }}
                >
                  Aramayı Temizle
                </Button>
              )}
            </div>
          )}

          {/* Posts Grid */}
          {!postsLoading && !searchLoading && postsToShow && postsToShow.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {postsToShow.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Post Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image_url || blogUtils.generatePlaceholderImage(post.title, post.category)}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Badge 
                      className="absolute top-3 left-3 text-white"
                      style={{ 
                        backgroundColor: blogUtils.getCategoryBgColor(post.category),
                        color: blogUtils.getCategoryColor(post.category)
                      }}
                    >
                      {post.category}
                    </Badge>
                  </div>

                  <div className="p-6">
                    {/* Meta Info */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {blogUtils.formatReadTime(post.read_time)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {blogUtils.formatDate(post.created_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-600 mb-4 line-clamp-3 text-sm">
                      {post.excerpt}
                    </p>

                    {/* Author & Read More */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">{post.author}</span>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <Button size="sm" variant="ghost" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          Oku
                          <ArrowRight className="ml-1 w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 