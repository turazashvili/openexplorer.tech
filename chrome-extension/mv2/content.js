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
                 document.querySelector('script[src*="react"]') ||
                 document.documentElement.innerHTML.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__'));
      },
      
      'Vue.js': () => {
        return !!(window.Vue || 
                 document.querySelector('[data-v-]') ||
                 document.querySelector('script[src*="vue"]') ||
                 document.querySelector('#app').__vue__);
      },
      
      'Angular': () => {
        return !!(window.angular || 
                 window.ng ||
                 document.querySelector('[ng-app]') ||
                 document.querySelector('[ng-controller]') ||
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
      
      // CSS Frameworks
      'Bootstrap': () => {
        return !!(document.querySelector('link[href*="bootstrap"]') ||
                 document.querySelector('.container') ||
                 document.querySelector('.row') ||
                 document.querySelector('.col-'));
      },
      
      'Tailwind CSS': () => {
        return !!(document.querySelector('link[href*="tailwind"]') ||
                 document.querySelector('[class*="bg-"]') ||
                 document.querySelector('[class*="text-"]') ||
                 document.querySelector('[class*="p-"]'));
      },
      
      // Content Management Systems
      'WordPress': () => {
        return !!(document.querySelector('link[href*="wp-content"]') ||
                 document.querySelector('script[src*="wp-content"]') ||
                 document.querySelector('meta[name="generator"][content*="WordPress"]') ||
                 document.querySelector('link[rel="pingback"]'));
      },
      
      'Shopify': () => {
        return !!(window.Shopify ||
                 document.querySelector('script[src*="shopify"]') ||
                 document.querySelector('link[href*="shopify"]') ||
                 document.querySelector('meta[name="shopify-checkout-api-token"]'));
      },
      
      'Drupal': () => {
        return !!(window.Drupal ||
                 document.querySelector('script[src*="drupal"]') ||
                 document.querySelector('meta[name="generator"][content*="Drupal"]') ||
                 document.querySelector('body[class*="drupal"]'));
      },
      
      // Analytics & Tracking
      'Google Analytics': () => {
        return !!(window.gtag ||
                 window.ga ||
                 window._gaq ||
                 document.querySelector('script[src*="google-analytics"]') ||
                 document.querySelector('script[src*="googletagmanager"]'));
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
      
      // CDN & Infrastructure
      'Cloudflare': () => {
        return !!(document.querySelector('script[src*="cloudflare"]') ||
                 document.querySelector('link[href*="cloudflare"]') ||
                 this.checkHeaders('cf-ray') ||
                 this.checkHeaders('server', 'cloudflare'));
      },
      
      // E-commerce
      'WooCommerce': () => {
        return !!(document.querySelector('script[src*="woocommerce"]') ||
                 document.querySelector('link[href*="woocommerce"]') ||
                 document.querySelector('body[class*="woocommerce"]'));
      },
      
      // Other Technologies
      'Font Awesome': () => {
        return !!(document.querySelector('link[href*="font-awesome"]') ||
                 document.querySelector('script[src*="font-awesome"]') ||
                 document.querySelector('[class*="fa-"]'));
      },
      
      'Stripe': () => {
        return !!(window.Stripe ||
                 document.querySelector('script[src*="stripe"]'));
      },
      
      'PayPal': () => {
        return !!(window.paypal ||
                 document.querySelector('script[src*="paypal"]') ||
                 document.querySelector('form[action*="paypal"]'));
      }
    };
  }

  checkHeaders(headerName, expectedValue = null) {
    // This is a simplified check - in a real extension, you'd need to 
    // use the webRequest API to check actual headers
    return false;
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
      }
    });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze') {
    const detector = new TechnologyDetector();
    const technologies = detector.detectTechnologies();
    
    sendResponse({
      success: true,
      url: window.location.href,
      technologies: technologies,
      timestamp: new Date().toISOString()
    });
  }
  
  return true; // Keep message channel open for async response
});