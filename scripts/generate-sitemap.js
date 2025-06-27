#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator for Website URLs
 * 
 * This script generates sitemap-websites.xml by fetching all websites from the database.
 * Run this script whenever you want to update the sitemap with current database content.
 * 
 * Usage:
 * node scripts/generate-sitemap.js
 * 
 * In production, you could run this:
 * - As a cron job (daily/weekly)
 * - After database updates via webhook
 * - During build process
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateWebsitesSitemap() {
  console.log('🔍 Fetching websites from database...');
  
  try {
    // Fetch all websites from database
    const { data: websites, error } = await supabase
      .from('websites')
      .select('url, last_scraped')
      .order('last_scraped', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`📊 Found ${websites.length} websites`);

    // Generate XML sitemap
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const xmlFooter = '</urlset>';
    
    const urls = websites.map(website => {
      const lastmod = new Date(website.last_scraped).toISOString().split('T')[0];
      return `  <url>
    <loc>https://openexplorer.tech/website/${encodeURIComponent(website.url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }).join('\n');

    const sitemapContent = [
      xmlHeader,
      `  <!-- Generated on ${new Date().toISOString()} -->`,
      `  <!-- Contains ${websites.length} website pages -->`,
      '',
      urls,
      xmlFooter
    ].join('\n');

    // Write to public directory
    const outputPath = path.join(process.cwd(), 'public', 'sitemap-websites.xml');
    fs.writeFileSync(outputPath, sitemapContent, 'utf8');

    console.log(`✅ Generated sitemap with ${websites.length} websites`);
    console.log(`📁 Saved to: ${outputPath}`);

    // Also update the main sitemap index with current date
    const sitemapIndexPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://openexplorer.tech/sitemap-main.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://openexplorer.tech/sitemap-technologies.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://openexplorer.tech/sitemap-websites.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

    fs.writeFileSync(sitemapIndexPath, sitemapIndex, 'utf8');
    console.log('✅ Updated sitemap index');

  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateWebsitesSitemap();