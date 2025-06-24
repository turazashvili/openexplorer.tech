/*
  # Enable Real-time Subscriptions

  This migration ensures real-time subscriptions work properly for all tables.
  It safely adds tables to the real-time publication only if they're not already included.

  1. Real-time Configuration
     - Safely enable real-time for websites table
     - Safely enable real-time for technologies table  
     - Safely enable real-time for website_technologies table
  
  2. Verification
     - Query to verify real-time status for all tables
     - Show current real-time configuration
*/

-- Function to safely add table to real-time publication
DO $$
BEGIN
  -- Add websites table to real-time publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'websites'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE websites;
    RAISE NOTICE 'Added websites table to real-time publication';
  ELSE
    RAISE NOTICE 'websites table already in real-time publication';
  END IF;

  -- Add technologies table to real-time publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'technologies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE technologies;
    RAISE NOTICE 'Added technologies table to real-time publication';
  ELSE
    RAISE NOTICE 'technologies table already in real-time publication';
  END IF;

  -- Add website_technologies table to real-time publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'website_technologies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE website_technologies;
    RAISE NOTICE 'Added website_technologies table to real-time publication';
  ELSE
    RAISE NOTICE 'website_technologies table already in real-time publication';
  END IF;
END $$;

-- Create a view to easily check real-time status
CREATE OR REPLACE VIEW realtime_status AS
SELECT 
    t.table_name,
    t.table_schema,
    CASE 
        WHEN pt.tablename IS NOT NULL THEN 'Enabled'
        ELSE 'Disabled'
    END as realtime_status,
    pt.pubname
FROM information_schema.tables t
LEFT JOIN pg_publication_tables pt ON (
    t.table_schema = pt.schemaname AND 
    t.table_name = pt.tablename AND 
    pt.pubname = 'supabase_realtime'
)
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- Display current real-time configuration
SELECT 
    'Real-time configuration applied successfully' as status,
    COUNT(*) as tables_with_realtime
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND schemaname = 'public';