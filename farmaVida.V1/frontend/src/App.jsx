import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


import Login from './Componentes/login/login.jsx';
import Register from './Componentes/registro/register';
import OlvidoContrasena from './Componentes/OlvidoPassword/OlvidoContrasena.jsx';

import Homeadmi from './Componentes/home/homeadmi';
import Homeemple from './Componentes/home/homeemple';

import Proveedor from './Componentes/Admin/proveedores/proveedor.jsx';
import Medicamento from './Componentes/inventario/Medicamentos/admin/medicamento.jsx';
import Caducidad from './Componentes/inventario/Medicamentos/admin/medicaVencimiento/medicaVencimiento.jsx';
import Stockminimo from './Componentes/inventario/Medicamentos/admin/stockMinimo/stockminimo.jsx';
import Movimiento from './Componentes/inventario/Movimiento/admin/movimiento.jsx';
import Informes from './Componentes/Informe/infromes.jsx';

import UserCrud from './Componentes/Admin/gestion.user/User.crud/admi.crud.jsx';
import GestionUsu from './Componentes/Admin/gestion.user/gestion.user.jsx';
import Emplecrud from './Componentes/Admin/gestion.user/User.crud/emple.crud.jsx';

import UserImagen from './Componentes/imagenUser/userImagen.jsx';

import { AuthProvider, useAuth } from './Componentes/Auth/auth.jsx';
import ProtectedRoute from './Componentes/Auth/proteger.routes.jsx';

function AppWrapper() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = (event) => {
      if (location.pathname === '/homeadmi') {
        event.preventDefault();
        const confirmLogout = window.confirm('¿Estás seguro de que quieres salir?');
        if (confirmLogout) {
          logout();
          navigate('/'); 
        } else {
          navigate(1); 
        }
      }
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [logout, navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/olvidoContrasena" element={<OlvidoContrasena />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/homeadmi" element={<Homeadmi />} />
        <Route path="/homeemple" element={<Homeemple />} />

        <Route path="/proveedor" element={<Proveedor />} />
        <Route path="/medicamento" element={<Medicamento />} />
      
        <Route path="/caducidad" element={<Caducidad />} />
        <Route path='/stockMinimo' element={<Stockminimo/>} />
        <Route path="/movimiento" element={<Movimiento />} />
        <Route path="/informes" element={<Informes />} />

        <Route path="/imagenUsuario" element={<UserImagen />} />

        <Route path="/gestion_usuario" element={<GestionUsu />} />
        <Route path="/user_crud" element={<UserCrud />} />
        <Route path="/empleado_crud" element={<Emplecrud />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWrapper />
      </Router>
    </AuthProvider>
  );
}

export default App;
