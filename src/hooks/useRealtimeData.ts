import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
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
    isConnected: false,
    lastUpdate: new Date()
  });

  useEffect(() => {
    // Initial load
    loadInitialStats();

    // Set up real-time subscriptions
    const websitesSubscription = supabase
      .channel('websites-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'websites' },
        (payload) => {
          console.log('🔄 Website change detected:', payload);
          loadInitialStats(); // Refresh stats when data changes
          setStats(prev => ({ ...prev, lastUpdate: new Date() }));
        }
      )
      .subscribe((status) => {
        console.log('📡 Websites subscription status:', status);
        setStats(prev => ({ ...prev, isConnected: status === 'SUBSCRIBED' }));
      });

    const technologiesSubscription = supabase
      .channel('technologies-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'technologies' },
        (payload) => {
          console.log('🔄 Technology change detected:', payload);
          loadInitialStats();
          setStats(prev => ({ ...prev, lastUpdate: new Date() }));
        }
      )
      .subscribe();

    const linkSubscription = supabase
      .channel('website-technologies-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'website_technologies' },
        (payload) => {
          console.log('🔄 Website-technology link change detected:', payload);
          setStats(prev => ({ ...prev, lastUpdate: new Date() }));
        }
      )
      .subscribe();

    return () => {
      websitesSubscription.unsubscribe();
      technologiesSubscription.unsubscribe();
      linkSubscription.unsubscribe();
    };
  }, []);

  const loadInitialStats = async () => {
    try {
      // Get total websites count
      const { count: websiteCount } = await supabase
        .from('websites')
        .select('*', { count: 'exact', head: true });

      // Get total technologies count
      const { count: techCount } = await supabase
        .from('technologies')
        .select('*', { count: 'exact', head: true });

      // Get recently added websites (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentCount } = await supabase
        .from('websites')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      setStats(prev => ({
        ...prev,
        totalWebsites: websiteCount || 0,
        totalTechnologies: techCount || 0,
        recentlyAdded: recentCount || 0
      }));

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return stats;
}

export function useRealtimeSearch(searchParams: URLSearchParams) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [recentChanges, setRecentChanges] = useState<{
    newWebsites: number;
    updatedWebsites: number;
    newTechnologies: number;
  }>({
    newWebsites: 0,
    updatedWebsites: 0,
    newTechnologies: 0
  });

  const resetChanges = useCallback(() => {
    setRecentChanges({
      newWebsites: 0,
      updatedWebsites: 0,
      newTechnologies: 0
    });
  }, []);

  useEffect(() => {
    // Reset changes when search params change
    resetChanges();

    // Subscribe to changes that might affect search results
    const websiteSubscription = supabase
      .channel('search-website-updates')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'websites' },
        (payload) => {
          console.log('🆕 New website added:', payload.new);
          setLastUpdate(new Date());
          setRecentChanges(prev => ({ 
            ...prev, 
            newWebsites: prev.newWebsites + 1 
          }));
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'websites' },
        (payload) => {
          console.log('🔄 Website updated:', payload.new);
          setLastUpdate(new Date());
          setRecentChanges(prev => ({ 
            ...prev, 
            updatedWebsites: prev.updatedWebsites + 1 
          }));
        }
      )
      .subscribe();

    const technologySubscription = supabase
      .channel('search-technology-updates')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'technologies' },
        (payload) => {
          console.log('🆕 New technology added:', payload.new);
          setLastUpdate(new Date());
          setRecentChanges(prev => ({ 
            ...prev, 
            newTechnologies: prev.newTechnologies + 1 
          }));
        }
      )
      .subscribe();

    const linkSubscription = supabase
      .channel('search-link-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'website_technologies' },
        (payload) => {
          console.log('🔗 Website-technology link changed:', payload);
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      websiteSubscription.unsubscribe();
      technologySubscription.unsubscribe();
      linkSubscription.unsubscribe();
    };
  }, [searchParams.toString(), resetChanges]);

  return { lastUpdate, recentChanges, resetChanges };
}

// Hook for real-time website list updates with auto-refresh
export function useRealtimeWebsiteList(initialResults: WebsiteResult[]) {
  const [results, setResults] = useState<WebsiteResult[]>(initialResults);
  const [pendingUpdates, setPendingUpdates] = useState<number>(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const lastUserInteraction = useRef<number>(Date.now());

  useEffect(() => {
    setResults(initialResults);
    setPendingUpdates(0);
  }, [initialResults]);

  // Track user interactions to pause auto-refresh when user is actively browsing
  useEffect(() => {
    const handleUserActivity = () => {
      lastUserInteraction.current = Date.now();
    };

    // Listen for user interactions
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel('website-list-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'websites' },
        (payload) => {
          console.log('📋 Website list change detected:', payload);
          setPendingUpdates(prev => prev + 1);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'website_technologies' },
        (payload) => {
          console.log('📋 Website technologies change detected:', payload);
          setPendingUpdates(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshResults = useCallback((newResults: WebsiteResult[]) => {
    setResults(newResults);
    setPendingUpdates(0);
  }, []);

  // Check if user has been inactive for auto-refresh
  const shouldAutoRefresh = useCallback(() => {
    if (!autoRefreshEnabled) return false;
    
    const timeSinceLastInteraction = Date.now() - lastUserInteraction.current;
    const inactivityThreshold = 30000; // 30 seconds of inactivity
    
    return timeSinceLastInteraction > inactivityThreshold;
  }, [autoRefreshEnabled]);

  return { 
    results, 
    pendingUpdates, 
    refreshResults,
    hasPendingUpdates: pendingUpdates > 0,
    shouldAutoRefresh,
    autoRefreshEnabled,
    setAutoRefreshEnabled
  };
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'new_website' | 'new_technology' | 'website_update';
    message: string;
    timestamp: Date;
    data?: any;
  }>>([]);

  useEffect(() => {
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'websites' },
        (payload) => {
          const newNotification = {
            id: `website-${payload.new.id}`,
            type: 'new_website' as const,
            message: `New website analyzed: ${payload.new.url}`,
            timestamp: new Date(),
            data: payload.new
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10
          
          // Auto-remove after 5 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
          }, 5000);
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'technologies' },
        (payload) => {
          const newNotification = {
            id: `tech-${payload.new.id}`,
            type: 'new_technology' as const,
            message: `New technology discovered: ${payload.new.name}`,
            timestamp: new Date(),
            data: payload.new
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    dismissNotification,
    clearAllNotifications,
    hasNotifications: notifications.length > 0
  };
}