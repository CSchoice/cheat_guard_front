import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러이고, 이미 재시도한 요청이 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 갱신 로직 (리프레시 토큰이 있다면)
        // const refreshToken = localStorage.getItem('refreshToken');
        // if (refreshToken) {
        //   const response = await axios.post(`${API_URL}/api/auth/refresh-token`, { refreshToken });
        //   const { token } = response.data;
        //   localStorage.setItem('token', token);
        //   originalRequest.headers.Authorization = `Bearer ${token}`;
        //   return api(originalRequest);
        // }
        
        // 리프레시 토큰이 없거나 갱신 실패 시 로그아웃 처리
        console.error('Authentication failed:', error.response?.data?.message || '인증에 실패했습니다.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } catch (error) {
        console.error('Error during token refresh:', error);
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
