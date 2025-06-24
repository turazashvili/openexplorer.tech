/*
  # Add Enhanced Metadata Support

  1. Schema Changes
    - Add `metadata` JSONB column to `websites` table
    - Store rich website analysis data (performance, features, versions)

  2. Performance Indexes
    - GIN index for efficient JSONB queries
    - Specific indexes for commonly queried metadata fields
    - Support for filtering by website characteristics

  3. Security
    - Ensure public read access to metadata
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

-- Drop existing policy if it exists and recreate
DO $$
BEGIN
  -- Drop the policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'websites' 
    AND policyname = 'Allow public read access to website metadata'
  ) THEN
    DROP POLICY "Allow public read access to website metadata" ON websites;
  END IF;
  
  -- Create the policy
  EXECUTE 'CREATE POLICY "Allow public read access to website metadata" ON websites FOR SELECT TO public USING (true)';
END $$;