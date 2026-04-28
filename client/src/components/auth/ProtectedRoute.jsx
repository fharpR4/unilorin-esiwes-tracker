import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) { router.push('/'); return; }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      router.push(`/dashboard/${user?.role}`);
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  if (loading) return <LoadingSpinner fullScreen message="Loading your account..." />;
  if (!isAuthenticated) return null;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) return null;

  return children;
};

export default ProtectedRoute;