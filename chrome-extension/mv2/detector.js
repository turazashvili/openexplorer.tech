// Advanced technology detection library
// This file can be injected into pages for more detailed analysis

(function() {
  'use strict';
  
  window.TechDetector = {
    // Advanced detection methods that require page context
    detectAdvanced: function() {
      const technologies = [];
      
      // Check for React DevTools
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        technologies.push('React');
      }
      
      // Check for Vue DevTools
      if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
        technologies.push('Vue.js');
      }
      
      // Check for Angular DevTools
      if (window.ng && window.ng.probe) {
        technologies.push('Angular');
      }
      
      // Check for specific global variables
      const globalChecks = {
        'Shopify': 'Shopify',
        'WordPress': 'wp',
        'jQuery': '$',
        'Lodash': '_',
        'Moment.js': 'moment',
        'D3.js': 'd3',
        'Three.js': 'THREE'
      };
      
      Object.entries(globalChecks).forEach(([tech, globalVar]) => {
        if (window[globalVar]) {
          technologies.push(tech);
        }
      });
      
      return technologies;
    },
    
    // Check for CSS frameworks by analyzing computed styles
    detectCSSFrameworks: function() {
      const technologies = [];
      
      // Check for Bootstrap classes
      const bootstrapClasses = ['container', 'row', 'col-md-', 'btn', 'navbar'];
      if (bootstrapClasses.some(cls => document.querySelector(`.${cls}`))) {
        technologies.push('Bootstrap');
      }
      
      // Check for Tailwind CSS utility classes
      const tailwindPattern = /\b(bg-|text-|p-|m-|w-|h-|flex|grid)\w+/;
      const elements = document.querySelectorAll('*[class]');
      for (let el of elements) {
        if (tailwindPattern.test(el.className)) {
          technologies.push('Tailwind CSS');
          break;
        }
      }
      
      return technologies;
    }
  };
})();