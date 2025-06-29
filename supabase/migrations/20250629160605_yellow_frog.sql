/*
  # Clean up website metadata

  This migration removes page_title and page_url fields from all website metadata.
  These fields are redundant and should not be stored in the metadata JSONB column.

  1. Show current status before cleanup
  2. Remove page_title and page_url from all website metadata
  3. Verify cleanup was successful
  4. Show sample of cleaned data
*/

-- First, show current status before cleanup
SELECT 
    'Before cleanup' as status,
    COUNT(*) as total_websites,
    SUM(CASE WHEN metadata ? 'page_title' THEN 1 ELSE 0 END) as websites_with_page_title,
    SUM(CASE WHEN metadata ? 'page_url' THEN 1 ELSE 0 END) as websites_with_page_url,
    SUM(CASE WHEN metadata ? 'page_title' OR metadata ? 'page_url' THEN 1 ELSE 0 END) as websites_with_either_field
FROM websites;

-- Preview some examples before cleanup and perform the cleanup
DO $$
DECLARE
    sample_record RECORD;
    updated_count INTEGER;
BEGIN
    -- Show a few examples of what will be cleaned
    RAISE NOTICE 'Examples of metadata to be cleaned:';
    
    FOR sample_record IN 
        SELECT url, metadata->>'page_title' as page_title, metadata->>'page_url' as page_url
        FROM websites 
        WHERE metadata ? 'page_title' OR metadata ? 'page_url'
        LIMIT 5
    LOOP
        RAISE NOTICE 'URL: %, page_title: %, page_url: %', sample_record.url, sample_record.page_title, sample_record.page_url;
    END LOOP;

    -- Remove both page_title and page_url from all website metadata
    UPDATE websites 
    SET metadata = metadata - 'page_title' - 'page_url'
    WHERE metadata ? 'page_title' OR metadata ? 'page_url';

    -- Get count of affected rows
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE 'Updated % website records', updated_count;
END $$;

-- Show results after cleanup
SELECT 
    'After cleanup' as status,
    COUNT(*) as total_websites,
    SUM(CASE WHEN metadata ? 'page_title' THEN 1 ELSE 0 END) as websites_with_page_title,
    SUM(CASE WHEN metadata ? 'page_url' THEN 1 ELSE 0 END) as websites_with_page_url,
    SUM(CASE WHEN metadata ? 'page_title' OR metadata ? 'page_url' THEN 1 ELSE 0 END) as websites_with_either_field
FROM websites;

-- Verify the cleanup worked completely
DO $$
DECLARE
    remaining_page_titles INTEGER;
    remaining_page_urls INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_page_titles FROM websites WHERE metadata ? 'page_title';
    SELECT COUNT(*) INTO remaining_page_urls FROM websites WHERE metadata ? 'page_url';
    
    IF remaining_page_titles = 0 AND remaining_page_urls = 0 THEN
        RAISE NOTICE '✅ Cleanup successful! No page_title or page_url fields remain in metadata.';
    ELSE
        RAISE NOTICE '⚠️ Cleanup incomplete. Remaining page_titles: %, remaining page_urls: %', remaining_page_titles, remaining_page_urls;
    END IF;
END $$;

-- Show a sample of cleaned metadata to verify structure is intact
SELECT 
    'Sample cleaned metadata' as info,
    url,
    jsonb_pretty(metadata) as cleaned_metadata
FROM websites 
WHERE metadata IS NOT NULL 
AND jsonb_typeof(metadata) = 'object'
AND metadata != '{}'::jsonb
LIMIT 3;

-- Final summary
DO $$
BEGIN
    RAISE NOTICE 'Metadata cleanup migration completed successfully.';
    RAISE NOTICE 'All page_title and page_url fields have been removed from website metadata.';
    RAISE NOTICE 'Other metadata fields remain intact.';
END $$;