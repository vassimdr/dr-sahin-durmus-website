import type { Database } from '@/lib/supabase'

// Database types
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

// Custom types for blog functionality
export interface BlogPostWithContent extends BlogPost {
  content: string
}

export interface BlogPostCard {
  id: number
  title: string
  slug: string
  excerpt: string
  author: string
  category: string
  published_date: string
  read_time: string
  featured: boolean
  image_url: string | null
}

export interface BlogFilters {
  category?: string
  search?: string
  featured?: boolean
  limit?: number
  offset?: number
}

export interface BlogPaginationResult {
  posts: BlogPost[]
  totalCount: number
  hasMore: boolean
  currentPage: number
}

export interface BlogSearchResult {
  posts: BlogPost[]
  query: string
  totalResults: number
}

// Component prop types
export interface BlogPostCardProps {
  post: BlogPostCard
  variant?: 'default' | 'featured' | 'compact'
  showCategory?: boolean
  showExcerpt?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showReadTime?: boolean
}

export interface CategoryBadgeProps {
  category: string
  variant?: 'default' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export interface BlogHeroProps {
  title: string
  subtitle: string
  showSearch?: boolean
  onSearch?: (query: string) => void
}

export interface BlogCategoriesProps {
  categories: string[]
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
}

// Blog utilities
export interface BlogUtils {
  formatDate: (date: string) => string
  formatReadTime: (readTime: string) => string
  generateSlug: (title: string) => string
  truncateText: (text: string, maxLength: number) => string
  extractImageUrl: (content: string) => string | null
} 