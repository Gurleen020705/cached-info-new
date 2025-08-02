import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext
} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    user: null,
    isAuthenticated: null,
    loading: true
  });

  const navigate = useNavigate();

  // ✅ Memoized loadUser function
  const loadUser = useCallback(async () => {
    try {
      const res = await axios.get('/api/auth/user', {
        headers: {
          'x-auth-token': authState.token
        }
      });
      setAuthState(prev => ({
        ...prev,
        user: res.data,
        isAuthenticated: true,
        loading: false
      }));
    } catch (err) {
      localStorage.removeItem('token');
      setAuthState({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  }, [authState.token]);

  // ✅ Safe and compliant useEffect
  useEffect(() => {
    if (authState.token) {
      setAuthState(prev => ({ ...prev, loading: true }));
      loadUser();
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, [authState.token, loadUser]);

  // Google login
  const googleLogin = async (tokenId) => {
    try {
      const res = await axios.post('/api/auth/google', { tokenId });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      setAuthState({
        token,
        user,
        isAuthenticated: true,
        loading: false
      });

      navigate('/');
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        googleLogin,
        logout,
        loadUser
      }}
    >
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
export const useAuth = () => useContext(AuthContext);
