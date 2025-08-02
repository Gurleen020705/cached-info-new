import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResourcePage from './pages/ResourcePage';
import LoginPage from './pages/LoginPage';
import ResourceForm from './components/ResourceForm';
import RequestForm from './components/RequestForm';
import OurStory from './pages/OurStory';
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
        <Route path="/request" element={<RequestForm />} />
        <Route path="/submit" element={<ResourceForm />} />
        <Route path="/our-story" element={<OurStory />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
