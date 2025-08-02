import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/admin/HomePage';
import ResourcePage from './pages/ResourcePage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/authContext';
import Header from './components/Header';

function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resources" element={<ResourcePage />} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* Add placeholder routes for new pages */}
        <Route path="/request" element={<div>Request Resource Page</div>} />
        <Route path="/submit" element={<div>Submit Resource Page</div>} />
        <Route path="/our-story" element={<div>Our Story Page</div>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
