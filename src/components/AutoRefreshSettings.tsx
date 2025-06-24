import React from 'react';
import { RefreshCw, Pause, Play } from 'lucide-react';

interface AutoRefreshSettingsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  pendingUpdates: number;
}

const AutoRefreshSettings: React.FC<AutoRefreshSettingsProps> = ({
  enabled,
  onToggle,
  pendingUpdates
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onToggle(!enabled)}
        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          enabled
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title={enabled ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
      >
        {enabled ? (
          <>
            <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
            <span className="hidden sm:inline">Auto</span>
          </>
        ) : (
          <>
            <Pause className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Manual</span>
          </>
        )}
        {pendingUpdates > 0 && (
          <span className="ml-1.5 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
            {pendingUpdates > 99 ? '99+' : pendingUpdates}
          </span>
        )}
      </button>
      
      {!enabled && pendingUpdates > 0 && (
        <div className="text-xs text-gray-500 hidden sm:block">
          {pendingUpdates} update{pendingUpdates !== 1 ? 's' : ''} pending
        </div>
      )}
    </div>
  );
};

export default AutoRefreshSettings;