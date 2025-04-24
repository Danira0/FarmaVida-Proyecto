import React, { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import data from './data/Entrada.json';


function ShowEntrada() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [entrada, setEntrada] = useState([]);
  const [id_producto, setIdproducto] = useState("");
  const [id_prov, setIdprov] = useState("");
  const [id_cat, setIdcat] = useState("");
  const [f_entrada, setFentrada] = useState("");
  const [nombre, setNombre] = useState("");
  const [v_venta, setVventa] = useState("");
  const [stock_actual, setStockactual] = useState("");
  const [f_vencimiento, setFvencimiento] = useState("");
  const [id_estado, setEstado] = useState("");
  const [operation, setOperation] = useState("1");
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedEntradas = JSON.parse(localStorage.getItem("entradas")) || [];
    setEntrada(storedEntradas);
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
    id_producto = "",
    id_prov = "",
    id_cat = "",
    f_entrada = "",
    nombre = "",
    v_venta = "",
    stock_actual = "",
    f_vencimiento = "",
    id_estado = ""
  ) => {
    setIdproducto(id_producto);
    setIdprov(id_prov);
    setIdcat(id_cat);
    setFentrada(f_entrada);
    setNombre(nombre);
    setVventa(v_venta);
    setStockactual(stock_actual);
    setFvencimiento(f_vencimiento);
    setEstado(id_estado);
    setOperation(op);
    setTitle(op === "1" ? "Registrar Producto" : "Editar Producto");

    setShowModal(true);
    setTimeout(() => {
      document.getElementById("nombreProducto")?.focus();
    }, 500);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const validar = () => {
    if (
      String(id_producto).trim() === "" ||
      String(id_prov).trim() === "" ||
      String(id_cat).trim() === "" ||
      String(f_entrada).trim() === "" ||
      String(nombre).trim() === "" ||
      String(v_venta).trim() === "" ||
      String(stock_actual).trim() === "" ||
      String(f_vencimiento).trim() === "" ||
      String(id_estado).trim() === ""
    ) {
      show_alerta("Todos los campos son requeridos", "warning");
    } else {
      let nuevasEntradas = [...entrada];

      if (operation === "1") {
        const nuevaEntrada = {
          id_producto: String(id_producto).trim(),
          id_prov: String(id_prov).trim(),
          id_cat: String(id_cat).trim(),
          f_entrada: String(f_entrada).trim(),
          nombre: String(nombre).trim(),
          v_venta: String(v_venta).trim(),
          stock_actual: String(stock_actual).trim(),
          f_vencimiento: String(f_vencimiento).trim(),
          id_estado: String(id_estado).trim(),
        };
        nuevasEntradas.push(nuevaEntrada);
      } else {
        nuevasEntradas = nuevasEntradas.map((e) =>
          e.id_producto === id_producto
            ? {
                id_producto: String(id_producto).trim(),
                id_prov: String(id_prov).trim(),
                id_cat: String(id_cat).trim(),
                f_entrada: String(f_entrada).trim(),
                nombre: String(nombre).trim(),
                v_venta: String(v_venta).trim(),
                stock_actual: String(stock_actual).trim(),
                f_vencimiento: String(f_vencimiento).trim(),
                id_estado: String(id_estado).trim(),
              }
            : e
        );
      }

      setEntrada(nuevasEntradas);
      localStorage.setItem("entradas", JSON.stringify(nuevasEntradas));
      show_alerta("Entrada guardada con éxito", "success");
      closeModal();
    }
  };

  const deleteEntrada = (id_producto, nombre) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Seguro quieres eliminar el producto ${nombre}?`,
      icon: "question",
      text: "Ya no hay forma de regresar",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevasEntradas = entrada.filter(
          (e) => e.id_producto !== id_producto
        );
        setEntrada(nuevasEntradas);
        localStorage.setItem("entradas", JSON.stringify(nuevasEntradas));
        show_alerta("Producto eliminado con éxito", "success");
      }
    });
  };

  const EditButton = ({ id_producto, id_prov, id_cat, f_entrada, nombre, v_venta, stock_actual, f_vencimiento, id_estado }) => (
    <button
      onClick={() =>
        openModal(
          "2",
          id_producto,
          id_prov,
          id_cat,
          f_entrada,
          nombre,
          v_venta,
          stock_actual,
          f_vencimiento,
          id_estado
        )
      }
      className="btn btn-warning me-2"
    >
      Editar
    </button>
  );

  const DeleteButton = ({ id_producto, nombre }) => (
    <button
      onClick={() => deleteEntrada(id_producto, nombre)}
      className="btn btn-danger"
    >
      Eliminar
    </button>
  );

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
                          src="/Assets/gestion.png"
                          className="img_L"
                          alt="Icono de gestión de usuarios"
                          width="70px"
                          title="Gestión de Usuarios"
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
                  </>
              )}
            </ul>
          </div>
          <div className="md-10 col-10">
            <div className="col-auto p-3">
              <button
                onClick={() => openModal("1")}
                className="btn btn-primary"
                data-bs-toggle="modal"
              >
                <i className="fa-solid fa-circle-plus"></i>
                Añadir Producto
              </button>
              <div className="row mt-3">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID Producto</th>
                      <th>Proveedor</th>
                      <th>Categoría</th>
                      <th>Fecha Entrada</th>
                      <th>Nombre</th>
                      <th>Valor Venta</th>
                      <th>Stock Actual</th>
                      <th>Fecha Vencimiento</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entrada.map((e) => (
                      <tr key={e.id_producto}>
                        <td>{e.id_producto}</td>
                        <td>{e.id_prov}</td>
                        <td>{e.id_cat}</td>
                        <td>{e.f_entrada}</td>
                        <td>{e.nombre}</td>
                        <td>{e.v_venta}</td>
                        <td>{e.stock_actual}</td>
                        <td>{e.f_vencimiento}</td>
                        <td>{e.id_estado}</td>
                        <td>
                          <EditButton {...e} />
                          <DeleteButton id_producto={e.id_producto} nombre={e.nombre} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{title}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label htmlFor="id_producto" className="form-label">
                        ID Producto
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="id_producto"
                        value={id_producto}
                        onChange={(e) => setIdproducto(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="id_prov" className="form-label">
                        ID Proveedor
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="id_prov"
                        value={id_prov}
                        onChange={(e) => setIdprov(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="id_cat" className="form-label">
                        ID Categoría
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="id_cat"
                        value={id_cat}
                        onChange={(e) => setIdcat(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="f_entrada" className="form-label">
                        Fecha Entrada
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="f_entrada"
                        value={f_entrada}
                        onChange={(e) => setFentrada(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="nombreProducto" className="form-label">
                        Nombre
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="nombreProducto"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="v_venta" className="form-label">
                        Valor Venta
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="v_venta"
                        value={v_venta}
                        onChange={(e) => setVventa(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="stock_actual" className="form-label">
                        Stock Actual
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="stock_actual"
                        value={stock_actual}
                        onChange={(e) => setStockactual(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="f_vencimiento" className="form-label">
                        Fecha Vencimiento
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="f_vencimiento"
                        value={f_vencimiento}
                        onChange={(e) => setFvencimiento(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="id_estado" className="form-label">
                        Estado
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="id_estado"
                        value={id_estado}
                        onChange={(e) => setEstado(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={validar}>
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowEntrada;
