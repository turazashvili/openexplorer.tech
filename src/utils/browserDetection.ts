export interface BrowserInfo {
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isSafari: boolean;
  isOpera: boolean;
  isChromiumBased: boolean;
}

export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  
  const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent) && !/opr/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);
  const isEdge = /edge/.test(userAgent) || /edg/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isOpera = /opr/.test(userAgent) || /opera/.test(userAgent);
  
  // Chromium-based browsers include Chrome, Edge, Opera, and others
  const isChromiumBased = isChrome || isEdge || isOpera || (/chrome/.test(userAgent) && !isFirefox && !isSafari);
  
  return {
    isChrome,
    isFirefox,
    isEdge,
    isSafari,
    isOpera,
    isChromiumBased
  };
}

export function getExtensionUrl(): { url: string; storeName: string } {
  const browser = detectBrowser();
  
  if (browser.isFirefox) {
    return {
      url: 'https://addons.mozilla.org/en-US/firefox/addon/openexplorer_tech/',
      storeName: 'Firefox Add-ons'
    };
  } else if (browser.isChromiumBased) {
    // Default Chrome Web Store link (to be updated later)
    return {
      url: 'https://chrome.google.com/webstore',
      storeName: 'Chrome Web Store'
    };
  } else {
    // Fallback to Firefox for other browsers
    return {
      url: 'https://addons.mozilla.org/en-US/firefox/addon/openexplorer_tech/',
      storeName: 'Firefox Add-ons'
    };
  }
}