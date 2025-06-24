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
    const isLikelyTechnology = query && !query.includes('.') && !query.includes('/') && !query.includes('http');
    
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

      // Count query for category search
      countQueryBuilder = supabaseClient
        .from('websites')
        .select('id', { count: 'exact', head: true })
        .eq('website_technologies.technologies.category', category);

    } else if (isLikelyTechnology || tech) {
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
      countQueryBuilder = supabaseClient
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
        countQueryBuilder = supabaseClient
          .from('websites')
          .select('*', { count: 'exact', head: true })
          .ilike('url', `%${query}%`);
      } else {
        countQueryBuilder = supabaseClient
          .from('websites')
          .select('*', { count: 'exact', head: true });
      }
    }

    // Apply metadata filters to both query and count
    if (isResponsive !== null && isResponsive !== '') {
      queryBuilder = queryBuilder.eq('metadata->>is_responsive', isResponsive);
      if (countQueryBuilder) countQueryBuilder = countQueryBuilder.eq('metadata->>is_responsive', isResponsive);
    }

    if (isHttps !== null && isHttps !== '') {
      queryBuilder = queryBuilder.eq('metadata->>is_https', isHttps);
      if (countQueryBuilder) countQueryBuilder = countQueryBuilder.eq('metadata->>is_https', isHttps);
    }

    if (isSpa !== null && isSpa !== '') {
      queryBuilder = queryBuilder.eq('metadata->>likely_spa', isSpa);
      if (countQueryBuilder) countQueryBuilder = countQueryBuilder.eq('metadata->>likely_spa', isSpa);
    }

    if (hasServiceWorker !== null && hasServiceWorker !== '') {
      queryBuilder = queryBuilder.eq('metadata->>has_service_worker', hasServiceWorker);
      if (countQueryBuilder) countQueryBuilder = countQueryBuilder.eq('metadata->>has_service_worker', hasServiceWorker);
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

    // Execute both queries
    const [{ data: websites, error }, { count: totalCount, error: countError }] = await Promise.all([
      queryBuilder,
      countQueryBuilder || Promise.resolve({ count: 0, error: null })
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

    return new Response(
      JSON.stringify({
        results,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        },
        debug: {
          query,
          category,
          isLikelyTechnology,
          searchType: category ? 'category' : (isLikelyTechnology || tech ? 'technology' : 'url'),
          totalFound: websites?.length || 0
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