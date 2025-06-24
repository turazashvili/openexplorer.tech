/*
  # Remove Security Definer View

  1. Security Fix
    - Drop the problematic `realtime_status` view that uses SECURITY DEFINER
    - This view is not needed for our application functionality
    - Resolves the security warning from Supabase

  2. Notes
    - The realtime_status view was likely created automatically by Supabase
    - We don't use this view in our application
    - Removing it eliminates the security concern without affecting functionality
*/

-- Drop the problematic realtime_status view if it exists
DROP VIEW IF EXISTS public.realtime_status;

-- Ensure we don't have any other security definer views
-- This query will help identify any other problematic views (for reference only)
-- SELECT schemaname, viewname, definition 
-- FROM pg_views 
-- WHERE schemaname = 'public' 
-- AND definition ILIKE '%security definer%';