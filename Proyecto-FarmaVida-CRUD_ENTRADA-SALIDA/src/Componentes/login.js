import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import "bootstrap/dist/css/bootstrap.min.css";
import { Alert } from "react-bootstrap";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = ({ target: { id, value } }) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const registroLocal = localStorage.getItem("datosUsuario");
    const usuariosRegistrados = registroLocal ? JSON.parse(registroLocal) : null;

    if (usuariosRegistrados) {
      const user = 
        (usuariosRegistrados.usuario === formData.username && 
        usuariosRegistrados.password === formData.password &&
        usuariosRegistrados.rol === selectedRole);

      if (user) {
        login(usuariosRegistrados);
        navigate("/home");
      } else {
        setMessage({ text: "Usuario, contraseña o rol incorrectos.", type: "danger" });
      }
    } else {
      setMessage({ text: "No se encontraron registros. Regístrese primero.", type: "warning" });
    }
  };

  return (
    <main className="container">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="row border rounded-5 p-3 bg-white shadow box-area">
          <div className="col-md-6 rounded-4 d-flex justify-content-around align-items-center flex-column left-box">
            <div className="featured-image mb-3">
              <img
                src="/Assets/Logo_FarmaVida.png"
                className="img-fluid1 width-style1"
                alt="Logo de la farmacia"
              />
            </div>
            <div className="featured-image mb-3">
              <img
                src="/Assets/img1.png"
                className="img-fluid2 width-style1"
                alt="Farmacéutica sonriendo"
              />
            </div>
          </div>
          <div className="col-md-6 right-box">
            <div className="row align-items-center">
              <div className="header-text mb-4">
                <h2>Iniciar Sesión</h2>
              </div>
              <div className="btns">
                <button
                  className={`btn btn-lg fs-6 ${
                    selectedRole === "Administrador" ? "btn-success" : "btn-primary"
                  }`}
                  onClick={() => handleRoleSelect("Administrador")}
                >
                  Soy Administrador
                </button>
                <button
                  className={`btn btn-lg fs-6 ms-2 ${
                    selectedRole === "Empleado" ? "btn-success" : "btn-primary"
                  }`}
                  onClick={() => handleRoleSelect("Empleado")}
                >
                  Soy Empleado
                </button>
              </div>

              {message.text && (
                <Alert variant={message.type} className="mt-3">
                  {message.text}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="username">Usuario</label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light fs-6"
                    id="username"
                    placeholder="Usuario"
                    autoComplete="on"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    className="form-control form-control-lg bg-light fs-6"
                    id="password"
                    placeholder="Contraseña"
                    autoComplete="on"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group mb-5 d-flex justify-content-between">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="formCheck"
                    />
                    <label
                      htmlFor="formCheck"
                      className="form-check-label text-secondary"
                    >
                      <small>Recordar inicio de sesión</small>
                    </label>
                  </div>
                  <div className="forgot">
                    <small>
                      <a href="./recuperar_contrasena.html">
                        ¿Olvidó la contraseña?
                      </a>
                    </small>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                >
                  Iniciar Sesión
                </button>
              </form>
              <div className="row">
                <small>
                  ¿No tiene una cuenta? <Link to="/registro">Registrarse</Link>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
