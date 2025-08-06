import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Pages
import HomePage from './pages/HomePage';
import Resources from './pages/Resources';
import OurStory from './pages/OurStory';
import SharedResourcePage from './pages/SharedResourcePage';
import SubmitResource from './pages/SubmitResource';


//Components
import Header from './components/Header';
import Profile from './components/Profile';

// Context
import { AuthProvider } from './context/authContext';

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resource/:shareId" element={<SharedResourcePage />} />
          <Route path="/submit" element={<SubmitResource />} />
          <Route path="/our-story" element={<OurStory />} />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
