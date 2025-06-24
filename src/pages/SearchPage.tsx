import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchFilters from '../components/SearchFilters';
import ResultsTable from '../components/ResultsTable';
import Pagination from '../components/Pagination';
import SearchSuggestions from '../components/SearchSuggestions';
import RealtimeNotifications from '../components/RealtimeNotifications';
import RealtimeUpdateBanner from '../components/RealtimeUpdateBanner';
import AutoRefreshSettings from '../components/AutoRefreshSettings';
import { searchWebsites, SearchParams, WebsiteResult, SearchSuggestion } from '../lib/api';
import { useRealtimeStats, useRealtimeSearch, useRealtimeWebsiteList } from '../hooks/useRealtimeData';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<WebsiteResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Ref for scrolling to results section
  const resultsRef = useRef<HTMLElement>(null);

  // Real-time hooks
  const realtimeStats = useRealtimeStats();
  const { lastUpdate, recentChanges, resetChanges } = useRealtimeSearch(searchParams);
  const { 
    pendingUpdates, 
    refreshResults, 
    hasPendingUpdates, 
    shouldAutoRefresh,
    autoRefreshEnabled,
    setAutoRefreshEnabled
  } = useRealtimeWebsiteList(results);

  const currentQuery = searchParams.get('q') || '';
  const currentFilters = {
    category: searchParams.get('category') || undefined,
    sort: searchParams.get('sort') || 'last_scraped',
    order: searchParams.get('order') || 'desc',
    responsive: searchParams.get('responsive') || undefined,
    https: searchParams.get('https') || undefined,
    spa: searchParams.get('spa') || undefined,
    service_worker: searchParams.get('service_worker') || undefined,
  };

  useEffect(() => {
    performSearch();
  }, [searchParams]);

  // Auto-refresh logic with smart timing
  useEffect(() => {
    if (!hasPendingUpdates || !autoRefreshEnabled || loading) return;

    // Immediate refresh for first update, then use smart delays
    const getRefreshDelay = () => {
      if (pendingUpdates === 1) return 2000; // 2 seconds for first update
      if (shouldAutoRefresh()) return 5000; // 5 seconds if user is inactive
      return 15000; // 15 seconds if user is active
    };

    const timer = setTimeout(() => {
      console.log('🔄 Auto-refreshing due to real-time updates');
      performSearch(true);
    }, getRefreshDelay());

    return () => clearTimeout(timer);
  }, [lastUpdate, hasPendingUpdates, autoRefreshEnabled, loading, pendingUpdates, shouldAutoRefresh]);

  const performSearch = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setLoading(true);
    }
    
    try {
      const params: SearchParams = {
        q: searchParams.get('q') || undefined,
        category: searchParams.get('category') || undefined,
        sort: (searchParams.get('sort') as 'url' | 'last_scraped' | 'load_time') || 'last_scraped',
        order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
        page: parseInt(searchParams.get('page') || '1'),
        limit: 20,
        responsive: searchParams.get('responsive') || undefined,
        https: searchParams.get('https') || undefined,
        spa: searchParams.get('spa') || undefined,
        service_worker: searchParams.get('service_worker') || undefined,
      };

      console.log('🔍 Performing search with params:', params);

      const response = await searchWebsites(params);
      setResults(response.results);
      setSuggestions(response.suggestions || []);
      setPagination(response.pagination);
      
      // Update real-time list
      refreshResults(response.results);
      
      if (isAutoRefresh) {
        console.log('✅ Auto-refresh completed');
      }
      
      console.log('📊 Search response:', response);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setSuggestions([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  const scrollToResults = () => {
    if (resultsRef.current) {
      const headerHeight = 64; // Account for sticky header
      const elementTop = resultsRef.current.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
    }
  };

  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams();
    if (query.trim()) {
      newParams.set('q', query.trim());
    }
    // Reset page when searching
    setSearchParams(newParams);
    resetChanges(); // Reset change counters
    
    // Scroll to results after a short delay to allow the search to start
    setTimeout(() => {
      scrollToResults();
    }, 100);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'technology') {
      const newParams = new URLSearchParams();
      newParams.set('q', suggestion.name);
      setSearchParams(newParams);
    }
  };

  const handleFiltersChange = (filters: any) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Clear all filter params first
    ['category', 'sort', 'order', 'responsive', 'https', 'spa', 'service_worker', 'page'].forEach(key => {
      newParams.delete(key);
    });
    
    // Add back the query if it exists
    const currentQuery = searchParams.get('q');
    if (currentQuery) {
      newParams.set('q', currentQuery);
    }
    
    // Add new filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        newParams.set(key, value as string);
      }
    });
    
    setSearchParams(newParams);
    resetChanges(); // Reset change counters
    
    // Scroll to results when filters change
    setTimeout(() => {
      scrollToResults();
    }, 100);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    
    // Scroll to top of results when changing pages
    setTimeout(() => {
      scrollToResults();
    }, 100);
  };

  const handleRefreshClick = () => {
    performSearch();
    resetChanges();
  };

  const handleDismissUpdates = () => {
    resetChanges();
  };

  // Count active filters (excluding sort/order)
  const activeFilterCount = Object.keys(currentFilters).filter(key => 
    key !== 'sort' && key !== 'order' && currentFilters[key as keyof typeof currentFilters]
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Real-time Notifications */}
      <RealtimeNotifications />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Discover what powers{' '}
            <span className="text-blue-600">any website</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Uncover the technologies, frameworks, and tools behind any website with our comprehensive database
          </p>
          
          <div className="px-4">
            <SearchBar onSearch={handleSearch} initialValue={currentQuery} />
          </div>
          
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${realtimeStats.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{realtimeStats.totalWebsites.toLocaleString()}+ websites analyzed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{realtimeStats.totalTechnologies.toLocaleString()}+ technologies tracked</span>
            </div>
            {realtimeStats.recentlyAdded > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>{realtimeStats.recentlyAdded} added today</span>
              </div>
            )}
          </div>
          
          {realtimeStats.isConnected && (
            <div className="mt-4 text-xs text-green-600 flex items-center justify-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates enabled</span>
              {autoRefreshEnabled && <span>• Auto-refresh on</span>}
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section ref={resultsRef} className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {currentQuery ? 'Search Results' : 'Recent Discoveries'}
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied)
                  </span>
                )}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {loading 
                  ? 'Searching...' 
                  : currentQuery 
                    ? `Found ${pagination.total.toLocaleString()} result${pagination.total !== 1 ? 's' : ''} for "${currentQuery}"`
                    : 'Latest websites analyzed by our system'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <AutoRefreshSettings 
                enabled={autoRefreshEnabled}
                onToggle={setAutoRefreshEnabled}
                pendingUpdates={pendingUpdates}
              />
              <SearchFilters 
                onFiltersChange={handleFiltersChange}
                currentFilters={currentFilters}
              />
            </div>
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <SearchSuggestions 
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          )}

          {/* Real-time Update Banner - Only show if auto-refresh is disabled */}
          {!autoRefreshEnabled && (
            <RealtimeUpdateBanner
              pendingUpdates={pendingUpdates}
              onRefresh={handleRefreshClick}
              onDismiss={handleDismissUpdates}
              recentChanges={recentChanges}
            />
          )}
          
          <ResultsTable results={results} loading={loading} />
          
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchPage;