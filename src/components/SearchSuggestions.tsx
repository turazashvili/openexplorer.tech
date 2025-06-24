import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { SearchSuggestion } from '../lib/api';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ suggestions, onSuggestionClick }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-900 mb-2">
            No exact matches found. Did you mean:
          </h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="flex items-center justify-between w-full text-left p-3 bg-white border border-amber-200 rounded-md hover:bg-amber-50 transition-colors group"
              >
                <div>
                  <div className="font-medium text-gray-900">{suggestion.name}</div>
                  <div className="text-sm text-gray-600">{suggestion.suggestion}</div>
                  {suggestion.category && (
                    <div className="text-xs text-amber-700 mt-1">
                      Category: {suggestion.category}
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;