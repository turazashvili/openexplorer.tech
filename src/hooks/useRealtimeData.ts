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

    // Check if we're in a development environment or if real-time should be disabled
    const isDevelopment = import.meta.env.DEV;
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('.local');
    
    // Disable real-time in development or if explicitly disabled
    if (isDevelopment || isLocalhost || import.meta.env.VITE_DISABLE_REALTIME === 'true') {
      console.log('🔇 Real-time disabled (development environment or explicit disable)');
      return;
    }

    // Set up real-time subscriptions with enhanced error handling
    let websitesSubscription: any;
    let technologiesSubscription: any;
    let linkSubscription: any;

    const setupSubscriptions = () => {
      try {
        websitesSubscription = supabase
          .channel('public:websites', {
            config: {
              broadcast: { self: false },
              presence: { key: 'websites' }
            }
          })
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'websites' 
            },
            (payload) => {
              console.log('🔄 Website change detected:', payload.eventType);
              loadInitialStats();
              setStats(prev => ({ ...prev, lastUpdate: new Date() }));
            }
          )
          .subscribe((status, err) => {
            console.log('📡 Websites subscription status:', status);
            if (err) {
              console.warn('📡 Websites subscription error:', err);
              setStats(prev => ({ ...prev, isConnected: false }));
            } else {
              setStats(prev => ({ 
                ...prev, 
                isConnected: status === 'SUBSCRIBED' 
              }));
            }
          });

        technologiesSubscription = supabase
          .channel('public:technologies', {
            config: {
              broadcast: { self: false },
              presence: { key: 'technologies' }
            }
          })
          .on('postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'technologies' 
            },
            (payload) => {
              console.log('🔄 Technology change detected:', payload.eventType);
              loadInitialStats();
              setStats(prev => ({ ...prev, lastUpdate: new Date() }));
            }
          )
          .subscribe((status, err) => {
            console.log('📡 Technologies subscription status:', status);
            if (err) {
              console.warn('📡 Technologies subscription error:', err);
            }
          });

        linkSubscription = supabase
          .channel('public:website_technologies', {
            config: {
              broadcast: { self: false },
              presence: { key: 'links' }
            }
          })
          .on('postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'website_technologies' 
            },
            (payload) => {
              console.log('🔄 Website-technology link change detected:', payload.eventType);
              setStats(prev => ({ ...prev, lastUpdate: new Date() }));
            }
          )
          .subscribe((status, err) => {
            console.log('📡 Links subscription status:', status);
            if (err) {
              console.warn('📡 Links subscription error:', err);
            }
          });

      } catch (error) {
        console.warn('📡 Failed to set up real-time subscriptions:', error);
        setStats(prev => ({ ...prev, isConnected: false }));
      }
    };

    // Set up subscriptions with a delay to ensure page is ready
    const timer = setTimeout(setupSubscriptions, 1000);

    return () => {
      clearTimeout(timer);
      console.log('🔌 Unsubscribing from real-time channels');
      try {
        websitesSubscription?.unsubscribe();
        technologiesSubscription?.unsubscribe();
        linkSubscription?.unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing from channels:', error);
      }
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

    // Check if real-time should be disabled
    const isDevelopment = import.meta.env.DEV;
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('.local');
    
    if (isDevelopment || isLocalhost || import.meta.env.VITE_DISABLE_REALTIME === 'true') {
      console.log('🔇 Real-time search disabled (development environment or explicit disable)');
      return;
    }

    // Subscribe to changes that might affect search results with error handling
    let websiteSubscription: any;
    let technologySubscription: any;
    let linkSubscription: any;

    const setupSearchSubscriptions = () => {
      try {
        websiteSubscription = supabase
          .channel('search-website-updates', {
            config: {
              broadcast: { self: false },
              presence: { key: 'search-websites' }
            }
          })
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'websites' },
            (payload) => {
              console.log('🆕 New website added:', payload.new?.url);
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
              console.log('🔄 Website updated:', payload.new?.url);
              setLastUpdate(new Date());
              setRecentChanges(prev => ({ 
                ...prev, 
                updatedWebsites: prev.updatedWebsites + 1 
              }));
            }
          )
          .subscribe((status, err) => {
            console.log('📡 Search website subscription status:', status);
            if (err) {
              console.warn('📡 Search website subscription error:', err);
            }
          });

        technologySubscription = supabase
          .channel('search-technology-updates', {
            config: {
              broadcast: { self: false },
              presence: { key: 'search-technologies' }
            }
          })
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'technologies' },
            (payload) => {
              console.log('🆕 New technology added:', payload.new?.name);
              setLastUpdate(new Date());
              setRecentChanges(prev => ({ 
                ...prev, 
                newTechnologies: prev.newTechnologies + 1 
              }));
            }
          )
          .subscribe((status, err) => {
            console.log('📡 Search technology subscription status:', status);
            if (err) {
              console.warn('📡 Search technology subscription error:', err);
            }
          });

        linkSubscription = supabase
          .channel('search-link-updates', {
            config: {
              broadcast: { self: false },
              presence: { key: 'search-links' }
            }
          })
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'website_technologies' },
            (payload) => {
              console.log('🔗 Website-technology link changed');
              setLastUpdate(new Date());
            }
          )
          .subscribe((status, err) => {
            console.log('📡 Search link subscription status:', status);
            if (err) {
              console.warn('📡 Search link subscription error:', err);
            }
          });

      } catch (error) {
        console.warn('📡 Failed to set up search subscriptions:', error);
      }
    };

    const timer = setTimeout(setupSearchSubscriptions, 1000);

    return () => {
      clearTimeout(timer);
      try {
        websiteSubscription?.unsubscribe();
        technologySubscription?.unsubscribe();
        linkSubscription?.unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing from search channels:', error);
      }
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
    // Check if real-time should be disabled
    const isDevelopment = import.meta.env.DEV;
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('.local');
    
    if (isDevelopment || isLocalhost || import.meta.env.VITE_DISABLE_REALTIME === 'true') {
      console.log('🔇 Real-time website list disabled (development environment or explicit disable)');
      return;
    }

    let subscription: any;

    const setupListSubscription = () => {
      try {
        subscription = supabase
          .channel('website-list-updates', {
            config: {
              broadcast: { self: false },
              presence: { key: 'website-list' }
            }
          })
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'websites' },
            (payload) => {
              console.log('📋 Website list change detected:', payload.eventType);
              setPendingUpdates(prev => prev + 1);
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'website_technologies' },
            (payload) => {
              console.log('📋 Website technologies change detected:', payload.eventType);
              setPendingUpdates(prev => prev + 1);
            }
          )
          .subscribe((status, err) => {
            console.log('📡 Website list subscription status:', status);
            if (err) {
              console.warn('📡 Website list subscription error:', err);
            }
          });
      } catch (error) {
        console.warn('📡 Failed to set up website list subscription:', error);
      }
    };

    const timer = setTimeout(setupListSubscription, 1000);

    return () => {
      clearTimeout(timer);
      try {
        subscription?.unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing from website list channel:', error);
      }
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
    // Check if real-time should be disabled
    const isDevelopment = import.meta.env.DEV;
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('.local');
    
    if (isDevelopment || isLocalhost || import.meta.env.VITE_DISABLE_REALTIME === 'true') {
      console.log('🔇 Real-time notifications disabled (development environment or explicit disable)');
      return;
    }

    let subscription: any;

    const setupNotificationSubscription = () => {
      try {
        subscription = supabase
          .channel('notifications', {
            config: {
              broadcast: { self: false },
              presence: { key: 'notifications' }
            }
          })
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'websites' },
            (payload) => {
              const newNotification = {
                id: `website-${payload.new?.id}`,
                type: 'new_website' as const,
                message: `New website analyzed: ${payload.new?.url}`,
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
                id: `tech-${payload.new?.id}`,
                type: 'new_technology' as const,
                message: `New technology discovered: ${payload.new?.name}`,
                timestamp: new Date(),
                data: payload.new
              };
              
              setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
              
              setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
              }, 5000);
            }
          )
          .subscribe((status, err) => {
            console.log('📡 Notifications subscription status:', status);
            if (err) {
              console.warn('📡 Notifications subscription error:', err);
            }
          });
      } catch (error) {
        console.warn('📡 Failed to set up notification subscription:', error);
      }
    };

    const timer = setTimeout(setupNotificationSubscription, 1000);

    return () => {
      clearTimeout(timer);
      try {
        subscription?.unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing from notification channel:', error);
      }
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