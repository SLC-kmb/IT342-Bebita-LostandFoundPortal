import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import Dashboard from './features/dashboard/Dashboard';
import ReportLostItem from './features/items/ReportLostItem';
import ReportFoundItem from './features/items/ReportFoundItem';
import LostItems from './features/items/LostItems';
import FoundItems from './features/items/FoundItems';

function PrivateRoute({ children }) {
  const user = localStorage.getItem('user');
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}
