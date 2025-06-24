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

    // Determine if query is likely a technology name vs URL
    const isLikelyTechnology = query && !query.includes('.') && !query.includes('/');
    
    let queryBuilder;
    let countQuery;

    if (isLikelyTechnology || tech) {
      // Technology-based search
      const techToSearch = tech || query;
      
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
        .ilike('website_technologies.technologies.name', `%${techToSearch}%`);

      // Count query for technology search
      countQuery = supabaseClient
        .from('websites')
        .select('id', { count: 'exact', head: true })
        .eq('website_technologies.technologies.name', techToSearch);

    } else {
      // URL-based search or general search
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

      if (query) {
        queryBuilder = queryBuilder.ilike('url', `%${query}%`);
        countQuery = supabaseClient
          .from('websites')
          .select('*', { count: 'exact', head: true })
          .ilike('url', `%${query}%`);
      } else {
        countQuery = supabaseClient
          .from('websites')
          .select('*', { count: 'exact', head: true });
      }
    }

    // Apply category filter
    if (category) {
      queryBuilder = queryBuilder.eq('website_technologies.technologies.category', category);
    }

    // Apply metadata filters
    if (isResponsive !== null) {
      queryBuilder = queryBuilder.eq('metadata->>is_responsive', isResponsive);
      if (countQuery) countQuery = countQuery.eq('metadata->>is_responsive', isResponsive);
    }

    if (isHttps !== null) {
      queryBuilder = queryBuilder.eq('metadata->>is_https', isHttps);
      if (countQuery) countQuery = countQuery.eq('metadata->>is_https', isHttps);
    }

    if (isSpa !== null) {
      queryBuilder = queryBuilder.eq('metadata->>likely_spa', isSpa);
      if (countQuery) countQuery = countQuery.eq('metadata->>likely_spa', isSpa);
    }

    if (hasServiceWorker !== null) {
      queryBuilder = queryBuilder.eq('metadata->>has_service_worker', hasServiceWorker);
      if (countQuery) countQuery = countQuery.eq('metadata->>has_service_worker', hasServiceWorker);
    }

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

    const { data: websites, error } = await queryBuilder;

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

    // Transform the data to match frontend expectations
    const results = websites?.map(website => {
      // Get unique technologies for this website
      const technologies = website.website_technologies
        ?.map(wt => wt.technologies)
        ?.filter((tech, index, self) => 
          tech && index === self.findIndex(t => t && t.id === tech.id)
        ) || [];

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

    // Get total count for pagination
    let totalCount = 0;
    if (countQuery) {
      const { count } = await countQuery;
      totalCount = count || 0;
    } else {
      // Fallback count for technology searches
      const { count } = await supabaseClient
        .from('websites')
        .select('*', { count: 'exact', head: true });
      totalCount = count || 0;
    }

    return new Response(
      JSON.stringify({
        results,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        },
        debug: {
          query,
          isLikelyTechnology,
          searchType: isLikelyTechnology || tech ? 'technology' : 'url'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

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