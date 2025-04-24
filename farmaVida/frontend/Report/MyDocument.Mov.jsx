import React, { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axios from "axios";
import {
  AllMovementsReport,
  MovementsByDateReport,
  MovementsByProductReport,
  MovementsByUserReport,
  MovementsByTypeReport
} from "./MovimientoReports";

export const MyDocumentMovimientos = ({ 
  reportType, 
  fechaInicio, 
  fechaFin,
  productoId,
  usuarioId,
  tipoMovimiento
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let endpoint = "";
        let params = {};
        
        switch (reportType) {
          case "todos":
            endpoint = "http://localhost:4000/api/movimiento/todos";
            break;
          case "fechas":
            endpoint = "http://localhost:4000/api/movimiento/fechas";
            params = { fechaInicio, fechaFin };
            break;
          case "porproducto":
            endpoint = `http://localhost:4000/api/movimiento/porproducto/${productoId}`;
            break;
          case "usuario":
            endpoint = `http://localhost:4000/api/movimiento/usuario/${usuarioId}`;
            break;
          case "tipo":
            endpoint = `http://localhost:4000/api/movimiento/tipo/${tipoMovimiento}`;
            break;
          default:
            endpoint = "http://localhost:4000/api/movimiento/todos";
        }

        const response = await axios.get(endpoint, { params });
        
        if (!response.data) {
          throw new Error("No se recibieron datos del servidor");
        }
        
        console.log(`Datos recibidos para ${reportType}:`, response.data);
        setData(response.data);
      } catch (error) {
        console.error(`Error al obtener los datos (${reportType}):`, error);
        setError(`Error al cargar los datos: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportType, fechaInicio, fechaFin, productoId, usuarioId, tipoMovimiento]);

  const getReportComponent = () => {
    if (!data) return null;
    
    switch (reportType) {
      case "todos":
        return <AllMovementsReport data={data} />;
      case "fechas":
        return <MovementsByDateReport 
                 data={data} 
                 fechaInicio={fechaInicio} 
                 fechaFin={fechaFin} 
               />;
      case "porproducto":
        return <MovementsByProductReport 
                 data={data} 
                 productoId={productoId} 
               />;
      case "usuario":
        return <MovementsByUserReport 
                 data={data} 
                 usuarioId={usuarioId} 
               />;
      case "tipo":
        return <MovementsByTypeReport 
                 data={data} 
                 tipo={tipoMovimiento} 
               />;
      default:
        return <AllMovementsReport data={data} />;
    }
  };

  const getFileName = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    switch (reportType) {
      case "todos":
        return `Informe_General_Movimientos_${dateStr}.pdf`;
      case "fechas":
        return `Movimientos_Por_Fecha_${fechaInicio || ''}_${fechaFin || ''}_${dateStr}.pdf`;
      case "porproducto":
        return `Movimientos_Por_Producto_${productoId || ''}_${dateStr}.pdf`;
      case "usuario":
        return `Movimientos_Por_Usuario_${usuarioId || ''}_${dateStr}.pdf`;
      case "tipo":
        return `Movimientos_Por_Tipo_${tipoMovimiento || ''}_${dateStr}.pdf`;
      default:
        return `Informe_Movimientos_${dateStr}.pdf`;
    }
  };

  if (loading) {
    return <div style={{ padding: '10px', color: '#666', textAlign: 'center' }}>Cargando datos para el reporte...</div>;
  }

  if (error) {
    return <div style={{ padding: '10px', color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  if (!data || data.length === 0) {
    return <div style={{ padding: '10px', color: 'orange', textAlign: 'center' }}>No hay datos disponibles para mostrar</div>;
  }

  return (
    <PDFDownloadLink
      document={getReportComponent()}
      fileName={getFileName()}
      style={{
        textDecoration: "none",
        padding: "12px 20px",
        color: "#ffffff",
        backgroundColor: "#4a6baf",
        border: "none",
        borderRadius: "4px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "background-color 0.3s",
        ':hover': {
          backgroundColor: "#3a5699",
        }
      }}
    >
      {({ loading }) => (
        loading ? "Generando PDF..." : "Descargar Reporte en PDF"
      )}
    </PDFDownloadLink>
  );
};