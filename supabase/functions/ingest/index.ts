import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface IngestPayload {
  url: string;
  technologies: string[];
  metadata?: Record<string, any>;
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
    const { url, technologies, metadata = {}, scraped_at }: IngestPayload = await req.json();

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

    console.log(`Processing ingest for ${cleanUrl} with ${technologies.length} technologies`);

    // Prepare website data with metadata
    const websiteData = {
      url: cleanUrl,
      last_scraped: scrapedAt.toISOString(),
      metadata: metadata
    };

    // Upsert website with metadata
    const { data: website, error: websiteError } = await supabaseClient
      .from('websites')
      .upsert(
        websiteData,
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
        JSON.stringify({ error: 'Failed to upsert website', details: websiteError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Website upserted: ${website.id}`);

    // Process technologies with enhanced categorization
    const techResults = [];
    const websiteTechLinks = [];

    for (const techName of technologies) {
      if (!techName || !techName.trim()) continue;

      const trimmedTechName = techName.trim();
      
      // Determine category based on technology name
      const category = categorizeTechnology(trimmedTechName);

      console.log(`Processing technology: ${trimmedTechName} -> ${category}`);

      // Upsert technology with improved categorization
      const { data: tech, error: techError } = await supabaseClient
        .from('technologies')
        .upsert(
          { 
            name: trimmedTechName,
            category: category
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

    console.log(`Processed ${techResults.length} technologies`);

    // Remove old technology links for this website to ensure clean state
    const { error: deleteError } = await supabaseClient
      .from('website_technologies')
      .delete()
      .eq('website_id', website.id);

    if (deleteError) {
      console.error('Error deleting old links:', deleteError);
    }

    // Link website to technologies
    if (websiteTechLinks.length > 0) {
      const { error: linkError } = await supabaseClient
        .from('website_technologies')
        .insert(websiteTechLinks);

      if (linkError) {
        console.error('Website-technology link error:', linkError);
        return new Response(
          JSON.stringify({ error: 'Failed to link technologies', details: linkError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    console.log(`Successfully linked ${websiteTechLinks.length} technologies to website`);

    return new Response(
      JSON.stringify({
        success: true,
        website: website,
        technologies_processed: techResults.length,
        technologies: techResults,
        metadata_stored: Object.keys(metadata).length,
        links_created: websiteTechLinks.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Ingest function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function categorizeTechnology(techName: string): string {
  const categories = {
    'JavaScript Framework': [
      'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 
      'Alpine.js', 'Ember.js', 'Backbone.js'
    ],
    'CSS Framework': [
      'Bootstrap', 'Tailwind CSS', 'Bulma', 'Foundation', 
      'Materialize', 'Semantic UI'
    ],
    'Content Management': [
      'WordPress', 'Drupal', 'Joomla', 'Shopify', 'Squarespace', 
      'Wix', 'Webflow', 'Magento', 'Ghost'
    ],
    'Analytics': [
      'Google Analytics', 'Google Tag Manager', 'Hotjar', 'Mixpanel', 
      'Facebook Pixel', 'Segment'
    ],
    'CDN': [
      'Cloudflare', 'AWS CloudFront', 'jsDelivr', 'unpkg', 
      'KeyCDN', 'MaxCDN'
    ],
    'E-commerce': [
      'WooCommerce', 'Stripe', 'PayPal', 'Square'
    ],
    'Development Tool': [
      'Lodash', 'Moment.js', 'D3.js', 'Three.js', 'Chart.js', 
      'Axios', 'Webpack', 'Vite', 'Parcel'
    ],
    'UI Library': [
      'Font Awesome', 'Material Icons', 'Feather Icons', 'Google Fonts'
    ],
    'Monitoring': [
      'Sentry', 'LogRocket', 'Intercom', 'Zendesk', 'Drift'
    ],
    'Performance': [
      'Lazy Loading', 'Service Worker', 'Web Workers'
    ],
    'JavaScript Library': [
      'jQuery'
    ],
    'Backend Service': [
      'Supabase', 'Firebase', 'AWS Amplify', 'Vercel', 'Netlify'
    ]
  };

  for (const [category, technologies] of Object.entries(categories)) {
    if (technologies.includes(techName)) {
      return category;
    }
  }

  return 'Other';
}