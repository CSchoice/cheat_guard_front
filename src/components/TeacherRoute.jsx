import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function TeacherRoute({ children }) {
  const { isAuthenticated, isTeacher, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isTeacher) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
