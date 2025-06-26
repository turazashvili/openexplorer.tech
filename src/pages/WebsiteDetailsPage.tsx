import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Clock, Calendar, ArrowLeft, Shield, Smartphone, Zap, Globe, ChevronDown, ChevronRight, Database, Code, RotateCcw, Move, GripVertical } from 'lucide-react';
import { getWebsiteDetailsByDomain, WebsiteDetails } from '../lib/api';
import { findTechnology } from '../utils/staticTechnologies';
import { useMetadataOrder } from '../hooks/useMetadataOrder';
import DraggableMetadataContainer from '../components/DraggableMetadataContainer';

const WebsiteDetailsPage: React.FC = () => {
  const { domain } = useParams<{ domain: string }>();
  const [website, setWebsite] = useState<WebsiteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const { getOrderedCategories, updateOrder, resetOrder, isLoaded } = useMetadataOrder();

  useEffect(() => {
    if (domain) {
      fetchWebsiteDetails(decodeURIComponent(domain));
    }
  }, [domain]);

  const fetchWebsiteDetails = async (websiteDomain: string) => {
    try {
      setLoading(true);
      const data = await getWebsiteDetailsByDomain(websiteDomain);
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

  const getMetadataCategories = () => {
    return getOrderedCategories().map(category => {
      let icon;
      switch (category.id) {
        case 'page-info':
          icon = Globe;
          break;
        case 'performance':
          icon = Zap;
          break;
        case 'seo-social':
          icon = Globe;
          break;
        case 'features':
          icon = Shield;
          break;
        case 'external-resources':
          icon = ExternalLink;
          break;
        case 'analytics':
          icon = Database;
          break;
        case 'versions':
          icon = Code;
          break;
        default:
          icon = Code;
      }
      return { ...category, icon };
    });
  };

  const formatMetadataValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? '✅ Yes' : '❌ No';
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'None';
    if (typeof value === 'number') {
      if (key.includes('time')) return `${value.toLocaleString()}ms`;
      if (key.includes('count')) return value.toLocaleString();
      return value.toString();
    }
    return value.toString();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const categories = getMetadataCategories();
      const newOrder = [...categories];
      const draggedItem = newOrder[draggedIndex];
      
      // Remove the dragged item
      newOrder.splice(draggedIndex, 1);
      // Insert it at the new position
      newOrder.splice(dragOverIndex, 0, draggedItem);
      
      // Update the order in storage
      updateOrder(newOrder.map(cat => cat.id));
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex !== null) {
      setDragOverIndex(index);
    }
  };

  // Helper function to create SEO-friendly technology URLs using static technology data
  const getTechnologyUrl = (techName: string) => {
    const staticTech = findTechnology(techName);
    if (staticTech) {
      return `/${staticTech.slug}`;
    }
    
    // Fallback to dynamic URL generation
    return `/${techName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
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
          <p className="text-gray-600 mb-8">{error || `The website "${domain}" could not be found in our database.`}</p>
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
  const metadataCategories = getMetadataCategories();
  const hasMetadata = Object.keys(website.metadata).length > 0;

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
                          to={getTechnologyUrl(tech.name)}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          title={`View all websites using ${tech.name}`}
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

          {/* Technical Metadata */}
          {hasMetadata && (
            <div className="px-4 sm:px-8 py-6 border-t border-gray-200 bg-gray-50">
              <div className="mb-4">
                <button
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors mb-2"
                >
                  {showMetadata ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <Database className="h-5 w-5" />
                  <span className="font-semibold">Technical Metadata</span>
                  <span className="text-sm text-gray-500">
                    ({Object.keys(website.metadata).length} fields)
                  </span>
                </button>
                
                {showMetadata && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <GripVertical className="h-4 w-4" />
                      <span>Hover and drag the grip icon to reorder sections</span>
                    </div>
                    <button
                      onClick={resetOrder}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Reset to default order"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset order</span>
                    </button>
                  </div>
                )}
              </div>

              {showMetadata && (
                <div className="space-y-6">
                  {Object.entries(metadataCategories).map(([categoryName, category]) => {
                    const categoryFields = category.fields.filter(field => 
                      website.metadata.hasOwnProperty(field) && 
                      website.metadata[field] !== null && 
                      website.metadata[field] !== undefined
                    );

                    if (categoryFields.length === 0) return null;

                    const Icon = category.icon;
                    return (
                      <DraggableMetadataContainer
                        key={category.id}
                        id={category.id}
                        index={metadataCategories.indexOf(category)}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        isDragging={draggedIndex === metadataCategories.indexOf(category)}
                        isOver={dragOverIndex === metadataCategories.indexOf(category)}
                      >
                        <div className="flex items-center space-x-2 mb-3">
                          <Icon className={`h-4 w-4 ${category.color}`} />
                          <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {categoryFields.map(field => (
                            <div key={field} className="flex justify-between items-start">
                              <span className="text-sm text-gray-600 capitalize flex-shrink-0 mr-2">
                                {field.replace(/_/g, ' ')}:
                              </span>
                              <span className="text-sm font-medium text-gray-900 text-right break-all">
                                {formatMetadataValue(field, website.metadata[field])}
                              </span>
                            </div>
                          ))}
                        </div>
                      </DraggableMetadataContainer>
                    );
                  })}

                  {/* Other uncategorized fields */}
                  {(() => {
                    const categorizedFields = Object.values(metadataCategories).flatMap(cat => cat.fields);
                    const uncategorizedFields = Object.keys(website.metadata).filter(
                      field => !categorizedFields.includes(field) && 
                      website.metadata[field] !== null && 
                      website.metadata[field] !== undefined
                    );

                    if (uncategorizedFields.length === 0) return null;

                    return (
                      <DraggableMetadataContainer
                        key="uncategorized"
                        id="uncategorized"
                        index={metadataCategories.length}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        isDragging={draggedIndex === metadataCategories.length}
                        isOver={dragOverIndex === metadataCategories.length}
                      >
                        <div className="flex items-center space-x-2 mb-3">
                          <Code className="h-4 w-4 text-gray-600" />
                          <h4 className="font-semibold text-gray-900">Other Technical Data</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {uncategorizedFields.map(field => (
                            <div key={field} className="flex justify-between items-start">
                              <span className="text-sm text-gray-600 capitalize flex-shrink-0 mr-2">
                                {field.replace(/_/g, ' ')}:
                              </span>
                              <span className="text-sm font-medium text-gray-900 text-right break-all">
                                {formatMetadataValue(field, website.metadata[field])}
                              </span>
                            </div>
                          ))}
                        </div>
                      </DraggableMetadataContainer>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteDetailsPage;