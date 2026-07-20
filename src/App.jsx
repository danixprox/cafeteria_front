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
import MisPedidos from './pages/Cliente/MisPedidos';
import HistorialPedidosCliente from './pages/Cliente/HistorialPedidos';
import ClienteLayout from './pages/Cliente/ClienteLayout';
import OpinionesCliente from './pages/Cliente/OpinionesCliente';

import DashboardEmpleado from './pages/Empleado/DashboardEmpleado';
import CocineroLayout from './pages/Cocinero/CocineroLayout';
import PerfilCocinero from './pages/Cocinero/PerfilCocinero';
import ComandasCocina from './pages/Cocinero/ComandasCocina';
import DetalleComanda from './pages/Cocinero/DetalleComanda';

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

        {/* 👨‍🍳 COCINERO */}
        <Route
          path="/cocinero"
          element={
            <ProtectedRoute rolesPermitidos={['cocinero']}>
              <CocineroLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="comandas" replace />} />
          <Route path="perfil" element={<PerfilCocinero />} />
          <Route path="comandas" element={<ComandasCocina />} />
          <Route path="comandas/:id" element={<DetalleComanda />} />
        </Route>

        {/* 👨‍🍳 EMPLEADO */}
        <Route
          path="/empleado"
          element={
            <ProtectedRoute rolesPermitidos={['emp', 'mesero']}>
              <EmployeePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/empleado/reservas"
          element={
            <ProtectedRoute rolesPermitidos={['emp', 'mesero']}>
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

          <Route path="mis-pedidos" element={<MisPedidos />} />

          <Route path="historial" element={<HistorialPedidosCliente />} />

          <Route path="opiniones" element={<OpinionesCliente />} />

          <Route path="perfil" element={<ClientPage />} />

        </Route>

        {/* 🚫 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </Router>
  );
}

export default App;
