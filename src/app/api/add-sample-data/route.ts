import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    // Örnek yorumlar
    const sampleReviews = [
      {
        patient_name: 'Ayşe Kaya',
        patient_email: 'ayse.kaya@email.com',
        review_text: 'İmplant tedavim için Dr. Şahin Durmuş\'u tercih ettim. Hem işlem öncesi hem de sonrası çok ilgili davrandı. Kliniği çok temiz ve modern. Kesinlikle tavsiye ederim!',
        rating: 5,
        treatment_category: 'implant',
        is_approved: true,
        is_featured: true,
        helpful_count: 12
      },
      {
        patient_name: 'Mehmet Öztürk',
        patient_email: 'mehmet.ozturk@email.com',
        review_text: 'Diş beyazlatma işlemi için gittim. Sonuç harika oldu! Personel çok güler yüzlü ve profesyonel. Fiyatlar da makul seviyede.',
        rating: 5,
        treatment_category: 'beyazlatma',
        is_approved: true,
        is_featured: false,
        helpful_count: 8
      },
      {
        patient_name: 'Fatma Demir',
        patient_email: 'fatma.demir@email.com',
        review_text: 'Çocuğumun diş tedavisi için geldik. Doktor çocuklarla çok iyi ilgileniyor, hiç korkmadı. Teşekkür ederiz!',
        rating: 5,
        treatment_category: 'cocuk-dis',
        is_approved: true,
        is_featured: false,
        helpful_count: 5
      },
      {
        patient_name: 'Ali Yılmaz',
        patient_email: 'ali.yilmaz@email.com',
        review_text: 'Ortodonti tedavim devam ediyor. İlk aylarda biraz zorluk yaşasam da doktor ve ekip çok destekleyici. Sonuçları görmeye başladım.',
        rating: 4,
        treatment_category: 'ortodonti',
        is_approved: false,
        is_featured: false,
        helpful_count: 0
      }
    ];

    // Verileri ekle
    const { data, error } = await supabase
      .from('patient_reviews')
      .insert(sampleReviews)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Sample data added successfully',
      count: data.length,
      data 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 