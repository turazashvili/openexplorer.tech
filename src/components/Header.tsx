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
            <span className="text-lg sm:text-xl font-bold text-gray-900">TechLookup</span>
          </Link>
          
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm lg:text-base">
              Features
            </a>
            <a href="#docs" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm lg:text-base">
              Docs
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm lg:text-base">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;