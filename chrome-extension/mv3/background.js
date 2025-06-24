// Background script for Manifest V3 (Service Worker)
chrome.runtime.onInstalled.addListener(() => {
  console.log('TechLookup Analyzer extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically
  // No additional action needed as popup is defined in manifest
});

// Optional: Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'background_task') {
    // Handle any background tasks if needed
    sendResponse({ success: true });
  }
  
  return true;
});