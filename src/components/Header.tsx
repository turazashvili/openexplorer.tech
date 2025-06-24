import React from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Database className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">Open Tech Explorer</span>
          </Link>
          
          {/* Spacer to account for the floating badge */}
          <div className="w-16 sm:w-20"></div>
        </div>
      </div>
      
      {/* Large Floating Bolt.new Badge */}
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-0 right-4 sm:right-6 lg:right-8 z-60 transition-transform hover:scale-105 drop-shadow-lg"
        title="Made with Bolt.new"
        style={{ transform: 'translateY(-25%)' }}
      >
        <img
          src="/black_circle_360x360.png"
          alt="Made with Bolt.new"
          className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
        />
      </a>
    </header>
  );
};

export default Header;