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

    // Extract domain from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const domain = decodeURIComponent(pathParts[pathParts.length - 1]);

    if (!domain) {
      return new Response(
        JSON.stringify({ error: 'Domain is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Looking for website with domain:', domain);

    // Fetch website with technologies and metadata by domain
    const { data: website, error } = await supabaseClient
      .from('websites')
      .select(`
        id,
        url,
        last_scraped,
        created_at,
        metadata,
        website_technologies (
          technologies (
            id,
            name,
            category
          )
        )
      `)
      .eq('url', domain)
      .single();

    if (error) {
      console.error('Website fetch error:', error);
      return new Response(
        JSON.stringify({ error: 'Website not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Found website:', website.url);

    // Transform the data
    const result = {
      id: website.id,
      url: website.url,
      lastScraped: website.last_scraped,
      createdAt: website.created_at,
      metadata: website.metadata || {},
      technologies: website.website_technologies.map(wt => ({
        id: wt.technologies.id,
        name: wt.technologies.name,
        category: wt.technologies.category
      }))
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Website by domain function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});