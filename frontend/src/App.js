import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import LeaveRequest from './pages/LeaveRequest';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeData from './pages/EmployeeData';
import Supervisors from './pages/Supervisors';
import LeaveApprovals from './pages/LeaveApprovals';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* User Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave-request" element={<LeaveRequest />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute requiredRole="ADMIN"><EmployeeData /></ProtectedRoute>} />
            <Route path="/admin/supervisors" element={<ProtectedRoute requiredRole="ADMIN"><Supervisors /></ProtectedRoute>} />
            <Route path="/admin/leave-approvals" element={<ProtectedRoute requiredRole="ADMIN"><LeaveApprovals /></ProtectedRoute>} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
