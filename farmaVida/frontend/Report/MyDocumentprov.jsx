import React, { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axios from "axios";
import {
  LaboratorioReport,
  ProductoPorLaboratorioReport,
  ProveedorReport
} from "./ProveedorReport.jsx";

export const MyDocumentProv = ({ 
  reportType, 
  laboratorioId 
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
        
        switch (reportType) {
          case "laboratorios":
            endpoint = "http://localhost:4000/api/proveedor/todos";
            break;
          case "laboratorio":
            endpoint = `http://localhost:4000/api/proveedor/laboratorio/${laboratorioId}`;
            break;
          case "productos":
            endpoint = `http://localhost:4000/api/proveedor/productoporlaboratorio/${laboratorioId}`;
            break;
          default:
            endpoint = "http://localhost:4000/api/proveedor/todos";
        }

        const response = await axios.get(endpoint);
        
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

    // Solo hacer fetch si es un informe que no requiere ID o si el ID está presente
    if (reportType !== "laboratorios" && !laboratorioId) {
      setError("Se requiere el ID del laboratorio para este informe");
      setLoading(false);
      return;
    }

    fetchData();
  }, [reportType, laboratorioId]);

  const getReportComponent = () => {
    if (!data) return null;
    
    switch (reportType) {
      case "laboratorios":
        return <LaboratorioReport data={data} />;
      case "laboratorio":
        return <ProveedorReport data={data} />;
      case "productos":
        return <ProductoPorLaboratorioReport data={data} />;
      default:
        return <LaboratorioReport data={data} />;
    }
  };

  const getFileName = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    switch (reportType) {
      case "laboratorios":
        return `Informe_General_Laboratorios_${dateStr}.pdf`;
      case "laboratorio":
        return `Informe_Laboratorio_${laboratorioId || ''}_${dateStr}.pdf`;
      case "productos":
        return `Productos_Laboratorio_${laboratorioId || ''}_${dateStr}.pdf`;
      default:
        return `Informe_Proveedores_${dateStr}.pdf`;
    }
  };

  if (loading) {
    return <div style={{ padding: '10px', color: '#666', textAlign: 'center' }}>Cargando datos para el reporte...</div>;
  }

  if (error) {
    return <div style={{ padding: '10px', color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
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