# TechLookup Chrome Extension

This Chrome extension analyzes websites to detect technologies and sends the data to the TechLookup database.

## Features

- 🔍 **Automatic Technology Detection** - Detects 20+ popular web technologies
- 📊 **Real-time Analysis** - Analyzes the current website with one click
- 🗄️ **Database Integration** - Sends findings to TechLookup Supabase database
- 🎨 **Beautiful UI** - Clean, modern popup interface
- 🔄 **Dual Manifest Support** - Both Manifest V2 and V3 versions included

## Detected Technologies

### JavaScript Frameworks & Libraries
- React, Vue.js, Angular, jQuery, Next.js

### CSS Frameworks
- Bootstrap, Tailwind CSS

### Content Management Systems
- WordPress, Shopify, Drupal, WooCommerce

### Analytics & Tracking
- Google Analytics, Google Tag Manager, Facebook Pixel

### CDN & Infrastructure
- Cloudflare, Google APIs

### Other
- Font Awesome, Stripe, PayPal, and more...

## Installation

### For Development

1. **Configure the extension:**
   - Open `chrome-extension/shared/popup.js`
   - Replace `YOUR_SUPABASE_URL` with your actual Supabase URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your actual Supabase anon key
   - Replace the database URL in the "View Database" link

2. **Choose your manifest version:**
   - For **Manifest V2**: Use the `mv2` folder
   - For **Manifest V3**: Use the `mv3` folder (recommended for new installations)

3. **Copy shared files:**
   ```bash
   # For MV2
   cp chrome-extension/shared/* chrome-extension/mv2/
   
   # For MV3
   cp chrome-extension/shared/* chrome-extension/mv3/
   ```

4. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select either the `mv2` or `mv3` folder

### Icons

You'll need to add icon files to the `icons/` folder in each manifest directory:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px) 
- `icon128.png` (128x128px)

## Usage

1. **Navigate to any website**
2. **Click the TechLookup extension icon** in your browser toolbar
3. **Click "Analyze Technologies"** in the popup
4. **View detected technologies** grouped by category
5. **Data is automatically sent** to the TechLookup database

## API Integration

The extension sends data to your Supabase backend using this format:

```json
{
  "url": "example.com",
  "technologies": ["React", "Tailwind CSS", "Cloudflare"],
  "scraped_at": "2024-01-15T10:30:00Z"
}
```

## File Structure

```
chrome-extension/
├── mv2/                    # Manifest V2 version
│   ├── manifest.json
│   └── background.js
├── mv3/                    # Manifest V3 version  
│   ├── manifest.json
│   └── background.js
├── shared/                 # Shared files for both versions
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic and API calls
│   ├── content.js         # Technology detection script
│   └── detector.js        # Advanced detection library
└── README.md
```

## Development

### Adding New Technology Detection

1. **Edit `content.js`** and add a new detection rule to `initializeDetectionRules()`
2. **Test the detection** on websites that use the technology
3. **Update the categorization** in `popup.js` if needed

### Example Detection Rule

```javascript
'New Framework': () => {
  return !!(window.NewFramework || 
           document.querySelector('script[src*="newframework"]') ||
           document.querySelector('[data-new-framework]'));
}
```

## Permissions

### Manifest V2
- `activeTab` - Access current tab content
- `storage` - Store extension settings
- `https://*/*` & `http://*/*` - Make API requests

### Manifest V3  
- `activeTab` - Access current tab content
- `storage` - Store extension settings
- `host_permissions` - Make API requests to any domain

## Privacy

- The extension only analyzes publicly available website code
- No personal data or browsing history is collected
- Only detected technology names and website URLs are sent to the database
- All data helps improve the public TechLookup database

## Support

For issues or feature requests, please visit the TechLookup website or contact support.