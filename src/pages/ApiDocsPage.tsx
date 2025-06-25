import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code, Play, Copy, Check, Book, Database, Search, Globe, Zap, AlertCircle, CheckCircle } from 'lucide-react';

const ApiDocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [playgroundQuery, setPlaygroundQuery] = useState('react');
  const [playgroundResponse, setPlaygroundResponse] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundStatus, setPlaygroundStatus] = useState<'success' | 'error' | null>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Get the anon key from environment variables
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const runPlayground = async () => {
    setPlaygroundLoading(true);
    setPlaygroundStatus(null);
    try {
      const params = new URLSearchParams({
        q: playgroundQuery,
        limit: '5'
      });
      
      const response = await fetch(`/api/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      const responseText = JSON.stringify(data, null, 2);
      setPlaygroundResponse(responseText);
      
      // Determine if response is success or error
      if (response.ok && !data.error) {
        setPlaygroundStatus('success');
      } else {
        setPlaygroundStatus('error');
      }
    } catch (error) {
      const errorResponse = JSON.stringify({ 
        error: 'Failed to fetch data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, null, 2);
      setPlaygroundResponse(errorResponse);
      setPlaygroundStatus('error');
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const CodeBlock: React.FC<{ children: string; language?: string; copyKey: string }> = ({ 
    children, 
    language = 'bash', 
    copyKey 
  }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
        <span className="text-sm font-medium text-gray-300">{language}</span>
        <button
          onClick={() => copyToClipboard(children, copyKey)}
          className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
        >
          {copiedStates[copyKey] ? (
            <>
              <Check className="h-4 w-4" />
              <span className="text-sm">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="text-sm">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );

  const endpoints = [
    {
      id: 'search',
      name: 'Search Websites',
      icon: Search,
      method: 'GET',
      path: '/api/search',
      description: 'Search for websites by technology, domain, or category with advanced filtering options.',
      parameters: [
        { name: 'q', type: 'string', required: false, description: 'Search query for website domains or technology names' },
        { name: 'tech', type: 'string', required: false, description: 'Filter by specific technology name' },
        { name: 'category', type: 'string', required: false, description: 'Filter by technology category' },
        { name: 'sort', type: 'string', required: false, description: 'Sort field: "last_scraped", "url", "load_time"', default: 'last_scraped' },
        { name: 'order', type: 'string', required: false, description: 'Sort order: "asc" or "desc"', default: 'desc' },
        { name: 'page', type: 'number', required: false, description: 'Page number for pagination', default: '1' },
        { name: 'limit', type: 'number', required: false, description: 'Results per page (max 100)', default: '20' },
        { name: 'responsive', type: 'boolean', required: false, description: 'Filter by responsive design support' },
        { name: 'https', type: 'boolean', required: false, description: 'Filter by HTTPS support' },
        { name: 'spa', type: 'boolean', required: false, description: 'Filter by Single Page Application architecture' },
        { name: 'service_worker', type: 'boolean', required: false, description: 'Filter by Service Worker implementation' }
      ]
    },
    {
      id: 'website',
      name: 'Get Website Details',
      icon: Globe,
      method: 'GET',
      path: '/api/website/{domain}',
      description: 'Get detailed information about a specific website including all detected technologies and metadata.',
      parameters: [
        { name: 'domain', type: 'string', required: true, description: 'Website domain (e.g., "example.com")' }
      ]
    },
    {
      id: 'technology',
      name: 'Get Technology Details',
      icon: Zap,
      method: 'GET',
      path: '/api/technology/{id}',
      description: 'Get detailed information about a specific technology including all websites using it.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Technology UUID from search results' }
      ]
    }
  ];

  const examples = {
    search: {
      request: `curl -H "Authorization: Bearer ${anonKey}" \\
     "https://openexplorer.tech/api/search?q=react&limit=10&responsive=true"`,
      response: `{
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "url": "example.com",
      "technologies": [
        {
          "name": "React",
          "category": "JavaScript Framework"
        },
        {
          "name": "Webpack",
          "category": "Development Tool"
        }
      ],
      "lastScraped": "2025-01-24T10:30:00Z",
      "metadata": {
        "is_responsive": true,
        "is_https": true,
        "page_load_time": 1250,
        "script_count": 15
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1543,
    "totalPages": 155
  },
  "suggestions": []
}`
    },
    website: {
      request: `curl -H "Authorization: Bearer ${anonKey}" \\
     "https://openexplorer.tech/api/website/example.com"`,
      response: `{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "url": "example.com",
  "lastScraped": "2025-01-24T10:30:00Z",
  "createdAt": "2025-01-20T14:22:00Z",
  "metadata": {
    "is_responsive": true,
    "is_https": true,
    "likely_spa": true,
    "page_load_time": 1250,
    "script_count": 15,
    "stylesheet_count": 3,
    "has_service_worker": true
  },
  "technologies": [
    {
      "id": "tech-123",
      "name": "React",
      "category": "JavaScript Framework"
    },
    {
      "id": "tech-456",
      "name": "Tailwind CSS",
      "category": "CSS Framework"
    }
  ]
}`
    },
    technology: {
      request: `curl -H "Authorization: Bearer ${anonKey}" \\
     "https://openexplorer.tech/api/technology/tech-123"`,
      response: `{
  "id": "tech-123",
  "name": "React",
  "category": "JavaScript Framework",
  "createdAt": "2025-01-15T09:00:00Z",
  "websites": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "url": "example.com",
      "lastScraped": "2025-01-24T10:30:00Z"
    },
    {
      "id": "987f6543-d21c-43b2-9876-543210987654",
      "url": "another-site.com",
      "lastScraped": "2025-01-24T09:15:00Z"
    }
  ]
}`
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Code className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">API Documentation</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Free, real-time API access to our comprehensive database of website technologies. 
            No API keys required, but authentication headers needed for proper access.
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-12 border border-blue-200">
          <div className="flex items-start space-x-4">
            <Book className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
              <p className="text-gray-700 mb-6">
                Our API is completely free but requires an Authorization header with our anon key. Include it in all your requests:
              </p>
              <CodeBlock copyKey="quickstart" language="bash">
{`# Search for React websites
curl -H "Authorization: Bearer ${anonKey}" \\
     "https://openexplorer.tech/api/search?q=react&limit=5"

# Get details for a specific website
curl -H "Authorization: Bearer ${anonKey}" \\
     "https://openexplorer.tech/api/website/github.com"

# Find all websites using a specific technology
curl -H "Authorization: Bearer ${anonKey}" \\
     "https://openexplorer.tech/api/search?tech=Next.js"`}
              </CodeBlock>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Note:</strong> The anon key shown above is publicly available and safe to use in client-side applications. 
                    It's the same key used by our website and browser extension.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoints</h3>
              <nav className="space-y-2">
                {endpoints.map((endpoint) => {
                  const Icon = endpoint.icon;
                  return (
                    <button
                      key={endpoint.id}
                      onClick={() => setActiveTab(endpoint.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        activeTab === endpoint.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{endpoint.name}</div>
                        <div className="text-xs opacity-75">{endpoint.method}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Playground */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">🛝 API Playground</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={playgroundQuery}
                    onChange={(e) => setPlaygroundQuery(e.target.value)}
                    placeholder="Search query..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={runPlayground}
                    disabled={playgroundLoading || !playgroundQuery.trim()}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4" />
                    <span>{playgroundLoading ? 'Testing...' : 'Test API'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className={`${activeTab === endpoint.id ? 'block' : 'hidden'}`}
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Endpoint Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <endpoint.icon className="h-8 w-8 text-blue-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{endpoint.name}</h2>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {endpoint.method}
                          </span>
                          <code className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{endpoint.description}</p>
                  </div>

                  <div className="p-8">
                    {/* Parameters */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Parameters</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                                Type
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                                Required
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {endpoint.parameters.map((param, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <code className="text-sm font-mono text-blue-600">{param.name}</code>
                                  {param.default && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Default: {param.default}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{param.type}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    param.required 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {param.required ? 'Required' : 'Optional'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Example Request */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Request</h3>
                      <CodeBlock copyKey={`${endpoint.id}-request`} language="bash">
                        {examples[endpoint.id as keyof typeof examples]?.request || ''}
                      </CodeBlock>
                    </div>

                    {/* Example Response */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Response</h3>
                      <CodeBlock copyKey={`${endpoint.id}-response`} language="json">
                        {examples[endpoint.id as keyof typeof examples]?.response || ''}
                      </CodeBlock>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Playground Results */}
            {playgroundResponse && (
              <div className={`mt-8 rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                playgroundStatus === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : playgroundStatus === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'
              }`}>
                <div className={`px-6 py-4 border-b flex items-center space-x-3 ${
                  playgroundStatus === 'success' 
                    ? 'bg-green-100 border-green-200' 
                    : playgroundStatus === 'error'
                      ? 'bg-red-100 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                }`}>
                  {playgroundStatus === 'success' && (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-900">Playground Response - Success</h3>
                    </>
                  )}
                  {playgroundStatus === 'error' && (
                    <>
                      <AlertCircle className="h-6 w-6 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-900">Playground Response - Error</h3>
                    </>
                  )}
                  {!playgroundStatus && (
                    <h3 className="text-lg font-semibold text-gray-900">Playground Response</h3>
                  )}
                </div>
                <div className="p-6">
                  <CodeBlock copyKey="playground-response" language="json">
                    {playgroundResponse}
                  </CodeBlock>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Real-time Data</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Our database is continuously updated by our browser extension users, ensuring you always get the latest technology information.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">No Rate Limits</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Unlike paid services, we don't impose rate limits. Use our API as much as you need for your projects and research.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Community Driven</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Powered by thousands of users contributing anonymized website technology data through our browser extension.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage;