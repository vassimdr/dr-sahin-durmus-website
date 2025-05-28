// Video Sistemi Test Scripti
// Bu dosyayı çalıştırarak video sisteminin durumunu kontrol edebilirsiniz

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables eksik!');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Var' : '❌ Yok');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Var' : '❌ Yok');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVideoSystem() {
  console.log('🎬 Video sistemi test ediliyor...\n');

  try {
    // 1. Database bağlantısı test et
    console.log('1. Database bağlantısı test ediliyor...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('doctor_videos')
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      console.error('❌ Database bağlantı hatası:', healthError.message);
      
      if (healthError.message.includes('relation "doctor_videos" does not exist')) {
        console.log('\n🔧 Çözüm: new_simple_video_system.sql dosyasını Supabase SQL Editor\'da çalıştırın');
      }
      return;
    }

    console.log('✅ Database bağlantısı başarılı');
    console.log(`📊 Toplam video sayısı: ${healthCheck || 0}`);

    // 2. Videoları listele
    console.log('\n2. Mevcut videolar kontrol ediliyor...');
    const { data: videos, error: videosError } = await supabase
      .from('doctor_videos')
      .select('*')
      .limit(5);

    if (videosError) {
      console.error('❌ Video listesi alınamadı:', videosError.message);
      return;
    }

    if (videos && videos.length > 0) {
      console.log('✅ Videolar bulundu:');
      videos.forEach((video, index) => {
        console.log(`   ${index + 1}. ${video.title} (${video.category}) - ${video.is_active ? 'Aktif' : 'Pasif'}`);
      });
    } else {
      console.log('⚠️  Henüz video eklenmemiş');
    }

    // 3. Storage bucket kontrol et
    console.log('\n3. Storage bucket kontrol ediliyor...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Storage bucket listesi alınamadı:', bucketsError.message);
      return;
    }

    const videosBucket = buckets?.find(bucket => bucket.name === 'videos');
    if (videosBucket) {
      console.log('✅ Videos bucket bulundu');
      console.log(`   - Public: ${videosBucket.public ? 'Evet' : 'Hayır'}`);
      console.log(`   - File size limit: ${videosBucket.file_size_limit ? (videosBucket.file_size_limit / 1024 / 1024).toFixed(0) + 'MB' : 'Sınırsız'}`);
    } else {
      console.log('❌ Videos bucket bulunamadı');
      console.log('\n🔧 Çözüm: video_storage_setup.sql dosyasını Supabase SQL Editor\'da çalıştırın');
      return;
    }

    // 4. API endpoint test et
    console.log('\n4. API endpoint test ediliyor...');
    try {
      const response = await fetch('http://localhost:3000/api/doctor-videos');
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API endpoint çalışıyor');
        console.log(`📊 API\'den dönen video sayısı: ${result.data?.length || 0}`);
      } else {
        console.log('⚠️  API endpoint yanıt vermiyor (uygulama çalışmıyor olabilir)');
      }
    } catch (apiError) {
      console.log('⚠️  API endpoint test edilemedi (uygulama çalışmıyor olabilir)');
    }

    console.log('\n🎉 Video sistemi test tamamlandı!');
    
  } catch (error) {
    console.error('❌ Test sırasında hata:', error.message);
  }
}

// Test'i çalıştır
testVideoSystem().then(() => {
  console.log('\n📋 Sonraki adımlar:');
  console.log('1. npm run dev ile uygulamayı başlatın');
  console.log('2. http://localhost:3000/admin/videos adresini ziyaret edin');
  console.log('3. Video yüklemeyi test edin');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test başarısız:', error);
  process.exit(1);
}); 