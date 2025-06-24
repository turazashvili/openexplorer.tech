// Configuration
const SUPABASE_URL = 'https://catnatrzpjqcwqnppgkf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdG5hdHJ6cGpxY3dxbnBwZ2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODE2MTEsImV4cCI6MjA2NjM1NzYxMX0.RO4IJkuMNuLoE70UC2-b1JoGH2eXsFkED7HFpOlMofs';

class TechLookupPopup {
  constructor() {
    this.currentTab = null;
    this.technologies = [];
    this.init();
  }

  async init() {
    await this.getCurrentTab();
    this.setupEventListeners();
    this.displayCurrentUrl();
    
    // Auto-analyze when popup opens
    await this.analyzeTechnologies();
  }

  async getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        this.currentTab = tabs[0];
        resolve(tabs[0]);
      });
    });
  }

  setupEventListeners() {
    document.getElementById('analyzeBtn').addEventListener('click', () => {
      this.analyzeTechnologies();
    });

    document.getElementById('viewDatabase').addEventListener('click', () => {
      chrome.tabs.create({ url: window.location.origin }); // Opens your TechLookup website
    });
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
      // Add timeout to prevent hanging
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
    
    Object.entries(grouped).forEach(([category, techs]) => {
      const section = document.createElement('div');
      section.className = 'tech-section';
      
      section.innerHTML = `
        <h3>${category}</h3>
        <div class="tech-tags">
          ${techs.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
      `;
      
      container.appendChild(section);
    });

    document.getElementById('results').style.display = 'block';
  }

  groupTechnologies(technologies) {
    const categories = {
      'JavaScript Frameworks': ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js'],
      'CSS Frameworks': ['Bootstrap', 'Tailwind CSS', 'Bulma', 'Foundation'],
      'Content Management': ['WordPress', 'Drupal', 'Joomla', 'Shopify', 'Squarespace'],
      'Analytics': ['Google Analytics', 'Google Tag Manager', 'Hotjar', 'Mixpanel'],
      'CDN': ['Cloudflare', 'AWS CloudFront', 'KeyCDN', 'MaxCDN'],
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
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TechLookupPopup();
});