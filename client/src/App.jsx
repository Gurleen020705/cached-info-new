import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import Resources from './pages/Resources';
import OurStory from './pages/OurStory';
import SharedResourcePage from './pages/SharedResourcePage';
import SubmitResource from './pages/SubmitResource';
import Dashboard from './pages/Dashboard';

// Components
import Header from './components/Header';
import Profile from './components/Profile';
import SignIn from './components/SignIn';
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/submit" element={
          <ProtectedRoute>
            <SubmitResource />
          </ProtectedRoute>
        } />
        <Route path="/resource/:shareId" element={<SharedResourcePage />} />
        <Route path="/our-story" element={<OurStory />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;