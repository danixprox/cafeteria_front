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

import Salas from './pages/Cliente/Salas';
import DetalleSala from './pages/Cliente/DetalleSala';
import MisReservas from './pages/Cliente/MisReservas';
import MisNotificaciones from './pages/Cliente/MisNotificaciones';
import ClienteLayout from './pages/Cliente/ClienteLayout';

import DashboardEmpleado from './pages/Empleado/DashboardEmpleado';

import GestionReservas from './pages/Admin/GestionReservas';
import ControlAsistencia from './pages/Admin/ControlAsistencia';
import GestionNotificaciones from './pages/Admin/GestionNotificaciones';

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

        <Route
          path="/admin/reservas"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <GestionReservas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/asistencia"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <ControlAsistencia />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/notificaciones"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <GestionNotificaciones />
            </ProtectedRoute>
          }
        />

        {/* 👨‍🍳 EMPLEADO */}
        <Route
          path="/empleado"
          element={
            <ProtectedRoute rolesPermitidos={['emp', 'mesero', 'cocinero']}>
              <EmployeePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/empleado/reservas"
          element={
            <ProtectedRoute rolesPermitidos={['emp', 'mesero', 'cocinero']}>
              <DashboardEmpleado />
            </ProtectedRoute>
          }
        />

        {/* 🧑 CLIENTE */}
        <Route
          path="/cliente"
          element={
            <ProtectedRoute rolesPermitidos={['cliente']}>
              <ClienteLayout />
            </ProtectedRoute>
          }
        >

          <Route index element={<Navigate to="salas" replace />} />

          <Route path="salas" element={<Salas />} />

          <Route path="salas/:id" element={<DetalleSala />} />

          <Route path="mis-reservas" element={<MisReservas />} />

          <Route path="notificaciones" element={<MisNotificaciones />} />

          <Route path="perfil" element={<ClientPage />} />

        </Route>

        {/* 🚫 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </Router>
  );
}

export default App;