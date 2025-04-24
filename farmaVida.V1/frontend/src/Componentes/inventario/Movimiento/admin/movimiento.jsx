import React, { useEffect, useState } from "react";
import { useAuth } from "../../../Auth/auth.jsx";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import Menu from "../../../home/admimenulateral.jsx";
import "./../../../../App.css";

function Movimiento() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const handleFilterChange = (value) => {
    if (value === "filtro_az") {
      setOrdenAZ(true);
      setEntradas(false);
      setSalidas(false);
      setDevolucion(false);
    } else if (value === "entrada") {
      setEntradas(true);
      setSalidas(false);
      setDevolucion(false);
      setOrdenAZ(false);
    } else if (value === "salida") {
      setSalidas(true);
      setEntradas(false);
      setDevolucion(false);
      setOrdenAZ(false);
    } else if (value === "devolucion") {
      setDevolucion(true);
      setEntradas(false);
      setSalidas(false);
      setOrdenAZ(false);
    } else if (value === "todos") {
      setEntradas(false);
      setSalidas(false);
      setDevolucion(false);
      setOrdenAZ(false);
    }
  };

  const ordenarMovimientoAZ = (movimiento) => {
    return movimiento.slice().sort((a, b) => {
      if (a.nombre < b.nombre) return -1;
      if (a.nombre > b.nombre) return 1;
      return 0;
    });
  };

  const [Movimiento, setMovimiento] = useState([]);
  const [ID_STOCK, setID_STOCK] = useState("");
  const [ProductoID_Producto, setProductoID_Producto] = useState("");
  const [UsuarioID_Usuario, setUsuarioID_Usuario] = useState("");
  const [PresentacionID_Presentacion, setPresentacionID_Presentacion] =
    useState("");
  const [UbicacionID_Ubicacion, setUbicacionID_Ubicacion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fecha_hora_movimiento, setFecha_hora_movimiento] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [tipo_movimiento, setTipo_movimiento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [iva_aplicado, setIva_aplicado] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [total_venta, setTotal_venta] = useState("");
  const [valor_unitario_movimiento, setValor_unitario_movimiento] =
    useState("");
  const [productos, setProductos] = useState([]);
  const [usuario, setUsuario] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [ordenAZ, setOrdenAZ] = useState(false);
  const [entradas, setEntradas] = useState(false);
  const [salidas, setSalidas] = useState(false);
  const [devolucion, setDevolucion] = useState(false);
  const [movimientoSeleccionadoDevolucion, setMovimientoSeleccionadoDevolucion] = useState(null);
  const [showDevolucionModal, setShowDevolucionModal] = useState(false);
  const [cantidadDevolucion, setCantidadDevolucion] = useState("");
  const [motivoDevolucion, setMotivoDevolucion] = useState("");
  const [observacionesDevolucion, setObservacionesDevolucion] = useState("");
  const [operacion, setOperacion] = useState("");
  const [title, setTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const MAX_HORAS_DEVOLUCION = 24;

  useEffect(() => {
    getMovimiento();
    getProductos();
    getUsuario();
    getPresentaciones();
  }, []);

  const getMovimiento = async () => {
    try {
      const respuesta = await axios.get(
        "http://localhost:4000/api/obtener/movimientos"
      );
      console.log("Datos de entrada recibidos:", respuesta.data);
      setMovimiento(respuesta.data);
    } catch (error) {
      console.error("Error fetching movimiento:", error);
    }
  };

  const getProductos = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/obtener/productos"
      );
      console.log("Todos los productos cargados:", response.data);
      setProductos(response.data || []);
      setProductosFiltrados(response.data || []);
    } catch (error) {
      console.error("Error fetching productos:", error);
      setProductos([]);
      setProductosFiltrados([]);
    }
  };

  const getProductosByPresentacion = async (presentacionId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/obtener/productos/presentacion/${presentacionId}`
      );
      console.log(
        `Productos para presentación ${presentacionId}:`,
        response.data
      );
      setProductosFiltrados(response.data || []);
      setProductoID_Producto("");
    } catch (error) {
      console.error("Error fetching productos por presentación:", error);
      setProductosFiltrados([]);
    }
  };

  const getUsuario = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/obtener/usuarios"
      );
      console.log("Usuarios cargados:", response.data);
      setUsuario(response.data);
    } catch (error) {
      console.error("Error fetching usuarios:", error);
    }
  };

  const getPresentaciones = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/obtener/presentaciones"
      );
      console.log("Presentaciones Cargadas:", response.data);
      setPresentaciones(response.data || []);
    } catch (error) {
      console.error("Error fetching presentaciones:", error);
      setPresentaciones([]);
    }
  };

  const getDevolucionesPendientes = async (movimientoId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/devoluciones-pendientes/${movimientoId}`
      );
      
      if (response.data.error === "MOVIMIENTO_NO_ENCONTRADO") {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se encontró el movimiento de salida",
        });
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error("Error al obtener devoluciones pendientes:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al obtener devoluciones pendientes",
      });
      return null;
    }
  };

  const seleccionarMovimientoParaDevolucion = async (movimiento) => {
    const data = await getDevolucionesPendientes(movimiento.ID_STOCK);
    
    if (!data) return;
    
    setMovimientoSeleccionadoDevolucion({
      ...movimiento,
      cantidad_pendiente: data.cantidad_pendiente,
      cantidad_devuelta: data.cantidad_devuelta,
      cantidad_original: data.cantidad_original,
      fecha_hora_movimiento: data.fecha_hora_movimiento
    });
    
    setShowDevolucionModal(true);
  };

  const procesarDevolucion = async () => {
    if (!movimientoSeleccionadoDevolucion) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha seleccionado un movimiento para devolver",
      });
      return;
    }

    if (!cantidadDevolucion || cantidadDevolucion <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La cantidad a devolver debe ser mayor que cero",
      });
      return;
    }

    if (cantidadDevolucion > movimientoSeleccionadoDevolucion.cantidad_pendiente) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `La cantidad a devolver (${cantidadDevolucion}) excede la disponible (${movimientoSeleccionadoDevolucion.cantidad_pendiente})`,
      });
      return;
    }

    if (!motivoDevolucion) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe especificar el motivo de la devolución",
      });
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:4000/api/devolucion/${movimientoSeleccionadoDevolucion.ID_STOCK}`,
        {
          motivo: motivoDevolucion,
          observaciones: observacionesDevolucion,
          cantidad: Number(cantidadDevolucion),
        }
      );

      if (response.status >= 200 && response.status < 300) {
        getMovimiento();
        setShowDevolucionModal(false);
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: response.data.message || "Devolución registrada correctamente",
        });
      }
    } catch (error) {
      console.error("Error al procesar la devolución:", error);
      
      let errorMessage = "Hubo un error al procesar la devolución";
      if (error.response) {
        if (error.response.data.error === "TIEMPO_EXCEDIDO") {
          errorMessage = `No se puede devolver el producto. Han pasado más de ${MAX_HORAS_DEVOLUCION} horas (1 día) desde la salida.`;
        } else if (error.response.data.error === "SIN_STOCK_DEVOLUCION") {
          errorMessage = "No hay cantidad disponible para devolver";
        } else if (error.response.data.error === "CANTIDAD_EXCEDIDA") {
          errorMessage = error.response.data.message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const filtrarProductosPorPresentacion = (presentacionId) => {
    if (!presentacionId || !productos.length) {
      setProductosFiltrados(productos);
      return;
    }

    const idBuscado = Number(presentacionId);

    const filtered = productos.filter(
      (producto) => Number(producto.PresentacionID_Presentacion) === idBuscado
    );

    setProductosFiltrados(filtered.length ? filtered : []);
    setProductoID_Producto("");
  };

  const openModal = (
    op,
    ID_STOCK,
    ProductoID_Producto,
    PresentacionID_Presentacion,
    UsuarioID_Usuario,
    UbicacionID_Ubicacion,
    fecha_hora_movimiento,
    tipo_movimiento,
    iva_aplicado,
    subtotal,
    total_venta,
    valor_unitario_movimiento,
    motivo,
    cantidad,
    observaciones
  ) => {
    console.log("Datos recibidos en OpenModal:", {
      ID_STOCK,
      ProductoID_Producto,
      PresentacionID_Presentacion,
      UsuarioID_Usuario,
      UbicacionID_Ubicacion,
      fecha_hora_movimiento,
      tipo_movimiento,
      iva_aplicado,
      subtotal,
      total_venta,
      valor_unitario_movimiento,
      motivo,
      cantidad,
      observaciones,
    });
    setID_STOCK(ID_STOCK || "");
    setProductoID_Producto(
      ProductoID_Producto ? String(ProductoID_Producto) : ""
    );
    setPresentacionID_Presentacion(
      PresentacionID_Presentacion ? String(PresentacionID_Presentacion) : ""
    );
    setUsuarioID_Usuario(UsuarioID_Usuario ? String(UsuarioID_Usuario) : "");
    setUbicacionID_Ubicacion(
      UbicacionID_Ubicacion ? String(UbicacionID_Ubicacion) : ""
    );
    setFecha_hora_movimiento(
      fecha_hora_movimiento
        ? fecha_hora_movimiento.replace("T", " ").split(".")[0]
        : ""
    );
    setTipo_movimiento(tipo_movimiento || "");
    setIva_aplicado(iva_aplicado || "");
    setSubtotal(subtotal || "");
    setTotal_venta(total_venta || "");
    setValor_unitario_movimiento(valor_unitario_movimiento || "");
    setMotivo(motivo || "");
    setCantidad(cantidad ? String(cantidad) : "");
    setObservaciones(observaciones || "");
    setOperacion(op);
    setTitle(op === 1 ? "Registrar Movimiento" : "Editar Movimiento");
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setShowDevolucionModal(false);
    setMovimientoSeleccionadoDevolucion(null);
    setCantidadDevolucion("");
    setMotivoDevolucion("");
    setObservacionesDevolucion("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tipo_movimiento === "Salida" && !valor_unitario_movimiento) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El valor unitario es obligatorio para salidas",
      });
      return;
    }

    const movimiento = {
      ID_STOCK,
      ProductoID_Producto: Number(ProductoID_Producto),
      PresentacionID_Presentacion: Number(PresentacionID_Presentacion),
      UsuarioID_Usuario: Number(UsuarioID_Usuario),
      UbicacionID_Ubicacion: Number(UbicacionID_Ubicacion),
      fecha_hora_movimiento,
      tipo_movimiento,
      motivo,
      cantidad: Number(cantidad),
      observaciones,
      valor_unitario_movimiento: valor_unitario_movimiento
        ? Number(valor_unitario_movimiento)
        : null,
    };

    try {
      let response;
      if (operacion === 1) {
        response = await axios.post(
          "http://localhost:4000/api/registrar/movimiento",
          movimiento
        );
      } else if (operacion === 2) {
        response = await axios.put(
          `http://localhost:4000/api/actualizar/movimiento/${ID_STOCK}`,
          movimiento
        );
      }

      if (response && response.status >= 200 && response.status < 300) {
        getMovimiento();
        closeModal();
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text:
            operacion === 1
              ? "Movimiento registrado correctamente"
              : "Movimiento actualizado correctamente",
        });
      } else {
        throw new Error("Error al procesar la solicitud del servidor");
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);

      if (error.response?.data?.error === "INACTIVE_PRODUCT") {
        Swal.fire({
          icon: "info",
          title: "Información",
          text:
            error.response?.data?.message ||
            "No se puede realizar salida de un producto inactivo",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message ||
            "Hubo un error al procesar la solicitud",
        });
      }
    }
  };

  const validar = (e) => {
    if (!PresentacionID_Presentacion) {
      show_alerta("El campo presentación es obligatorio", "error");
      return;
    }
    if (!ProductoID_Producto) {
      show_alerta("El campo Producto es obligatorio", "error");
      return;
    }
    if (!UsuarioID_Usuario) {
      show_alerta("El campo Usuario es obligatorio", "error");
      return;
    }
    if (!UbicacionID_Ubicacion) {
      show_alerta("El campo Ubicación es obligatorio", "error");
      return;
    }
    if (tipo_movimiento === "Salida" && !valor_unitario_movimiento) {
      show_alerta("El valor unitario es obligatorio para salidas", "error");
      return;
    }
    if (!cantidad) {
      show_alerta("El campo Cantidad es obligatorio", "error");
      return;
    }
    if (!tipo_movimiento) {
      show_alerta("El campo tipo movimiento es obligatorio", "error");
      return;
    }
    if (!motivo) {
      show_alerta("El campo Motivo es obligatorio", "error");
      return;
    }
    if (!observaciones) {
      show_alerta("El campo observaciones es obligatorio", "error");
      return;
    }
    handleSubmit(e);
  };

  const show_alerta = (msj, icon) => {
    Swal.fire({
      title: msj,
      icon: icon,
      confirmButtonText: "Aceptar",
    });
  };

  const deleteMovimiento = async (ID_STOCK) => {
    const MySwal = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    MySwal.fire({
      title: `¿Estás seguro de eliminar el Movimiento ${ID_STOCK}?`,
      icon: "question",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://localhost:4000/api/eliminar/movimiento/${ID_STOCK}`
          );
          getMovimiento();
          show_alerta("Movimiento eliminada correctamente", "success");
        } catch (error) {
          show_alerta("Error al eliminar el Movimiento", "error");
        }
      } else {
        show_alerta("Operación cancelada", "info");
      }
    });
  };

  const movimientoMostrados = ordenAZ
    ? ordenarMovimientoAZ(Movimiento)
    : Movimiento;

  return (
    <div>
      <nav>
        <div className="head row">
          <div className="logos col p-3">
            <img
              src="/Assets/logo.png"
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
      <div className="container_prove">
        <div className="op row d-flex">
          <Menu />
          <div className="search-container">
            <div className="btn_busq">
              <img src="./Assets/lupa.png" alt="lupa"></img>
              <input
                type="text"
                className="input-busqueda"
                placeholder="Buscar Medicamento"
              ></input>
            </div>
            <div>
              <select
                id="filterSelect"
                className="formulario"
                aria-label="Selecciona un filtro de búsqueda"
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="" disabled selected>
                  Filtro de Movimientos
                </option>
                <option value="filtro_az">Ordenar (A-Z)</option>
                <option value="entrada">Entradas</option>
                <option value="salida">Salidas</option>
                <option value="devolucion">Devoluciones</option>
                <option value="todos">Todos los movimientos</option>
              </select>
            </div>
          </div>
          <div className="col-lg-10 col-md-5 mt-0">
            <div className="App">
              <div className="container-fluid">
                <div className="row mt-3">
                  <div className="col-md-3 offset-md-4">
                    <div className="d-grid mx-auto">
                      <button
                        className="btn btn-dark"
                        onClick={() => openModal(1)}
                      >
                        <i className="fa-solid fa-circle-plus"></i> Añadir
                        Movimiento
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tabla_medic row mt-5">
                <div className="col-10 col-lg-8">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr className="table-primary">
                          <th>ID Stock</th>
                          <th>Producto</th>
                          <th>Presentación</th>
                          <th>Usuario</th>
                          <th>Ubicación</th>
                          <th>Fecha y Hora</th>
                          <th>Tipo de Movimiento</th>
                          <th>IVA Aplicado</th>
                          <th>Subtotal</th>
                          <th>Total Venta</th>
                          <th>Valor Unitario</th>
                          <th>Motivo</th>
                          <th>Cantidad</th>
                          <th>Observaciones</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="table-group-divider">
                        {movimientoMostrados
                          .filter((mov) => {
                            if (entradas) return mov.tipo_movimiento === "Entrada";
                            if (salidas) return mov.tipo_movimiento === "Salida";
                            if (devolucion) return mov.tipo_movimiento === "Devolucion";
                            return true;
                          })
                          .map((mov) => (
                            <tr key={mov.ID_STOCK}>
                              <td className="table-info">{mov.ID_STOCK}</td>
                              <td>{mov.producto}</td>
                              <td className="table-info">
                                {mov.presentacion_nombre}
                              </td>
                              <td>{mov.usuario}</td>
                              <td className="table-info">
                                {mov.ubicacion_nombre}
                              </td>
                              <td>{formatearFecha(mov.fecha_hora_movimiento)}</td>
                              <td className="table-info">
                                {mov.tipo_movimiento}
                                {mov.tipo_movimiento === "Salida" && (
                                  <button 
                                    className="btn btn-sm btn-info ms-2"
                                    onClick={() => seleccionarMovimientoParaDevolucion(mov)}
                                  >
                                    <i className="fas fa-undo"></i> Devolver
                                  </button>
                                )}
                              </td>
                              <td>{mov.iva_aplicado}</td>
                              <td className="table-info">{mov.subtotal}</td>
                              <td>{mov.total_venta}</td>
                              <td>
                                {new Intl.NumberFormat("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                  minimumFractionDigits: 0,
                                }).format(mov.valor_unitario_movimiento)}
                              </td>
                              <td>{mov.motivo}</td>
                              <td className="table-info">{mov.cantidad}</td>
                              <td>{mov.observaciones}</td>
                              <td>
                                <button
                                  onClick={() =>
                                    openModal(
                                      2,
                                      mov.ID_STOCK,
                                      mov.ProductoID_Producto,
                                      mov.PresentacionID_Presentacion,
                                      mov.UsuarioID_Usuario,
                                      mov.UbicacionID_Ubicacion,
                                      mov.fecha_hora_movimiento,
                                      mov.tipo_movimiento,
                                      mov.iva_aplicado,
                                      mov.subtotal,
                                      mov.total_venta,
                                      mov.valor_unitario_movimiento,
                                      mov.motivo,
                                      mov.cantidad,
                                      mov.observaciones
                                    )
                                  }
                                  className="btn btn-warning"
                                >
                                  <i className="fa-solid fa-edit"></i>
                                </button>
                                &nbsp;
                                <button
                                  onClick={() => deleteMovimiento(mov.ID_STOCK)}
                                  className="btn btn-danger"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {showForm && (
                <div
                  id="ModalMovimiento"
                  className="modal-fade"
                  aria-hidden="true"
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <label className="h5">{title}</label>
                      </div>
                      <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                          <input type="hidden" id="ID_STOCK" value={ID_STOCK} />

                          <small className="form-text text-muted mb-2">
                            Ingrese Presentación
                          </small>
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="fas fa-pills"></i>
                            </span>
                            <select
                              className="form-control"
                              placeholder="Presentacion"
                              value={PresentacionID_Presentacion}
                              onChange={async (e) => {
                                const presentacionId = e.target.value;
                                setPresentacionID_Presentacion(
                                  presentacionId
                                );

                                if (presentacionId) {
                                  await getProductosByPresentacion(
                                    presentacionId
                                  );
                                } else {
                                  setProductosFiltrados(productos);
                                }

                                setProductoID_Producto("");
                              }}
                            >
                              <option value="">
                                Seleccione una Presentacion
                              </option>
                              {presentaciones.map((presentacion) => (
                                <option
                                  key={presentacion.ID_Presentacion}
                                  value={presentacion.ID_Presentacion}
                                >
                                  {presentacion.nombre_presentacion}
                                </option>
                              ))}
                            </select>
                          </div>

                          <small className="form-text text-muted mb-2">
                            Ingrese Producto de Movimiento
                          </small>
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="fas fa-notes-medical"></i>
                            </span>
                            <select
                              className="form-control"
                              placeholder="ID PRODUCTO"
                              value={ProductoID_Producto}
                              onChange={(e) =>
                                setProductoID_Producto(e.target.value)
                              }
                              disabled={!PresentacionID_Presentacion}
                            >
                              <option value="">
                                Seleccione un producto
                              </option>
                              {productosFiltrados.map((producto) => (
                                <option
                                  key={producto.ID_PRODUCTO}
                                  value={producto.ID_PRODUCTO}
                                >
                                  {producto.nombre} (
                                  {producto.nombre_presentacion})
                                </option>
                              ))}
                            </select>
                          </div>

                          <small className="form-text text-muted mb-2">
                            Ingrese Usuario
                          </small>
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="fas fa-user"></i>
                            </span>
                            <select
                              className="form-control"
                              placeholder="Usuario de movimiento"
                              value={UsuarioID_Usuario}
                              onChange={(e) =>
                                setUsuarioID_Usuario(e.target.value)
                              }
                            >
                              <option value="">
                                Seleccione un usuario
                              </option>
                              {usuario.map((user) => (
                                <option
                                  key={user.ID_Usuario}
                                  value={user.ID_Usuario}
                                >
                                  {user.nombre_usuario}
                                </option>
                              ))}
                            </select>
                          </div>

                          <small className="form-text text-muted mb-2">
                            Ingrese la Ubicacion del Producto
                          </small>
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="fas fa-map-pin"></i>
                            </span>
                            <select
                              className="form-control"
                              placeholder="Ubicacion del producto"
                              value={UbicacionID_Ubicacion}
                              onChange={(e) =>
                                setUbicacionID_Ubicacion(e.target.value)
                              }
                            >
                              <option value="">
                                Seleccione la Ubicacion
                              </option>
                              <option value="1">Almacén principal</option>
                              <option value="2">Almacén secundario</option>
                              <option value="3">
                                Estantería para medicamentos comunes
                              </option>
                              <option value="4">
                                Estantería para medicamentos controlados
                              </option>
                              <option value="5">
                                Refrigerador para medicamentos termolábiles
                              </option>
                              <option value="6">
                                Refrigerador para vacunas
                              </option>
                            </select>
                          </div>

                          <small className="form-text text-muted mb-2">
                            Ingrese Tipo de movimiento
                          </small>
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="fas fa-exchange-alt"></i>
                            </span>
                            <select
                              className="form-control"
                              placeholder="Tipo de Movimiento a realizar"
                              value={tipo_movimiento}
                              onChange={(e) =>
                                setTipo_movimiento(e.target.value)
                              }
                            >
                              <option value="">
                                Seleccione el tipo de movimiento
                              </option>
                              <option value="Entrada">Entrada</option>
                              <option value="Salida">Salida</option>
                            </select>
                          </div>

                          <small className="form-text text-muted mb-2">
                            Ingrese Cantidad
                          </small>
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="fas fa-boxes"></i>
                            </span>
                            <input
                              type="number"
                              id="cantidad"
                              className="form-control"
                              placeholder="Cantidad del producto"
                              value={cantidad}
                              onChange={(e) => setCantidad(e.target.value)}
                            />
                          </div>

                          <small className="form-text text-muted mb-2">
                            Ingrese el Motivo
                          </small>
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="fas fa-list-ol"></i>
                            </span>
                            <select
                              className="form-control"
                              placeholder="Tipo de Movimiento a realizar"
                              value={motivo}
                              onChange={(e) => setMotivo(e.target.value)}
                            >
                              <option value="">
                                Seleccione el Motivo del movimiento
                              </option>
                              <option value="Venta">Venta</option>
                              <option value="Entrada">
                                Reponer Producto
                              </option>
                              <option value="Devolucion_producto">
                                Devolucion del producto
                              </option>
                            </select>
                          </div>

                          {tipo_movimiento === "Salida" && (
                            <>
                              <small className="form-text text-muted mb-2">
                                Ingrese Valor unitario de Salida
                              </small>
                              <div className="input-group mb-3">
                                <span className="input-group-text">
                                  <i className="fas fa-dollar-sign"></i>
                                </span>
                                <input
                                  type="number"
                                  id="valor_unitario_movimiento"
                                  className="form-control"
                                  placeholder="Valor unitario movimiento"
                                  value={valor_unitario_movimiento}
                                  onChange={(e) => {
                                    const numericValue =
                                      e.target.value.replace(/\D/g, "");
                                    setValor_unitario_movimiento(
                                      numericValue
                                    );
                                  }}
                                />
                              </div>
                            </>
                          )}

                          <small className="form-text text-muted mb-2">
                            Ingrese Observación
                          </small>
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="fas fa-align-left"></i>
                            </span>
                            <input
                              type="text"
                              id="observaciones"
                              className="form-control"
                              placeholder="Observaciones"
                              value={observaciones}
                              onChange={(e) =>
                                setObservaciones(e.target.value)
                              }
                            />
                          </div>
                        </form>
                      </div>
                      <div className="d-grid col-6 mx-auto">
                        <button
                          type="button"
                          onClick={(e) => validar(e)}
                          className="btn btn-success"
                        >
                          <i className="fa-solid fa-floppy-disk"></i> Guardar
                        </button>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          id="btnCerrar"
                          className="btn btn-secondary"
                          onClick={closeModal}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal de Devolución */}
              {showDevolucionModal && movimientoSeleccionadoDevolucion && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Registrar Devolución</h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                      </div>
                      <div className="modal-body">
                        <div className="alert alert-info mb-3">
                          <p><strong>Producto:</strong> {movimientoSeleccionadoDevolucion.producto}</p>
                          <p><strong>Presentación:</strong> {movimientoSeleccionadoDevolucion.presentacion_nombre}</p>
                          <p><strong>Cantidad original:</strong> {movimientoSeleccionadoDevolucion.cantidad_original}</p>
                          <p><strong>Cantidad devuelta:</strong> {movimientoSeleccionadoDevolucion.cantidad_devuelta}</p>
                          <p><strong>Cantidad pendiente:</strong> {movimientoSeleccionadoDevolucion.cantidad_pendiente}</p>
                          <p><strong>Fecha de salida:</strong> {new Date(movimientoSeleccionadoDevolucion.fecha_hora_movimiento).toLocaleString()}</p>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Cantidad a devolver</label>
                          <input
                            type="number"
                            className="form-control"
                            value={cantidadDevolucion}
                            onChange={(e) => setCantidadDevolucion(e.target.value)}
                            min="1"
                            max={movimientoSeleccionadoDevolucion.cantidad_pendiente}
                            required
                          />
                          <div className="form-text">
                            Máximo disponible: {movimientoSeleccionadoDevolucion.cantidad_pendiente}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Motivo de la devolución</label>
                          <select
                            className="form-select"
                            value={motivoDevolucion}
                            onChange={(e) => setMotivoDevolucion(e.target.value)}
                            required
                          >
                            <option value="">Seleccione un motivo</option>
                            <option value="Producto defectuoso">Producto defectuoso</option>
                            <option value="Cliente no lo necesitó">Cliente no lo necesitó</option>
                            <option value="Error en el despacho">Error en el despacho</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Observaciones</label>
                          <textarea
                            className="form-control"
                            value={observacionesDevolucion}
                            onChange={(e) => setObservacionesDevolucion(e.target.value)}
                            rows="3"
                          ></textarea>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={closeModal}
                        >
                          Cancelar
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          onClick={procesarDevolucion}
                        >
                          Procesar Devolución
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Movimiento;