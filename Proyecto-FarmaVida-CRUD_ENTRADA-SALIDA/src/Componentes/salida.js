import React, { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import data from './data/Salida.json'; 


function Salida() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [salida, setSalida] = useState([]);
  const [id_venta, setIdventa] = useState("");
  const [id_emp, setIdemp] = useState("");
  const [id_cli, setIdcli] = useState("");
  const [f_venta, setFventa] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [id_estado, setIdestado] = useState("");
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState("Registrar Venta");

  useEffect(() => {
    const storedSalidas = JSON.parse(localStorage.getItem("salidas")) || [];
    if (data.length > 0) {
      const updatedData = data.filter(
        jsonSalida => !storedSalidas.some(salida => salida.id_venta === jsonSalida.id_venta)
      );
      const combinedData = [...storedSalidas, ...updatedData];
      setSalida(combinedData);
      localStorage.setItem("salidas", JSON.stringify(combinedData));
    } else {
      setSalida(storedSalidas);
    }
  }, []);

  const show_alerta = (mensaje, tipo) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: mensaje,
      icon: tipo,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const openModal = (
    op,
    id_venta = "",
    id_emp = "",
    id_cli = "",
    f_venta = "",
    observaciones = "",
    id_estado = ""
  ) => {
    setIdventa(id_venta);
    setIdemp(id_emp);
    setIdcli(id_cli);
    setFventa(f_venta);
    setObservaciones(observaciones);
    setIdestado(id_estado);
    setOperation(op);
    setTitle(op === 1 ? "Registrar Venta" : "Editar Venta");
  };

  const validar = () => {
    if (
      String(id_venta).trim() === "" ||
      String(id_emp).trim() === "" ||
      String(id_cli).trim() === "" ||
      String(f_venta).trim() === "" ||
      String(observaciones).trim() === "" ||
      String(id_estado).trim() === ""
    ) {
      show_alerta("Todos los campos son requeridos", "warning");
    } else {
      let nuevasSalidas = [...salida];
      if (operation === 1) {
        const nuevaSalida = {
          id_venta: String(id_venta).trim(),
          id_emp: String(id_emp).trim(),
          id_cli: String(id_cli).trim(),
          f_venta: String(f_venta).trim(),
          observaciones: String(observaciones).trim(),
          id_estado: String(id_estado).trim(),
        };
        nuevasSalidas.push(nuevaSalida);
      } else {
        nuevasSalidas = nuevasSalidas.map((e) =>
          e.id_venta === id_venta
            ? {
                id_venta: String(id_venta).trim(),
                id_emp: String(id_emp).trim(),
                id_cli: String(id_cli).trim(),
                f_venta: String(f_venta).trim(),
                observaciones: String(observaciones).trim(),
                id_estado: String(id_estado).trim(),
              }
            : e
        );
      }
      setSalida(nuevasSalidas);
      localStorage.setItem("salidas", JSON.stringify(nuevasSalidas));
      show_alerta("Salida guardada con éxito", "success");
      document.getElementById("btnCerrar").click();
    }
  };

  const deleteSalida = (id_venta) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro quieres eliminar la venta ${id_venta}?`,
      icon: "question",
      text: "Ya no hay forma de regresar",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevasSalidas = salida.filter((e) => e.id_venta !== id_venta);
        setSalida(nuevasSalidas);
        localStorage.setItem("salidas", JSON.stringify(nuevasSalidas));
        show_alerta("Producto eliminado con éxito", "success");
      }
    });
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
                  <li className="nav-item">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <Link to="/entrada" className="nav-link text-center">
                        <img
                          src="/Assets/flecha_entrada.png"
                          className="img_L"
                          alt="Icono de entradas"
                          width="70px"
                          title="Entradas y Salidas"
                        />
                        <h2>Registro de entradas</h2>
                      </Link>
                    </div>
                  </li>
                  <li className="nav-item">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <Link to="/salida" className="nav-link text-center">
                        <img
                          src="/Assets/flecha_salida.png"
                          className="img_L"
                          alt="Icono de salidas"
                          width="70px"
                          title="Entradas y Salidas"
                        />
                        <h2>Registro de salidas</h2>
                      </Link>
                    </div>
                  </li>
                  <li className="nav-item">
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
                  <li className="nav-item">
                    <div className="d-flex flex-column align-items-center mt-4">
                      <Link
                        to="/gestion_usuarios"
                        className="nav-link text-center"
                      >
                        <img
                          src="/Assets/usuario1.png"
                          className="img_L"
                          alt="Icono de gestión de usuarios"
                          width="70px"
                          title="Gestión de usuarios"
                        />
                        <h2>Gestión de usuarios</h2>
                      </Link>
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
                        <h2>Medicamentos</h2>
                      </a>
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="col-10 p-4 content">
            <h3 className="text-center">Registro de Salidas</h3>

            <div className="row">
              <div className="col-12">
                <button
                  type="button"
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#modalSalida"
                  onClick={() => openModal(1)}
                >
                  Registrar Venta
                </button>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>ID Venta</th>
                        <th>ID Empleado</th>
                        <th>ID Cliente</th>
                        <th>Fecha Venta</th>
                        <th>Observaciones</th>
                        <th>ID Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salida.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No hay registros
                          </td>
                        </tr>
                      ) : (
                        salida.map((item, index) => (
                          <tr key={index}>
                            <td>{item.id_venta}</td>
                            <td>{item.id_emp}</td>
                            <td>{item.id_cli}</td>
                            <td>{item.f_venta}</td>
                            <td>{item.observaciones}</td>
                            <td>{item.id_estado}</td>
                            <td>
                              <button
                                className="btn btn-warning"
                                onClick={() =>
                                  openModal(
                                    2,
                                    item.id_venta,
                                    item.id_emp,
                                    item.id_cli,
                                    item.f_venta,
                                    item.observaciones,
                                    item.id_estado
                                  )
                                }
                                data-bs-toggle="modal"
                                data-bs-target="#modalSalida"
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => deleteSalida(item.id_venta)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="modal fade"
          id="modalSalida"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  {title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label>ID Venta</label>
                      <input
                        type="text"
                        className="form-control"
                        value={id_venta}
                        onChange={(e) => setIdventa(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label>ID Empleado</label>
                      <input
                        type="text"
                        className="form-control"
                        value={id_emp}
                        onChange={(e) => setIdemp(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label>ID Cliente</label>
                      <input
                        type="text"
                        className="form-control"
                        value={id_cli}
                        onChange={(e) => setIdcli(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label>Fecha Venta</label>
                      <input
                        type="date"
                        className="form-control"
                        value={f_venta}
                        onChange={(e) => setFventa(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label>Observaciones</label>
                      <input
                        type="text"
                        className="form-control"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label>ID Estado</label>
                      <input
                        type="text"
                        className="form-control"
                        value={id_estado}
                        onChange={(e) => setIdestado(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  id="btnCerrar"
                >
                  Cerrar
                </button>
                <button type="button" className="btn btn-primary" onClick={validar}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Salida;
