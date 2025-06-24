-- Enable real-time for all tables
-- This migration ensures real-time subscriptions work properly

-- Enable real-time for websites table
ALTER PUBLICATION supabase_realtime ADD TABLE websites;

-- Enable real-time for technologies table  
ALTER PUBLICATION supabase_realtime ADD TABLE technologies;

-- Enable real-time for website_technologies table
ALTER PUBLICATION supabase_realtime ADD TABLE website_technologies;

-- Verify real-time is enabled
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;

-- Show current real-time configuration
SELECT 
    t.table_schema as schemaname,
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
ORDER BY t.table_name;