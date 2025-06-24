import React from 'react';
import { X, Globe, Zap, RefreshCw } from 'lucide-react';
import { useRealtimeNotifications } from '../hooks/useRealtimeData';

const RealtimeNotifications: React.FC = () => {
  const { notifications, dismissNotification, clearAllNotifications, hasNotifications } = useRealtimeNotifications();

  if (!hasNotifications) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_website':
        return <Globe className="h-4 w-4 text-blue-600" />;
      case 'new_technology':
        return <Zap className="h-4 w-4 text-green-600" />;
      case 'website_update':
        return <RefreshCw className="h-4 w-4 text-orange-600" />;
      default:
        return <Globe className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'new_website':
        return 'bg-blue-50 border-blue-200';
      case 'new_technology':
        return 'bg-green-50 border-green-200';
      case 'website_update':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={clearAllNotifications}
            className="text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded border shadow-sm"
          >
            Clear all ({notifications.length})
          </button>
        </div>
      )}
      
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg border shadow-lg animate-slide-in-right ${getBackgroundColor(notification.type)}`}
        >
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealtimeNotifications;