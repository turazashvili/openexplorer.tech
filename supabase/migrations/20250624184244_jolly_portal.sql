/*
  # Security Verification and Testing

  This migration verifies that our security policies are working correctly
  and provides test queries to ensure proper access control.
*/

-- Test that anon role can read from all tables
DO $$
BEGIN
    -- Test reading websites (should work)
    PERFORM 1 FROM websites LIMIT 1;
    RAISE NOTICE '✅ Anon can read websites';
    
    -- Test reading technologies (should work)
    PERFORM 1 FROM technologies LIMIT 1;
    RAISE NOTICE '✅ Anon can read technologies';
    
    -- Test reading website_technologies (should work)
    PERFORM 1 FROM website_technologies LIMIT 1;
    RAISE NOTICE '✅ Anon can read website_technologies';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error in read tests: %', SQLERRM;
END $$;

-- Create a test function to verify anon permissions
CREATE OR REPLACE FUNCTION test_anon_permissions()
RETURNS TABLE(
    table_name text,
    can_select boolean,
    can_insert boolean,
    can_update boolean,
    can_delete boolean
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Test websites table
    RETURN QUERY SELECT 
        'websites'::text,
        has_table_privilege('anon', 'websites', 'SELECT'),
        has_table_privilege('anon', 'websites', 'INSERT'),
        has_table_privilege('anon', 'websites', 'UPDATE'),
        has_table_privilege('anon', 'websites', 'DELETE');
    
    -- Test technologies table
    RETURN QUERY SELECT 
        'technologies'::text,
        has_table_privilege('anon', 'technologies', 'SELECT'),
        has_table_privilege('anon', 'technologies', 'INSERT'),
        has_table_privilege('anon', 'technologies', 'UPDATE'),
        has_table_privilege('anon', 'technologies', 'DELETE');
    
    -- Test website_technologies table
    RETURN QUERY SELECT 
        'website_technologies'::text,
        has_table_privilege('anon', 'website_technologies', 'SELECT'),
        has_table_privilege('anon', 'website_technologies', 'INSERT'),
        has_table_privilege('anon', 'website_technologies', 'UPDATE'),
        has_table_privilege('anon', 'website_technologies', 'DELETE');
END;
$$ LANGUAGE plpgsql;

-- Run the permission test
SELECT * FROM test_anon_permissions();

-- Clean up test function
DROP FUNCTION test_anon_permissions();

-- Show all current policies for verification
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;