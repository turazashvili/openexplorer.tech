import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter website URL or technology name..."
          className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          className="px-6 sm:px-8 bg-blue-600 text-white font-semibold rounded-r-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline ml-2">Search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;