import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ExternalLink, Clock, ArrowLeft, Globe, Filter, Shield, Smartphone, Zap } from 'lucide-react';
import { searchWebsites, WebsiteResult, SearchParams } from '../lib/api';
import Pagination from '../components/Pagination';
import { supabase } from '../lib/supabase';

const TechnologyListPage: React.FC = () => {
  const { technologyName } = useParams<{ technologyName: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<WebsiteResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technologyInfo, setTechnologyInfo] = useState<{
    name: string;
    category: string;
  } | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    responsive: searchParams.get('responsive') || '',
    https: searchParams.get('https') || '',
    spa: searchParams.get('spa') || '',
    service_worker: searchParams.get('service_worker') || '',
    sort: searchParams.get('sort') || 'last_scraped',
    order: searchParams.get('order') || 'desc',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (technologyName) {
      fetchTechnologyData();
    }
  }, [technologyName, searchParams]);

  // Enhanced URL slug to technology name conversion
  const convertUrlToTechnologyName = (urlSlug: string): string[] => {
    // Convert kebab-case to proper case
    const basicConversion = urlSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Create multiple variations to try
    const variations = [basicConversion];

    // Special cases for common technologies
    const specialCases: Record<string, string[]> = {
      'next-js': ['Next.js', 'NextJS', 'Next JS'],
      'vue-js': ['Vue.js', 'VueJS', 'Vue JS'],
      'angular-js': ['AngularJS', 'Angular.js', 'Angular JS'],
      'react-js': ['React', 'ReactJS', 'React.js'],
      'node-js': ['Node.js', 'NodeJS', 'Node JS'],
      'express-js': ['Express.js', 'ExpressJS', 'Express JS'],
      'd3-js': ['D3.js', 'D3JS', 'D3 JS'],
      'three-js': ['Three.js', 'ThreeJS', 'Three JS'],
      'chart-js': ['Chart.js', 'ChartJS', 'Chart JS'],
      'moment-js': ['Moment.js', 'MomentJS', 'Moment JS'],
      'lodash-js': ['Lodash', 'Lodash.js'],
      'jquery': ['jQuery', 'JQuery'],
      'css': ['CSS'],
      'html': ['HTML'],
      'javascript': ['JavaScript', 'JS'],
      'typescript': ['TypeScript', 'TS'],
      'tailwind-css': ['Tailwind CSS', 'TailwindCSS'],
      'bootstrap': ['Bootstrap'],
      'font-awesome': ['Font Awesome', 'FontAwesome'],
      'google-analytics': ['Google Analytics'],
      'google-tag-manager': ['Google Tag Manager', 'GTM'],
      'wordpress': ['WordPress', 'Word Press'],
      'woocommerce': ['WooCommerce', 'Woo Commerce'],
      'web-workers': ['Web Workers'],
      'service-worker': ['Service Worker'],
      'lazy-loading': ['Lazy Loading'],
      'aws-cloudfront': ['AWS CloudFront', 'CloudFront'],
      'material-icons': ['Material Icons'],
      'semantic-ui': ['Semantic UI'],
    };

    // Check if we have special cases for this URL slug
    if (specialCases[urlSlug.toLowerCase()]) {
      variations.push(...specialCases[urlSlug.toLowerCase()]);
    }

    // Add common variations
    variations.push(
      // With dots for JS libraries
      basicConversion.replace(/\bJs\b/g, '.js'),
      basicConversion.replace(/\bJS\b/g, '.js'),
      // Without spaces
      basicConversion.replace(/\s+/g, ''),
      // All lowercase
      basicConversion.toLowerCase(),
      // All uppercase
      basicConversion.toUpperCase(),
      // Original slug with spaces
      urlSlug.replace(/-/g, ' '),
      // Camel case
      urlSlug.split('-').map((word, index) => 
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
      ).join('')
    );

    // Remove duplicates and return
    return [...new Set(variations)];
  };

  const fetchTechnologyData = async () => {
    if (!technologyName) return;

    setLoading(true);
    setError(null);

    try {
      // Get all possible technology name variations
      const techNameVariations = convertUrlToTechnologyName(technologyName);
      
      console.log('🔍 Looking for technology variations:', techNameVariations);

      let foundTechnology = null;

      // Try each variation until we find a match
      for (const variation of techNameVariations) {
        console.log('🔍 Trying variation:', variation);
        
        const { data: techData, error: techError } = await supabase
          .from('technologies')
          .select('name, category')
          .ilike('name', variation)
          .limit(1);

        if (!techError && techData && techData.length > 0) {
          foundTechnology = techData[0];
          console.log('✅ Found technology with variation:', variation, '→', foundTechnology);
          break;
        }
      }

      // If no exact match, try wildcard search with the first variation
      if (!foundTechnology) {
        console.log('🔍 Trying wildcard search...');
        const { data: wildcardData, error: wildcardError } = await supabase
          .from('technologies')
          .select('name, category')
          .ilike('name', `%${techNameVariations[0]}%`)
          .limit(1);

        if (!wildcardError && wildcardData && wildcardData.length > 0) {
          foundTechnology = wildcardData[0];
          console.log('✅ Found technology with wildcard:', foundTechnology);
        }
      }

      if (!foundTechnology) {
        setError(`Technology "${techNameVariations[0]}" not found`);
        setLoading(false);
        return;
      }

      console.log('✅ Using technology:', foundTechnology.name);

      // Set technology info first
      setTechnologyInfo({
        name: foundTechnology.name,
        category: foundTechnology.category
      });

      // Search for websites using this technology
      const params: SearchParams = {
        tech: foundTechnology.name, // Use the exact technology name from database
        sort: (searchParams.get('sort') as 'url' | 'last_scraped' | 'load_time') || 'last_scraped',
        order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
        page: parseInt(searchParams.get('page') || '1'),
        limit: 50,
        responsive: searchParams.get('responsive') || undefined,
        https: searchParams.get('https') || undefined,
        spa: searchParams.get('spa') || undefined,
        service_worker: searchParams.get('service_worker') || undefined,
      };

      console.log('🔍 Searching with params:', params);

      const response = await searchWebsites(params);
      console.log('📊 Search response:', response);
      
      setResults(response.results);
      setPagination(response.pagination);

    } catch (err) {
      console.error('Error fetching technology data:', err);
      setError('Failed to load technology data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    // Reset to first page when filters change
    newParams.delete('page');
    
    setSearchParams(newParams);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set('sort', 'last_scraped');
    newParams.set('order', 'desc');
    setSearchParams(newParams);
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };

  const getMetadataIndicators = (metadata: any) => {
    const indicators = [];
    
    if (metadata?.is_https) {
      indicators.push({ icon: Shield, color: 'text-green-600', title: 'HTTPS Secure' });
    }
    
    if (metadata?.is_responsive) {
      indicators.push({ icon: Smartphone, color: 'text-blue-600', title: 'Responsive Design' });
    }
    
    if (metadata?.has_service_worker) {
      indicators.push({ icon: Zap, color: 'text-purple-600', title: 'Service Worker' });
    }
    
    return indicators.slice(0, 3);
  };

  // Helper function to create website URL from domain
  const getWebsiteUrl = (domain: string) => {
    return `/website/${encodeURIComponent(domain)}`;
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(key => 
    key !== 'sort' && key !== 'order' && filters[key as keyof typeof filters]
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="h-12 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !technologyInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Technology Not Found</h1>
          <p className="text-gray-600 mb-8">{error || `The technology "${technologyName}" could not be found.`}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO-optimized header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {technologyInfo.name} Websites
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Discover {pagination.total.toLocaleString()} websites using {technologyInfo.name} technology
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {technologyInfo.category}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{pagination.total.toLocaleString()} websites found</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Websites using {technologyInfo.name}
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied)
                  </span>
                )}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Showing {results.length} of {pagination.total.toLocaleString()} results
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  activeFilterCount > 0 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filter Results</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsive Design
                  </label>
                  <select
                    value={filters.responsive}
                    onChange={(e) => handleFilterChange('responsive', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="true">Responsive</option>
                    <option value="false">Not Responsive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTTPS Security
                  </label>
                  <select
                    value={filters.https}
                    onChange={(e) => handleFilterChange('https', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="true">HTTPS (Secure)</option>
                    <option value="false">HTTP (Not Secure)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Type
                  </label>
                  <select
                    value={filters.spa}
                    onChange={(e) => handleFilterChange('spa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="true">Single Page App</option>
                    <option value="false">Traditional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Worker
                  </label>
                  <select
                    value={filters.service_worker}
                    onChange={(e) => handleFilterChange('service_worker', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="true">Has Service Worker</option>
                    <option value="false">No Service Worker</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort by
                    </label>
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="last_scraped">Last scraped</option>
                      <option value="url">Website URL</option>
                      <option value="load_time">Page load time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <select
                      value={filters.order}
                      onChange={(e) => handleFilterChange('order', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="desc">Newest first</option>
                      <option value="asc">Oldest first</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {results.length === 0 ? (
              <div className="p-8 text-center">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No websites found with the current filters.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Website</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Scraped</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Link
                                to={getWebsiteUrl(result.url)}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {result.url}
                              </Link>
                              <a
                                href={`https://${result.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {getMetadataIndicators(result.metadata).map((indicator, index) => {
                                const Icon = indicator.icon;
                                return (
                                  <Icon
                                    key={index}
                                    className={`h-4 w-4 ${indicator.color}`}
                                    title={indicator.title}
                                  />
                                );
                              })}
                              {result.metadata?.page_load_time && (
                                <span className="text-xs text-gray-500" title="Page load time">
                                  {Math.round(result.metadata.page_load_time)}ms
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>{getRelativeTime(result.lastScraped)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-200">
                  {results.map((result) => (
                    <div key={result.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Link
                            to={getWebsiteUrl(result.url)}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate flex-1 mr-2"
                          >
                            {result.url}
                          </Link>
                          <a
                            href={`https://${result.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            {getMetadataIndicators(result.metadata).map((indicator, index) => {
                              const Icon = indicator.icon;
                              return (
                                <Icon
                                  key={index}
                                  className={`h-4 w-4 ${indicator.color}`}
                                  title={indicator.title}
                                />
                              );
                            })}
                            {result.metadata?.page_load_time && (
                              <span className="text-xs text-gray-500" title="Page load time">
                                {Math.round(result.metadata.page_load_time)}ms
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{getRelativeTime(result.lastScraped)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnologyListPage;