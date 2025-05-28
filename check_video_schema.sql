-- Video tablolarının varlığını kontrol et
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('videos', 'video_categories', 'video_views', 'video_comments', 'video_playlists', 'playlist_videos');

-- Foreign key ilişkilerini kontrol et
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('videos', 'video_views', 'video_comments', 'playlist_videos');

-- Video kategorilerinin varlığını kontrol et
SELECT COUNT(*) as category_count FROM video_categories;

-- Video tablosunun yapısını kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
AND table_schema = 'public'
ORDER BY ordinal_position; 