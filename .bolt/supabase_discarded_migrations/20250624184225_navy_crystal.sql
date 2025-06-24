/*
  # Comprehensive Security Policies for TechLookup Database

  1. Security Model
    - `websites` table: Allow public READ, authenticated WRITE (for extensions)
    - `technologies` table: Allow public READ ONLY (managed by edge functions)
    - `website_technologies` table: Allow public READ ONLY (managed by edge functions)
  
  2. Protection Strategy
    - Anonymous users can only read data and write to websites table
    - Only service role can modify technologies and website_technologies
    - Prevent any DELETE operations from public access
    - Edge functions use service role for full control

  3. Changes
    - Remove all existing policies
    - Create new restrictive policies
    - Ensure data integrity and prevent abuse
*/

-- First, disable RLS temporarily to clean up
ALTER TABLE websites DISABLE ROW LEVEL SECURITY;
ALTER TABLE technologies DISABLE ROW LEVEL SECURITY;
ALTER TABLE website_technologies DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on websites table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'websites')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON websites';
    END LOOP;
    
    -- Drop all policies on technologies table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'technologies')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON technologies';
    END LOOP;
    
    -- Drop all policies on website_technologies table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'website_technologies')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON website_technologies';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_technologies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- WEBSITES TABLE POLICIES
-- =====================================================

-- Allow public to read all website data
CREATE POLICY "Public can read websites"
  ON websites
  FOR SELECT
  TO public
  USING (true);

-- Allow anonymous users to INSERT new websites (for Chrome extension)
CREATE POLICY "Anonymous can insert websites"
  ON websites
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to UPDATE existing websites (for Chrome extension)
CREATE POLICY "Anonymous can update websites"
  ON websites
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- EXPLICITLY DENY DELETE operations for all non-service roles
CREATE POLICY "Deny delete websites"
  ON websites
  FOR DELETE
  TO public
  USING (false);

-- =====================================================
-- TECHNOLOGIES TABLE POLICIES
-- =====================================================

-- Allow public to read all technology data
CREATE POLICY "Public can read technologies"
  ON technologies
  FOR SELECT
  TO public
  USING (true);

-- DENY all write operations to non-service roles
-- Only edge functions with service role can modify technologies
CREATE POLICY "Deny insert technologies"
  ON technologies
  FOR INSERT
  TO public
  WITH CHECK (false);

CREATE POLICY "Deny update technologies"
  ON technologies
  FOR UPDATE
  TO public
  USING (false);

CREATE POLICY "Deny delete technologies"
  ON technologies
  FOR DELETE
  TO public
  USING (false);

-- =====================================================
-- WEBSITE_TECHNOLOGIES TABLE POLICIES
-- =====================================================

-- Allow public to read all website-technology relationships
CREATE POLICY "Public can read website_technologies"
  ON website_technologies
  FOR SELECT
  TO public
  USING (true);

-- DENY all write operations to non-service roles
-- Only edge functions with service role can modify relationships
CREATE POLICY "Deny insert website_technologies"
  ON website_technologies
  FOR INSERT
  TO public
  WITH CHECK (false);

CREATE POLICY "Deny update website_technologies"
  ON website_technologies
  FOR UPDATE
  TO public
  USING (false);

CREATE POLICY "Deny delete website_technologies"
  ON website_technologies
  FOR DELETE
  TO public
  USING (false);

-- =====================================================
-- ADDITIONAL SECURITY MEASURES
-- =====================================================

-- Ensure the anon role has the minimum required permissions
-- Grant SELECT on all tables to anon (for reading)
GRANT SELECT ON websites TO anon;
GRANT SELECT ON technologies TO anon;
GRANT SELECT ON website_technologies TO anon;

-- Grant INSERT and UPDATE on websites only to anon (for Chrome extension)
GRANT INSERT, UPDATE ON websites TO anon;

-- Ensure anon can use sequences for websites table
GRANT USAGE ON SEQUENCE websites_id_seq TO anon;

-- Revoke any dangerous permissions from anon role
REVOKE DELETE ON websites FROM anon;
REVOKE INSERT, UPDATE, DELETE ON technologies FROM anon;
REVOKE INSERT, UPDATE, DELETE ON website_technologies FROM anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify policies are in place
DO $$
BEGIN
    RAISE NOTICE 'Security policies created successfully!';
    RAISE NOTICE 'Websites table policies: %', (SELECT count(*) FROM pg_policies WHERE tablename = 'websites');
    RAISE NOTICE 'Technologies table policies: %', (SELECT count(*) FROM pg_policies WHERE tablename = 'technologies');
    RAISE NOTICE 'Website_technologies table policies: %', (SELECT count(*) FROM pg_policies WHERE tablename = 'website_technologies');
END $$;