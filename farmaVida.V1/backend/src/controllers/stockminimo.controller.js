import db from '../config/db.js';
import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER || 'daniracyber@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'qtgw kigb jcsw lpzo';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

const enviarAlertaStockMinimo = async (productosBajoStock) => {
  const tablaProductos = productosBajoStock.map(producto => `
    <tr>
      <td style="padding: 10px; border: 1px solid #23539E;">${producto.ID_PRODUCTO}</td>
      <td style="padding: 10px; border: 1px solid #23539E;">${producto.nombre}</td>
      <td style="padding: 10px; border: 1px solid #23539E;">${producto.stock_minimo}</td>
      <td style="padding: 10px; border: 1px solid #23539E; color: red;">${producto.stock_actual}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: EMAIL_USER,
    to: 'daniracyber@gmail.com',
    subject: `Alerta: Productos con stock mínimo alcanzado`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #23539E;">Alerta de Stock Mínimo</h2>
        <p>Los siguientes productos han alcanzado su stock mínimo:</p>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #23539E;">
          <thead>
            <tr style="background-color: #23539E; color: white;">
              <th style="padding: 10px; border: 1px solid #23539E;">ID Producto</th>
              <th style="padding: 10px; border: 1px solid #23539E;">Nombre</th>
              <th style="padding: 10px; border: 1px solid #23539E;">Stock Mínimo</th>
              <th style="padding: 10px; border: 1px solid #23539E;">Stock Actual</th>
            </tr>
          </thead>
          <tbody>
            ${tablaProductos}
          </tbody>
        </table>
        <p style="margin-top: 20px;">Por favor, tome las medidas necesarias para reponer el stock.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Alerta enviada por correo para ${productosBajoStock.length} productos con stock bajo.`);
  } catch (error) {
    console.error(`Error al enviar la alerta por correo: ${error.message}`);
  }
};

export const verificarStockYEnviarAlerta = async (req, res) => {
    try {
      const query = `
        SELECT 
          p.ID_PRODUCTO,
          p.nombre,
          p.stock_minimo,
          COALESCE(SUM(CASE WHEN ms.tipo_movimiento = 'Entrada' THEN ms.cantidad ELSE -ms.cantidad END), 0) AS stock_actual
        FROM 
          producto p
        LEFT JOIN 
          movimiento ms ON p.ID_PRODUCTO = ms.ProductoID_PRODUCTO
        GROUP BY 
          p.ID_PRODUCTO
      `;
  
      const [productos] = await db.promise().query(query);
  
      const productosBajoStock = productos.filter(producto => producto.stock_actual < producto.stock_minimo);
  
      console.log("Productos con stock bajo:", productosBajoStock); 
  
      if (productosBajoStock.length > 0) {
        await enviarAlertaStockMinimo(productosBajoStock);
      }
  
      res.status(200).json({ productosBajoStock }); 
    } catch (error) {
      console.error("Error en la verificación de stock:", error);
      res.status(500).json({ message: "Error al verificar el stock", error: error.message });
    }
  };