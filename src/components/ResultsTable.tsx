import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Clock, Shield, Smartphone, Zap } from 'lucide-react';
import { WebsiteResult } from '../lib/api';

interface ResultsTableProps {
  results: WebsiteResult[];
  loading?: boolean;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, loading }) => {
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
    
    return indicators.slice(0, 3); // Show max 3 indicators
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No results found. Try searching for a website URL or technology.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Website</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Technologies</th>
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
                      to={`/website/${result.id}`}
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
                  <div className="flex flex-wrap gap-2">
                    {result.technologies.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        title={tech.category}
                      >
                        {tech.name}
                      </span>
                    ))}
                    {result.technologies.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{result.technologies.length - 3} more
                      </span>
                    )}
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
    </div>
  );
};

export default ResultsTable;