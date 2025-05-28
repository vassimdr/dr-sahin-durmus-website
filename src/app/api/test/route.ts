import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Environment variables kontrolü
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key exists:', !!supabaseKey);
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      }, { status: 500 });
    }

    // Supabase client oluştur
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Basit bir test query
    const { data, error } = await supabase
      .from('patient_reviews')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: 'Supabase connection failed',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Supabase connection successful',
      data 
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 