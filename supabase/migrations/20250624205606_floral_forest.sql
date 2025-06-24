-- Enable real-time for all tables
-- This migration ensures real-time subscriptions work properly

-- Safely enable real-time for websites table (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'websites'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE websites;
        RAISE NOTICE 'Added websites table to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'websites table already in supabase_realtime publication';
    END IF;
END $$;

-- Safely enable real-time for technologies table (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'technologies'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE technologies;
        RAISE NOTICE 'Added technologies table to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'technologies table already in supabase_realtime publication';
    END IF;
END $$;

-- Safely enable real-time for website_technologies table (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'website_technologies'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE website_technologies;
        RAISE NOTICE 'Added website_technologies table to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'website_technologies table already in supabase_realtime publication';
    END IF;
END $$;

-- Verify real-time is enabled
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND schemaname = 'public'
ORDER BY schemaname, tablename;

-- Show current real-time configuration for our tables
SELECT 
    t.table_name as tablename,
    CASE 
        WHEN pt.tablename IS NOT NULL THEN 'Enabled'
        ELSE 'Disabled'
    END as realtime_status
FROM information_schema.tables t
LEFT JOIN pg_publication_tables pt ON (
    t.table_schema = pt.schemaname AND 
    t.table_name = pt.tablename AND 
    pt.pubname = 'supabase_realtime'
)
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
AND t.table_name IN ('websites', 'technologies', 'website_technologies')
ORDER BY t.table_name;

-- Final verification message
DO $$
DECLARE
    enabled_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO enabled_count
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public'
    AND tablename IN ('websites', 'technologies', 'website_technologies');
    
    RAISE NOTICE 'Real-time migration completed. % out of 3 tables are enabled for real-time.', enabled_count;
END $$;