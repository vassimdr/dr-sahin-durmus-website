import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Dinamik validasyon fonksiyonu
function validateUpdateData(data: any) {
  const errors: string[] = []
  
  if (data.name !== undefined && (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0)) {
    errors.push('İsim boş olamaz')
  }
  
  if (data.phone !== undefined) {
    if (!data.phone || typeof data.phone !== 'string') {
      errors.push('Telefon numarası gereklidir')
    } else {
      const phoneDigits = data.phone.replace(/[^0-9]/g, '')
      if (phoneDigits.length < 10) {
        errors.push('Geçerli bir telefon numarası giriniz')
      }
    }
  }
  
  if (data.priority !== undefined && (typeof data.priority !== 'number' || data.priority < 1 || data.priority > 5)) {
    errors.push('Öncelik 1-5 arasında olmalıdır')
  }
  
  const validSources = ['website', 'phone', 'whatsapp', 'instagram', 'tiktok', 'social', 'referral']
  if (data.source !== undefined && !validSources.includes(data.source)) {
    errors.push('Geçersiz kaynak türü')
  }
  
  const validStatuses = ['pending', 'called', 'completed', 'cancelled', 'scheduled']
  if (data.status !== undefined && !validStatuses.includes(data.status)) {
    errors.push('Geçersiz durum')
  }
  
  return errors
}

// GET - Tek geri arama talebini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('callback_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Talep bulunamadı' },
          { status: 404 }
        )
      }
      
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Veritabanı hatası', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası', details: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH - Geri arama talebini güncelle (dinamik)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const body = await request.json()
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      )
    }

    // Dinamik validasyon
    const validationErrors = validateUpdateData(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validasyon hatası', details: validationErrors },
        { status: 400 }
      )
    }

    // Önce mevcut kaydı kontrol et
    const { data: existingData, error: fetchError } = await supabase
      .from('callback_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Talep bulunamadı' },
          { status: 404 }
        )
      }
      
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Veritabanı hatası', details: fetchError.message },
        { status: 500 }
      )
    }

    // Dinamik güncelleme verisi hazırla
    const updateData: any = {}
    
    // Sadece gönderilen alanları güncelle
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.phone !== undefined) updateData.phone = body.phone.trim()
    if (body.status !== undefined) updateData.status = body.status
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.source !== undefined) updateData.source = body.source
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null
    if (body.admin_notes !== undefined) updateData.admin_notes = body.admin_notes?.trim() || null
    if (body.scheduled_at !== undefined) updateData.scheduled_at = body.scheduled_at

    // Özel durum işlemleri
    if (body.status) {
      switch (body.status) {
        case 'called':
          if (!existingData.called_at) {
            updateData.called_at = new Date().toISOString()
          }
          break
        case 'completed':
          if (!existingData.completed_at) {
            updateData.completed_at = new Date().toISOString()
          }
          break
        case 'scheduled':
          if (body.scheduled_at) {
            updateData.scheduled_at = body.scheduled_at
          }
          break
      }
    }

    // Güncelleme yap
    const { data, error } = await supabase
      .from('callback_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json(
        { error: 'Güncelleme hatası', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Talep başarıyla güncellendi',
      data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası', details: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Geri arama talebini sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz ID' },
        { status: 400 }
      )
    }

    // Önce kaydın var olup olmadığını kontrol et
    const { data: existingData, error: fetchError } = await supabase
      .from('callback_requests')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Talep bulunamadı' },
          { status: 404 }
        )
      }
      
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Veritabanı hatası', details: fetchError.message },
        { status: 500 }
      )
    }

    // Silme işlemi
    const { error } = await supabase
      .from('callback_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { error: 'Silme hatası', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${existingData.name} adlı talep başarıyla silindi`,
      deletedId: id
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası', details: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
} 