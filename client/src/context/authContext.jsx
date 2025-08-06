import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path to your supabase config

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user || null);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in');
            break;
          case 'SIGNED_OUT':
            console.log('User signed out');
            // Clear any local storage or cached data
            localStorage.removeItem('savedResources');
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
          case 'USER_UPDATED':
            console.log('User updated');
            break;
          default:
            break;
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  // Sign in with email
  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  // Sign up with email
  const signUpWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Email sign up error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Clear any local data
      localStorage.removeItem('savedResources');

      // Redirect to home page
      window.location.href = '/';

    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Update password
  const updatePassword = async (password) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  // Check if user has valid session
  const isAuthenticated = () => {
    return !!(session && user && !loading);
  };

  // Get access token
  const getAccessToken = () => {
    return session?.access_token || null;
  };

  // Refresh session manually if needed
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated,
    getAccessToken,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};