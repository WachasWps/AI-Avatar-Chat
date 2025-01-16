// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './components/UploadPage'; // Upload PDF page
import NikitaChat from './components/NikitaChat'; // Nikita chat and QnA page
import HomePage from './components/HomePage'; // New homepage


const App: React.FC = () => {
  return (
    <Router>
       <Routes>
        {/* HomePage as the default landing page */}
        <Route path="/" element={<HomePage />} />

        {/* Upload PDF Page */}
        <Route path="/upload" element={<UploadPage />} />

        {/* Nikita Chat and Lip Sync Page */}
        <Route path="/qna" element={<NikitaChat />} />

      </Routes>

    </Router>
  );
};

export default App;
