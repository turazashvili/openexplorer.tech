import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Download } from 'lucide-react';
import { getExtensionUrl } from '../utils/browserDetection';

const Header: React.FC = () => {
  const { url: extensionUrl, storeName } = getExtensionUrl();
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/icon.png" 
              alt="Open Tech Explorer" 
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-900">Open Tech Explorer</span>
          </Link>
          
          {/* Center Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/extension" 
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                location.pathname === '/extension'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Why Install Extension?
            </Link>
          </nav>
          
          {/* Right side - Extension Install Link and Bolt.new Badge */}
          {/* Extension Install Link and Bolt.new Badge */}
          <div className="flex items-center space-x-3">
            <a
              href={extensionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              title={`Install Extension from ${storeName}`}
            >
              <Download className="h-4 w-4 mr-2" />
              Install Extension
            </a>
            
            {/* Mobile install link */}
            <a
              href={extensionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title={`Install Extension from ${storeName}`}
            >
              <Download className="h-4 w-4" />
            </a>
            
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