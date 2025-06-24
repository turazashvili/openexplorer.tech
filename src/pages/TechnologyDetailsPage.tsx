import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Clock, ArrowLeft, Globe } from 'lucide-react';
import { getTechnologyDetails, TechnologyDetails } from '../lib/api';

const TechnologyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [technology, setTechnology] = useState<TechnologyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTechnologyDetails(id);
    }
  }, [id]);

  const fetchTechnologyDetails = async (techId: string) => {
    try {
      setLoading(true);
      const data = await getTechnologyDetails(techId);
      setTechnology(data);
    } catch (err) {
      setError('Failed to load technology details');
      console.error('Error fetching technology details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="h-12 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !technology) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Technology Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The requested technology could not be found.'}</p>
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
    <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Technology Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">{technology.name}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {technology.category}
                </span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{technology.websites.length.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Websites using this technology</p>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  First discovered: {formatDate(technology.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Websites List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Websites using {technology.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {technology.websites.length.toLocaleString()} website{technology.websites.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {technology.websites.length === 0 ? (
                <div className="p-8 text-center">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No websites found using this technology.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {technology.websites.map((website) => (
                    <div key={website.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <Link
                              to={`/website/${website.id}`}
                              className="text-base sm:text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors truncate"
                            >
                              {website.url}
                            </Link>
                            <a
                              href={`https://${website.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          <div className="flex items-center space-x-1 mt-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>Last scraped {getRelativeTime(website.lastScraped)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyDetailsPage;