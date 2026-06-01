import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VehiclesList from './pages/VehiclesList';
import CreateVehicle from './pages/CreateVehicle';
import EditVehicle from './pages/EditVehicle';
import VehicleDetail from './pages/VehicleDetail';
import MaintenanceSchedule from './pages/MaintenanceSchedule';
import MaintenanceHistory from './pages/MaintenanceHistory';
import Documents from './pages/Documents';
import Expenses from './pages/Expenses';
import DamageReports from './pages/DamageReports';
import UsersManagement from './pages/UsersManagement';
import AuditLog from './pages/AuditLog';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside Dashboard Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Analytics */}
            <Route index element={<Dashboard />} />

            {/* Vehicles Management */}
            <Route path="vehicles" element={<VehiclesList />} />
            <Route
              path="vehicles/new"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FLEET_MANAGER']}>
                  <CreateVehicle />
                </ProtectedRoute>
              }
            />
            <Route path="vehicles/:id" element={<VehicleDetail />} />
            <Route
              path="vehicles/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FLEET_MANAGER']}>
                  <EditVehicle />
                </ProtectedRoute>
              }
            />

            {/* Maintenance schedules */}
            <Route path="schedules" element={<MaintenanceSchedule />} />

            {/* Maintenance histories */}
            <Route path="histories" element={<MaintenanceHistory />} />

            {/* Documents */}
            <Route path="documents" element={<Documents />} />

            {/* Expenses (Costs) */}
            <Route
              path="expenses"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FLEET_MANAGER', 'FINANCE']}>
                  <Expenses />
                </ProtectedRoute>
              }
            />

            {/* Damage Reports */}
            <Route path="damage-reports" element={<DamageReports />} />

            {/* Users Management */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <UsersManagement />
                </ProtectedRoute>
              }
            />

            {/* Audit Log */}
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <AuditLog />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch All Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
