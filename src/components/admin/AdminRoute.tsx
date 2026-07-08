import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Spinner } from '../ui/Spinner';
import { AdminLayout } from './AdminLayout';

export function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}
