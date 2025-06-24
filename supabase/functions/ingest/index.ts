import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface IngestPayload {
  url: string;
  technologies: string[];
  scraped_at?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { url, technologies, scraped_at }: IngestPayload = await req.json();

    if (!url || !technologies || !Array.isArray(technologies)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: url, technologies' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Clean and validate URL
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const scrapedAt = scraped_at ? new Date(scraped_at) : new Date();

    // Upsert website
    const { data: website, error: websiteError } = await supabaseClient
      .from('websites')
      .upsert(
        { 
          url: cleanUrl, 
          last_scraped: scrapedAt.toISOString() 
        },
        { 
          onConflict: 'url',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single();

    if (websiteError) {
      console.error('Website upsert error:', websiteError);
      return new Response(
        JSON.stringify({ error: 'Failed to upsert website' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process technologies
    const techResults = [];
    const websiteTechLinks = [];

    for (const techName of technologies) {
      if (!techName.trim()) continue;

      // Upsert technology
      const { data: tech, error: techError } = await supabaseClient
        .from('technologies')
        .upsert(
          { 
            name: techName.trim(),
            category: 'Other' // Default category, can be updated later
          },
          { 
            onConflict: 'name',
            ignoreDuplicates: false 
          }
        )
        .select()
        .single();

      if (techError) {
        console.error('Technology upsert error:', techError);
        continue;
      }

      techResults.push(tech);
      websiteTechLinks.push({
        website_id: website.id,
        technology_id: tech.id
      });
    }

    // Link website to technologies
    if (websiteTechLinks.length > 0) {
      const { error: linkError } = await supabaseClient
        .from('website_technologies')
        .upsert(websiteTechLinks, { 
          onConflict: 'website_id,technology_id',
          ignoreDuplicates: true 
        });

      if (linkError) {
        console.error('Website-technology link error:', linkError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        website: website,
        technologies_processed: techResults.length,
        technologies: techResults
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Ingest function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});