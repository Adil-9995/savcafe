import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRole: string;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRole }) => {
  const { user } = useAuth();

  if (!user || user.role !== allowedRole) {
    return <Navigate to={user?.role === 'Cashier' ? '/billing' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
