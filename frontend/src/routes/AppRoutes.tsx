import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CustomerHome from '../pages/CustomerHome';
import CustomerMenu from '../pages/CustomerMenu';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Billing from '../pages/Billing';
import Products from '../pages/Products';
import Categories from '../pages/Categories';
import Sales from '../pages/Sales';
import Reports from '../pages/Reports';
import Users from '../pages/Users';
import Settings from '../pages/Settings';
import Database from '../pages/Database';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Customer Homepage */}
      <Route path="/" element={<CustomerHome />} />
      <Route path="/home" element={<CustomerHome />} />
      <Route path="/menu" element={<CustomerMenu />} />

      {/* Login Screen */}
      <Route path="/login" element={<Login />} />

      {/* Protected Backoffice POS Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin Dashboard */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Shop Owner', 'Manager']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Core Billing Screen (Both Admin and Cashier) */}
        <Route path="billing" element={<Billing />} />

        {/* Product Management (Admin Only) */}
        <Route
          path="products"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Shop Owner', 'Manager']}>
              <Products />
            </ProtectedRoute>
          }
        />

        {/* Category Management (Admin Only) */}
        <Route
          path="categories"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Shop Owner', 'Manager']}>
              <Categories />
            </ProtectedRoute>
          }
        />

        {/* Sales & History (Both roles) */}
        <Route path="sales" element={<Sales />} />

        {/* Business Reports (Admin Only) */}
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Shop Owner', 'Manager']}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* User cashiers profiles (Admin Only) */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Shop Owner']}>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* System Settings (Admin Only) */}
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Shop Owner']}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Database Control (Admin Only) */}
        <Route
          path="database"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Shop Owner']}>
              <Database />
            </ProtectedRoute>
          }
        />

        {/* Account Profile Details */}
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
