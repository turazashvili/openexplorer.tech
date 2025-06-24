import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface RealtimeStats {
  totalWebsites: number;
  totalTechnologies: number;
  recentlyAdded: number;
  isConnected: boolean;
}

export function useRealtimeStats() {
  const [stats, setStats] = useState<RealtimeStats>({
    totalWebsites: 0,
    totalTechnologies: 0,
    recentlyAdded: 0,
    isConnected: false
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
        }
      )
      .subscribe();

    return () => {
      websitesSubscription.unsubscribe();
      technologiesSubscription.unsubscribe();
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

export function useRealtimeSearch(searchParams: any) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Subscribe to changes that might affect search results
    const subscription = supabase
      .channel('search-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'websites' },
        () => {
          setLastUpdate(new Date());
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'website_technologies' },
        () => {
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { lastUpdate };
}