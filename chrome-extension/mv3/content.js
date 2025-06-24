// Enhanced content script for comprehensive technology detection with metadata
class TechnologyDetector {
  constructor() {
    this.technologies = new Set();
    this.metadata = {};
    this.detectionRules = this.initializeDetectionRules();
  }

  initializeDetectionRules() {
    return {
      // JavaScript Frameworks & Libraries
      'React': () => {
        const hasReact = !!(window.React || 
                 document.querySelector('[data-reactroot]') ||
                 document.querySelector('[data-react-helmet]') ||
                 document.querySelector('script[src*="react"]') ||
                 document.documentElement.innerHTML.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__') ||
                 window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
        
        if (hasReact && window.React) {
          this.metadata.react_version = window.React.version;
        }
        return hasReact;
      },
      
      'Vue.js': () => {
        const hasVue = !!(window.Vue || 
                 document.querySelector('[data-v-]') ||
                 document.querySelector('script[src*="vue"]') ||
                 document.querySelector('#app')?.__vue__ ||
                 window.__VUE__);
        
        if (hasVue && window.Vue) {
          this.metadata.vue_version = window.Vue.version;
        }
        return hasVue;
      },
      
      'Angular': () => {
        const hasAngular = !!(window.angular || 
                 window.ng ||
                 document.querySelector('[ng-app]') ||
                 document.querySelector('[ng-controller]') ||
                 document.querySelector('[ng-version]') ||
                 document.querySelector('script[src*="angular"]'));
        
        if (hasAngular) {
          const versionEl = document.querySelector('[ng-version]');
          if (versionEl) {
            this.metadata.angular_version = versionEl.getAttribute('ng-version');
          }
        }
        return hasAngular;
      },
      
      'jQuery': () => {
        const hasJQuery = !!(window.jQuery || window.$);
        if (hasJQuery && window.jQuery) {
          this.metadata.jquery_version = window.jQuery.fn.jquery;
        }
        return hasJQuery;
      },
      
      'Next.js': () => {
        const hasNext = !!(window.__NEXT_DATA__ || 
                 document.querySelector('script[src*="_next"]') ||
                 document.querySelector('#__next'));
        
        if (hasNext && window.__NEXT_DATA__) {
          this.metadata.nextjs_build_id = window.__NEXT_DATA__.buildId;
        }
        return hasNext;
      },
      
      'Nuxt.js': () => {
        return !!(window.$nuxt || 
                 document.querySelector('#__nuxt') ||
                 document.querySelector('script[src*="nuxt"]'));
      },
      
      'Svelte': () => {
        return !!(document.querySelector('script[src*="svelte"]') ||
                 document.querySelector('[data-svelte]'));
      },
      
      'Alpine.js': () => {
        return !!(window.Alpine ||
                 document.querySelector('[x-data]') ||
                 document.querySelector('script[src*="alpine"]'));
      },
      
      'Ember.js': () => {
        return !!(window.Ember ||
                 document.querySelector('script[src*="ember"]'));
      },
      
      'Backbone.js': () => {
        return !!(window.Backbone ||
                 document.querySelector('script[src*="backbone"]'));
      },
      
      // CSS Frameworks & Preprocessors
      'Bootstrap': () => {
        const hasBootstrap = !!(document.querySelector('link[href*="bootstrap"]') ||
                 document.querySelector('.container') ||
                 document.querySelector('.row') ||
                 document.querySelector('.col-') ||
                 document.querySelector('[class*="col-"]'));
        
        if (hasBootstrap) {
          // Try to detect Bootstrap version from CSS classes
          if (document.querySelector('.container-fluid')) {
            this.metadata.bootstrap_version = '3+';
          }
        }
        return hasBootstrap;
      },
      
      'Tailwind CSS': () => {
        return !!(document.querySelector('link[href*="tailwind"]') ||
                 document.querySelector('[class*="bg-"]') ||
                 document.querySelector('[class*="text-"]') ||
                 document.querySelector('[class*="p-"]') ||
                 document.querySelector('[class*="m-"]') ||
                 document.querySelector('[class*="w-"]') ||
                 document.querySelector('[class*="h-"]'));
      },
      
      'Bulma': () => {
        return !!(document.querySelector('link[href*="bulma"]') ||
                 document.querySelector('.column') ||
                 document.querySelector('.columns'));
      },
      
      'Foundation': () => {
        return !!(document.querySelector('link[href*="foundation"]') ||
                 document.querySelector('.foundation') ||
                 document.querySelector('[class*="large-"]'));
      },
      
      'Materialize': () => {
        return !!(document.querySelector('link[href*="materialize"]') ||
                 document.querySelector('script[src*="materialize"]') ||
                 document.querySelector('.material-icons'));
      },
      
      'Semantic UI': () => {
        return !!(document.querySelector('link[href*="semantic"]') ||
                 document.querySelector('.ui.container'));
      },
      
      // Content Management Systems
      'WordPress': () => {
        const hasWP = !!(document.querySelector('link[href*="wp-content"]') ||
                 document.querySelector('script[src*="wp-content"]') ||
                 document.querySelector('meta[name="generator"][content*="WordPress"]') ||
                 document.querySelector('link[rel="pingback"]') ||
                 window.wp);
        
        if (hasWP) {
          const generator = document.querySelector('meta[name="generator"]');
          if (generator && generator.content.includes('WordPress')) {
            this.metadata.wordpress_version = generator.content.match(/WordPress ([\d.]+)/)?.[1];
          }
        }
        return hasWP;
      },
      
      'Shopify': () => {
        const hasShopify = !!(window.Shopify ||
                 document.querySelector('script[src*="shopify"]') ||
                 document.querySelector('link[href*="shopify"]') ||
                 document.querySelector('meta[name="shopify-checkout-api-token"]') ||
                 document.querySelector('script[src*="shopifycdn"]'));
        
        if (hasShopify && window.Shopify) {
          this.metadata.shopify_shop = window.Shopify.shop;
        }
        return hasShopify;
      },
      
      'Drupal': () => {
        return !!(window.Drupal ||
                 document.querySelector('script[src*="drupal"]') ||
                 document.querySelector('meta[name="generator"][content*="Drupal"]') ||
                 document.querySelector('body[class*="drupal"]'));
      },
      
      'Joomla': () => {
        return !!(document.querySelector('meta[name="generator"][content*="Joomla"]') ||
                 document.querySelector('script[src*="joomla"]') ||
                 document.querySelector('link[href*="joomla"]'));
      },
      
      'Magento': () => {
        return !!(document.querySelector('script[src*="magento"]') ||
                 document.querySelector('body[class*="magento"]') ||
                 window.Magento);
      },
      
      'Squarespace': () => {
        return !!(document.querySelector('script[src*="squarespace"]') ||
                 document.querySelector('meta[name="generator"][content*="Squarespace"]'));
      },
      
      'Wix': () => {
        return !!(document.querySelector('script[src*="wix"]') ||
                 document.querySelector('meta[name="generator"][content*="Wix"]'));
      },
      
      'Webflow': () => {
        return !!(document.querySelector('script[src*="webflow"]') ||
                 document.querySelector('meta[name="generator"][content*="Webflow"]'));
      },
      
      // Analytics & Tracking
      'Google Analytics': () => {
        const hasGA = !!(window.gtag ||
                 window.ga ||
                 window._gaq ||
                 document.querySelector('script[src*="google-analytics"]') ||
                 document.querySelector('script[src*="googletagmanager"]') ||
                 document.querySelector('script[src*="gtag"]'));
        
        if (hasGA) {
          // Try to extract tracking ID
          const scripts = document.querySelectorAll('script');
          for (const script of scripts) {
            const match = script.textContent?.match(/UA-\d+-\d+|G-[A-Z0-9]+/);
            if (match) {
              this.metadata.ga_tracking_id = match[0];
              break;
            }
          }
        }
        return hasGA;
      },
      
      'Google Tag Manager': () => {
        const hasGTM = !!(window.dataLayer ||
                 document.querySelector('script[src*="googletagmanager"]') ||
                 document.querySelector('noscript[src*="googletagmanager"]'));
        
        if (hasGTM) {
          // Try to extract GTM ID
          const scripts = document.querySelectorAll('script');
          for (const script of scripts) {
            const match = script.textContent?.match(/GTM-[A-Z0-9]+/);
            if (match) {
              this.metadata.gtm_id = match[0];
              break;
            }
          }
        }
        return hasGTM;
      },
      
      'Facebook Pixel': () => {
        return !!(window.fbq ||
                 document.querySelector('script[src*="connect.facebook.net"]'));
      },
      
      'Hotjar': () => {
        return !!(window.hj ||
                 document.querySelector('script[src*="hotjar"]'));
      },
      
      'Mixpanel': () => {
        return !!(window.mixpanel ||
                 document.querySelector('script[src*="mixpanel"]'));
      },
      
      'Segment': () => {
        return !!(window.analytics ||
                 document.querySelector('script[src*="segment"]'));
      },
      
      // CDN & Infrastructure
      'Cloudflare': () => {
        return !!(document.querySelector('script[src*="cloudflare"]') ||
                 document.querySelector('link[href*="cloudflare"]') ||
                 document.querySelector('script[src*="cdnjs.cloudflare.com"]'));
      },
      
      'AWS CloudFront': () => {
        return !!(document.querySelector('script[src*="cloudfront"]') ||
                 document.querySelector('link[href*="cloudfront"]'));
      },
      
      'jsDelivr': () => {
        return !!(document.querySelector('script[src*="jsdelivr"]') ||
                 document.querySelector('link[href*="jsdelivr"]'));
      },
      
      'unpkg': () => {
        return !!(document.querySelector('script[src*="unpkg.com"]') ||
                 document.querySelector('link[href*="unpkg.com"]'));
      },
      
      // E-commerce & Payments
      'WooCommerce': () => {
        return !!(document.querySelector('script[src*="woocommerce"]') ||
                 document.querySelector('link[href*="woocommerce"]') ||
                 document.querySelector('body[class*="woocommerce"]'));
      },
      
      'Stripe': () => {
        return !!(window.Stripe ||
                 document.querySelector('script[src*="stripe"]'));
      },
      
      'PayPal': () => {
        return !!(window.paypal ||
                 document.querySelector('script[src*="paypal"]') ||
                 document.querySelector('form[action*="paypal"]'));
      },
      
      'Square': () => {
        return !!(window.Square ||
                 document.querySelector('script[src*="squareup"]'));
      },
      
      // Development Tools & Libraries
      'Lodash': () => {
        const hasLodash = !!(window._ && window._.VERSION);
        if (hasLodash) {
          this.metadata.lodash_version = window._.VERSION;
        }
        return hasLodash;
      },
      
      'Moment.js': () => {
        const hasMoment = !!(window.moment);
        if (hasMoment) {
          this.metadata.moment_version = window.moment.version;
        }
        return hasMoment;
      },
      
      'D3.js': () => {
        const hasD3 = !!(window.d3);
        if (hasD3) {
          this.metadata.d3_version = window.d3.version;
        }
        return hasD3;
      },
      
      'Three.js': () => {
        const hasThree = !!(window.THREE);
        if (hasThree) {
          this.metadata.threejs_version = window.THREE.REVISION;
        }
        return hasThree;
      },
      
      'Chart.js': () => {
        return !!(window.Chart ||
                 document.querySelector('script[src*="chart.js"]'));
      },
      
      'Axios': () => {
        return !!(window.axios ||
                 document.querySelector('script[src*="axios"]'));
      },
      
      // UI Libraries & Components
      'Font Awesome': () => {
        return !!(document.querySelector('link[href*="font-awesome"]') ||
                 document.querySelector('script[src*="font-awesome"]') ||
                 document.querySelector('[class*="fa-"]') ||
                 document.querySelector('[class*="fas "]') ||
                 document.querySelector('[class*="far "]'));
      },
      
      'Material Icons': () => {
        return !!(document.querySelector('link[href*="material-icons"]') ||
                 document.querySelector('.material-icons'));
      },
      
      'Feather Icons': () => {
        return !!(document.querySelector('script[src*="feather"]') ||
                 document.querySelector('[data-feather]'));
      },
      
      // Build Tools & Bundlers (detected via source maps or specific patterns)
      'Webpack': () => {
        return !!(document.querySelector('script[src*="webpack"]') ||
                 document.documentElement.innerHTML.includes('webpackJsonp'));
      },
      
      'Vite': () => {
        return !!(document.querySelector('script[src*="vite"]') ||
                 document.querySelector('script[type="module"][src*="@vite"]'));
      },
      
      'Parcel': () => {
        return !!(document.querySelector('script[src*="parcel"]'));
      },
      
      // Testing & Development
      'Sentry': () => {
        return !!(window.Sentry ||
                 document.querySelector('script[src*="sentry"]'));
      },
      
      'LogRocket': () => {
        return !!(window.LogRocket ||
                 document.querySelector('script[src*="logrocket"]'));
      },
      
      // Social & Communication
      'Intercom': () => {
        return !!(window.Intercom ||
                 document.querySelector('script[src*="intercom"]'));
      },
      
      'Zendesk': () => {
        return !!(window.zE ||
                 document.querySelector('script[src*="zendesk"]'));
      },
      
      'Drift': () => {
        return !!(window.drift ||
                 document.querySelector('script[src*="drift"]'));
      },
      
      // Performance & Optimization
      'Lazy Loading': () => {
        return !!(document.querySelector('img[loading="lazy"]') ||
                 document.querySelector('iframe[loading="lazy"]'));
      },
      
      'Service Worker': () => {
        return !!(navigator.serviceWorker && navigator.serviceWorker.controller);
      },
      
      'Web Workers': () => {
        return !!(window.Worker && document.documentElement.innerHTML.includes('new Worker'));
      }
    };
  }

  detectTechnologies() {
    // Clear previous results
    this.technologies.clear();
    this.metadata = {};
    
    // Collect basic page metadata
    this.collectPageMetadata();
    
    // Run all detection rules
    Object.entries(this.detectionRules).forEach(([techName, detector]) => {
      try {
        if (detector()) {
          this.technologies.add(techName);
        }
      } catch (error) {
        console.warn(`Error detecting ${techName}:`, error);
      }
    });
    
    // Additional detection methods
    this.detectFromMetaTags();
    this.detectFromScriptSources();
    this.detectFromLinkTags();
    this.detectFromHeaders();
    this.detectPerformanceMetrics();
    
    return {
      technologies: Array.from(this.technologies),
      metadata: this.metadata
    };
  }

  collectPageMetadata() {
    // Basic page information
    this.metadata.page_title = document.title;
    this.metadata.page_url = window.location.href;
    this.metadata.page_domain = window.location.hostname;
    this.metadata.page_protocol = window.location.protocol;
    this.metadata.page_language = document.documentElement.lang || 'unknown';
    
    // Viewport and responsive design
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      this.metadata.viewport_content = viewport.getAttribute('content');
      this.metadata.is_responsive = viewport.getAttribute('content').includes('width=device-width');
    }
    
    // Character encoding
    const charset = document.querySelector('meta[charset]') || document.querySelector('meta[http-equiv="Content-Type"]');
    if (charset) {
      this.metadata.charset = charset.getAttribute('charset') || 'unknown';
    }
    
    // Page description and keywords
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      this.metadata.meta_description_length = description.getAttribute('content')?.length || 0;
    }
    
    const keywords = document.querySelector('meta[name="keywords"]');
    if (keywords) {
      this.metadata.has_meta_keywords = true;
    }
    
    // Social media meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    
    this.metadata.has_open_graph = !!ogTitle;
    this.metadata.has_twitter_cards = !!twitterCard;
    
    // Favicon detection
    const favicon = document.querySelector('link[rel*="icon"]');
    this.metadata.has_favicon = !!favicon;
    
    // Count various elements
    this.metadata.script_count = document.querySelectorAll('script').length;
    this.metadata.stylesheet_count = document.querySelectorAll('link[rel="stylesheet"]').length;
    this.metadata.image_count = document.querySelectorAll('img').length;
    this.metadata.form_count = document.querySelectorAll('form').length;
    
    // Check for common accessibility features
    this.metadata.has_skip_links = !!document.querySelector('a[href*="#main"], a[href*="#content"]');
    this.metadata.has_alt_text = document.querySelectorAll('img[alt]').length > 0;
    
    // Check for HTTPS
    this.metadata.is_https = window.location.protocol === 'https:';
    
    // Detect if it's a SPA (Single Page Application)
    this.metadata.likely_spa = this.detectSPA();
  }

  detectSPA() {
    // Check for common SPA indicators
    const indicators = [
      window.history.pushState,
      document.querySelector('[data-reactroot]'),
      document.querySelector('#app'),
      document.querySelector('#root'),
      window.__NEXT_DATA__,
      window.Vue,
      window.angular
    ];
    
    return indicators.filter(Boolean).length >= 2;
  }

  detectFromMetaTags() {
    const metaTags = document.querySelectorAll('meta[name="generator"]');
    metaTags.forEach(tag => {
      const content = tag.getAttribute('content');
      if (content) {
        if (content.includes('WordPress')) {
          this.technologies.add('WordPress');
          this.metadata.wordpress_version = content.match(/WordPress ([\d.]+)/)?.[1];
        }
        if (content.includes('Drupal')) {
          this.technologies.add('Drupal');
          this.metadata.drupal_version = content.match(/Drupal ([\d.]+)/)?.[1];
        }
        if (content.includes('Joomla')) this.technologies.add('Joomla');
        if (content.includes('Shopify')) this.technologies.add('Shopify');
        if (content.includes('Squarespace')) this.technologies.add('Squarespace');
        if (content.includes('Wix')) this.technologies.add('Wix');
        if (content.includes('Webflow')) this.technologies.add('Webflow');
        if (content.includes('Ghost')) this.technologies.add('Ghost');
      }
    });
  }

  detectFromScriptSources() {
    const scripts = document.querySelectorAll('script[src]');
    const scriptSources = Array.from(scripts).map(script => script.getAttribute('src'));
    
    // Store external script domains for analysis
    const externalDomains = new Set();
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        try {
          const url = new URL(src, window.location.href);
          if (url.hostname !== window.location.hostname) {
            externalDomains.add(url.hostname);
          }
        } catch (e) {
          // Invalid URL, skip
        }
        
        // Technology detection from script sources
        const detections = {
          'Cloudflare': ['cdnjs.cloudflare.com', 'cloudflare'],
          'Google APIs': ['ajax.googleapis.com', 'apis.google.com'],
          'jQuery': ['code.jquery.com', 'jquery'],
          'React': ['react'],
          'Vue.js': ['vue'],
          'Angular': ['angular'],
          'Bootstrap': ['bootstrap'],
          'Tailwind CSS': ['tailwind'],
          'Google Analytics': ['google-analytics', 'gtag', 'googletagmanager'],
          'Facebook Pixel': ['facebook.net'],
          'Lodash': ['lodash'],
          'Moment.js': ['moment'],
          'D3.js': ['d3'],
          'Three.js': ['three'],
          'Chart.js': ['chart.js'],
          'Axios': ['axios'],
          'Sentry': ['sentry'],
          'Intercom': ['intercom'],
          'Zendesk': ['zendesk'],
          'Hotjar': ['hotjar'],
          'Mixpanel': ['mixpanel']
        };
        
        Object.entries(detections).forEach(([tech, patterns]) => {
          if (patterns.some(pattern => src.includes(pattern))) {
            this.technologies.add(tech);
          }
        });
      }
    });
    
    this.metadata.external_script_domains = Array.from(externalDomains);
    this.metadata.external_script_count = externalDomains.size;
  }

  detectFromLinkTags() {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    const stylesheetSources = Array.from(links).map(link => link.getAttribute('href'));
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const detections = {
          'Bootstrap': ['bootstrap'],
          'Tailwind CSS': ['tailwind'],
          'Bulma': ['bulma'],
          'Foundation': ['foundation'],
          'Materialize': ['materialize'],
          'Semantic UI': ['semantic'],
          'Font Awesome': ['font-awesome'],
          'Material Icons': ['material-icons'],
          'Google Fonts': ['fonts.googleapis.com']
        };
        
        Object.entries(detections).forEach(([tech, patterns]) => {
          if (patterns.some(pattern => href.includes(pattern))) {
            this.technologies.add(tech);
          }
        });
      }
    });
    
    // Check for Google Fonts
    if (stylesheetSources.some(href => href && href.includes('fonts.googleapis.com'))) {
      this.technologies.add('Google Fonts');
      this.metadata.uses_google_fonts = true;
    }
  }

  detectFromHeaders() {
    // This would require additional permissions to access response headers
    // For now, we'll detect some technologies from available information
    
    // Check for common security headers via meta tags
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (csp) {
      this.metadata.has_csp = true;
    }
    
    // Check for preload/prefetch hints
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
    
    this.metadata.preload_count = preloadLinks.length;
    this.metadata.prefetch_count = prefetchLinks.length;
    this.metadata.uses_resource_hints = preloadLinks.length > 0 || prefetchLinks.length > 0;
  }

  detectPerformanceMetrics() {
    // Basic performance information
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      this.metadata.page_load_time = timing.loadEventEnd - timing.navigationStart;
      this.metadata.dom_ready_time = timing.domContentLoadedEventEnd - timing.navigationStart;
    }
    
    // Check for performance optimization techniques
    this.metadata.uses_lazy_loading = document.querySelectorAll('img[loading="lazy"]').length > 0;
    this.metadata.has_service_worker = 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
    
    // Check for modern web features
    this.metadata.supports_webp = this.supportsWebP();
    this.metadata.supports_avif = this.supportsAVIF();
  }

  supportsWebP() {
    return document.querySelector('img[src*=".webp"]') !== null;
  }

  supportsAVIF() {
    return document.querySelector('img[src*=".avif"]') !== null;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    try {
      const detector = new TechnologyDetector();
      const results = detector.detectTechnologies();
      
      sendResponse({
        success: true,
        url: window.location.href,
        technologies: results.technologies,
        metadata: results.metadata,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message || 'Detection failed'
      });
    }
  }
  
  return true; // Keep message channel open for async response
});