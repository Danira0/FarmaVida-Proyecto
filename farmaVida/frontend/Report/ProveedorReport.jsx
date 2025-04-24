import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

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
});

const BaseReport = ({ title, children, data }) => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
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
          <Text>Generado por: Sistema de Inventario</Text>
        </View>
      </Page>
    </Document>
  );
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return value.toString();
};

// 1. Reporte de todos los laboratorios
export const LaboratorioReport = ({ data }) => {
  return (
    <BaseReport title="INFORME DE TODOS LOS LABORATORIOS/PROVEEDORES" data={data}>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>ID</Text></View>
          <View style={[styles.tableCol, { width: '25%' }]}><Text>Nombre</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Dirección</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Teléfono</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Email</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Estado</Text></View>
        </View>

        {Array.isArray(data) && data.map((laboratorio, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(laboratorio.ID_Laboratorio)}</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text>{formatValue(laboratorio.nombre)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(laboratorio.direccion)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(laboratorio.telefono)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(laboratorio.email)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{laboratorio.estado === 1 ? 'Activo' : 'Inactivo'}</Text></View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};

// 2. Reporte de un laboratorio específico
export const ProveedorReport = ({ data }) => {
  if (!data) return null;

  return (
    <BaseReport title={`INFORME DEL LABORATORIO ${data.nombre || ''}`} data={data}>
      <View style={styles.section}>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ width: '30%', fontWeight: 'bold' }}>ID:</Text>
          <Text style={{ width: '70%' }}>{formatValue(data.ID_Laboratorio)}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ width: '30%', fontWeight: 'bold' }}>Nombre:</Text>
          <Text style={{ width: '70%' }}>{formatValue(data.nombre)}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ width: '30%', fontWeight: 'bold' }}>Dirección:</Text>
          <Text style={{ width: '70%' }}>{formatValue(data.direccion)}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ width: '30%', fontWeight: 'bold' }}>Teléfono:</Text>
          <Text style={{ width: '70%' }}>{formatValue(data.telefono)}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ width: '30%', fontWeight: 'bold' }}>Email:</Text>
          <Text style={{ width: '70%' }}>{formatValue(data.email)}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <Text style={{ width: '30%', fontWeight: 'bold' }}>Estado:</Text>
          <Text style={{ width: '70%' }}>{data.estado === 1 ? 'Activo' : 'Inactivo'}</Text>
        </View>
      </View>
    </BaseReport>
  );
};

// 3. Reporte de productos por laboratorio
export const ProductoPorLaboratorioReport = ({ data }) => {
  return (
    <BaseReport title="INFORME DE PRODUCTOS POR LABORATORIO" data={data}>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>ID</Text></View>
          <View style={[styles.tableCol, { width: '25%' }]}><Text>Nombre</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Precio</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Categoría</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Presentación</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Stock</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Lote</Text></View>
        </View>

        {Array.isArray(data) && data.map((producto, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(producto.ID_PRODUCTO)}</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text>{formatValue(producto.nombre)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>$ {formatValue(producto.valor_unitario)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.nombre_categoria)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(producto.nombre_presentacion)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(producto.stock_actual)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(producto.lote)}</Text></View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};