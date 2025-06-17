import api from './config';

export const authApi = {
  // 로그인
  login: async (nickname, password) => {
    const response = await api.post('/login', { nickname, password });
    return response.data;
  },

  // 내 정보 조회
  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  // 회원가입
  register: async (nickname, password) => {
    const response = await api.post('/users', { nickname, password });
    return response.data;
  }
};
