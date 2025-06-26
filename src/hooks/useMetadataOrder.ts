import { useState, useEffect } from 'react';

const STORAGE_KEY = 'metadata-container-order';

export interface MetadataCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  fields: string[];
}

const defaultCategories: MetadataCategory[] = [
  {
    id: 'page-info',
    name: 'Page Information',
    icon: null, // Will be set in component
    color: 'text-blue-600',
    fields: ['page_title', 'page_domain', 'page_protocol', 'page_language', 'charset']
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: null,
    color: 'text-green-600',
    fields: ['page_load_time', 'dom_ready_time', 'script_count', 'stylesheet_count', 'image_count', 'form_count']
  },
  {
    id: 'seo-social',
    name: 'SEO & Social',
    icon: null,
    color: 'text-purple-600',
    fields: ['meta_description_length', 'has_meta_keywords', 'has_open_graph', 'has_twitter_cards', 'has_favicon']
  },
  {
    id: 'features',
    name: 'Features',
    icon: null,
    color: 'text-orange-600',
    fields: ['is_https', 'is_responsive', 'likely_spa', 'has_service_worker', 'uses_lazy_loading', 'uses_resource_hints']
  },
  {
    id: 'external-resources',
    name: 'External Resources',
    icon: null,
    color: 'text-indigo-600',
    fields: ['external_script_count', 'external_script_domains', 'uses_google_fonts']
  },
  {
    id: 'analytics',
    name: 'Analytics & Tracking',
    icon: null,
    color: 'text-red-600',
    fields: ['ga_tracking_id', 'gtm_id', 'shopify_shop']
  },
  {
    id: 'versions',
    name: 'Technology Versions',
    icon: null,
    color: 'text-gray-600',
    fields: ['react_version', 'vue_version', 'angular_version', 'jquery_version', 'lodash_version', 'moment_version']
  }
];

export function useMetadataOrder() {
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load order from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        if (Array.isArray(parsedOrder)) {
          setCategoryOrder(parsedOrder);
        } else {
          setCategoryOrder(defaultCategories.map(cat => cat.id));
        }
      } catch (error) {
        console.error('Error parsing saved metadata order:', error);
        setCategoryOrder(defaultCategories.map(cat => cat.id));
      }
    } else {
      setCategoryOrder(defaultCategories.map(cat => cat.id));
    }
    setIsLoaded(true);
  }, []);

  // Save order to localStorage whenever it changes
  const updateOrder = (newOrder: string[]) => {
    setCategoryOrder(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
  };

  // Get ordered categories based on saved order
  const getOrderedCategories = (): MetadataCategory[] => {
    if (!isLoaded) return defaultCategories;
    
    const orderedCategories: MetadataCategory[] = [];
    
    // Add categories in the saved order
    categoryOrder.forEach(categoryId => {
      const category = defaultCategories.find(cat => cat.id === categoryId);
      if (category) {
        orderedCategories.push(category);
      }
    });
    
    // Add any new categories that might not be in the saved order
    defaultCategories.forEach(category => {
      if (!orderedCategories.find(cat => cat.id === category.id)) {
        orderedCategories.push(category);
      }
    });
    
    return orderedCategories;
  };

  // Reset to default order
  const resetOrder = () => {
    const defaultOrder = defaultCategories.map(cat => cat.id);
    updateOrder(defaultOrder);
  };

  return {
    categoryOrder,
    updateOrder,
    getOrderedCategories,
    resetOrder,
    isLoaded
  };
}