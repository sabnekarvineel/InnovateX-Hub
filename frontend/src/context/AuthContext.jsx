import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);

    // Setup axios interceptor to handle banned/deactivated accounts
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Handle banned account
          if (error.response.data?.isBanned) {
            logout();
            alert(`Your account has been banned. Reason: ${error.response.data.reason || 'Violated platform policies'}`);
            window.location.href = '/login';
          }
          // Handle deactivated account
          if (error.response.data?.isActive === false) {
            logout();
            alert('Your account is deactivated. Please login again to reactivate.');
            window.location.href = '/login';
          }
          // Handle token expiration
          if (error.response.status === 401 && error.response.data?.message === 'Token expired') {
            logout();
            alert('Your session has expired. Please login again.');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const register = async (name, email, password, role) => {
    try {
      const { data } = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role,
      });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', {
        email,
        password,
      });
      
      // Check if account is banned (backend should prevent this, but double check)
      if (data.isBanned) {
        throw new Error('Account is banned');
      }

      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      // Handle banned account error
      if (error.response?.data?.isBanned) {
        throw new Error(error.response.data.reason || 'Your account has been banned');
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
