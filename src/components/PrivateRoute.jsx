import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>; // 또는 로딩 스피너 컴포넌트를 반환할 수 있습니다.
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
