// Debug script to test metadata collection
// Run this in browser console to see what metadata is being collected

(function() {
  'use strict';
  
  console.log('🔍 TechLookup Metadata Debug Tool');
  console.log('=====================================');
  
  // Test the TechnologyDetector
  if (typeof TechnologyDetector !== 'undefined') {
    console.log('✅ TechnologyDetector class found');
    
    const detector = new TechnologyDetector();
    const results = detector.detectTechnologies();
    
    console.log('📊 Detection Results:');
    console.log('Technologies:', results.technologies);
    console.log('Metadata:', results.metadata);
    
    // Show specific metadata categories
    console.log('\n🏗️ Page Structure:');
    console.log('- Title:', results.metadata.page_title);
    console.log('- URL:', results.metadata.page_url);
    console.log('- Language:', results.metadata.page_language);
    console.log('- Charset:', results.metadata.charset);
    
    console.log('\n📱 Responsive & Security:');
    console.log('- Responsive:', results.metadata.is_responsive);
    console.log('- HTTPS:', results.metadata.is_https);
    console.log('- SPA:', results.metadata.likely_spa);
    
    console.log('\n⚡ Performance:');
    console.log('- Page Load Time:', results.metadata.page_load_time, 'ms');
    console.log('- DOM Ready Time:', results.metadata.dom_ready_time, 'ms');
    console.log('- Script Count:', results.metadata.script_count);
    console.log('- Stylesheet Count:', results.metadata.stylesheet_count);
    
    console.log('\n🔧 Modern Features:');
    console.log('- Service Worker:', results.metadata.has_service_worker);
    console.log('- Lazy Loading:', results.metadata.uses_lazy_loading);
    console.log('- Google Fonts:', results.metadata.uses_google_fonts);
    
    console.log('\n📈 SEO & Social:');
    console.log('- Open Graph:', results.metadata.has_open_graph);
    console.log('- Twitter Cards:', results.metadata.has_twitter_cards);
    console.log('- Meta Description Length:', results.metadata.meta_description_length);
    console.log('- Has Favicon:', results.metadata.has_favicon);
    
    console.log('\n🎯 Technology Versions:');
    if (results.metadata.react_version) console.log('- React:', results.metadata.react_version);
    if (results.metadata.vue_version) console.log('- Vue:', results.metadata.vue_version);
    if (results.metadata.jquery_version) console.log('- jQuery:', results.metadata.jquery_version);
    if (results.metadata.angular_version) console.log('- Angular:', results.metadata.angular_version);
    
    console.log('\n📋 Full Metadata Object:');
    console.table(results.metadata);
    
  } else {
    console.log('❌ TechnologyDetector class not found');
    console.log('This might mean the content script is not loaded properly');
  }
  
  // Test basic page elements
  console.log('\n🔍 Basic Page Analysis:');
  console.log('- Scripts on page:', document.querySelectorAll('script').length);
  console.log('- Stylesheets:', document.querySelectorAll('link[rel="stylesheet"]').length);
  console.log('- Images:', document.querySelectorAll('img').length);
  console.log('- Has viewport meta:', !!document.querySelector('meta[name="viewport"]'));
  console.log('- Protocol:', window.location.protocol);
  console.log('- Performance API available:', !!window.performance);
  
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    console.log('- Calculated load time:', loadTime, 'ms');
  }
  
  console.log('\n🎯 Technology Detection Test:');
  console.log('- React detected:', !!(window.React || document.querySelector('[data-reactroot]')));
  console.log('- Vue detected:', !!(window.Vue || document.querySelector('[data-v-]')));
  console.log('- jQuery detected:', !!(window.jQuery || window.$));
  console.log('- Angular detected:', !!(window.angular || window.ng));
  
  console.log('\n✅ Debug complete! Check the results above.');
})();