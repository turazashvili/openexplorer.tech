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

    // Build the query
    let queryBuilder = supabaseClient
      .from('websites')
      .select(`
        id,
        url,
        last_scraped,
        website_technologies!inner (
          technologies (
            id,
            name,
            category
          )
        )
      `);

    // Apply filters
    if (query) {
      queryBuilder = queryBuilder.ilike('url', `%${query}%`);
    }

    if (tech) {
      queryBuilder = queryBuilder.eq('website_technologies.technologies.name', tech);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('website_technologies.technologies.category', category);
    }

    // Apply sorting
    if (sortBy === 'url') {
      queryBuilder = queryBuilder.order('url', { ascending: sortOrder === 'asc' });
    } else {
      queryBuilder = queryBuilder.order('last_scraped', { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data: websites, error, count } = await queryBuilder;

    if (error) {
      console.error('Search error:', error);
      return new Response(
        JSON.stringify({ error: 'Search failed' }),
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
        .map(wt => wt.technologies)
        .filter((tech, index, self) => 
          index === self.findIndex(t => t.id === tech.id)
        );

      return {
        id: website.id,
        url: website.url,
        technologies: technologies.map(tech => ({
          name: tech.name,
          category: tech.category
        })),
        lastScraped: website.last_scraped
      };
    }) || [];

    // Get total count for pagination
    const { count: totalCount } = await supabaseClient
      .from('websites')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        results,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Search function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});