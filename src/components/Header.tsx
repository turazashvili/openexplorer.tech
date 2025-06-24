import React from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto pl-4 sm:pl-6 lg:pl-8 pr-2 sm:pr-3 lg:pr-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Database className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">Open Tech Explorer</span>
          </Link>
          
          {/* Large Bolt.new Badge - Close to Right Edge */}
          <div className="flex items-center">
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center transition-transform hover:scale-105 drop-shadow-lg mr-1 sm:mr-2"
              title="Made with Bolt.new"
            >
              <img
                src="/black_circle_360x360.png"
                alt="Made with Bolt.new"
                className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;