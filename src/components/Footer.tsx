import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/icon.png" 
                alt="Open Tech Explorer" 
                className="h-8 w-8"
              />
              <span className="text-lg font-bold text-gray-900">Open Tech Explorer</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Discover the technologies behind any website with our comprehensive database and browser extension.
            </p>
            <p className="text-sm text-gray-500">
              © 2025 Open Tech Explorer. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Search Technologies
                </Link>
              </li>
              <li>
                <a
                  href="https://addons.mozilla.org/en-US/firefox/addon/openexplorer_tech/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Browser Extension
                </a>
              </li>
              <li>
                <a
                  href="https://bolt.new/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Made with Bolt.new
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:niko@axrisi.com"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              <p>Developed by Nikoloz Turazashvili</p>
              <p>Individual Entrepreneur Registration: I/E 65545000014</p>
            </div>
            <div className="text-sm text-gray-500">
              <a href="mailto:niko@axrisi.com" className="hover:text-gray-700">
                niko@axrisi.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;