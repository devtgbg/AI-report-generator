import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JobDetailsPage from './pages/JobDetailsPage';
import AiReportPage from './pages/AiReportPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs/:jobId/details" element={<JobDetailsPage />} />
        <Route path="/jobs/:jobId/ai-report" element={<AiReportPage />} />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
