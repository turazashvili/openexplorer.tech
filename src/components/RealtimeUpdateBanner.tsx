import React from 'react';
import { RefreshCw, X, Info } from 'lucide-react';

interface RealtimeUpdateBannerProps {
  pendingUpdates: number;
  onRefresh: () => void;
  onDismiss: () => void;
  recentChanges?: {
    newWebsites: number;
    updatedWebsites: number;
    newTechnologies: number;
  };
}

const RealtimeUpdateBanner: React.FC<RealtimeUpdateBannerProps> = ({
  pendingUpdates,
  onRefresh,
  onDismiss,
  recentChanges
}) => {
  if (pendingUpdates === 0) return null;

  const getUpdateMessage = () => {
    if (recentChanges) {
      const parts = [];
      if (recentChanges.newWebsites > 0) {
        parts.push(`${recentChanges.newWebsites} new website${recentChanges.newWebsites !== 1 ? 's' : ''}`);
      }
      if (recentChanges.updatedWebsites > 0) {
        parts.push(`${recentChanges.updatedWebsites} updated`);
      }
      if (recentChanges.newTechnologies > 0) {
        parts.push(`${recentChanges.newTechnologies} new technolog${recentChanges.newTechnologies !== 1 ? 'ies' : 'y'}`);
      }
      
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    
    return `${pendingUpdates} update${pendingUpdates !== 1 ? 's' : ''} available`;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 animate-slide-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-blue-900">
                New data available
              </p>
              <div className="flex items-center space-x-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                <Info className="h-3 w-3" />
                <span>Auto-refresh disabled</span>
              </div>
            </div>
            <p className="text-sm text-blue-700">
              {getUpdateMessage()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh now
          </button>
          <button
            onClick={onDismiss}
            className="text-blue-400 hover:text-blue-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealtimeUpdateBanner;