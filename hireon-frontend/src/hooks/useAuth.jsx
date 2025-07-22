import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI, setAuthToken, getAuthToken, removeAuthToken, setUser } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch latest profile from backend and update state
  const fetchProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setUserState(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    try {
      const profile = await authAPI.getProfile();
      console.log('Fetched user profile:', profile); // Debug log
      setUser(profile);
      setUserState(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      removeAuthToken();
      setUserState(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        setAuthToken(response.token);
        await fetchProfile(); // Always fetch latest profile after login
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      if (response.success) {
        setAuthToken(response.token);
        await fetchProfile();
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Signup failed' 
      };
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await authAPI.googleLogin(idToken);
      if (response.success) {
        setAuthToken(response.token);
        await fetchProfile();
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Google login failed' 
      };
    }
  };

  const logout = () => {
    removeAuthToken();
    setUserState(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    setUserState(updatedUser);
  };

  // Get subscription status with expiration check
  const isTokenExpired = (user) => {
    if (!user?.expires) return false;
    return new Date().getTime() > (user.expires * 1000);
  };

  const getSubscriptionStatus = () => {
    if (!user) return 'free';
    if (!user.plan || !user.verified) return 'free';
    if (isTokenExpired(user)) return 'expired';
    return user.plan;
  };

  const getTimeRemaining = () => {
    if (!user?.expires) return null;
    const now = new Date().getTime();
    const expiry = new Date(user.expires * 1000).getTime();
    const difference = expiry - now;
    if (difference <= 0) return 'Expired';
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) {
      return `${days} days, ${hours} hours`;
    } else if (hours > 0) {
      return `${hours} hours, ${minutes} minutes`;
    } else {
      return `${minutes} minutes`;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUser,
    fetchProfile,
    getSubscriptionStatus,
    getTimeRemaining,
    isTokenExpired: () => user ? isTokenExpired(user) : false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

