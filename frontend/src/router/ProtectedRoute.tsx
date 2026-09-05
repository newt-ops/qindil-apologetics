import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { usePermission } from '../hooks/usePermission';
import { useHasRole } from '../hooks/useHasRole';
import { Spinner } from '../components/ui';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredPermission?: string;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();
  const hasPermission = usePermission(requiredPermission || '');
  const hasRole = useHasRole(requiredRole || '');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg font-sans text-gold">
        <div className="flex items-center space-x-3">
          <Spinner size="md" />
          <span className="text-sm font-medium">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole) {
    // Non-admin roles (e.g., standard 'user') attempting to access admin routes get redirected to /dashboard
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermission && !hasPermission) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-bg text-text font-sans">
        <h1 className="text-4xl font-bold text-danger">403</h1>
        <p className="mt-2 text-textMuted">Access Denied. You lack the [{requiredPermission}] permission.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
