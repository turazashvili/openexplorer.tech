/*
  # Add metadata support to websites table

  1. Schema Changes
    - Add `metadata` JSONB column to `websites` table for storing rich website metadata
    - Add indexes for common metadata queries
    - Add RLS policies for metadata access

  2. Metadata Structure
    The metadata JSONB will store:
    - Page characteristics (responsive, https, spa, language)
    - Performance metrics (load_time, script_count, external_domains)
    - SEO data (meta_description_length, open_graph, twitter_cards)
    - Technology versions (react_version, vue_version, etc.)
    - Modern web features (service_worker, lazy_loading, webp_support)

  3. Indexes
    - GIN index on metadata for efficient JSONB queries
    - Specific indexes for commonly queried metadata fields
*/

-- Add metadata column to websites table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websites' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE websites ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- Add GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_websites_metadata_gin 
ON websites USING GIN (metadata);

-- Add specific indexes for commonly queried metadata fields
CREATE INDEX IF NOT EXISTS idx_websites_is_responsive 
ON websites USING BTREE ((metadata->>'is_responsive'));

CREATE INDEX IF NOT EXISTS idx_websites_is_https 
ON websites USING BTREE ((metadata->>'is_https'));

CREATE INDEX IF NOT EXISTS idx_websites_likely_spa 
ON websites USING BTREE ((metadata->>'likely_spa'));

CREATE INDEX IF NOT EXISTS idx_websites_page_load_time 
ON websites USING BTREE (((metadata->>'page_load_time')::numeric));

-- Add index for technology versions (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_websites_tech_versions 
ON websites USING GIN ((metadata->'versions'));

-- Update RLS policies to include metadata access
CREATE POLICY IF NOT EXISTS "Allow public read access to website metadata"
  ON websites
  FOR SELECT
  TO public
  USING (true);