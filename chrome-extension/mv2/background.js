// Enhanced background script with full tab monitoring and auto-analysis
class OpenTechExplorerBackground {
  constructor() {
    this.settings = { autoAnalysis: true };
    this.analysisCache = new Map();
    this.pendingAnalysis = new Set();
    this.blockedDomains = this.initializeBlockedDomains();
    this.init();
  }

  initializeBlockedDomains() {
    return new Set([
      // Localhost variations
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      
      // Local development domains
      'local',
      'dev',
      'test',
      'staging',
      'development',
      
      // Common development ports and patterns
      'localhost:3000',
      'localhost:3001',
      'localhost:8000',
      'localhost:8080',
      'localhost:5000',
      'localhost:5173', // Vite default
      'localhost:4200', // Angular CLI default
      'localhost:3030',
      'localhost:9000',
      
      // IP ranges for local development
      '192.168.',
      '10.0.',
      '172.16.',
      '172.17.',
      '172.18.',
      '172.19.',
      '172.20.',
      '172.21.',
      '172.22.',
      '172.23.',
      '172.24.',
      '172.25.',
      '172.26.',
      '172.27.',
      '172.28.',
      '172.29.',
      '172.30.',
      '172.31.',
      
      // Development TLDs
      '.local',
      '.dev',
      '.test',
      '.localhost',
      '.internal',
      '.lan',
      
      // Common development subdomains
      'dev.',
      'test.',
      'staging.',
      'local.',
      'development.',
      'preview.',
      
      // File protocol
      'file://',
      
      // Chrome extension pages
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      
      // Browser internal pages
      'chrome://',
      'about:',
      'moz://',
      'edge://',
      'opera://',
      
      // Common development frameworks default URLs
      'webpack-dev-server',
      'hot-reload',
      'browsersync'
    ]);
  }

  isBlockedUrl(url) {
    if (!url || typeof url !== 'string') return true;
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const fullUrl = url.toLowerCase();
      
      // Check exact matches
      if (this.blockedDomains.has(hostname)) {
        console.log(`Open Tech Explorer: Blocked exact match - ${hostname}`);
        return true;
      }
      
      // Check if hostname starts with blocked patterns
      for (const blocked of this.blockedDomains) {
        if (blocked.endsWith('.') && hostname.startsWith(blocked)) {
          console.log(`Open Tech Explorer: Blocked IP range - ${hostname} matches ${blocked}`);
          return true;
        }
        
        if (blocked.startsWith('.') && hostname.endsWith(blocked)) {
          console.log(`Open Tech Explorer: Blocked TLD - ${hostname} matches ${blocked}`);
          return true;
        }
        
        if (blocked.endsWith('.') && hostname.startsWith(blocked)) {
          console.log(`Open Tech Explorer: Blocked subdomain - ${hostname} matches ${blocked}`);
          return true;
        }
        
        if (fullUrl.includes(blocked)) {
          console.log(`Open Tech Explorer: Blocked pattern - ${url} contains ${blocked}`);
          return true;
        }
      }
      
      // Check for localhost with any port
      if (hostname === 'localhost' || hostname.startsWith('localhost:')) {
        console.log(`Open Tech Explorer: Blocked localhost with port - ${hostname}`);
        return true;
      }
      
      // Check for IP addresses in private ranges
      const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
      const ipMatch = hostname.match(ipRegex);
      if (ipMatch) {
        const [, a, b, c, d] = ipMatch.map(Number);
        
        // Private IP ranges
        if (
          (a === 10) || // 10.0.0.0/8
          (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
          (a === 192 && b === 168) || // 192.168.0.0/16
          (a === 127) || // 127.0.0.0/8 (loopback)
          (a === 169 && b === 254) // 169.254.0.0/16 (link-local)
        ) {
          console.log(`Open Tech Explorer: Blocked private IP - ${hostname}`);
          return true;
        }
      }
      
      // Check for development ports (common dev server ports)
      const devPorts = [3000, 3001, 4200, 5000, 5173, 8000, 8080, 8888, 9000, 9001];
      if (devPorts.includes(urlObj.port ? parseInt(urlObj.port) : 0)) {
        console.log(`Open Tech Explorer: Blocked development port - ${urlObj.port}`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.warn(`Open Tech Explorer: Error parsing URL ${url}:`, error);
      return true; // Block invalid URLs
    }
  }

  async init() {
    // Load settings
    await this.loadSettings();

    // Listen for tab updates (navigation)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Listen for tab activation
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabActivation(activeInfo);
    });

    // Listen for messages from popup/content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open
    });

    console.log('Open Tech Explorer Background: Full auto-analysis initialized with URL filtering');
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['autoAnalysis'], (result) => {
        this.settings = {
          autoAnalysis: result.autoAnalysis !== false // Default to true
        };
        resolve();
      });
    });
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    // Only process when page is completely loaded and auto-analysis is enabled
    if (changeInfo.status === 'complete' && 
        tab.url && 
        tab.url.startsWith('http') && 
        this.settings.autoAnalysis &&
        !this.isBlockedUrl(tab.url)) {
      
      // Schedule analysis with delay to ensure page is ready
      setTimeout(() => {
        this.scheduleAnalysis(tabId, tab.url);
      }, 2000);
    }
  }

  handleTabActivation(activeInfo) {
    if (!this.settings.autoAnalysis) return;

    // When user switches to a tab, check if it needs analysis
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab.url && tab.url.startsWith('http') && !this.isBlockedUrl(tab.url)) {
        this.scheduleAnalysis(activeInfo.tabId, tab.url);
      }
    });
  }

  scheduleAnalysis(tabId, url) {
    const hostname = this.extractHostname(url);
    if (!hostname || this.pendingAnalysis.has(tabId) || this.isBlockedUrl(url)) return;

    // Check cache - don't re-analyze within 1 hour
    const cacheKey = hostname;
    const cached = this.analysisCache.get(cacheKey);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (cached && (now - cached.timestamp) < oneHour) {
      // Use cached results
      this.storeTabResults(tabId, hostname, cached.technologies, cached.metadata);
      return;
    }

    // Mark as pending and perform analysis
    this.pendingAnalysis.add(tabId);
    this.performBackgroundAnalysis(tabId, url, hostname);
  }

  async performBackgroundAnalysis(tabId, url, hostname) {
    try {
      // Double-check URL is not blocked before analysis
      if (this.isBlockedUrl(url)) {
        console.log(`Open Tech Explorer: Skipping blocked URL - ${url}`);
        return;
      }

      console.log(`Open Tech Explorer: Auto-analyzing ${hostname}...`);

      // Inject content script and analyze
      const results = await this.injectAndAnalyze(tabId);
      
      if (results && results.success && results.technologies) {
        const technologies = results.technologies;
        const metadata = results.metadata || {};
        
        // Send to database
        const dbSuccess = await this.sendToDatabase(hostname, technologies, metadata);
        
        if (dbSuccess) {
          // Cache the results
          this.analysisCache.set(hostname, {
            technologies,
            metadata,
            timestamp: Date.now()
          });

          // Store results for popup
          this.storeTabResults(tabId, hostname, technologies, metadata);

          console.log(`Open Tech Explorer: ✅ Auto-analyzed ${hostname} - found ${technologies.length} technologies`);
        }
      }
    } catch (error) {
      console.warn(`Open Tech Explorer: ❌ Auto-analysis failed for ${hostname}:`, error.message);
    } finally {
      this.pendingAnalysis.delete(tabId);
    }
  }

  async injectAndAnalyze(tabId) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Analysis timeout'));
      }, 8000);

      chrome.tabs.sendMessage(tabId, { action: 'analyze' }, (response) => {
        clearTimeout(timeout);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  async sendToDatabase(hostname, technologies, metadata = {}) {
    const SUPABASE_URL = 'https://catnatrzpjqcwqnppgkf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdG5hdHJ6cGpxY3dxbnBwZ2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODE2MTEsImV4cCI6MjA2NjM1NzYxMX0.RO4IJkuMNuLoE70UC2-b1JoGH2eXsFkED7HFpOlMofs';

    // Final check before sending to database
    if (this.isBlockedUrl(`https://${hostname}`)) {
      console.log(`Open Tech Explorer: Prevented sending blocked hostname to database - ${hostname}`);
      return false;
    }

    try {
      const payload = {
        url: hostname,
        technologies: technologies,
        metadata: metadata,
        scraped_at: new Date().toISOString()
      };

      const response = await fetch(`${SUPABASE_URL}/functions/v1/ingest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Open Tech Explorer: Database error:', error);
      return false;
    }
  }

  storeTabResults(tabId, hostname, technologies, metadata = {}) {
    chrome.storage.local.set({ 
      [`results_${tabId}`]: {
        hostname,
        technologies,
        metadata,
        timestamp: new Date().toISOString(),
        source: 'background'
      }
    });
  }

  extractHostname(url) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      
      // Additional check for blocked hostnames
      if (this.isBlockedUrl(`https://${hostname}`)) {
        return null;
      }
      
      return hostname;
    } catch {
      return null;
    }
  }

  handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'getStoredResults':
        const tabId = request.tabId;
        chrome.storage.local.get([`results_${tabId}`], (result) => {
          sendResponse(result[`results_${tabId}`] || null);
        });
        break;

      case 'updateSettings':
        this.settings = { ...this.settings, ...request.settings };
        chrome.storage.sync.set(request.settings, () => {
          console.log('Open Tech Explorer: Settings updated:', this.settings);
          sendResponse({ success: true });
        });
        break;

      case 'getSettings':
        sendResponse(this.settings);
        break;

      case 'clearCache':
        this.analysisCache.clear();
        chrome.storage.local.clear();
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ error: 'Unknown action' });
    }
  }
}

// Initialize background service
new OpenTechExplorerBackground();