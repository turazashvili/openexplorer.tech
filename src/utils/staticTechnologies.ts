// Static technology definitions for generating routes
// This ensures every technology has a guaranteed page

export interface StaticTechnology {
  name: string;
  slug: string;
  category: string;
  description?: string;
}

export const STATIC_TECHNOLOGIES: StaticTechnology[] = [
  // JavaScript Frameworks
  { name: 'React', slug: 'react', category: 'JavaScript Framework', description: 'A JavaScript library for building user interfaces' },
  { name: 'Vue.js', slug: 'vue-js', category: 'JavaScript Framework', description: 'The Progressive JavaScript Framework' },
  { name: 'Angular', slug: 'angular', category: 'JavaScript Framework', description: 'Platform for building mobile and desktop web applications' },
  { name: 'Next.js', slug: 'next-js', category: 'JavaScript Framework', description: 'The React Framework for Production' },
  { name: 'Nuxt.js', slug: 'nuxt-js', category: 'JavaScript Framework', description: 'The Intuitive Vue Framework' },
  { name: 'Svelte', slug: 'svelte', category: 'JavaScript Framework', description: 'Cybernetically enhanced web apps' },
  { name: 'Alpine.js', slug: 'alpine-js', category: 'JavaScript Framework', description: 'A rugged, minimal framework for composing JavaScript behavior' },
  { name: 'Ember.js', slug: 'ember-js', category: 'JavaScript Framework', description: 'A framework for ambitious web developers' },
  { name: 'Backbone.js', slug: 'backbone-js', category: 'JavaScript Framework', description: 'Give your JS App some Backbone with Models, Views, Collections, and Events' },

  // CSS Frameworks
  { name: 'Bootstrap', slug: 'bootstrap', category: 'CSS Framework', description: 'The most popular HTML, CSS, and JS library in the world' },
  { name: 'Tailwind CSS', slug: 'tailwind-css', category: 'CSS Framework', description: 'A utility-first CSS framework for rapidly building custom designs' },
  { name: 'Bulma', slug: 'bulma', category: 'CSS Framework', description: 'Modern CSS framework based on Flexbox' },
  { name: 'Foundation', slug: 'foundation', category: 'CSS Framework', description: 'The most advanced responsive front-end framework in the world' },
  { name: 'Materialize', slug: 'materialize', category: 'CSS Framework', description: 'A modern responsive front-end framework based on Material Design' },
  { name: 'Semantic UI', slug: 'semantic-ui', category: 'CSS Framework', description: 'User Interface is the language of the web' },

  // Content Management Systems
  { name: 'WordPress', slug: 'wordpress', category: 'Content Management', description: 'WordPress is open source software you can use to create a beautiful website, blog, or app' },
  { name: 'Drupal', slug: 'drupal', category: 'Content Management', description: 'Drupal is an open source platform for building amazing digital experiences' },
  { name: 'Joomla', slug: 'joomla', category: 'Content Management', description: 'Joomla! is an award-winning content management system (CMS)' },
  { name: 'Shopify', slug: 'shopify', category: 'Content Management', description: 'Everything you need to sell online' },
  { name: 'Squarespace', slug: 'squarespace', category: 'Content Management', description: 'Everything to sell anything' },
  { name: 'Wix', slug: 'wix', category: 'Content Management', description: 'Create a website you\'re proud of' },
  { name: 'Webflow', slug: 'webflow', category: 'Content Management', description: 'The web design platform for the modern web' },
  { name: 'Magento', slug: 'magento', category: 'Content Management', description: 'Commerce, Evolved' },
  { name: 'Ghost', slug: 'ghost', category: 'Content Management', description: 'Turn your audience into a business' },

  // Analytics & Tracking
  { name: 'Google Analytics', slug: 'google-analytics', category: 'Analytics', description: 'Measure your advertising ROI as well as track your Flash, video, and social networking sites and applications' },
  { name: 'Google Tag Manager', slug: 'google-tag-manager', category: 'Analytics', description: 'Google Tag Manager helps make tag management simple, easy and reliable' },
  { name: 'Hotjar', slug: 'hotjar', category: 'Analytics', description: 'See how visitors are really using your website, collect user feedback and turn more visitors into customers' },
  { name: 'Mixpanel', slug: 'mixpanel', category: 'Analytics', description: 'Product analytics that convert' },
  { name: 'Facebook Pixel', slug: 'facebook-pixel', category: 'Analytics', description: 'Measure, optimize and build audiences for your ad campaigns' },
  { name: 'Segment', slug: 'segment', category: 'Analytics', description: 'The leading customer data platform' },

  // CDN & Infrastructure
  { name: 'Cloudflare', slug: 'cloudflare', category: 'CDN', description: 'The Web Performance & Security Company' },
  { name: 'AWS CloudFront', slug: 'aws-cloudfront', category: 'CDN', description: 'Fast, highly secure and programmable content delivery network (CDN)' },
  { name: 'jsDelivr', slug: 'jsdelivr', category: 'CDN', description: 'A free CDN for open source projects' },
  { name: 'unpkg', slug: 'unpkg', category: 'CDN', description: 'A fast, global content delivery network for everything on npm' },

  // E-commerce & Payments
  { name: 'WooCommerce', slug: 'woocommerce', category: 'E-commerce', description: 'The most customizable eCommerce platform for building your online business' },
  { name: 'Stripe', slug: 'stripe', category: 'E-commerce', description: 'Online payment processing for internet businesses' },
  { name: 'PayPal', slug: 'paypal', category: 'E-commerce', description: 'Send Money, Pay Online or Set Up a Merchant Account' },
  { name: 'Square', slug: 'square', category: 'E-commerce', description: 'Solutions to run your business' },

  // Development Tools & Libraries
  { name: 'jQuery', slug: 'jquery', category: 'JavaScript Library', description: 'Write less, do more' },
  { name: 'Lodash', slug: 'lodash', category: 'Development Tool', description: 'A modern JavaScript utility library delivering modularity, performance & extras' },
  { name: 'Moment.js', slug: 'moment-js', category: 'Development Tool', description: 'Parse, validate, manipulate, and display dates and times in JavaScript' },
  { name: 'D3.js', slug: 'd3-js', category: 'Development Tool', description: 'Data-Driven Documents' },
  { name: 'Three.js', slug: 'three-js', category: 'Development Tool', description: 'JavaScript 3D library' },
  { name: 'Chart.js', slug: 'chart-js', category: 'Development Tool', description: 'Simple yet flexible JavaScript charting for designers & developers' },
  { name: 'Axios', slug: 'axios', category: 'Development Tool', description: 'Promise based HTTP client for the browser and node.js' },
  { name: 'Webpack', slug: 'webpack', category: 'Development Tool', description: 'A static module bundler for modern JavaScript applications' },
  { name: 'Vite', slug: 'vite', category: 'Development Tool', description: 'Next Generation Frontend Tooling' },
  { name: 'Parcel', slug: 'parcel', category: 'Development Tool', description: 'The zero configuration build tool for the web' },

  // UI Libraries & Icons
  { name: 'Font Awesome', slug: 'font-awesome', category: 'UI Library', description: 'The web\'s most popular icon set and toolkit' },
  { name: 'Material Icons', slug: 'material-icons', category: 'UI Library', description: 'Material Design Icons by Google' },
  { name: 'Feather Icons', slug: 'feather-icons', category: 'UI Library', description: 'Simply beautiful open source icons' },
  { name: 'Google Fonts', slug: 'google-fonts', category: 'UI Library', description: 'Making the web more beautiful, fast, and open through great typography' },

  // Monitoring & Support
  { name: 'Sentry', slug: 'sentry', category: 'Monitoring', description: 'Application monitoring and error tracking software' },
  { name: 'LogRocket', slug: 'logrocket', category: 'Monitoring', description: 'Modern frontend monitoring and product analytics' },
  { name: 'Intercom', slug: 'intercom', category: 'Monitoring', description: 'The Business Messenger you and your customers will love' },
  { name: 'Zendesk', slug: 'zendesk', category: 'Monitoring', description: 'Customer service software and support ticket system' },
  { name: 'Drift', slug: 'drift', category: 'Monitoring', description: 'The Revenue Acceleration Platform' },

  // Performance & Features
  { name: 'Lazy Loading', slug: 'lazy-loading', category: 'Performance', description: 'Technique for deferring loading of non-critical resources' },
  { name: 'Service Worker', slug: 'service-worker', category: 'Performance', description: 'A script that your browser runs in the background' },
  { name: 'Web Workers', slug: 'web-workers', category: 'Performance', description: 'A way to run scripts in background threads' },
];

// Create lookup maps for efficient searching
export const TECHNOLOGY_BY_SLUG = new Map(
  STATIC_TECHNOLOGIES.map(tech => [tech.slug, tech])
);

export const TECHNOLOGY_BY_NAME = new Map(
  STATIC_TECHNOLOGIES.map(tech => [tech.name.toLowerCase(), tech])
);

// Helper function to find technology by various inputs
export function findTechnology(input: string): StaticTechnology | null {
  const lowerInput = input.toLowerCase();
  
  // Try exact slug match first
  if (TECHNOLOGY_BY_SLUG.has(lowerInput)) {
    return TECHNOLOGY_BY_SLUG.get(lowerInput)!;
  }
  
  // Try exact name match
  if (TECHNOLOGY_BY_NAME.has(lowerInput)) {
    return TECHNOLOGY_BY_NAME.get(lowerInput)!;
  }
  
  // Try partial matches
  for (const tech of STATIC_TECHNOLOGIES) {
    if (tech.name.toLowerCase().includes(lowerInput) || 
        tech.slug.includes(lowerInput) ||
        lowerInput.includes(tech.slug)) {
      return tech;
    }
  }
  
  return null;
}

// Get all technologies by category
export function getTechnologiesByCategory(): Record<string, StaticTechnology[]> {
  const byCategory: Record<string, StaticTechnology[]> = {};
  
  for (const tech of STATIC_TECHNOLOGIES) {
    if (!byCategory[tech.category]) {
      byCategory[tech.category] = [];
    }
    byCategory[tech.category].push(tech);
  }
  
  return byCategory;
}

// Get all unique categories
export function getAllCategories(): string[] {
  const categories = new Set(STATIC_TECHNOLOGIES.map(tech => tech.category));
  return Array.from(categories).sort();
}