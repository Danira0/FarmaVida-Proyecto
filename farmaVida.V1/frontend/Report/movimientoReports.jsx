import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

// Estilos para los reportes de movimiento
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
  entradaText: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  salidaText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
});

// Componente BaseReport para movimientos
const BaseReport = ({ title, children, data, fechaInicio, fechaFin }) => {
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
          {fechaInicio || fechaFin ? (
            <Text style={{ textAlign: 'center', fontSize: 10, marginBottom: 10 }}>
              {fechaInicio && `Desde: ${formatDate(fechaInicio)} `}
              {fechaFin && `Hasta: ${formatDate(fechaFin)}`}
            </Text>
          ) : null}
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
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 1. Reporte de todos los movimientos
export const AllMovementsReport = ({ data }) => {
  return (
    <BaseReport title="INFORME GENERAL DE MOVIMIENTOS" data={data}>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>ID</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Fecha/Hora</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Producto</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Cantidad</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Tipo</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Usuario</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Ubicación</Text></View>
        </View>

        {data.map((movimiento, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(movimiento.ID_Movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatDate(movimiento.fecha_hora_movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(movimiento.nombre_producto)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(movimiento.cantidad_movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}>
              <Text style={movimiento.tipo_movimiento === 'Entrada' ? styles.entradaText : styles.salidaText}>
                {formatValue(movimiento.tipo_movimiento)}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(movimiento.nombre_usuario)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(movimiento.nombre_ubicacion)}</Text></View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};

// 2. Reporte de movimientos por fecha
export const MovementsByDateReport = ({ data, fechaInicio, fechaFin }) => {
  return (
    <BaseReport 
      title="MOVIMIENTOS POR FECHA" 
      data={data}
      fechaInicio={fechaInicio}
      fechaFin={fechaFin}
    >
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Fecha/Hora</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Producto</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Cantidad</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Tipo</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Presentación</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Usuario</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Ubicación</Text></View>
        </View>

        {data.map((movimiento, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatDate(movimiento.fecha_hora_movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(movimiento.nombre_producto)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(movimiento.cantidad_movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}>
              <Text style={movimiento.tipo_movimiento === 'Entrada' ? styles.entradaText : styles.salidaText}>
                {formatValue(movimiento.tipo_movimiento)}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(movimiento.nombre_presentacion)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(movimiento.nombre_usuario)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(movimiento.nombre_ubicacion)}</Text></View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};

// 3. Reporte de movimientos por producto
export const MovementsByProductReport = ({ data, productoId }) => {
  return (
    <BaseReport 
      title="MOVIMIENTOS POR PRODUCTO" 
      data={data}
    >
      <View style={styles.section}>
        <Text>Producto: {data[0]?.nombre_producto || 'N/A'}</Text>
      </View>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Fecha/Hora</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Tipo</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Cantidad</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Presentación</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Usuario</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Ubicación</Text></View>
        </View>

        {data.map((movimiento, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatDate(movimiento.fecha_hora_movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}>
              <Text style={movimiento.tipo_movimiento === 'Entrada' ? styles.entradaText : styles.salidaText}>
                {formatValue(movimiento.tipo_movimiento)}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(movimiento.cantidad_movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(movimiento.nombre_presentacion)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(movimiento.nombre_usuario)} {formatValue(movimiento.apellido_usuario)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(movimiento.nombre_ubicacion)}</Text></View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};

// 4. Reporte de movimientos por usuario
export const MovementsByUserReport = ({ data, usuarioId }) => {
  return (
    <BaseReport 
      title="MOVIMIENTOS POR USUARIO" 
      data={data}
    >
      <View style={styles.section}>
        <Text>Usuario: {data[0]?.nombre_usuario || 'N/A'} {data[0]?.apellido_usuario || ''}</Text>
      </View>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Fecha/Hora</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Producto</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Cantidad</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Tipo</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Presentación</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Ubicación</Text></View>
        </View>

        {data.map((movimiento, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatDate(movimiento.fecha_hora_movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(movimiento.nombre_producto)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(movimiento.cantidad_movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}>
              <Text style={movimiento.tipo_movimiento === 'Entrada' ? styles.entradaText : styles.salidaText}>
                {formatValue(movimiento.tipo_movimiento)}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(movimiento.nombre_presentacion)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(movimiento.nombre_ubicacion)}</Text></View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};

// 5. Reporte de movimientos por tipo
export const MovementsByTypeReport = ({ data, tipo }) => {
  return (
    <BaseReport 
      title={`MOVIMIENTOS POR TIPO (${tipo || 'N/A'})`} 
      data={data}
    >
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Fecha/Hora</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Producto</Text></View>
          <View style={[styles.tableCol, { width: '10%' }]}><Text>Cantidad</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text>Usuario</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Presentación</Text></View>
          <View style={[styles.tableCol, { width: '20%' }]}><Text>Ubicación</Text></View>
        </View>

        {data.map((movimiento, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatDate(movimiento.fecha_hora_movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(movimiento.nombre_producto)}</Text></View>
            <View style={[styles.tableCol, { width: '10%' }]}><Text>{formatValue(movimiento.cantidad_movimiento)}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>{formatValue(movimiento.nombre_usuario)} {formatValue(movimiento.apellido_usuario)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(movimiento.nombre_presentacion)}</Text></View>
            <View style={[styles.tableCol, { width: '20%' }]}><Text>{formatValue(movimiento.nombre_ubicacion)}</Text></View>
          </View>
        ))}
      </View>
    </BaseReport>
  );
};