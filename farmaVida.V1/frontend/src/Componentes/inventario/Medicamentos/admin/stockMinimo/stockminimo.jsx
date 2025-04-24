import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../Auth/auth.jsx";
import Menu from "../../../../home/admimenulateral.jsx";

function Stockminimo() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [stockminimo, setStockminimo] = useState([]);


  const getverificarStockYEnviarAlerta = async () => {
    try {
      const respuesta = await axios.get("http://localhost:4000/api/verificar-stock");
      setStockminimo(respuesta.data.productosBajoStock || []); 
    } catch (error) {
      console.error("Error al obtener los productos con stock mínimo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron obtener los productos con stock mínimo.",
      });
    }
  };

  useEffect(() => {
    getverificarStockYEnviarAlerta();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="boton-atras-container">
        <button onClick={handleGoBack} className="btn btn-primary fle_atras">
          <img src="/Assets/flecha_atras.png" alt="flecha_a" />
        </button>
      </div>
      <nav>
        <div className="head row">
          <div className="logos col p-3">
            <img src="/Assets/logo.png" alt="Logo de la farmacia" width="250px" />
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
          <Menu />
          <div className="col-lg-10 col-md-5 mt-0">
            <div className="App">
              <div className="container-fluid">
                <div className="row mt-5">
                  <div className="col-md-3 offset-md-4"></div>
                </div>
                <div className="tabla_medic row mt-5">
                  <div className="col-10 col-lg-8">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr className="table-primary">
                            <th>ID Producto</th>
                            <th>Nombre</th>
                            <th>Stock Mínimo</th>
                            <th>Stock Actual</th>
                          </tr>
                        </thead>
                        <tbody className="table-group-divider">
                          {stockminimo.map((producto) => (
                            <tr key={producto.ID_PRODUCTO}>
                              <td className="table-info">{producto.ID_PRODUCTO}</td>
                              <td>{producto.nombre}</td>
                              <td className="table-info">{producto.stock_minimo}</td>
                              <td style={{ color: producto.stock_actual < producto.stock_minimo ? "red" : "black" }}>
                                {producto.stock_actual}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stockminimo;
