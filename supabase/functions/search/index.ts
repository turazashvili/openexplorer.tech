import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Parse query parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    const query = searchParams.get('q') || '';
    const tech = searchParams.get('tech') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sort') || 'last_scraped';
    const sortOrder = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Metadata filters
    const isResponsive = searchParams.get('responsive');
    const isHttps = searchParams.get('https');
    const isSpa = searchParams.get('spa');
    const hasServiceWorker = searchParams.get('service_worker');

    console.log('🔍 Search params:', { query, category, tech, isResponsive, isHttps, isSpa, hasServiceWorker });

    // Enhanced query analysis
    const cleanQuery = query.trim().toLowerCase();
    const isLikelyURL = cleanQuery.includes('.') || cleanQuery.includes('/') || cleanQuery.startsWith('http');
    const isLikelyTechnology = !isLikelyURL && cleanQuery.length > 0;
    
    let queryBuilder;
    let countQueryBuilder;

    if (category) {
      // Category-based search - find websites that use technologies in this category
      queryBuilder = supabaseClient
        .from('websites')
        .select(`
          id,
          url,
          last_scraped,
          metadata,
          website_technologies!inner (
            technologies!inner (
              id,
              name,
              category
            )
          )
        `)
        .eq('website_technologies.technologies.category', category);

      // Separate count query for category search
      countQueryBuilder = supabaseClient
        .from('websites')
        .select('id', { count: 'exact', head: true })
        .eq('website_technologies.technologies.category', category);

    } else if (tech) {
      // Explicit technology search with partial matching
      queryBuilder = supabaseClient
        .from('websites')
        .select(`
          id,
          url,
          last_scraped,
          metadata,
          website_technologies!inner (
            technologies!inner (
              id,
              name,
              category
            )
          )
        `)
        .ilike('website_technologies.technologies.name', `%${tech}%`);

      // Count query for technology search
      countQueryBuilder = supabaseClient
        .from('websites')
        .select('id', { count: 'exact', head: true })
        .eq('website_technologies.technologies.name', tech);

    } else if (cleanQuery.length > 0) {
      // ENHANCED: Combined URL and technology search
      // This is the key fix - search BOTH URLs and technologies simultaneously
      
      console.log('🔍 Performing combined URL + technology search for:', cleanQuery);
      
      queryBuilder = supabaseClient
        .from('websites')
        .select(`
          id,
          url,
          last_scraped,
          metadata,
          website_technologies (
            technologies (
              id,
              name,
              category
            )
          )
        `);

      countQueryBuilder = supabaseClient
        .from('websites')
        .select('*', { count: 'exact', head: true });

      // Build comprehensive search conditions
      const searchConditions = [];
      
      // 1. URL-based search patterns
      searchConditions.push(`url.ilike.%${cleanQuery}%`);
      
      // 2. If query looks like it could be part of a domain, try with common TLDs
      if (!cleanQuery.includes('.') && cleanQuery.length > 2) {
        const commonTLDs = ['com', 'org', 'net', 'io', 'co', 'ai', 'app'];
        for (const tld of commonTLDs) {
          searchConditions.push(`url.ilike.%${cleanQuery}.${tld}%`);
          searchConditions.push(`url.ilike.${cleanQuery}.${tld}`); // Exact match
        }
      }
      
      // 3. If query has a TLD, try without www
      if (cleanQuery.includes('.')) {
        const withoutWww = cleanQuery.replace(/^www\./, '');
        searchConditions.push(`url.ilike.%${withoutWww}%`);
        searchConditions.push(`url.eq.${withoutWww}`); // Exact match
      }
      
      // 4. Try as subdomain
      if (!cleanQuery.includes('.')) {
        searchConditions.push(`url.ilike.${cleanQuery}.%`);
      }

      console.log('🔍 Search conditions:', searchConditions);

      // Apply the combined search with OR logic
      const combinedFilter = `or(${searchConditions.join(',')})`;
      queryBuilder = queryBuilder.or(combinedFilter);
      countQueryBuilder = countQueryBuilder.or(combinedFilter);

      // ALSO search for websites that use technologies matching the query
      // This is done in a separate query and then combined
      let techQueryBuilder = supabaseClient
        .from('websites')
        .select(`
          id,
          url,
          last_scraped,
          metadata,
          website_technologies!inner (
            technologies!inner (
              id,
              name,
              category
            )
          )
        `)
        .ilike('website_technologies.technologies.name', `%${cleanQuery}%`);

      // Apply metadata filters to tech query too
      const applyMetadataFilters = (builder: any) => {
        if (isResponsive !== null && isResponsive !== '') {
          builder = builder.eq('metadata->>is_responsive', isResponsive === 'true');
        }
        if (isHttps !== null && isHttps !== '') {
          builder = builder.eq('metadata->>is_https', isHttps === 'true');
        }
        if (isSpa !== null && isSpa !== '') {
          builder = builder.eq('metadata->>likely_spa', isSpa === 'true');
        }
        if (hasServiceWorker !== null && hasServiceWorker !== '') {
          builder = builder.eq('metadata->>has_service_worker', hasServiceWorker === 'true');
        }
        return builder;
      };

      queryBuilder = applyMetadataFilters(queryBuilder);
      countQueryBuilder = applyMetadataFilters(countQueryBuilder);
      techQueryBuilder = applyMetadataFilters(techQueryBuilder);

      // Apply sorting to both queries
      if (sortBy === 'url') {
        queryBuilder = queryBuilder.order('url', { ascending: sortOrder === 'asc' });
        techQueryBuilder = techQueryBuilder.order('url', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'load_time') {
        queryBuilder = queryBuilder.order('metadata->>page_load_time', { ascending: sortOrder === 'asc' });
        techQueryBuilder = techQueryBuilder.order('metadata->>page_load_time', { ascending: sortOrder === 'asc' });
      } else {
        queryBuilder = queryBuilder.order('last_scraped', { ascending: sortOrder === 'asc' });
        techQueryBuilder = techQueryBuilder.order('last_scraped', { ascending: sortOrder === 'asc' });
      }

      // Execute both URL and technology searches
      const [urlResults, techResults] = await Promise.all([
        queryBuilder.range(offset, offset + limit - 1),
        techQueryBuilder.range(0, limit - 1) // Get some tech results too
      ]);

      console.log('📊 URL search results:', urlResults.data?.length || 0);
      console.log('📊 Tech search results:', techResults.data?.length || 0);

      // Combine and deduplicate results
      const allWebsites = [];
      const seenIds = new Set();

      // Add URL search results first (higher priority)
      if (urlResults.data) {
        for (const website of urlResults.data) {
          if (!seenIds.has(website.id)) {
            allWebsites.push(website);
            seenIds.add(website.id);
          }
        }
      }

      // Add technology search results (fill remaining slots)
      if (techResults.data) {
        for (const website of techResults.data) {
          if (!seenIds.has(website.id) && allWebsites.length < limit) {
            allWebsites.push(website);
            seenIds.add(website.id);
          }
        }
      }

      // Get total count (approximate)
      const { count: urlCount } = await countQueryBuilder;
      const { count: techCount } = await supabaseClient
        .from('websites')
        .select('id', { count: 'exact', head: true })
        .ilike('website_technologies.technologies.name', `%${cleanQuery}%`);

      const totalCount = Math.max(urlCount || 0, techCount || 0);

      // Transform the combined data
      const results = allWebsites.map(website => {
        let technologies = [];
        
        if (website.website_technologies && Array.isArray(website.website_technologies)) {
          technologies = website.website_technologies
            .map(wt => wt.technologies)
            .filter((tech, index, self) => 
              tech && index === self.findIndex(t => t && t.id === tech.id)
            );
        }

        return {
          id: website.id,
          url: website.url,
          technologies: technologies.map(tech => ({
            name: tech.name,
            category: tech.category
          })),
          lastScraped: website.last_scraped,
          metadata: website.metadata || {}
        };
      });

      // Generate suggestions if no results
      let suggestions = [];
      if (results.length === 0) {
        const { data: similarTechs } = await supabaseClient
          .from('technologies')
          .select('name, category')
          .ilike('name', `%${cleanQuery}%`)
          .limit(5);
        
        if (similarTechs && similarTechs.length > 0) {
          suggestions = similarTechs.map(tech => ({
            type: 'technology',
            name: tech.name,
            category: tech.category,
            suggestion: `Search for websites using ${tech.name}`
          }));
        }
      }

      return new Response(
        JSON.stringify({
          results,
          suggestions,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
          },
          debug: {
            query: cleanQuery,
            originalQuery: query,
            category,
            isLikelyURL,
            isLikelyTechnology,
            searchType: 'combined',
            totalFound: results.length,
            urlResults: urlResults.data?.length || 0,
            techResults: techResults.data?.length || 0,
            appliedFilters: {
              responsive: isResponsive,
              https: isHttps,
              spa: isSpa,
              service_worker: hasServiceWorker
            }
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else {
      // Default: show recent websites
      queryBuilder = supabaseClient
        .from('websites')
        .select(`
          id,
          url,
          last_scraped,
          metadata,
          website_technologies (
            technologies (
              id,
              name,
              category
            )
          )
        `);

      countQueryBuilder = supabaseClient
        .from('websites')
        .select('*', { count: 'exact', head: true });
    }

    // Apply metadata filters to both queries (for non-combined searches)
    const applyMetadataFilters = (builder: any) => {
      if (isResponsive !== null && isResponsive !== '') {
        builder = builder.eq('metadata->>is_responsive', isResponsive === 'true');
      }
      if (isHttps !== null && isHttps !== '') {
        builder = builder.eq('metadata->>is_https', isHttps === 'true');
      }
      if (isSpa !== null && isSpa !== '') {
        builder = builder.eq('metadata->>likely_spa', isSpa === 'true');
      }
      if (hasServiceWorker !== null && hasServiceWorker !== '') {
        builder = builder.eq('metadata->>has_service_worker', hasServiceWorker === 'true');
      }
      return builder;
    };

    if (queryBuilder && !cleanQuery) { // Only apply if not already handled above
      queryBuilder = applyMetadataFilters(queryBuilder);
      countQueryBuilder = applyMetadataFilters(countQueryBuilder);

      // Apply sorting
      if (sortBy === 'url') {
        queryBuilder = queryBuilder.order('url', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'load_time') {
        queryBuilder = queryBuilder.order('metadata->>page_load_time', { ascending: sortOrder === 'asc' });
      } else {
        queryBuilder = queryBuilder.order('last_scraped', { ascending: sortOrder === 'asc' });
      }

      // Apply pagination
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);

      // Execute both queries in parallel
      const [{ data: websites, error }, { count: totalCount, error: countError }] = await Promise.all([
        queryBuilder,
        countQueryBuilder
      ]);

      if (error) {
        console.error('Search error:', error);
        return new Response(
          JSON.stringify({ error: 'Search failed', details: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (countError) {
        console.error('Count error:', countError);
      }

      console.log(`📊 Found ${websites?.length || 0} websites, total count: ${totalCount || 0}`);

      // Transform the data to match frontend expectations
      const results = websites?.map(website => {
        // Get unique technologies for this website
        let technologies = [];
        
        if (website.website_technologies && Array.isArray(website.website_technologies)) {
          technologies = website.website_technologies
            .map(wt => wt.technologies)
            .filter((tech, index, self) => 
              tech && index === self.findIndex(t => t && t.id === tech.id)
            );
        }

        return {
          id: website.id,
          url: website.url,
          technologies: technologies.map(tech => ({
            name: tech.name,
            category: tech.category
          })),
          lastScraped: website.last_scraped,
          metadata: website.metadata || {}
        };
      }) || [];

      // If no results found and query looks like it could be a technology, suggest technology search
      let suggestions = [];
      if (results.length === 0 && cleanQuery && !isLikelyURL) {
        // Search for similar technology names
        const { data: similarTechs } = await supabaseClient
          .from('technologies')
          .select('name, category')
          .ilike('name', `%${cleanQuery}%`)
          .limit(5);
        
        if (similarTechs && similarTechs.length > 0) {
          suggestions = similarTechs.map(tech => ({
            type: 'technology',
            name: tech.name,
            category: tech.category,
            suggestion: `Search for websites using ${tech.name}`
          }));
        }
      }

      return new Response(
        JSON.stringify({
          results,
          suggestions,
          pagination: {
            page,
            limit,
            total: totalCount || 0,
            totalPages: Math.ceil((totalCount || 0) / limit)
          },
          debug: {
            query: cleanQuery,
            originalQuery: query,
            category,
            isLikelyURL,
            isLikelyTechnology,
            searchType: category ? 'category' : (tech ? 'technology' : 'default'),
            totalFound: websites?.length || 0,
            appliedFilters: {
              responsive: isResponsive,
              https: isHttps,
              spa: isSpa,
              service_worker: hasServiceWorker
            }
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Search function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});