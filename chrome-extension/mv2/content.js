// Content script for technology detection
class TechnologyDetector {
  constructor() {
    this.technologies = new Set();
    this.detectionRules = this.initializeDetectionRules();
  }

  initializeDetectionRules() {
    return {
      // JavaScript Frameworks & Libraries
      'React': () => {
        return !!(window.React || 
                 document.querySelector('[data-reactroot]') ||
                 document.querySelector('[data-react-helmet]') ||
                 document.querySelector('script[src*="react"]') ||
                 document.documentElement.innerHTML.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__') ||
                 window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
      },
      
      'Vue.js': () => {
        return !!(window.Vue || 
                 document.querySelector('[data-v-]') ||
                 document.querySelector('script[src*="vue"]') ||
                 document.querySelector('#app')?.__vue__ ||
                 window.__VUE__);
      },
      
      'Angular': () => {
        return !!(window.angular || 
                 window.ng ||
                 document.querySelector('[ng-app]') ||
                 document.querySelector('[ng-controller]') ||
                 document.querySelector('[ng-version]') ||
                 document.querySelector('script[src*="angular"]'));
      },
      
      'jQuery': () => {
        return !!(window.jQuery || window.$);
      },
      
      'Next.js': () => {
        return !!(window.__NEXT_DATA__ || 
                 document.querySelector('script[src*="_next"]') ||
                 document.querySelector('#__next'));
      },
      
      'Nuxt.js': () => {
        return !!(window.$nuxt || 
                 document.querySelector('#__nuxt') ||
                 document.querySelector('script[src*="nuxt"]'));
      },
      
      // CSS Frameworks
      'Bootstrap': () => {
        return !!(document.querySelector('link[href*="bootstrap"]') ||
                 document.querySelector('.container') ||
                 document.querySelector('.row') ||
                 document.querySelector('.col-') ||
                 document.querySelector('[class*="col-"]'));
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
      
      // Content Management Systems
      'WordPress': () => {
        return !!(document.querySelector('link[href*="wp-content"]') ||
                 document.querySelector('script[src*="wp-content"]') ||
                 document.querySelector('meta[name="generator"][content*="WordPress"]') ||
                 document.querySelector('link[rel="pingback"]') ||
                 window.wp);
      },
      
      'Shopify': () => {
        return !!(window.Shopify ||
                 document.querySelector('script[src*="shopify"]') ||
                 document.querySelector('link[href*="shopify"]') ||
                 document.querySelector('meta[name="shopify-checkout-api-token"]') ||
                 document.querySelector('script[src*="shopifycdn"]'));
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
      
      // Analytics & Tracking
      'Google Analytics': () => {
        return !!(window.gtag ||
                 window.ga ||
                 window._gaq ||
                 document.querySelector('script[src*="google-analytics"]') ||
                 document.querySelector('script[src*="googletagmanager"]') ||
                 document.querySelector('script[src*="gtag"]'));
      },
      
      'Google Tag Manager': () => {
        return !!(window.dataLayer ||
                 document.querySelector('script[src*="googletagmanager"]') ||
                 document.querySelector('noscript[src*="googletagmanager"]'));
      },
      
      'Facebook Pixel': () => {
        return !!(window.fbq ||
                 document.querySelector('script[src*="connect.facebook.net"]'));
      },
      
      'Hotjar': () => {
        return !!(window.hj ||
                 document.querySelector('script[src*="hotjar"]'));
      },
      
      // CDN & Infrastructure
      'Cloudflare': () => {
        return !!(document.querySelector('script[src*="cloudflare"]') ||
                 document.querySelector('link[href*="cloudflare"]') ||
                 document.querySelector('script[src*="cdnjs.cloudflare.com"]'));
      },
      
      // E-commerce
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
      
      // Other Technologies
      'Font Awesome': () => {
        return !!(document.querySelector('link[href*="font-awesome"]') ||
                 document.querySelector('script[src*="font-awesome"]') ||
                 document.querySelector('[class*="fa-"]') ||
                 document.querySelector('[class*="fas "]') ||
                 document.querySelector('[class*="far "]'));
      },
      
      'Lodash': () => {
        return !!(window._ && window._.VERSION);
      },
      
      'Moment.js': () => {
        return !!(window.moment);
      },
      
      'D3.js': () => {
        return !!(window.d3);
      },
      
      'Three.js': () => {
        return !!(window.THREE);
      }
    };
  }

  detectTechnologies() {
    // Clear previous results
    this.technologies.clear();
    
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
    
    // Additional meta tag detection
    this.detectFromMetaTags();
    
    // Additional script source detection
    this.detectFromScriptSources();
    
    return Array.from(this.technologies);
  }

  detectFromMetaTags() {
    const metaTags = document.querySelectorAll('meta[name="generator"]');
    metaTags.forEach(tag => {
      const content = tag.getAttribute('content');
      if (content) {
        if (content.includes('WordPress')) this.technologies.add('WordPress');
        if (content.includes('Drupal')) this.technologies.add('Drupal');
        if (content.includes('Joomla')) this.technologies.add('Joomla');
        if (content.includes('Shopify')) this.technologies.add('Shopify');
        if (content.includes('Squarespace')) this.technologies.add('Squarespace');
        if (content.includes('Wix')) this.technologies.add('Wix');
      }
    });
  }

  detectFromScriptSources() {
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        // CDN detection
        if (src.includes('cdnjs.cloudflare.com')) this.technologies.add('Cloudflare');
        if (src.includes('ajax.googleapis.com')) this.technologies.add('Google APIs');
        if (src.includes('code.jquery.com')) this.technologies.add('jQuery');
        
        // Framework detection
        if (src.includes('react')) this.technologies.add('React');
        if (src.includes('vue')) this.technologies.add('Vue.js');
        if (src.includes('angular')) this.technologies.add('Angular');
        if (src.includes('bootstrap')) this.technologies.add('Bootstrap');
        if (src.includes('tailwind')) this.technologies.add('Tailwind CSS');
        
        // Analytics
        if (src.includes('google-analytics') || src.includes('gtag')) this.technologies.add('Google Analytics');
        if (src.includes('googletagmanager')) this.technologies.add('Google Tag Manager');
        if (src.includes('facebook.net')) this.technologies.add('Facebook Pixel');
        
        // Other libraries
        if (src.includes('lodash')) this.technologies.add('Lodash');
        if (src.includes('moment')) this.technologies.add('Moment.js');
        if (src.includes('d3')) this.technologies.add('D3.js');
        if (src.includes('three')) this.technologies.add('Three.js');
      }
    });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    try {
      const detector = new TechnologyDetector();
      const technologies = detector.detectTechnologies();
      
      sendResponse({
        success: true,
        url: window.location.href,
        technologies: technologies,
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