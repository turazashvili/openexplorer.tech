// Enhanced popup with metadata display and improved technology categorization
const SUPABASE_URL = 'https://catnatrzpjqcwqnppgkf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdG5hdHJ6cGpxY3dxbnBwZ2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODE2MTEsImV4cCI6MjA2NjM1NzYxMX0.RO4IJkuMNuLoE70UC2-b1JoGH2eXsFkED7HFpOlMofs';

class TechLookupPopup {
  constructor() {
    this.currentTab = null;
    this.technologies = [];
    this.metadata = {};
    this.settings = { autoAnalysis: true };
    this.backgroundResults = null;
    this.init();
  }

  async init() {
    await this.getCurrentTab();
    await this.loadSettings();
    this.setupEventListeners();
    this.displayCurrentUrl();
    this.setupSettingsUI();
    
    // Check for background analysis results first
    await this.checkBackgroundResults();
  }

  async getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        this.currentTab = tabs[0];
        resolve(tabs[0]);
      });
    });
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        this.settings = response || { autoAnalysis: true };
        resolve();
      });
    });
  }

  setupEventListeners() {
    document.getElementById('analyzeBtn').addEventListener('click', () => {
      this.analyzeTechnologies();
    });

    document.getElementById('viewDatabase').addEventListener('click', () => {
      chrome.tabs.create({ url: window.location.origin });
    });

    // Auto-analysis toggle
    const autoToggle = document.getElementById('autoAnalysisToggle');
    if (autoToggle) {
      autoToggle.addEventListener('change', (e) => {
        this.updateAutoAnalysisSetting(e.target.checked);
      });
    }
  }

  setupSettingsUI() {
    const autoToggle = document.getElementById('autoAnalysisToggle');
    if (autoToggle) {
      autoToggle.checked = this.settings.autoAnalysis;
    }

    // Update status text based on setting
    const statusText = document.querySelector('.auto-note');
    if (statusText) {
      if (this.settings.autoAnalysis) {
        statusText.textContent = '✨ Auto-analysis enabled - scanning websites automatically';
        statusText.style.background = '#f0f9ff';
        statusText.style.borderColor = '#bae6fd';
        statusText.style.color = '#0369a1';
      } else {
        statusText.textContent = '⏸️ Auto-analysis disabled - click to analyze manually';
        statusText.style.background = '#fef3c7';
        statusText.style.borderColor = '#fcd34d';
        statusText.style.color = '#92400e';
      }
    }
  }

  async checkBackgroundResults() {
    if (!this.currentTab) return;

    // Check if background analysis already found results
    chrome.runtime.sendMessage(
      { action: 'getStoredResults', tabId: this.currentTab.id },
      (response) => {
        if (response && response.technologies) {
          this.backgroundResults = response;
          this.technologies = response.technologies;
          this.metadata = response.metadata || {};
          this.displayResults();
          
          const source = response.source === 'background' ? 'auto-analyzed' : 'analyzed';
          this.showSuccess(`Found ${response.technologies.length} technologies (${source})`);
          
          // Update button text
          document.getElementById('analyzeBtn').textContent = '🔍 Re-analyze';
        } else if (this.settings.autoAnalysis) {
          // No background results yet, show waiting message
          this.showInfo('Auto-analyzing in background...');
          
          // Check again in a few seconds
          setTimeout(() => {
            this.checkBackgroundResults();
          }, 3000);
        } else {
          // Auto-analysis disabled, perform manual analysis
          this.analyzeTechnologies();
        }
      }
    );
  }

  displayCurrentUrl() {
    if (this.currentTab) {
      try {
        const url = new URL(this.currentTab.url);
        document.getElementById('currentUrl').textContent = url.hostname;
      } catch (error) {
        document.getElementById('currentUrl').textContent = 'Invalid URL';
      }
    }
  }

  async updateAutoAnalysisSetting(enabled) {
    this.settings.autoAnalysis = enabled;
    
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: this.settings
    }, () => {
      this.setupSettingsUI();
      
      if (enabled && !this.backgroundResults) {
        // If enabling auto-analysis and no results yet, trigger analysis
        this.showInfo('Auto-analysis enabled - analyzing current page...');
        setTimeout(() => {
          this.checkBackgroundResults();
        }, 1000);
      }
    });
  }

  async analyzeTechnologies() {
    // Skip analysis for chrome:// and other non-web URLs
    if (!this.currentTab || !this.currentTab.url.startsWith('http')) {
      this.showError('Cannot analyze this page. Please visit a website.');
      return;
    }

    this.showLoading();
    
    try {
      // Inject content script to analyze the page
      const results = await this.injectAnalyzer();
      this.technologies = results.technologies || [];
      this.metadata = results.metadata || {};
      
      // Send data to Supabase
      await this.sendToSupabase(results);
      
      // Display results
      this.displayResults();
      this.showSuccess('Technologies detected and sent to database!');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      let errorMessage = 'Failed to analyze website. ';
      
      if (error.message) {
        errorMessage += error.message;
      } else if (typeof error === 'string') {
        errorMessage += error;
      } else {
        errorMessage += 'Please try again.';
      }
      
      this.showError(errorMessage);
    } finally {
      this.hideLoading();
    }
  }

  async injectAnalyzer() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Analysis timeout - page may not be ready'));
      }, 10000);

      chrome.tabs.sendMessage(this.currentTab.id, { action: 'analyze' }, (response) => {
        clearTimeout(timeout);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response) {
          reject(new Error('No response from content script'));
        } else if (!response.success) {
          reject(new Error(response.error || 'Analysis failed'));
        } else {
          resolve(response);
        }
      });
    });
  }

  async sendToSupabase(data) {
    try {
      const url = new URL(this.currentTab.url);
      const hostname = url.hostname.replace(/^www\./, '');
      
      const payload = {
        url: hostname,
        technologies: data.technologies || [],
        metadata: data.metadata || {},
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  displayResults() {
    const container = document.getElementById('technologiesContainer');
    container.innerHTML = '';

    if (this.technologies.length === 0) {
      container.innerHTML = '<div class="tech-section"><p>No technologies detected</p></div>';
      return;
    }

    // Group technologies by category
    const grouped = this.groupTechnologies(this.technologies);
    
    // Display technology groups
    Object.entries(grouped).forEach(([category, techs]) => {
      const section = document.createElement('div');
      section.className = 'tech-section';
      
      section.innerHTML = `
        <h3>${category} (${techs.length})</h3>
        <div class="tech-tags">
          ${techs.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
      `;
      
      container.appendChild(section);
    });

    // Display metadata if available
    if (Object.keys(this.metadata).length > 0) {
      this.displayMetadata(container);
    }

    document.getElementById('results').style.display = 'block';
  }

  displayMetadata(container) {
    const metadataSection = document.createElement('div');
    metadataSection.className = 'tech-section';
    
    const interestingMetadata = this.getInterestingMetadata();
    
    if (interestingMetadata.length > 0) {
      metadataSection.innerHTML = `
        <h3>📊 Website Insights</h3>
        <div class="metadata-items">
          ${interestingMetadata.map(item => `
            <div class="metadata-item">
              <span class="metadata-label">${item.label}:</span>
              <span class="metadata-value">${item.value}</span>
            </div>
          `).join('')}
        </div>
      `;
      
      container.appendChild(metadataSection);
    }
  }

  getInterestingMetadata() {
    const items = [];
    
    // Page characteristics
    if (this.metadata.is_responsive !== undefined) {
      items.push({
        label: 'Responsive Design',
        value: this.metadata.is_responsive ? '✅ Yes' : '❌ No'
      });
    }
    
    if (this.metadata.is_https !== undefined) {
      items.push({
        label: 'HTTPS',
        value: this.metadata.is_https ? '🔒 Secure' : '⚠️ Not Secure'
      });
    }
    
    if (this.metadata.likely_spa !== undefined) {
      items.push({
        label: 'Single Page App',
        value: this.metadata.likely_spa ? '✅ Likely' : '❌ Traditional'
      });
    }
    
    // Performance metrics
    if (this.metadata.page_load_time) {
      items.push({
        label: 'Load Time',
        value: `${Math.round(this.metadata.page_load_time)}ms`
      });
    }
    
    if (this.metadata.script_count) {
      items.push({
        label: 'Scripts',
        value: this.metadata.script_count
      });
    }
    
    if (this.metadata.stylesheet_count) {
      items.push({
        label: 'Stylesheets',
        value: this.metadata.stylesheet_count
      });
    }
    
    if (this.metadata.external_script_count) {
      items.push({
        label: 'External Scripts',
        value: this.metadata.external_script_count
      });
    }
    
    // Optimization features
    if (this.metadata.uses_lazy_loading) {
      items.push({
        label: 'Lazy Loading',
        value: '✅ Enabled'
      });
    }
    
    if (this.metadata.has_service_worker) {
      items.push({
        label: 'Service Worker',
        value: '✅ Active'
      });
    }
    
    if (this.metadata.uses_google_fonts) {
      items.push({
        label: 'Google Fonts',
        value: '✅ Used'
      });
    }
    
    // SEO and accessibility
    if (this.metadata.has_open_graph) {
      items.push({
        label: 'Open Graph',
        value: '✅ Present'
      });
    }
    
    if (this.metadata.has_twitter_cards) {
      items.push({
        label: 'Twitter Cards',
        value: '✅ Present'
      });
    }
    
    if (this.metadata.meta_description_length) {
      items.push({
        label: 'Meta Description',
        value: `${this.metadata.meta_description_length} chars`
      });
    }
    
    // Versions (if available)
    if (this.metadata.react_version) {
      items.push({
        label: 'React Version',
        value: this.metadata.react_version
      });
    }
    
    if (this.metadata.vue_version) {
      items.push({
        label: 'Vue Version',
        value: this.metadata.vue_version
      });
    }
    
    if (this.metadata.jquery_version) {
      items.push({
        label: 'jQuery Version',
        value: this.metadata.jquery_version
      });
    }
    
    return items.slice(0, 8); // Limit to most important items
  }

  groupTechnologies(technologies) {
    const categories = {
      'JavaScript Frameworks': ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Alpine.js', 'Ember.js', 'Backbone.js'],
      'CSS Frameworks': ['Bootstrap', 'Tailwind CSS', 'Bulma', 'Foundation', 'Materialize', 'Semantic UI'],
      'Content Management': ['WordPress', 'Drupal', 'Joomla', 'Shopify', 'Squarespace', 'Wix', 'Webflow', 'Magento', 'Ghost'],
      'Analytics & Tracking': ['Google Analytics', 'Google Tag Manager', 'Hotjar', 'Mixpanel', 'Facebook Pixel', 'Segment'],
      'CDN & Infrastructure': ['Cloudflare', 'AWS CloudFront', 'jsDelivr', 'unpkg', 'KeyCDN', 'MaxCDN'],
      'E-commerce & Payments': ['WooCommerce', 'Stripe', 'PayPal', 'Square'],
      'Development Tools': ['Lodash', 'Moment.js', 'D3.js', 'Three.js', 'Chart.js', 'Axios', 'Webpack', 'Vite', 'Parcel'],
      'UI & Icons': ['Font Awesome', 'Material Icons', 'Feather Icons', 'Google Fonts'],
      'Monitoring & Support': ['Sentry', 'LogRocket', 'Intercom', 'Zendesk', 'Drift'],
      'Performance & Features': ['Lazy Loading', 'Service Worker', 'Web Workers'],
      'Other': []
    };

    const grouped = {};
    
    technologies.forEach(tech => {
      let assigned = false;
      
      for (const [category, techList] of Object.entries(categories)) {
        if (techList.includes(tech)) {
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(tech);
          assigned = true;
          break;
        }
      }
      
      if (!assigned) {
        if (!grouped['Other']) grouped['Other'] = [];
        grouped['Other'].push(tech);
      }
    });

    return grouped;
  }

  showLoading() {
    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('analyzeBtn').textContent = '🔄 Analyzing...';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('status').textContent = '';
  }

  hideLoading() {
    document.getElementById('analyzeBtn').disabled = false;
    document.getElementById('analyzeBtn').textContent = '🔍 Re-analyze';
    document.getElementById('loading').style.display = 'none';
  }

  showSuccess(message) {
    const status = document.getElementById('status');
    status.className = 'status success';
    status.textContent = message;
  }

  showError(message) {
    const status = document.getElementById('status');
    status.className = 'status error';
    status.textContent = message;
    document.getElementById('results').style.display = 'block';
  }

  showInfo(message) {
    const status = document.getElementById('status');
    status.className = 'status';
    status.style.background = '#f0f9ff';
    status.style.color = '#0369a1';
    status.style.border = '1px solid #bae6fd';
    status.textContent = message;
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TechLookupPopup();
});