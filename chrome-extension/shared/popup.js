// Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your actual Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key

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
      chrome.tabs.create({ url: 'https://your-techlookup-domain.com' }); // Replace with your domain
    });
  }

  displayCurrentUrl() {
    if (this.currentTab) {
      const url = new URL(this.currentTab.url);
      document.getElementById('currentUrl').textContent = url.hostname;
    }
  }

  async analyzeTechnologies() {
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
      this.showError('Failed to analyze website. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  async injectAnalyzer() {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(this.currentTab.id, { action: 'analyze' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  async sendToSupabase(data) {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
  }

  hideLoading() {
    document.getElementById('analyzeBtn').disabled = false;
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
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TechLookupPopup();
});