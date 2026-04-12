import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ReportLostItem from './pages/ReportLostItem';
import ReportFoundItem from './pages/ReportFoundItem';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';

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
