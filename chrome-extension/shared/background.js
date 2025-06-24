// Enhanced background script with tab monitoring
class TechLookupBackground {
  constructor() {
    this.analyzedTabs = new Set();
    this.pendingAnalysis = new Map();
    this.init();
  }

  init() {
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
    });

    console.log('TechLookup Background: Initialized');
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    // Only process when page is completely loaded
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
      // Check if we should auto-analyze this tab
      this.scheduleAnalysis(tabId, tab.url);
    }
  }

  handleTabActivation(activeInfo) {
    // When user switches to a tab, check if it needs analysis
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab.url && tab.url.startsWith('http')) {
        this.scheduleAnalysis(activeInfo.tabId, tab.url);
      }
    });
  }

  scheduleAnalysis(tabId, url) {
    const hostname = this.extractHostname(url);
    if (!hostname) return;

    // Check if we've already analyzed this hostname recently
    const cacheKey = `analyzed_${hostname}`;
    chrome.storage.local.get([cacheKey], (result) => {
      const lastAnalyzed = result[cacheKey];
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hour cache

      if (!lastAnalyzed || (now - lastAnalyzed) > oneHour) {
        // Schedule analysis with a small delay to ensure page is ready
        setTimeout(() => {
          this.performBackgroundAnalysis(tabId, url, hostname);
        }, 2000);
      }
    });
  }

  async performBackgroundAnalysis(tabId, url, hostname) {
    try {
      // Check if user has enabled auto-analysis
      const settings = await this.getSettings();
      if (!settings.autoAnalysis) return;

      // Inject content script and analyze
      const results = await this.injectAndAnalyze(tabId);
      
      if (results && results.technologies && results.technologies.length > 0) {
        // Send to database
        await this.sendToDatabase(hostname, results.technologies);
        
        // Cache the analysis
        const cacheKey = `analyzed_${hostname}`;
        chrome.storage.local.set({ [cacheKey]: Date.now() });
        
        // Store results for popup
        chrome.storage.local.set({ 
          [`results_${tabId}`]: {
            hostname,
            technologies: results.technologies,
            timestamp: new Date().toISOString()
          }
        });

        console.log(`TechLookup: Auto-analyzed ${hostname} - found ${results.technologies.length} technologies`);
      }
    } catch (error) {
      console.warn(`TechLookup: Auto-analysis failed for ${hostname}:`, error);
    }
  }

  async injectAndAnalyze(tabId) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action: 'analyze' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  }

  async sendToDatabase(hostname, technologies) {
    const SUPABASE_URL = 'https://catnatrzpjqcwqnppgkf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdG5hdHJ6cGpxY3dxbnBwZ2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODE2MTEsImV4cCI6MjA2NjM1NzYxMX0.RO4IJkuMNuLoE70UC2-b1JoGH2eXsFkED7HFpOlMofs';

    try {
      const payload = {
        url: hostname,
        technologies: technologies,
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
      console.error('Database error:', error);
      return false;
    }
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['autoAnalysis'], (result) => {
        resolve({
          autoAnalysis: result.autoAnalysis !== false // Default to true
        });
      });
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
    if (request.action === 'getStoredResults') {
      const tabId = request.tabId;
      chrome.storage.local.get([`results_${tabId}`], (result) => {
        sendResponse(result[`results_${tabId}`] || null);
      });
      return true;
    }

    if (request.action === 'updateSettings') {
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ success: true });
      });
      return true;
    }
  }
}

// Initialize background service
new TechLookupBackground();