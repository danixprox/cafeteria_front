import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Features/public/Home';
import Login from './Features/public/login';
import Registro from './Features/public/Registro';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
