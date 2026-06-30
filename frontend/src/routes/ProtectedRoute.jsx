import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!isLoggedIn()) return <Navigate to="/login" />;

  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!isAdmin()) return <Navigate to="/" />;

  return children;
};