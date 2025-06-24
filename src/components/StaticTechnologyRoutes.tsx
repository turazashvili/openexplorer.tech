import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { STATIC_TECHNOLOGIES } from '../utils/staticTechnologies';
import StaticTechnologyPage from '../pages/StaticTechnologyPage';

const StaticTechnologyRoutes: React.FC = () => {
  return (
    <Routes>
      {STATIC_TECHNOLOGIES.map((tech) => (
        <Route
          key={tech.slug}
          path={`/${tech.slug}`}
          element={<StaticTechnologyPage technology={tech} />}
        />
      ))}
    </Routes>
  );
};

export default StaticTechnologyRoutes;