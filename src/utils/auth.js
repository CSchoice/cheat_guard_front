// 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('token');
};

// 토큰 저장
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

// 토큰 제거
export const removeToken = () => {
  localStorage.removeItem('token');
};

// 인증 여부 확인
export const isAuthenticated = () => {
  return !!getToken();
};
