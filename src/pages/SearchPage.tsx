import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchFilters from '../components/SearchFilters';
import ResultsTable from '../components/ResultsTable';
import Pagination from '../components/Pagination';
import { searchWebsites, SearchParams, WebsiteResult } from '../lib/api';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<WebsiteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

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

  const performSearch = async () => {
    setLoading(true);
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

      const response = await searchWebsites(params);
      setResults(response.results);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const handleFiltersChange = (filters: any) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value as string);
      } else {
        newParams.delete(key);
      }
    });
    
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{pagination.total.toLocaleString()}+ websites analyzed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>500+ technologies tracked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {currentQuery ? 'Search Results' : 'Recent Discoveries'}
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
            
            <div className="flex-shrink-0">
              <SearchFilters 
                onFiltersChange={handleFiltersChange}
                currentFilters={currentFilters}
              />
            </div>
          </div>
          
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