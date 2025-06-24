import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    category?: string;
    sort?: string;
    order?: string;
    responsive?: string;
    https?: string;
    spa?: string;
    service_worker?: string;
  }) => void;
  currentFilters: {
    category?: string;
    sort?: string;
    order?: string;
    responsive?: string;
    https?: string;
    spa?: string;
    service_worker?: string;
  };
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFiltersChange, currentFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('technologies')
        .select('category')
        .not('category', 'is', null);
      
      if (data) {
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories.sort());
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...currentFilters };
    if (value === '' || value === undefined) {
      delete newFilters[key as keyof typeof newFilters];
    } else {
      newFilters[key as keyof typeof newFilters] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    // Clear all filters by passing an empty object
    onFiltersChange({});
    setIsOpen(false); // Close the filter panel after clearing
  };

  // Count only non-sorting filters for the badge
  const activeFilterCount = Object.keys(currentFilters).filter(key => 
    key !== 'sort' && key !== 'order' && currentFilters[key as keyof typeof currentFilters]
  ).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
          hasActiveFilters 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Filters</span>
        {hasActiveFilters && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filter panel */}
          <div className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <div className="flex items-center space-x-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Technology Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technology Category
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Filter websites by the types of technologies they use
                </p>
                <select
                  value={currentFilters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Website Characteristics */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Website Characteristics</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Responsive Design</label>
                    <select
                      value={currentFilters.responsive || ''}
                      onChange={(e) => handleFilterChange('responsive', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="true">Responsive</option>
                      <option value="false">Not Responsive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">HTTPS Security</label>
                    <select
                      value={currentFilters.https || ''}
                      onChange={(e) => handleFilterChange('https', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="true">HTTPS (Secure)</option>
                      <option value="false">HTTP (Not Secure)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Application Type</label>
                    <select
                      value={currentFilters.spa || ''}
                      onChange={(e) => handleFilterChange('spa', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="true">Single Page App (SPA)</option>
                      <option value="false">Traditional Multi-page</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Progressive Web App Features</label>
                    <select
                      value={currentFilters.service_worker || ''}
                      onChange={(e) => handleFilterChange('service_worker', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="true">Has Service Worker</option>
                      <option value="false">No Service Worker</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sorting */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Sorting</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Sort by</label>
                    <select
                      value={currentFilters.sort || 'last_scraped'}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="last_scraped">Last scraped</option>
                      <option value="url">Website URL</option>
                      <option value="load_time">Page load time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Order</label>
                    <select
                      value={currentFilters.order || 'desc'}
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
          </div>
        </>
      )}
    </div>
  );
};

export default SearchFilters;