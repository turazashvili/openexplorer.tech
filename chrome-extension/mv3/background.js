// Enhanced background script with full tab monitoring and auto-analysis for MV3
class TechLookupBackground {
  constructor() {
    this.settings = { autoAnalysis: true };
    this.analysisCache = new Map();
    this.pendingAnalysis = new Set();
    this.init();
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

    console.log('TechLookup Background: Full auto-analysis initialized (MV3)');
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
        this.settings.autoAnalysis) {
      
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
      if (tab.url && tab.url.startsWith('http')) {
        this.scheduleAnalysis(activeInfo.tabId, tab.url);
      }
    });
  }

  scheduleAnalysis(tabId, url) {
    const hostname = this.extractHostname(url);
    if (!hostname || this.pendingAnalysis.has(tabId)) return;

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
      console.log(`TechLookup: Auto-analyzing ${hostname}...`);

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

          console.log(`TechLookup: ✅ Auto-analyzed ${hostname} - found ${technologies.length} technologies`);
        }
      }
    } catch (error) {
      console.warn(`TechLookup: ❌ Auto-analysis failed for ${hostname}:`, error.message);
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
      console.error('TechLookup: Database error:', error);
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
      return new URL(url).hostname.replace(/^www\./, '');
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
          console.log('TechLookup: Settings updated:', this.settings);
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
new TechLookupBackground();