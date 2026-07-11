import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4F0] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#664930] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#664930] font-semibold">Loading SAVORA POS...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const canAccessBilling = user.role === 'Cashier' || user.role === 'Staff';
    return <Navigate to={canAccessBilling ? '/billing' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
