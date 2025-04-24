import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

// Estilos mejorados para todos los reportes
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  table: {
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },
  tableCol: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#eeeeee',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    fontSize: 8,
    textAlign: 'center',
  },
  warningText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  successText: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
});

// Componente BaseReport común para todos los reportes
const BaseReport = ({ title, children, data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text>No hay datos disponibles para generar el reporte</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>Sistema de Inventario</Text>
          <Text>Fecha: {new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {children}

        <View style={styles.footer}>
          <Text>Total registros: {data.length} | Generado por: Sistema de Inventario</Text>
        </View>
      </Page>
    </Document>
  );
};

// Función para formatear valores
const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'number') return value.toLocaleString();
  return value.toString();
};

// Formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

// 1. Reporte de todos los productos
export const AllProductsReport = ({ data }) => {
  if (!data || !Array.isArray(data)) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Error: Datos no válidos para el reporte general</Text>
        </Page>
      </Document>
    );
  }

  return (
    <BaseReport title="INFORME GENERAL DE PRODUCTOS" data={data}>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Código</Text></View>
          <View style={[styles.tableCol, { width: '25%' }]}><Text>Nombre</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Precio</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Categoría</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Laboratorio</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Stock</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Lote</Text></View>
        </View>

        {data.map((producto, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(producto.ID_PRODUCTO)}</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text>{formatValue(producto.nombre)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>$ {formatValue(producto.valor_unitario)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.nombre_categoria)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.nombre_laboratorio)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(producto.stock_actual)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(producto.lote)}</Text></View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};

// 2. Reporte de productos por vencer
export const ExpiringProductsReport = ({ data }) => {
  if (!data || !Array.isArray(data)) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Error: Datos no válidos para el reporte de productos por vencer</Text>
        </Page>
      </Document>
    );
  }

  return (
    <BaseReport title="PRODUCTOS POR VENCER" data={data}>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Código</Text></View>
          <View style={[styles.tableCol, { width: '25%' }]}><Text>Nombre</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Laboratorio</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Lote</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Fecha Venc.</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Días Restantes</Text></View>
        </View>

        {data.map((producto, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.ID_PRODUCTO)}</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text>{formatValue(producto.nombre)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.nombre_laboratorio)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.lote)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatDate(producto.fecha_vencimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}>
              <Text style={producto.dias_para_vencer <= 30 ? styles.warningText : {}}>
                {formatValue(producto.dias_para_vencer)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};

// 3. Reporte de productos en stock
export const StockProductsReport = ({ data }) => {
  if (!data || !Array.isArray(data)) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Error: Datos no válidos para el reporte de stock</Text>
        </Page>
      </Document>
    );
  }

  return (
    <BaseReport title="INFORME DE STOCK DE PRODUCTOS" data={data}>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Código</Text></View>
          <View style={[styles.tableCol, { width: '25%' }]}><Text>Nombre</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Stock Actual</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Stock Mínimo</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Diferencia</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Estado</Text></View>
        </View>

        {data.map((producto, index) => {
          const diferencia = producto.stock_actual - producto.stock_minimo;
          const estado = diferencia >= 0 ? 'SUFICIENTE' : 'INSUFICIENTE';
          
          return (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(producto.ID_PRODUCTO)}</Text></View>
              <View style={[styles.tableCol, { width: '25%' }]}><Text>{formatValue(producto.nombre)}</Text></View>
              <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.stock_actual)}</Text></View>
              <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.stock_minimo)}</Text></View>
              <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(diferencia)}</Text></View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={diferencia >= 0 ? styles.successText : styles.warningText}>
                  {estado}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </BaseReport>
  );
};

// 4. Reporte de productos por fecha de ingreso
export const ProductsByDateReport = ({ data, fechaInicio, fechaFin }) => {
  if (!data || !Array.isArray(data)) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Error: Datos no válidos para el reporte por fecha de ingreso</Text>
        </Page>
      </Document>
    );
  }

  return (
    <BaseReport 
      title={`PRODUCTOS POR FECHA DE INGRESO (${fechaInicio || 'sin inicio'} - ${fechaFin || 'sin fin'})`} 
      data={data}
    >
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Código</Text></View>
          <View style={[styles.tableCol, { width: '25%' }]}><Text>Nombre</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Fecha Ingreso</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Lote</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Proveedor</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Responsable</Text></View>
        </View>

        {data.map((producto, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(producto.ID_PRODUCTO)}</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text>{formatValue(producto.nombre)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatDate(producto.fecha_entrada)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.lote)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.proveedor || 'N/A')}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(producto.responsable || 'N/A')}</Text></View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};