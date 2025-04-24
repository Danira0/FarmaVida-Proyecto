import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Registro() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rol, setRol] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegistro = () => {
    setError("");
    setSuccess(false);

    if (!usuario || !password || !confirmPassword || !rol) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const datosRegistro = {
      usuario,
      password,
      rol,
    };
    localStorage.setItem("datosUsuario", JSON.stringify(datosRegistro));

    setSuccess(true);
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
                <h2>Registro</h2>
              </div>
              <div className="btns">
                <button
                  className={`boton btn btn-primary btn-lg fs-6 ${
                    rol === "Administrador" ? "btn-success" : "btn-primary"
                  }`}
                  onClick={() => setRol("Administrador")}
                >
                  Soy Administrador
                </button>
                <button
                  className={`boton btn btn-primary btn-lg fs-6 ${
                    rol === "Empleado" ? "btn-success" : "btn-primary"
                  }`}
                  onClick={() => setRol("Empleado")}
                >
                  Soy Empleado
                </button>
              </div>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>
              <div className="input-group mb-3">
                <input
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="input-group mb-1">
                <input
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="input-group mb-3 d-flex justify-content-between">
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
                    <small>
                      Acepto los términos y condiciones de la política de
                      protección de datos. Recibirá confirmación del registro
                      por correo electrónico.
                    </small>
                  </label>
                </div>
              </div>
              {error && (
                <div
                  className="alert alert-danger text-center"
                  style={{ maxWidth: "400px", margin: "16px auto" }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="alert alert-success text-center"
                  style={{ maxWidth: "400px", margin: "16px auto" }}
                >
                  Registro exitoso!
                </div>
              )}

              <div className="input-group mb-3">
                <button
                  onClick={handleRegistro}
                  className="btn btn-lg btn-primary w-100 fs-6"
                >
                  Finalizar
                </button>
              </div>
              <div className="input-group mb-3">
                <Link to="/" className="btn btn-lg btn-secondary w-100 fs-6">
                  Ir a Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Registro;
