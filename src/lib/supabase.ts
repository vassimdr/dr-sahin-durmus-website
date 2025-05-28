import { createClient } from '@supabase/supabase-js'

// Geçici olarak demo değerler kullanıyoruz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Eğer environment variables tanımlanmamışsa, mock data kullanacağız
const USE_MOCK_DATA = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = USE_MOCK_DATA 
  ? null // Mock data kullanılacak
  : createClient(supabaseUrl, supabaseAnonKey)

export const useMockData = USE_MOCK_DATA

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: number
          title: string
          slug: string
          excerpt: string
          content: string
          author: string
          category: string
          published_date: string
          read_time: string
          featured: boolean
          image_url: string | null
          created_at: string
          updated_at: string
          published: boolean
          meta_title: string | null
          meta_description: string | null
          tags: string[] | null
          view_count: number
        }
        Insert: {
          id?: number
          title: string
          slug: string
          excerpt: string
          content: string
          author: string
          category: string
          published_date: string
          read_time: string
          featured?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
          published?: boolean
          meta_title?: string | null
          meta_description?: string | null
          tags?: string[] | null
          view_count?: number
        }
        Update: {
          id?: number
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          author?: string
          category?: string
          published_date?: string
          read_time?: string
          featured?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
          published?: boolean
          meta_title?: string | null
          meta_description?: string | null
          tags?: string[] | null
          view_count?: number
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 