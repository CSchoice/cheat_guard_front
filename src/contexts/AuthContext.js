import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 토큰이 있으면 사용자 정보 가져오기
      api.get('/users/me')
      .then(response => {
        setUser(response.data);
        setIsAuthenticated(true);
      })
      .catch((error) => {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const login = async (nickname, password) => {
    try {
      console.log('Attempting login with:', { nickname });
      const response = await api.post('/auth/login', { nickname, password });
      console.log('Login response:', response);
      
      if (!response.data) {
        throw new Error('서버로부터 유효한 응답을 받지 못했습니다.');
      }
      
      // Check for both access_token (snake_case) and accessToken (camelCase)
      const token = response.data.accessToken || response.data.access_token;
      const userData = response.data.user || { nickname };
      
      if (!token) {
        console.error('No access token in response:', response.data);
        throw new Error('로그인 토큰을 받지 못했습니다.');
      }
      
      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || '로그인에 실패했습니다.'
      };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('users', userData);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || '회원가입에 실패했습니다.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    isTeacher: user?.role === 'teacher',
    loading,
    login,
    register,
    logout,
    updateUser: setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용해야 합니다.');
  }
  return context;
};

export default AuthContext;
