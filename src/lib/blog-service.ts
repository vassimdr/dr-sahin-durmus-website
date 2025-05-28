import { supabase, useMockData } from './supabase'
import type { Database } from './supabase'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type Category = Database['public']['Tables']['categories']['Row']

// Mock data
const mockPosts: BlogPost[] = [
  {
    id: 1,
    title: "İmplant Tedavisi: Modern Çözümler ve Faydaları",
    slug: "implant-tedavisi-modern-cozumler",
    excerpt: "Eksik dişlerinizi en doğal görünümde yeniden kazanmanın yolları ve implant tedavisinin avantajları hakkında bilmeniz gerekenler.",
    content: `<h2>İmplant Tedavisi Nedir?</h2><p>Diş implantı, kaybedilen dişlerin yerine konulan titanyum vida şeklindeki yapay diş kökleridir. Bu modern tedavi yöntemi, eksik dişlerin en doğal ve kalıcı çözümünü sunar.</p><h2>İmplant Tedavisinin Avantajları</h2><ul><li>Doğal diş görünümü ve hissi</li><li>Uzun ömürlü çözüm</li><li>Çiğneme fonksiyonunu tam olarak geri kazandırır</li><li>Komşu dişlere zarar vermez</li></ul><h2>Tedavi Süreci</h2><p>İmplant tedavisi genellikle 3-6 ay sürer ve aşağıdaki aşamalardan oluşur:</p><ol><li>Detaylı muayene ve planlama</li><li>İmplant yerleştirme cerrahi</li><li>İyileşme süreci (osseointegrasyon)</li><li>Protez uygulaması</li></ol>`,
    author: "Dr. Şahin DURMUŞ",
    category: "İmplant",
    published_date: "2024-03-15",
    read_time: "8 dk",
    featured: true,
    published: true,
    image_url: null,
    meta_title: null,
    meta_description: null,
    tags: ["implant", "diş tedavisi", "cerrahi"],
    view_count: 150,
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-03-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Estetik Diş Hekimliği ile Gülüş Tasarımı",
    slug: "estetik-dis-hekimligi-gulus-tasarimi",
    excerpt: "Hollywood gülüşü elde etmenin sırları, veneer kaplama ve diş beyazlatma işlemleri hakkında uzman görüşler.",
    content: `<h2>Gülüş Tasarımı Nedir?</h2><p>Gülüş tasarımı, kişinin yüz yapısına ve kişilik özelliklerine uygun olarak dişlerinin şekil, boyut ve renginin düzenlenmesi işlemidir.</p><h2>Veneer Kaplama</h2><p>Veneer kaplamalar, dişlerin ön yüzeyine yapıştırılan ince porselen ya da kompozit tabakalarıdır. Bu yöntemle:</p><ul><li>Diş rengi değiştirilebilir</li><li>Diş şekli düzeltilebilir</li><li>Çarpık dişler düzeltilebilir</li><li>Aralıklar kapatılabilir</li></ul><h2>Diş Beyazlatma</h2><p>Profesyonel diş beyazlatma, dişlerin doğal rengini açarak daha beyaz bir görünüm elde etme işlemidir.</p>`,
    author: "Dr. Şahin DURMUŞ",
    category: "Estetik Diş Hekimliği",
    published_date: "2024-03-12",
    read_time: "6 dk",
    featured: true,
    published: true,
    image_url: null,
    meta_title: null,
    meta_description: null,
    tags: ["estetik", "gülüş tasarımı", "veneer"],
    view_count: 200,
    created_at: "2024-03-12T10:00:00Z",
    updated_at: "2024-03-12T10:00:00Z"
  },
  {
    id: 3,
    title: "Çocuklarda Diş Sağlığı: Anne Babaların Rehberi",
    slug: "cocuklarda-dis-sagligi-rehberi",
    excerpt: "Çocukların diş sağlığını korumak için erken yaşta alınması gereken önlemler ve doktor kontrollerinin önemi.",
    content: `<h2>Erken Yaşta Diş Bakımı</h2><p>Çocuklarda diş bakımı, ilk dişin çıkmasıyla birlikte başlamalıdır. Bu dönemde yapılması gerekenler:</p><ul><li>İlk diş çıkmadan önce bezle dişeti temizliği</li><li>İlk dişle birlikte fırçalama başlangıcı</li><li>2 yaşından sonra florid diş macunu kullanımı</li></ul><h2>Beslenme Alışkanlıkları</h2><p>Çocukların diş sağlığını etkileyen faktörler:</p><ul><li>Şekerli ve asitli içeceklerden kaçınma</li><li>Biberonla uyuma alışkanlığından kurtulma</li><li>Kalsiyum ve vitamin açısından zengin beslenme</li></ul>`,
    author: "Dr. Şahin DURMUŞ",
    category: "Çocuk Diş Hekimliği",
    published_date: "2024-03-10",
    read_time: "7 dk",
    featured: false,
    published: true,
    image_url: null,
    meta_title: null,
    meta_description: null,
    tags: ["çocuk diş sağlığı", "preventif", "diş bakımı"],
    view_count: 120,
    created_at: "2024-03-10T10:00:00Z",
    updated_at: "2024-03-10T10:00:00Z"
  },
  {
    id: 4,
    title: "Ortodonti Tedavisi: Tel Takma ve Sonrası",
    slug: "ortodonti-tedavisi-tel-takma",
    excerpt: "Diş teli tedavisi süreci, modern ortodonti yöntemleri ve tedavi sonrası bakım önerileri.",
    content: `<h2>Ortodonti Tedavisi Kimler İçin Uygundur?</h2><p>Ortodonti tedavisi aşağıdaki durumlarda uygulanır:</p><ul><li>Çarpık veya döük dişler</li><li>Dişler arası aşırı boşluklar</li><li>Üst ve alt çenenin uyumsuzluğu</li><li>Kapanış bozuklukları</li></ul><h2>Tedavi Seçenekleri</h2><p>Modern ortodonti çeşitli tedavi seçenekleri sunar:</p><ul><li>Geleneksel metal braketler</li><li>Seramik braketler</li><li>Şeffaf plaklar (Invisalign)</li><li>Lingual braketler</li></ul>`,
    author: "Dr. Şahin DURMUŞ",
    category: "Ortodonti",
    published_date: "2024-03-08",
    read_time: "9 dk",
    featured: false,
    published: true,
    image_url: null,
    meta_title: null,
    meta_description: null,
    tags: ["ortodonti", "diş teli", "invisalign"],
    view_count: 90,
    created_at: "2024-03-08T10:00:00Z",
    updated_at: "2024-03-08T10:00:00Z"
  }
]

const mockCategories: Category[] = [
  { id: 1, name: "Estetik Diş Hekimliği", slug: "estetik-dis-hekimligi", description: "Gülüş tasarımı, veneer, diş beyazlatma ve estetik tedaviler", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 2, name: "İmplant", slug: "implant", description: "Diş implantı tedavileri ve cerrahi işlemler", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 3, name: "Çocuk Diş Hekimliği", slug: "cocuk-dis-hekimligi", description: "Çocukların diş sağlığı ve pediatrik tedaviler", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 4, name: "Ortodonti", slug: "ortodonti", description: "Diş teli, şeffaf plak ve diş düzeltme tedavileri", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 5, name: "Diş Bakımı", slug: "dis-bakimi", description: "Günlük diş bakımı, hijyen ve koruyucu tedaviler", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: 6, name: "Genel Bilgiler", slug: "genel-bilgiler", description: "Diş sağlığı hakkında genel bilgiler ve ipuçları", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" }
]

export class BlogService {
  // Tüm blog yazılarını getir
  static async getAllPosts(): Promise<BlogPost[]> {
    if (useMockData) {
      return Promise.resolve(mockPosts.filter(post => post.published))
    }

    try {
      const { data, error } = await supabase!
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_date', { ascending: false })

      if (error) {
        console.error('Error fetching blog posts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllPosts:', error)
      return []
    }
  }

  // Öne çıkan blog yazılarını getir
  static async getFeaturedPosts(): Promise<BlogPost[]> {
    if (useMockData) {
      return Promise.resolve(mockPosts.filter(post => post.featured && post.published))
    }

    try {
      const { data, error } = await supabase!
        .from('blog_posts')
        .select('*')
        .eq('featured', true)
        .eq('published', true)
        .order('published_date', { ascending: false })
        .limit(2)

      if (error) {
        console.error('Error fetching featured posts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getFeaturedPosts:', error)
      return []
    }
  }

  // Kategoriye göre blog yazılarını getir
  static async getPostsByCategory(category: string): Promise<BlogPost[]> {
    if (useMockData) {
      return Promise.resolve(mockPosts.filter(post => post.category === category && post.published))
    }

    try {
      const { data, error } = await supabase!
        .from('blog_posts')
        .select('*')
        .eq('category', category)
        .eq('published', true)
        .order('published_date', { ascending: false })

      if (error) {
        console.error('Error fetching posts by category:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getPostsByCategory:', error)
      return []
    }
  }

  // Slug'a göre tek blog yazısı getir
  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    if (useMockData) {
      const post = mockPosts.find(post => post.slug === slug && post.published)
      return Promise.resolve(post || null)
    }

    try {
      const { data, error } = await supabase!
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error) {
        console.error('Error fetching post by slug:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getPostBySlug:', error)
      return null
    }
  }

  // Tüm kategorileri getir
  static async getAllCategories(): Promise<Category[]> {
    if (useMockData) {
      return Promise.resolve(mockCategories)
    }

    try {
      const { data, error } = await supabase!
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllCategories:', error)
      return []
    }
  }

  // Blog yazısı ara
  static async searchPosts(query: string): Promise<BlogPost[]> {
    if (useMockData) {
      const searchQuery = query.toLowerCase()
      const results = mockPosts.filter(post => 
        post.published && (
          post.title.toLowerCase().includes(searchQuery) ||
          post.excerpt.toLowerCase().includes(searchQuery) ||
          post.content.toLowerCase().includes(searchQuery)
        )
      )
      return Promise.resolve(results)
    }

    try {
      const { data, error } = await supabase!
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_date', { ascending: false })

      if (error) {
        console.error('Error searching posts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in searchPosts:', error)
      return []
    }
  }

  // Sayfalama ile blog yazılarını getir
  static async getPostsPaginated(page: number = 1, limit: number = 6): Promise<{
    posts: BlogPost[]
    totalCount: number
    hasMore: boolean
  }> {
    if (useMockData) {
      const publishedPosts = mockPosts.filter(post => post.published)
      const offset = (page - 1) * limit
      const posts = publishedPosts.slice(offset, offset + limit)
      const totalCount = publishedPosts.length
      const hasMore = offset + limit < totalCount

      return Promise.resolve({
        posts,
        totalCount,
        hasMore
      })
    }

    try {
      const offset = (page - 1) * limit

      // Toplam sayıyı al
      const { count } = await supabase!
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)

      // Sayfalı veriyi al
      const { data, error } = await supabase!
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching paginated posts:', error)
        return { posts: [], totalCount: 0, hasMore: false }
      }

      const totalCount = count || 0
      const hasMore = offset + limit < totalCount

      return {
        posts: data || [],
        totalCount,
        hasMore
      }
    } catch (error) {
      console.error('Error in getPostsPaginated:', error)
      return { posts: [], totalCount: 0, hasMore: false }
    }
  }
} 