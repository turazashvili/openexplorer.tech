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

    // Extract technology ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const techId = pathParts[pathParts.length - 1];

    if (!techId) {
      return new Response(
        JSON.stringify({ error: 'Technology ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch technology with websites
    const { data: technology, error } = await supabaseClient
      .from('technologies')
      .select(`
        id,
        name,
        category,
        created_at,
        website_technologies (
          websites (
            id,
            url,
            last_scraped
          )
        )
      `)
      .eq('id', techId)
      .single();

    if (error) {
      console.error('Technology fetch error:', error);
      return new Response(
        JSON.stringify({ error: 'Technology not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform the data
    const result = {
      id: technology.id,
      name: technology.name,
      category: technology.category,
      createdAt: technology.created_at,
      websites: technology.website_technologies.map(wt => ({
        id: wt.websites.id,
        url: wt.websites.url,
        lastScraped: wt.websites.last_scraped
      }))
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Technology function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});