# Open Tech Explorer Chrome Extension

Discover website technologies and contribute to the Open Tech Explorer database with automatic analysis and comprehensive tech stack detection.

## 🚀 **Features**

### **🔄 Automatic Analysis**
- **Monitors ALL tab changes** and page loads automatically
- **Auto-analyzes new websites** when pages finish loading  
- **Smart caching** - won't re-analyze the same site for 1 hour
- **Runs silently** in the background without user interaction
- **Instant popup results** from background analysis

### **🎯 Advanced Technology Detection**
- **30+ Technology Categories** including frameworks, CMS, analytics, CDN, and more
- **Comprehensive Metadata Collection** - performance metrics, SEO data, security features
- **Version Detection** for popular frameworks (React, Vue, jQuery, etc.)
- **Website Characteristics** - responsive design, HTTPS, SPA detection, service workers

### **⚙️ Smart Controls**
- **Auto-analysis toggle** in popup to enable/disable background scanning
- **Manual re-analysis** button for fresh scans on demand
- **Visual status indicators** showing analysis state and results
- **Background/manual analysis detection** with clear labeling

## 🔧 **Installation Instructions**

### **For Chrome Web Store Submission:**
1. Choose either `mv2/` (Manifest V2) or `mv3/` (Manifest V3) folder
2. Zip the entire folder contents (not the folder itself)
3. Upload to Chrome Web Store Developer Dashboard

### **For Local Development:**
```bash
# For Manifest V3 (Recommended)
1. Go to chrome://extensions/
2. Enable Developer mode  
3. Click "Load unpacked"
4. Select chrome-extension/mv3/ folder

# For Manifest V2 (Legacy Support)
1. Go to chrome://extensions/
2. Enable Developer mode  
3. Click "Load unpacked"
4. Select chrome-extension/mv2/ folder
```

## 🎨 **User Experience**

### **Background Process:**
1. **Monitors every website** you visit automatically
2. **Waits 2 seconds** for page to fully load
3. **Checks cache** - skips if analyzed within 1 hour  
4. **Auto-analyzes** if auto-analysis is enabled
5. **Sends to database** automatically via Open Tech Explorer API
6. **Stores results** for instant popup display

### **Popup Experience:**
1. **Click extension icon** → **Instant results** (from background analysis)
2. **Toggle auto-analysis** on/off as needed
3. **Manual re-analysis** available anytime
4. **Visual feedback** on analysis status and technology categorization
5. **Detailed metadata insights** with performance and security metrics

## 📊 **Technology Categories Detected**

- **JavaScript Frameworks** - React, Vue.js, Angular, Svelte, Next.js, etc.
- **CSS Frameworks** - Bootstrap, Tailwind CSS, Bulma, Foundation, etc.
- **Content Management** - WordPress, Drupal, Shopify, Squarespace, etc.
- **Analytics & Tracking** - Google Analytics, GTM, Hotjar, Mixpanel, etc.
- **CDN & Infrastructure** - Cloudflare, AWS CloudFront, jsDelivr, etc.
- **E-commerce & Payments** - WooCommerce, Stripe, PayPal, Square, etc.
- **Development Tools** - Webpack, Vite, Lodash, D3.js, Chart.js, etc.
- **UI & Icons** - Font Awesome, Material Icons, Google Fonts, etc.
- **Monitoring & Support** - Sentry, LogRocket, Intercom, Zendesk, etc.
- **Performance Features** - Service Workers, Lazy Loading, Web Workers, etc.

## 🔒 **Privacy & Performance**

- **Only analyzes HTTP/HTTPS** websites (skips chrome:// pages)
- **1-hour caching** prevents excessive analysis and reduces server load
- **Lightweight background** process with minimal browser impact
- **User control** - can disable auto-analysis anytime
- **No personal data** collected - only technology names and website metadata
- **Secure API communication** with Open Tech Explorer database

## 📈 **Metadata Insights**

The extension collects comprehensive website metadata including:

### **Performance Metrics:**
- Page load time and DOM ready time
- Script and stylesheet counts
- Image and form element counts
- External script domain analysis

### **Security & Standards:**
- HTTPS detection and security headers
- Content Security Policy presence
- Favicon and meta tag analysis
- Open Graph and Twitter Card detection

### **Modern Web Features:**
- Service Worker detection
- Lazy loading implementation
- Progressive Web App indicators
- Responsive design detection

### **SEO & Accessibility:**
- Meta description length analysis
- Alt text usage detection
- Skip link presence
- Language and charset detection

## 🌐 **Database Integration**

All analyzed data is automatically sent to the **Open Tech Explorer** database at `https://openexplorer.tech`, contributing to a comprehensive, community-driven database of website technologies.

### **API Endpoints:**
- **Ingest API**: Sends technology and metadata to database
- **Search API**: Powers the main website's search functionality
- **Real-time Updates**: Live data synchronization across platform

## 🎯 **Usage**

### **Automatic Mode (Default):**
1. **Install extension** - auto-analysis starts immediately
2. **Browse websites** - they're analyzed automatically in background
3. **Click extension icon** - see instant results from background analysis
4. **View detailed insights** - technology categories and metadata

### **Manual Mode:**
1. **Toggle off auto-analysis** in popup settings
2. **Navigate to any website**
3. **Click extension icon** and "Analyze Technologies"
4. **View results** and confirm data sent to database

## 🔧 **Technical Details**

### **Manifest V3 Features:**
- Service Worker background script for better performance
- Enhanced security with host permissions
- Modern Chrome extension architecture
- Improved resource management

### **Manifest V2 Support:**
- Background page for broader browser compatibility
- Legacy extension support
- Identical functionality to MV3 version

### **Performance Optimizations:**
- **Debounced analysis** - prevents multiple analyses of same page
- **Intelligent caching** - avoids duplicate work with 1-hour expiration
- **Timeout handling** - prevents hanging on slow-loading pages
- **Error recovery** - continues working even if some analyses fail

## 📝 **Version Information**

- **Version**: 1.0.0
- **Author**: Open Tech Explorer Team
- **Homepage**: https://openexplorer.tech
- **Support**: Available through Open Tech Explorer website

## 🎉 **Get Started**

Install the **Open Tech Explorer** extension today and start contributing to the largest open database of website technologies! Every website you visit helps build a comprehensive resource for developers, researchers, and technology enthusiasts worldwide.

**Try it out** - install the extension, visit a few websites, then click the extension icon to see the automatic analysis results instantly! 🚀