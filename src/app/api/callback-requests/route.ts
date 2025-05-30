import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Dinamik validasyon fonksiyonu
function validateCallbackRequest(data: any) {
  const errors: string[] = []
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('İsim gereklidir')
  }
  
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push('Telefon numarası gereklidir')
  } else {
    const phoneDigits = data.phone.replace(/[^0-9]/g, '')
    if (phoneDigits.length < 10) {
      errors.push('Geçerli bir telefon numarası giriniz')
    }
  }
  
  if (data.priority && (typeof data.priority !== 'number' || data.priority < 1 || data.priority > 5)) {
    errors.push('Öncelik 1-5 arasında olmalıdır')
  }
  
  const validSources = ['website', 'phone', 'whatsapp', 'social', 'referral']
  if (data.source && !validSources.includes(data.source)) {
    errors.push('Geçersiz kaynak türü')
  }
  
  const validStatuses = ['pending', 'called', 'completed', 'cancelled', 'scheduled']
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push('Geçersiz durum')
  }
  
  return errors
}

// POST - Yeni geri arama talebi oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Dinamik validasyon
    const validationErrors = validateCallbackRequest(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validasyon hatası', details: validationErrors },
        { status: 400 }
      )
    }

    // Dinamik veri hazırlama
    const requestData: any = {
      name: body.name.trim(),
      phone: body.phone.trim(),
      priority: body.priority || 1,
      source: body.source || 'website',
      status: body.status || 'pending'
    }

    // Opsiyonel alanlar
    if (body.notes) requestData.notes = body.notes.trim()
    if (body.admin_notes) requestData.admin_notes = body.admin_notes.trim()
    if (body.scheduled_at) requestData.scheduled_at = body.scheduled_at

    // Veritabanına ekle
    const { data, error } = await supabase
      .from('callback_requests')
      .insert([requestData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Veritabanı hatası', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Geri arama talebiniz başarıyla alındı',
      data
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası', details: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
}

// GET - Geri arama taleplerini listele (dinamik filtreleme)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Dinamik parametreler
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const source = searchParams.get('source')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Dinamik sorgu oluşturma
    let query = supabase
      .from('callback_requests')
      .select('*', { count: 'exact' })

    // Dinamik filtreler
    if (status) {
      query = query.eq('status', status)
    }
    
    if (priority) {
      query = query.eq('priority', parseInt(priority))
    }
    
    if (source) {
      query = query.eq('source', source)
    }

    // Arama fonksiyonu
    if (search) {
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_callback_requests', { search_term: search })
        .limit(limit)
        .range((page - 1) * limit, page * limit - 1)

      if (searchError) {
        console.error('Search error:', searchError)
        return NextResponse.json(
          { error: 'Arama hatası', details: searchError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: searchResults,
        pagination: {
          page,
          limit,
          total: searchResults.length
        }
      })
    }

    // Normal listeleme
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Veritabanı hatası', details: error.message },
        { status: 500 }
      )
    }

    // İstatistikleri de al
    const { data: stats, error: statsError } = await supabase
      .rpc('get_callback_stats')

    return NextResponse.json({
      success: true,
      data,
      stats: statsError ? null : stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası', details: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
} 