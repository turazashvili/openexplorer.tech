import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Shield, AlertTriangle, Scale, Mail } from 'lucide-react';

const TermsPage: React.FC = () => {
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
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                <p className="text-gray-600 mt-1">Last updated: January 2025</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-gray-700 mb-8">
                These Terms of Service govern your use of the Open Tech Explorer browser extension and website. 
                By using our service, you agree to these terms.
              </p>

              {/* Acceptance of Terms */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Scale className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Acceptance of Terms</h2>
                </div>
                <p className="text-gray-700">
                  By installing, accessing, or using the Open Tech Explorer extension or website, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our service.
                </p>
              </div>

              {/* Description of Service */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description of Service</h2>
                <p className="text-gray-700 mb-4">
                  Open Tech Explorer is a browser extension and web service that:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>Analyzes websites to detect technologies, frameworks, and tools in use</li>
                  <li>Provides users with insights about website technology stacks</li>
                  <li>Maintains a public database of website technologies for research and educational purposes</li>
                  <li>Offers search and filtering capabilities for the collected data</li>
                </ul>
              </div>

              {/* User Responsibilities */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">User Responsibilities</h2>
                </div>
                <p className="text-gray-700 mb-4">You agree to:</p>
                <ul className="space-y-2 text-gray-700">
                  <li>Use the service only for lawful purposes and in accordance with these Terms</li>
                  <li>Not attempt to reverse engineer, modify, or tamper with the extension</li>
                  <li>Not use the service to collect data for malicious purposes</li>
                  <li>Respect the privacy and rights of website owners and other users</li>
                  <li>Not attempt to overload or disrupt our servers or systems</li>
                </ul>
              </div>

              {/* Data Collection and Use */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Data Collection and Use</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  By using our service, you acknowledge and agree that:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>We collect website domain names and technology information as described in our Privacy Policy</li>
                  <li>This data may be displayed publicly on our website</li>
                  <li>You can control data collection through the extension's settings</li>
                  <li>We do not collect personal information about users</li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
                <p className="text-gray-700 mb-4">
                  The Open Tech Explorer extension, website, and all related content are the intellectual property of 
                  Nikoloz Turazashvili (I/E 65545000014). The service is provided under these terms but ownership 
                  remains with the developer.
                </p>
                <p className="text-gray-700">
                  The technology detection data collected through the service becomes part of our public database 
                  and may be used for research, educational, and commercial purposes.
                </p>
              </div>

              {/* Disclaimers */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Disclaimers</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  The service is provided "as is" without warranties of any kind. We make no guarantees about:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>The accuracy or completeness of technology detection</li>
                  <li>The availability or uptime of the service</li>
                  <li>The security or privacy of data transmission</li>
                  <li>Compatibility with all websites or browsers</li>
                </ul>
              </div>

              {/* Limitation of Liability */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700">
                  To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                  directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting 
                  from your use of the service.
                </p>
              </div>

              {/* Termination */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
                <p className="text-gray-700">
                  We reserve the right to terminate or suspend access to our service immediately, without prior notice 
                  or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service.
                </p>
              </div>

              {/* Changes to Terms */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="text-gray-700">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                  we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </div>

              {/* Governing Law */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-700">
                  These Terms shall be interpreted and governed by the laws of Georgia, without regard to its 
                  conflict of law provisions.
                </p>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900 m-0">Contact Information</h2>
                </div>
                <div className="text-gray-700">
                  <p className="mb-2">
                    <strong>Developer:</strong> Nikoloz Turazashvili
                  </p>
                  <p className="mb-2">
                    <strong>Business Registration:</strong> Individual Entrepreneur I/E 65545000014
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
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
    </div>
  );
};

export default TermsPage;