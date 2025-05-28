import { useState, useEffect } from 'react'
import { BlogService } from '@/lib/blog-service'
import type { Database } from '@/lib/supabase'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type Category = Database['public']['Tables']['categories']['Row']

// Tüm blog yazılarını getiren hook
export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await BlogService.getAllPosts()
      setPosts(data)
      setError(null)
    } catch (err) {
      setError('Blog yazıları yüklenirken bir hata oluştu')
      console.error('Error fetching blog posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return { posts, loading, error, refetch: fetchPosts }
}

// Öne çıkan blog yazılarını getiren hook
export function useFeaturedPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeaturedPosts() {
      try {
        setLoading(true)
        const data = await BlogService.getFeaturedPosts()
        setPosts(data)
        setError(null)
      } catch (err) {
        setError('Öne çıkan yazılar yüklenirken bir hata oluştu')
        console.error('Error fetching featured posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPosts()
  }, [])

  return { posts, loading, error }
}

// Kategorileri getiren hook
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const data = await BlogService.getAllCategories()
        setCategories(data)
        setError(null)
      } catch (err) {
        setError('Kategoriler yüklenirken bir hata oluştu')
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

// Tek blog yazısını getiren hook
export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return

      try {
        setLoading(true)
        const data = await BlogService.getPostBySlug(slug)
        setPost(data)
        setError(null)
      } catch (err) {
        setError('Blog yazısı yüklenirken bir hata oluştu')
        console.error('Error fetching blog post:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  return { post, loading, error }
}

// Kategoriye göre blog yazılarını getiren hook
export function useBlogPostsByCategory(category: string) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPostsByCategory() {
      if (!category || category === 'Tümü') {
        // Tüm yazıları getir
        try {
          setLoading(true)
          const data = await BlogService.getAllPosts()
          setPosts(data)
          setError(null)
        } catch (err) {
          setError('Blog yazıları yüklenirken bir hata oluştu')
          console.error('Error fetching all posts:', err)
        } finally {
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        const data = await BlogService.getPostsByCategory(category)
        setPosts(data)
        setError(null)
      } catch (err) {
        setError('Blog yazıları yüklenirken bir hata oluştu')
        console.error('Error fetching posts by category:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPostsByCategory()
  }, [category])

  return { posts, loading, error }
}

// Blog yazılarında arama yapan hook
export function useSearchPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchPosts = async (query: string) => {
    if (!query.trim()) {
      setPosts([])
      return
    }

    try {
      setLoading(true)
      const data = await BlogService.searchPosts(query)
      setPosts(data)
      setError(null)
    } catch (err) {
      setError('Arama sırasında bir hata oluştu')
      console.error('Error searching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setPosts([])
    setError(null)
  }

  return { posts, loading, error, searchPosts, clearSearch }
}

// Sayfalama ile blog yazılarını getiren hook
export function usePaginatedPosts(limit: number = 6) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const loadPosts = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true)
      const { posts: newPosts, totalCount: count, hasMore: more } = await BlogService.getPostsPaginated(page, limit)
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts])
      } else {
        setPosts(newPosts)
      }
      
      setTotalCount(count)
      setHasMore(more)
      setCurrentPage(page)
      setError(null)
    } catch (err) {
      setError('Blog yazıları yüklenirken bir hata oluştu')
      console.error('Error loading paginated posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      loadPosts(currentPage + 1, true)
    }
  }

  useEffect(() => {
    loadPosts(1)
  }, [limit])

  return { 
    posts, 
    loading, 
    error, 
    hasMore, 
    totalCount, 
    currentPage, 
    loadMore, 
    refetch: () => loadPosts(1) 
  }
} 