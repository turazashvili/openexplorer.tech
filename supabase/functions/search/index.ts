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
    
    let queryBuilder;
    let countQueryBuilder;

    if (tech) {
      // Explicit technology search - this is the key fix for technology pages
      console.log('🎯 Technology-specific search for:', tech);
      
      // First, find the exact technology by name (case-insensitive)
      const { data: technologyData, error: techError } = await supabaseClient
        .from('technologies')
        .select('id, name, category')
        .ilike('name', tech)
        .limit(1);

      if (techError || !technologyData || technologyData.length === 0) {
        console.log('❌ Technology not found:', tech);
        return new Response(
          JSON.stringify({
            results: [],
            suggestions: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            debug: { query: tech, searchType: 'technology_not_found', error: 'Technology not found' }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const technology = technologyData[0];
      console.log('✅ Found technology:', technology);

      // Main query for websites using this specific technology
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
        .eq('website_technologies.technology_id', technology.id);

      // FIXED: Count from website_technologies directly (much simpler and more reliable)
      countQueryBuilder = supabaseClient
        .from('website_technologies')
        .select('website_id', { count: 'exact', head: true })
        .eq('technology_id', technology.id);

    } else if (category) {
      // Category-based search
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

      // FIXED: Count from website_technologies with technology join
      countQueryBuilder = supabaseClient
        .from('website_technologies')
        .select('technologies!inner(*)', { count: 'exact', head: true })
        .eq('technologies.category', category);

    } else if (cleanQuery.length > 0) {
      // Combined URL and technology search
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
      
      // URL-based search patterns
      searchConditions.push(`url.ilike.%${cleanQuery}%`);
      
      // If query looks like it could be part of a domain, try with common TLDs
      if (!cleanQuery.includes('.') && cleanQuery.length > 2) {
        const commonTLDs = ['com', 'org', 'net', 'io', 'co', 'ai', 'app'];
        for (const tld of commonTLDs) {
          searchConditions.push(`url.ilike.%${cleanQuery}.${tld}%`);
          searchConditions.push(`url.ilike.${cleanQuery}.${tld}`);
        }
      }
      
      // If query has a TLD, try without www
      if (cleanQuery.includes('.')) {
        const withoutWww = cleanQuery.replace(/^www\./, '');
        searchConditions.push(`url.ilike.%${withoutWww}%`);
        searchConditions.push(`url.eq.${withoutWww}`);
      }
      
      // Try as subdomain
      if (!cleanQuery.includes('.')) {
        searchConditions.push(`url.ilike.${cleanQuery}.%`);
      }

      // Apply the combined search with OR logic
      const combinedFilter = `or(${searchConditions.join(',')})`;
      queryBuilder = queryBuilder.or(combinedFilter);
      countQueryBuilder = countQueryBuilder.or(combinedFilter);

      // ALSO search for websites that use technologies matching the query
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

      // FIXED: Create proper count query for technology search (same structure as main query)
      let techCountQueryBuilder = supabaseClient
        .from('websites')
        .select('id', { count: 'exact', head: true })
        .ilike('website_technologies.technologies.name', `%${cleanQuery}%`);

      // Apply metadata filters to both queries
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
      techCountQueryBuilder = applyMetadataFilters(techCountQueryBuilder);

      // Apply sorting
      const applySorting = (builder: any) => {
        if (sortBy === 'url') {
          return builder.order('url', { ascending: sortOrder === 'asc' });
        } else if (sortBy === 'load_time') {
          return builder.order('metadata->>page_load_time', { ascending: sortOrder === 'asc' });
        } else {
          return builder.order('last_scraped', { ascending: sortOrder === 'asc' });
        }
      };

      queryBuilder = applySorting(queryBuilder);
      techQueryBuilder = applySorting(techQueryBuilder);

      // Execute both URL and technology searches, plus count queries in parallel
      const [urlResults, techResults, { count: urlCount }, { count: techCount }] = await Promise.all([
        queryBuilder.range(offset, offset + limit - 1),
        techQueryBuilder.range(0, limit - 1),
        countQueryBuilder,
        techCountQueryBuilder
      ]);

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

      // FIXED: Use the proper count results

      // For combined search, we take the maximum count since we're deduplicating results
      // This gives a reasonable estimate of total unique websites
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
            searchType: 'combined',
            totalFound: results.length,
            urlResults: urlResults.data?.length || 0,
            techResults: techResults.data?.length || 0,
            totalCount: totalCount
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // FIXED: Apply metadata filters to count queries for technology and category searches
    const applyMetadataFiltersToCount = (builder: any, isJunctionTable: boolean = false) => {
      if (isResponsive !== null && isResponsive !== '') {
        const field = isJunctionTable ? 'websites.metadata->>is_responsive' : 'metadata->>is_responsive';
        builder = builder.eq(field, isResponsive === 'true');
      }
      if (isHttps !== null && isHttps !== '') {
        const field = isJunctionTable ? 'websites.metadata->>is_https' : 'metadata->>is_https';
        builder = builder.eq(field, isHttps === 'true');
      }
      if (isSpa !== null && isSpa !== '') {
        const field = isJunctionTable ? 'websites.metadata->>likely_spa' : 'metadata->>likely_spa';
        builder = builder.eq(field, isSpa === 'true');
      }
      if (hasServiceWorker !== null && hasServiceWorker !== '') {
        const field = isJunctionTable ? 'websites.metadata->>has_service_worker' : 'metadata->>has_service_worker';
        builder = builder.eq(field, hasServiceWorker === 'true');
      }
      return builder;
    };

    // Apply filters and sorting for technology/category searches
    if (tech || category) {
      // For count queries using junction table, we need to join with websites to apply metadata filters
      if (tech) {
        // Technology search: if we have metadata filters, we need to join with websites table
        if (isResponsive || isHttps || isSpa || hasServiceWorker) {
          countQueryBuilder = supabaseClient
            .from('website_technologies')
            .select('websites!inner(*)', { count: 'exact', head: true })
            .eq('technology_id', technologyData[0].id);
          countQueryBuilder = applyMetadataFiltersToCount(countQueryBuilder, true);
        }
      } else if (category) {
        // Category search: if we have metadata filters, we need to join with websites table
        if (isResponsive || isHttps || isSpa || hasServiceWorker) {
          countQueryBuilder = supabaseClient
            .from('website_technologies')
            .select('websites!inner(*), technologies!inner(*)', { count: 'exact', head: true })
            .eq('technologies.category', category);
          countQueryBuilder = applyMetadataFiltersToCount(countQueryBuilder, true);
        }
      }

      // Apply metadata filters to main query
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

    } else if (!cleanQuery) {
      // Default search: apply filters and sorting
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
    }

    // Execute queries
    const [{ data: websites, error }, { count: totalCount, error: countError }] = await Promise.all([
      queryBuilder,
      countQueryBuilder
    ]);

    if (error) {
      console.error('Search error:', error);
      return new Response(
        JSON.stringify({ error: 'Search failed', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (countError) {
      console.error('Count error:', countError);
      // Continue with 0 count rather than failing the entire request
    }

    console.log(`📊 Found ${websites?.length || 0} websites, total count: ${totalCount || 0}`);

    // Transform the data
    const results = websites?.map(website => {
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

    // Generate suggestions if no results
    let suggestions = [];
    if (results.length === 0 && cleanQuery && !isLikelyURL) {
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
          tech,
          category,
          searchType: tech ? 'technology' : (category ? 'category' : 'default'),
          totalFound: websites?.length || 0,
          totalCount: totalCount || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Search function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});