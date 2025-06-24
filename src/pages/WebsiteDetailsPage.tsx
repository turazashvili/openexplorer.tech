import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Clock, Calendar, ArrowLeft, Shield, Smartphone, Zap, Globe } from 'lucide-react';
import { getWebsiteDetails, WebsiteDetails } from '../lib/api';

const WebsiteDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [website, setWebsite] = useState<WebsiteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchWebsiteDetails(id);
    }
  }, [id]);

  const fetchWebsiteDetails = async (websiteId: string) => {
    try {
      setLoading(true);
      const data = await getWebsiteDetails(websiteId);
      setWebsite(data);
    } catch (err) {
      setError('Failed to load website details');
      console.error('Error fetching website details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupTechnologiesByCategory = (technologies: WebsiteDetails['technologies']) => {
    return technologies.reduce((acc, tech) => {
      const category = tech.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tech);
      return acc;
    }, {} as Record<string, typeof technologies>);
  };

  const getMetadataFeatures = (metadata: Record<string, any>) => {
    const features = [];
    
    if (metadata.is_https) {
      features.push({ icon: Shield, label: 'HTTPS Secure', color: 'text-green-600 bg-green-50' });
    }
    
    if (metadata.is_responsive) {
      features.push({ icon: Smartphone, label: 'Responsive Design', color: 'text-blue-600 bg-blue-50' });
    }
    
    if (metadata.has_service_worker) {
      features.push({ icon: Zap, label: 'Service Worker', color: 'text-purple-600 bg-purple-50' });
    }
    
    if (metadata.likely_spa) {
      features.push({ icon: Globe, label: 'Single Page App', color: 'text-indigo-600 bg-indigo-50' });
    }
    
    return features;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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

  if (error || !website) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Website Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The requested website could not be found.'}</p>
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

  const groupedTechnologies = groupTechnologiesByCategory(website.technologies);
  const metadataFeatures = getMetadataFeatures(website.metadata);

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-8 py-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-all">{website.url}</h1>
                <a
                  href={`https://${website.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Visit website
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Metadata Features */}
          {metadataFeatures.length > 0 && (
            <div className="px-4 sm:px-8 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {metadataFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${feature.color}`}
                    >
                      <Icon className="h-4 w-4 mr-1.5" />
                      {feature.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="px-4 sm:px-8 py-6 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">Last Scraped</p>
                  <p className="text-sm text-gray-600 break-words">{formatDate(website.lastScraped)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">First Discovered</p>
                  <p className="text-sm text-gray-600 break-words">{formatDate(website.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            {(website.metadata.page_load_time || website.metadata.script_count) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {website.metadata.page_load_time && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {Math.round(website.metadata.page_load_time)}ms
                      </div>
                      <div className="text-xs text-gray-500">Load Time</div>
                    </div>
                  )}
                  {website.metadata.script_count && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {website.metadata.script_count}
                      </div>
                      <div className="text-xs text-gray-500">Scripts</div>
                    </div>
                  )}
                  {website.metadata.stylesheet_count && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {website.metadata.stylesheet_count}
                      </div>
                      <div className="text-xs text-gray-500">Stylesheets</div>
                    </div>
                  )}
                  {website.metadata.image_count && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {website.metadata.image_count}
                      </div>
                      <div className="text-xs text-gray-500">Images</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Technologies */}
          <div className="px-4 sm:px-8 py-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Technologies Used</h2>
            
            {Object.keys(groupedTechnologies).length === 0 ? (
              <p className="text-gray-500">No technologies detected for this website.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedTechnologies).map(([category, techs]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {techs.map((tech) => (
                        <Link
                          key={tech.id}
                          to={`/technology/${tech.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        >
                          {tech.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteDetailsPage;