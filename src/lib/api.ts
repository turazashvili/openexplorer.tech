const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export interface WebsiteResult {
  id: string;
  url: string;
  technologies: Technology[];
  lastScraped: string;
  metadata?: Record<string, any>;
}

export interface Technology {
  id?: string;
  name: string;
  category: string;
}

export interface SearchSuggestion {
  type: 'technology' | 'website';
  name: string;
  category?: string;
  suggestion: string;
}

export interface SearchParams {
  q?: string;
  tech?: string;
  category?: string;
  sort?: 'url' | 'last_scraped' | 'load_time';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  responsive?: string;
  https?: string;
  spa?: string;
  service_worker?: string;
}

export interface SearchResponse {
  results: WebsiteResult[];
  suggestions?: SearchSuggestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  debug?: {
    query: string;
    originalQuery: string;
    searchType: string;
    totalFound: number;
  };
}

export interface WebsiteDetails {
  id: string;
  url: string;
  lastScraped: string;
  createdAt: string;
  metadata: Record<string, any>;
  technologies: Technology[];
}

export interface TechnologyDetails {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  websites: {
    id: string;
    url: string;
    lastScraped: string;
  }[];
}

const headers = {
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export async function searchWebsites(params: SearchParams = {}): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/search?${searchParams}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to search websites');
  }

  return response.json();
}

export async function getWebsiteDetails(id: string): Promise<WebsiteDetails> {
  const response = await fetch(`${API_BASE_URL}/website/${id}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch website details');
  }

  return response.json();
}

export async function getWebsiteDetailsByDomain(domain: string): Promise<WebsiteDetails> {
  const response = await fetch(`${API_BASE_URL}/website-by-domain/${encodeURIComponent(domain)}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch website details');
  }

  return response.json();
}

export async function getTechnologyDetails(id: string): Promise<TechnologyDetails> {
  const response = await fetch(`${API_BASE_URL}/technology/${id}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch technology details');
  }

  return response.json();
}

export async function ingestWebsiteData(data: {
  url: string;
  technologies: string[];
  metadata?: Record<string, any>;
  scraped_at?: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ingest`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to ingest website data');
  }

  return response.json();
}

// Helper function to create SEO-friendly technology URLs
export function getTechnologyUrl(techName: string): string {
  return `/${techName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

// Helper function to get technology name from URL slug
export function getTechnologyNameFromUrl(slug: string): string {
  // This is a simple reverse mapping - in a real app you might want to store this mapping
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Helper function to create website URL from domain
export function getWebsiteUrl(domain: string): string {
  return `/website/${encodeURIComponent(domain)}`;
}