-- SQL commands to remove page_title from website metadata

-- First, check how many records contain page_title
SELECT 
    COUNT(*) as total_with_page_title,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM websites) as percentage
FROM websites 
WHERE metadata ? 'page_title';

-- Preview some examples before cleanup (optional)
SELECT 
    url,
    metadata->>'page_title' as page_title_to_remove
FROM websites 
WHERE metadata ? 'page_title'
LIMIT 5;

-- Remove page_title from all website metadata
UPDATE websites 
SET metadata = metadata - 'page_title'
WHERE metadata ? 'page_title';

-- Verify the cleanup worked (should return 0)
SELECT COUNT(*) as remaining_page_titles
FROM websites 
WHERE metadata ? 'page_title';

-- Optional: Show a sample of cleaned metadata
SELECT 
    url,
    jsonb_pretty(metadata) as cleaned_metadata
FROM websites 
WHERE metadata IS NOT NULL
LIMIT 3;