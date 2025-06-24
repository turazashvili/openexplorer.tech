# TechLookup Chrome Extension - Full Auto-Analysis

This Chrome extension automatically analyzes every website you visit to detect technologies and sends the data to the TechLookup database.

## 🚀 **NEW: Full Background Auto-Analysis**

### **🔄 Automatic Features**
- **Monitors ALL tab changes** and page loads
- **Auto-analyzes new websites** when pages finish loading  
- **Smart caching** - won't re-analyze the same site for 1 hour
- **Runs silently** in the background without user interaction
- **Instant popup results** from background analysis

### **⚙️ Smart Controls**
- **Auto-analysis toggle** in popup to enable/disable
- **Manual re-analysis** button for fresh scans
- **Visual status indicators** showing analysis state
- **Background/manual analysis detection**

## 🎯 **How It Works Now**

### **Background Process:**
1. **Monitors every website** you visit automatically
2. **Waits 2 seconds** for page to fully load
3. **Checks cache** - skips if analyzed within 1 hour  
4. **Auto-analyzes** if auto-analysis is enabled
5. **Sends to database** automatically
6. **Stores results** for instant popup display

### **Popup Experience:**
1. **Click extension icon** → **Instant results** (from background)
2. **Toggle auto-analysis** on/off as needed
3. **Manual re-analysis** available anytime
4. **Visual feedback** on analysis status

## 🔧 **Installation Instructions**

### **For Full Auto-Analysis (Recommended):**
```bash
# Use the shared folder with any manifest version
# Copy shared files to your preferred manifest version
cp chrome-extension/shared/* chrome-extension/mv3/

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer mode  
# 3. Click "Load unpacked"
# 4. Select chrome-extension/mv3/ folder
```

### **Key Features Added:**
- **`shared/background.js`** - Full background monitoring service
- **Enhanced `shared/popup.js`** - Settings & background integration
- **Enhanced content scripts** - Improved detection (30+ technologies)
- **Updated manifests** - Added `tabs` permission for monitoring

## 🎨 **New UI Features**

- **Auto-analysis status indicator** at top of popup
- **Settings toggle** to enable/disable background analysis  
- **Smart button text** ("Analyze" vs "Re-analyze")
- **Background analysis detection** with visual feedback
- **Better error messages** with specific details

## 🔒 **Privacy & Performance**

- **Only analyzes HTTP/HTTPS** websites (skips chrome:// pages)
- **1-hour caching** prevents excessive analysis
- **Lightweight background** process with minimal impact
- **User control** - can disable auto-analysis anytime
- **No personal data** collected - only technology names

## 📊 **Console Logging**

The extension now provides detailed console logging:
- `TechLookup: Auto-analyzing example.com...`
- `TechLookup: ✅ Auto-analyzed example.com - found 5 technologies`
- `TechLookup: ❌ Auto-analysis failed for example.com: Error message`

## 🎯 **Usage**

### **Automatic Mode (Default):**
1. **Install extension** - auto-analysis starts immediately
2. **Browse websites** - they're analyzed automatically in background
3. **Click extension icon** - see instant results from background analysis
4. **Toggle off** if you want manual-only mode

### **Manual Mode:**
1. **Toggle off auto-analysis** in popup settings
2. **Navigate to any website**
3. **Click extension icon** and "Analyze Technologies"
4. **View results** and data sent to database

## 🔧 **Technical Details**

### **Background Monitoring:**
- Listens to `chrome.tabs.onUpdated` for page loads
- Listens to `chrome.tabs.onActivated` for tab switches
- Implements smart caching with 1-hour expiration
- Handles errors gracefully without breaking browsing

### **Performance Optimizations:**
- **Debounced analysis** - prevents multiple analyses of same page
- **Cache management** - avoids duplicate work
- **Timeout handling** - prevents hanging on slow pages
- **Error recovery** - continues working even if some analyses fail

The extension now **truly automatically analyzes every website you visit** while giving you complete control over the feature! 🎉

**Try it out** - install the extension, visit a few websites, then click the extension icon to see the background analysis results instantly!