import React from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Database className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">Open Tech Explorer</span>
          </Link>
          
          {/* Bolt.new Badge */}
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 transition-transform hover:scale-105"
            title="Made with Bolt.new"
          >
            <img
              src="/black_circle_360x360.png"
              alt="Made with Bolt.new"
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;