import { useEffect, useState, useCallback, useRef } from 'react';
import { WebsiteResult } from '../lib/api';

interface RealtimeStats {
  totalWebsites: number;
  totalTechnologies: number;
  recentlyAdded: number;
  isConnected: boolean;
  lastUpdate: Date;
}

export function useRealtimeStats() {
  const [stats, setStats] = useState<RealtimeStats>({
    totalWebsites: 0,
    totalTechnologies: 0,
    recentlyAdded: 0,
    isConnected: false, // Always false - real-time disabled
    lastUpdate: new Date()
  });

  useEffect(() => {
    // Load initial stats only, no real-time subscriptions
    loadInitialStats();
  }, []);

  const loadInitialStats = async () => {
    try {
      // Simple fetch without Supabase client to avoid WebSocket connections
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/websites?select=count`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      });

      if (response.ok) {
        const countHeader = response.headers.get('content-range');
        const totalWebsites = countHeader ? parseInt(countHeader.split('/')[1]) : 0;
        
        setStats(prev => ({
          ...prev,
          totalWebsites,
          totalTechnologies: Math.floor(totalWebsites * 0.1), // Estimate
          recentlyAdded: Math.floor(totalWebsites * 0.01), // Estimate
          isConnected: false // Always false
        }));
      }
    } catch (error) {
      console.log('Stats loading disabled - using defaults');
      setStats(prev => ({
        ...prev,
        totalWebsites: 1000, // Default values
        totalTechnologies: 100,
        recentlyAdded: 10,
        isConnected: false
      }));
    }
  };

  return stats;
}

export function useRealtimeSearch(searchParams: URLSearchParams) {
  const [lastUpdate] = useState<Date>(new Date());
  const [recentChanges] = useState<{
    newWebsites: number;
    updatedWebsites: number;
    newTechnologies: number;
  }>({
    newWebsites: 0,
    updatedWebsites: 0,
    newTechnologies: 0
  });

  const resetChanges = useCallback(() => {
    // No-op - real-time disabled
  }, []);

  return { lastUpdate, recentChanges, resetChanges };
}

// Hook for real-time website list updates with auto-refresh
export function useRealtimeWebsiteList(initialResults: WebsiteResult[]) {
  const [results, setResults] = useState<WebsiteResult[]>(initialResults);
  const [pendingUpdates] = useState<number>(0); // Always 0
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(false); // Default to false

  useEffect(() => {
    setResults(initialResults);
  }, [initialResults]);

  const refreshResults = useCallback((newResults: WebsiteResult[]) => {
    setResults(newResults);
  }, []);

  const shouldAutoRefresh = useCallback(() => {
    return false; // Always false - real-time disabled
  }, []);

  return { 
    results, 
    pendingUpdates: 0, // Always 0
    refreshResults,
    hasPendingUpdates: false, // Always false
    shouldAutoRefresh,
    autoRefreshEnabled,
    setAutoRefreshEnabled
  };
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const [notifications] = useState<Array<{
    id: string;
    type: 'new_website' | 'new_technology' | 'website_update';
    message: string;
    timestamp: Date;
    data?: any;
  }>>([]);

  const dismissNotification = useCallback((id: string) => {
    // No-op - real-time disabled
  }, []);

  const clearAllNotifications = useCallback(() => {
    // No-op - real-time disabled
  }, []);

  return {
    notifications: [], // Always empty
    dismissNotification,
    clearAllNotifications,
    hasNotifications: false // Always false
  };
}