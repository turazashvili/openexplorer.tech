import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Users, Settings, Mail } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-600 mt-1">Last updated: June 2025</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-gray-700 mb-8">
                Open Tech Explorer is a browser extension that analyzes the technologies used on websites you visit. 
                We value your privacy and are committed to being transparent about what data is collected and how it is used.
              </p>

              {/* What Data Is Collected */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Database className="h-6 w-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">What Data Is Collected?</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>
                    <strong>Website Domain:</strong> The extension collects the domain name of the website you visit (e.g., example.com).
                  </li>
                  <li>
                    <strong>Detected Technologies:</strong> The extension collects information about the technologies detected on the website 
                    (such as frameworks, analytics tools, etc.).
                  </li>
                  <li>
                    <strong>Website Metadata:</strong> The extension may collect non-personal metadata about the website, such as whether 
                    it uses HTTPS, is responsive, or has certain performance features.
                  </li>
                  <li>
                    <strong>Timestamp:</strong> The date and time when the analysis was performed.
                  </li>
                </ul>
              </div>

              {/* What Data Is NOT Collected */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Eye className="h-6 w-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">What Data Is NOT Collected?</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>
                    <strong>No Personal Data:</strong> The extension does not collect any personal information about you, 
                    your browsing history, or any form data.
                  </li>
                  <li>
                    <strong>No Tracking:</strong> The extension does not track your browsing activity across websites or over time.
                  </li>
                </ul>
              </div>

              {/* How Is Data Used */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">How Is Data Used?</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>
                    The collected data is sent to our secure database to help build a public index of web technologies.
                  </li>
                  <li>
                    This data is used for research, statistics, and to improve the extension and the public database at openexplorer.tech.
                  </li>
                </ul>
              </div>

              {/* Why Is Data Collected */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Is Data Collected?</h2>
                <ul className="space-y-3 text-gray-700">
                  <li>To provide users with insights about the technologies used on websites.</li>
                  <li>To contribute to a public database of web technologies for educational and research purposes.</li>
                </ul>
              </div>

              {/* Data Sharing */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Data Sharing</h2>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>The collected data may be displayed publicly on openexplorer.tech.</li>
                  <li>No personal or sensitive user data is ever shared.</li>
                </ul>
              </div>

              {/* User Control */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">User Control</h2>
                <ul className="space-y-3 text-gray-700">
                  <li>You can disable automatic analysis in the extension settings.</li>
                  <li>You can clear any locally stored data at any time via the extension's options.</li>
                </ul>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Contact</h2>
                </div>
                <p className="text-gray-700">
                  If you have any questions about this privacy policy, please contact us at{' '}
                  <a href="mailto:niko@axrisi.com" className="text-blue-600 hover:text-blue-700">
                    niko@axrisi.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;