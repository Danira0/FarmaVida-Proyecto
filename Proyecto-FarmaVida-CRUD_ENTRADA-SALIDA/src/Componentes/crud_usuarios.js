import React, { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import CryptoJS from "crypto-js";

function CrudUsu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    usuario: "",
    email: "",
    password: "",
  });

  const secretKey = "your-secret-key";

  const cargarUsuarios = () => {
    const usuariosGuardados = localStorage.getItem("usuarios");
    if (usuariosGuardados) {
      const decryptedUsuarios = JSON.parse(usuariosGuardados).map(user => ({
        ...user,
        password: decryptPassword(user.password),
      }));
      setUsuarios(decryptedUsuarios);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  },);

  const guardarUsuarios = (nuevosUsuarios) => {
    const encryptedUsuarios = nuevosUsuarios.map(user => ({
      ...user,
      password: encryptPassword(user.password),
    }));
    setUsuarios(nuevosUsuarios);
    localStorage.setItem("usuarios", JSON.stringify(encryptedUsuarios));
  };

  const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
  };

  const decryptPassword = (encryptedPassword) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const handleLogout = () => {
    logout();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDelete = (id) => {
    const nuevosUsuarios = usuarios.filter((usuario) => usuario.id !== id);
    guardarUsuarios(nuevosUsuarios);
  };

  const handleShowForm = (user = null) => {
    if (user) {
      setEditUser(user);
      setFormData({
        id: user.id,
        usuario: user.usuario,
        email: user.email,
        password: decryptPassword(user.password),
      });
    } else {
      setEditUser(null);
      setFormData({
        id: "",
        usuario: "",
        email: "",
        password: "",
      });
    }
    setShowForm(!showForm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editUser) {
      const nuevosUsuarios = usuarios.map((usuario) =>
        usuario.id === formData.id ? { ...formData, password: encryptPassword(formData.password) } : usuario
      );
      guardarUsuarios(nuevosUsuarios);
    } else {
      const nuevosUsuarios = [...usuarios, { ...formData, id: Date.now(), password: encryptPassword(formData.password) }];
      guardarUsuarios(nuevosUsuarios);
    }
    setShowForm(false);
  };

  return (
    <div>
      <nav>
        <div className="head row">
          <div className="logos col p-3">
            <img
              src="/Assets/Logo_Farmavida.png"
              alt="Logo de la farmacia"
              width="250px"
            />
          </div>
          <div className="rol col">
            <div className="salir p-3">
              <img
                src="/Assets/flecha_salir.png"
                alt="Icono salida de sesión"
                width="50px"
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>
      </nav>
      <div className="container-fluid">
        <div className="op row d-flex">
          <div className="mlat col-2 md-2">
            <ul className="list-unstyled">
              {user.rol === "Administrador" && (
                <>
                  <li className="nav-item">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <a href="./home.js" className="nav-link text-center">
                        <img
                          src="/Assets/proveedor.png"
                          className="img_L"
                          alt="Icono de proveedores"
                          width="70px"
                          title="Proveedores"
                        />
                        <h2>Registro de proveedores</h2>
                      </a>
                    </div>
                  </li>
                  <li className="nav-item">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <a href="./home.js" className="nav-link text-center">
                        <img
                          src="/Assets/medicamentos.png"
                          className="img_L"
                          alt="Icono de medicamentos"
                          width="70px"
                          title="Medicamentos"
                        />
                        <h2>Registro de medicamentos</h2>
                      </a>
                    </div>
                  </li>
                  <li className="nav-item ">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <a href="./home.js" className="nav-link text-center">
                        <img
                          src="/Assets/flecha_entrada.png"
                          className="img_L"
                          alt="Icono de entradas"
                          width="70px"
                          title="Entradas y Salidas"
                        />
                        <h2>Registro de entradas</h2>
                      </a>
                    </div>
                  </li>
                  <li className="nav-item ">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <a href="./home.js" className="nav-link text-center">
                        <img
                          src="/Assets/flecha_salida.png"
                          className="img_L"
                          alt="Icono de salidas"
                          width="70px"
                          title="Entradas y Salidas"
                        />
                        <h2>Registro de salidas</h2>
                      </a>
                    </div>
                  </li>
                  <li className="nav-item ">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <a href="./home.js" className="nav-link text-center">
                        <img
                          src="/Assets/informes.png"
                          className="img_L"
                          alt="Icono de informes"
                          width="70px"
                          title="Informes"
                        />
                        <h2>Informes</h2>
                      </a>
                    </div>
                  </li>
                  <li className="nav-item ">
                    <div className="d-flex flex-column align-items-center mt-4">
                    <Link to="/gestion_usuarios" className="btn btn-lg btn-primary w-100 fs-6">
                    <img
                          src="/Assets/usuario1.png"
                          className="img_L"
                          alt="Icono de gestión de usuarios"
                          width="70px"
                          title="Gestion de usuarios"
                        />
                        <h2>Gestión de usuario</h2></Link>
                    </div>
                  </li>
                </>
              )}

              {user.rol === "Empleado" && (
                <>
                  <li className="nav-item">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <a href="./home.js" className="nav-link text-center">
                        <img
                          src="/Assets/medicamentos.png"
                          className="img_L"
                          alt="Icono de medicamentos"
                          width="70px"
                          title="Medicamentos"
                        />
                        <h2>Registro de medicamentos</h2>
                      </a>
                    </div>
                  </li>
                  <li className="nav-item ">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <a href="./home.js" className="nav-link text-center">
                        <img
                          src="/Assets/flecha_entrada.png"
                          className="img_L"
                          alt="Icono de entradas"
                          width="70px"
                          title="Entradas y Salidas"
                        />
                        <h2>Registro de entradas</h2>
                      </a>
                    </div>
                  </li>
                  <li className="nav-item ">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <a href="./home.js" className="nav-link text-center">
                        <img
                          src="/Assets/flecha_salida.png"
                          className="img_L"
                          alt="Icono de salidas"
                          width="70px"
                          title="Entradas y Salidas"
                        />
                        <h2>Registro de salidas</h2>
                      </a>
                    </div>
                  </li>
                  <li className="nav-item ">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <a href="./home.js" className="nav-link text-center">
                        <img
                          src="/Assets/informes.png"
                          className="img_L"
                          alt="Icono de informes"
                          width="70px"
                          title="Informes"
                        />
                        <h2>Informes</h2>
                      </a>
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>
          <section className="gestionUsuario col-lg p-0">
            <div className="mainContainer1">
              <button
                onClick={handleGoBack}
                className="boton-atras btn btn-lg btn-primary fs-6"
              >
                <img src="/Assets/flecha_atras.png" alt="flecha_a" />
              </button>
              <button
                className="btn btn-success mb-3"
                onClick={() => handleShowForm()}
              >
                Agregar Usuario
              </button>

              {showForm && (
                <form onSubmit={handleSubmit} className="mb-4" style={{width: '80%',margin: 'auto'}}>
                  <div className="mb-3">
                    <label htmlFor="usuario" className="form-label">
                      Usuario
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="usuario"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Correo
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {editUser ? "Modificar Usuario" : "Agregar Usuario"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => handleShowForm()}
                  >
                    Cancelar
                  </button>
                </form>
              )}

              <table className="table table-striped" style={{width: '80%',margin: 'auto'}}>
                <thead>
                  <tr>
                    <th scope="col">Usuario</th>
                    <th scope="col">Correo</th>
                    <th scope="col">Contraseña</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length > 0 ? (
                    usuarios.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>{usuario.usuario}</td>
                        <td>{usuario.email}</td>
                        <td>{decryptPassword(usuario.password)}</td>
                        <td>
                          <button
                            className="btn btn-primary me-2"
                            onClick={() => handleShowForm(usuario)}
                          >
                            Modificar
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(usuario.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CrudUsu;
