-- SQL commands to remove page_url from website metadata

-- First, check how many records contain page_url
SELECT 
    COUNT(*) as total_with_page_url,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM websites) as percentage
FROM websites 
WHERE metadata ? 'page_url';

-- Preview some examples before cleanup (optional)
SELECT 
    url,
    metadata->>'page_url' as page_url_to_remove
FROM websites 
WHERE metadata ? 'page_url'
LIMIT 5;

-- Remove page_url from all website metadata
UPDATE websites 
SET metadata = metadata - 'page_url'
WHERE metadata ? 'page_url';

-- Verify the cleanup worked (should return 0)
SELECT COUNT(*) as remaining_page_urls
FROM websites 
WHERE metadata ? 'page_url';

-- Optional: Show a sample of cleaned metadata
SELECT 
    url,
    jsonb_pretty(metadata) as cleaned_metadata
FROM websites 
WHERE url = 'console.cloud.google.com'
LIMIT 1;