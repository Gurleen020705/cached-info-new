import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';

// Pages
import HomePage from './pages/HomePage';
import Resources from './pages/Resources';
import OurStory from './pages/OurStory';
import SubmitResource from './pages/SubmitResource';
import RequestResource from './pages/RequestResource';
import Dashboard from './pages/Dashboard';

// Components
import Header from './components/Header';
import SignIn from './components/SignIn';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';



// App content component (separated to use data context)
const AppContent = () => {
  const { loading, error, initialLoadComplete } = useData();

  // Show loading screen while data is being fetched
  if (loading || !initialLoadComplete) {
    return <LoadingScreen error={error} />;
  }

  if (error && !initialLoadComplete) {
    return <LoadingScreen error={error} />;
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/request" element={
          <ProtectedRoute>
            <RequestResource />
          </ProtectedRoute>
        } />
        <Route path="/signin" element={<SignIn />} />
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
        <Route path="/our-story" element={<OurStory />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;