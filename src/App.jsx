import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './Features/public/Home';
import Login from './Features/public/login';
import Registro from './Features/public/Registro';

import AdminPage from './Features/admin/AdminPage';
import EmployeePage from './Features/dashboard/EmployeePage';
import ClientPage from './Features/public/ClientPage';

import ProtectedRoute from './routes/ProtectedRoute';
import RecuperarPassword from './Features/public/RecuperarPassword';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>

        {/* 🌍 Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />

        {/* 🔐 ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* 👨‍🍳 EMPLEADO */}
        <Route
          path="/empleado"
          element={
            <ProtectedRoute rolesPermitidos={['empleado']}>
              <EmployeePage />
            </ProtectedRoute>
          }
        />

        {/* 🧑 CLIENTE */}
        <Route
          path="/cliente"
          element={
            <ProtectedRoute rolesPermitidos={['cliente']}>
              <ClientPage />
            </ProtectedRoute>
          }
        />

        {/* 🚫 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;