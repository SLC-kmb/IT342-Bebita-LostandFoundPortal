import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import VerifyEmailPage from './features/auth/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import Dashboard from './features/dashboard/Dashboard';
import ReportLostItem from './features/items/ReportLostItem';
import ReportFoundItem from './features/items/ReportFoundItem';
import LostItems from './features/items/LostItems';
import FoundItems from './features/items/FoundItems';
import AdminDashboard from './features/admin/AdminDashboard';
import Profile from './features/auth/Profile';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token || !user.email) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/report-lost"
          element={
            <PrivateRoute>
              <ReportLostItem />
            </PrivateRoute>
          }
        />
        <Route
          path="/report-found"
          element={
            <PrivateRoute>
              <ReportFoundItem />
            </PrivateRoute>
          }
        />
        <Route
          path="/lost-items"
          element={
            <PrivateRoute>
              <LostItems />
            </PrivateRoute>
          }
        />
        <Route
          path="/found-items"
          element={
            <PrivateRoute>
              <FoundItems />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

