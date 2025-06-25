import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import SearchPage from './pages/SearchPage';
import WebsiteDetailsPage from './pages/WebsiteDetailsPage';
import TechnologyDetailsPage from './pages/TechnologyDetailsPage';
import ApiDocsPage from './pages/ApiDocsPage';
import ExtensionPage from './pages/ExtensionPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import StaticTechnologyRoutes from './components/StaticTechnologyRoutes';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/website/:domain" element={<WebsiteDetailsPage />} />
          <Route path="/technology/:id" element={<TechnologyDetailsPage />} />
          <Route path="/api-docs" element={<ApiDocsPage />} />
          <Route path="/extension" element={<ExtensionPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          {/* Static technology routes - these will handle all technology pages */}
          <Route path="/*" element={<StaticTechnologyRoutes />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;