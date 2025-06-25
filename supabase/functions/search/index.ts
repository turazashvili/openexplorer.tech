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
    let searchType = 'default';

    if (tech) {
      // Explicit technology search
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

      // Count query for technology search
      countQueryBuilder = supabaseClient
        .from('website_technologies')
        .select('website_id', { count: 'exact', head: true })
        .eq('technology_id', technology.id);

      searchType = 'technology';

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

      // Count query for category search
      countQueryBuilder = supabaseClient
        .from('website_technologies')
        .select('technologies!inner(*)', { count: 'exact', head: true })
        .eq('technologies.category', category);

      searchType = 'category';

    } else if (cleanQuery.length > 0) {
      // Combined URL and technology search - handle this separately and return early
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

      // Execute both searches with higher limits to get more comprehensive results
      const fetchLimit = Math.max(limit * 10, 200);
      
      const [urlResults, techResults] = await Promise.all([
        queryBuilder.range(0, fetchLimit - 1),
        techQueryBuilder.range(0, fetchLimit - 1)
      ]);

      // Combine and deduplicate results
      const allWebsites = [];
      const seenIds = new Set();

      // Add URL search results first (higher priority for search relevance)
      if (urlResults.data) {
        for (const website of urlResults.data) {
          if (!seenIds.has(website.id)) {
            allWebsites.push(website);
            seenIds.add(website.id);
          }
        }
      }

      // Add technology search results
      if (techResults.data) {
        for (const website of techResults.data) {
          if (!seenIds.has(website.id)) {
            allWebsites.push(website);
            seenIds.add(website.id);
          }
        }
      }

      // Calculate pagination
      const totalCount = allWebsites.length;
      const totalPages = Math.ceil(totalCount / limit);
      const paginatedResults = allWebsites.slice(offset, offset + limit);

      // Transform the combined data
      const results = paginatedResults.map(website => {
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
            totalPages: totalPages
          },
          debug: {
            query: cleanQuery,
            originalQuery: query,
            searchType: 'combined',
            totalFound: paginatedResults.length,
            urlResults: urlResults.data?.length || 0,
            techResults: techResults.data?.length || 0,
            totalUniqueResults: totalCount,
            fetchLimit: fetchLimit,
            totalCount: totalCount,
            note: 'Combined search with proper pagination'
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

      searchType = 'default';
    }

    // Apply metadata filters - this is now done ONCE for all search types except combined
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

    // Apply metadata filters to count queries with appropriate table references
    const applyMetadataFiltersToCount = (builder: any, searchType: string) => {
      if (searchType === 'technology' || searchType === 'category') {
        // For junction table queries, we need to join with websites to apply metadata filters
        if (isResponsive || isHttps || isSpa || hasServiceWorker) {
          if (searchType === 'technology') {
            builder = supabaseClient
              .from('website_technologies')
              .select('websites!inner(*)', { count: 'exact', head: true })
              .eq('technology_id', tech); // This will be replaced with the actual technology ID
          } else if (searchType === 'category') {
            builder = supabaseClient
              .from('website_technologies')
              .select('websites!inner(*), technologies!inner(*)', { count: 'exact', head: true })
              .eq('technologies.category', category);
          }

          // Apply metadata filters with websites table prefix
          if (isResponsive !== null && isResponsive !== '') {
            builder = builder.eq('websites.metadata->>is_responsive', isResponsive === 'true');
          }
          if (isHttps !== null && isHttps !== '') {
            builder = builder.eq('websites.metadata->>is_https', isHttps === 'true');
          }
          if (isSpa !== null && isSpa !== '') {
            builder = builder.eq('websites.metadata->>likely_spa', isSpa === 'true');
          }
          if (hasServiceWorker !== null && hasServiceWorker !== '') {
            builder = builder.eq('websites.metadata->>has_service_worker', hasServiceWorker === 'true');
          }
        }
      } else {
        // For direct websites table queries
        builder = applyMetadataFilters(builder);
      }
      return builder;
    };

    // Apply filters to main query
    queryBuilder = applyMetadataFilters(queryBuilder);
    
    // Apply filters to count query
    countQueryBuilder = applyMetadataFiltersToCount(countQueryBuilder, searchType);

    // Apply sorting - this is now done ONCE for all search types except combined
    if (sortBy === 'url') {
      queryBuilder = queryBuilder.order('url', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'load_time') {
      queryBuilder = queryBuilder.order('metadata->>page_load_time', { ascending: sortOrder === 'asc' });
    } else {
      queryBuilder = queryBuilder.order('last_scraped', { ascending: sortOrder === 'asc' });
    }

    // Apply pagination - this is now done ONCE for all search types except combined
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    // Execute queries - this is now done ONCE for all search types except combined
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
          searchType,
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