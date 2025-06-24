import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchPage from './pages/SearchPage';
import WebsiteDetailsPage from './pages/WebsiteDetailsPage';
import TechnologyDetailsPage from './pages/TechnologyDetailsPage';
import StaticTechnologyRoutes from './components/StaticTechnologyRoutes';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/website/:domain" element={<WebsiteDetailsPage />} />
          <Route path="/technology/:id" element={<TechnologyDetailsPage />} />
          {/* Static technology routes - these will handle all technology pages */}
          <Route path="/*" element={<StaticTechnologyRoutes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;