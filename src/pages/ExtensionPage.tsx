import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Heart, DollarSign, Shield, Users, Zap, Globe, CheckCircle, Star } from 'lucide-react';
import { getExtensionUrl } from '../utils/browserDetection';

const ExtensionPage: React.FC = () => {
  const { url: extensionUrl, storeName } = getExtensionUrl();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-900" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Be Part of the <span className="text-yellow-400">Revolution</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              Help us build the world's largest <strong>FREE</strong> database of website technologies. 
              Together, we're disrupting a <strong>$billion industry</strong> that charges thousands for what should be free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href={extensionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
              >
                <Download className="h-5 w-5 mr-3" />
                Install Extension Now
              </a>
              <div className="text-white/80 text-sm">
                Available for {storeName} • 100% Free Forever
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              The Problem is <span className="text-red-600">Outrageous</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Companies are charging thousands of dollars for basic website technology information that should be accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200">
              <DollarSign className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">$3,000+/month</h3>
              <p className="text-gray-700">
                What companies like BuiltWith and SimilarTech charge for technology insights
              </p>
            </div>
            
            <div className="text-center p-8 bg-orange-50 rounded-2xl border border-orange-200">
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Only</h3>
              <p className="text-gray-700">
                Most tools are locked behind expensive enterprise plans, excluding small developers and researchers
              </p>
            </div>
            
            <div className="text-center p-8 bg-yellow-50 rounded-2xl border border-yellow-200">
              <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Limited Access</h3>
              <p className="text-gray-700">
                Even paid plans have strict limits and don't provide real-time data
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Our <span className="text-green-600">Community-Powered</span> Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're building something revolutionary: a completely free, open database powered by people like you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Here's How You're Changing Everything:</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Install Once, Help Forever</h4>
                    <p className="text-gray-600">Every website you visit gets automatically analyzed and added to our free database.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">100% Privacy Focused</h4>
                    <p className="text-gray-600">We only collect website technology info - never your personal data, browsing history, or anything private.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Globe className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Real-Time Data</h4>
                    <p className="text-gray-600">Unlike paid services with outdated data, our information is fresh and constantly updated.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Democratizing Information</h4>
                    <p className="text-gray-600">Making enterprise-level insights available to everyone - students, startups, researchers, and developers.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">The Numbers Don't Lie</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">BuiltWith Pro</span>
                  <span className="font-bold text-red-600">$3,588/year</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">SimilarTech Enterprise</span>
                  <span className="font-bold text-red-600">$4,800/year</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Wappalyzer Premium</span>
                  <span className="font-bold text-red-600">$2,400/year</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-green-50 px-4 rounded-lg mt-6">
                  <span className="text-gray-900 font-semibold">Open Tech Explorer</span>
                  <span className="font-bold text-green-600 text-xl">FREE</span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-4">Save thousands. Get better data. Help others.</p>
                <a
                  href={extensionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Join the Revolution
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Your Privacy is <span className="text-blue-600">Sacred</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              We take privacy seriously. Here's exactly what we collect and what we don't.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 p-8 rounded-2xl border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-4">✅ What We Collect</h3>
              <ul className="space-y-3 text-green-700">
                <li>• Website domain names (like google.com)</li>
                <li>• Technologies used (React, WordPress, etc.)</li>
                <li>• Generic website features (HTTPS, responsive design)</li>
                <li>• Performance metrics (page load time)</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-8 rounded-2xl border border-red-200">
              <h3 className="text-xl font-bold text-red-800 mb-4">❌ What We DON'T Collect</h3>
              <ul className="space-y-3 text-red-700">
                <li>• Your personal information</li>
                <li>• Browsing history or patterns</li>
                <li>• Form data or passwords</li>
                <li>• Location or device information</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Everything we collect is already public information about websites - the same info you'd see by viewing a website's source code.
            </p>
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
              Read our full Privacy Policy →
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-purple-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Every click, every website visit, every installation brings us closer to democratizing web technology data. 
            <strong> Be part of something bigger.</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href={extensionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
            >
              <Download className="h-5 w-5 mr-3" />
              Install Extension Now
            </a>
            
            <div className="text-center">
              <div className="text-white/90 text-sm">Join thousands of contributors</div>
              <div className="text-yellow-400 font-semibold">100% Free • No Registration Required</div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/80 text-sm">
              🚀 Together, we're building the future of web technology research - one website at a time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExtensionPage;