import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Componentes/login';
import Home from './Componentes/home';
import Registro from './Componentes/registro';
import GestionUsu from './Componentes/gestion_usuarios';
import CrudUsu from './Componentes/crud_usuarios';
import Entrada from './Componentes/entrada';
import { AuthProvider } from './Componentes/auth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/gestion_usuarios" element={<GestionUsu />} />
          <Route path="/crud_usuarios" element={<CrudUsu />} />
          <Route path="/entrada" element={<Entrada />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;