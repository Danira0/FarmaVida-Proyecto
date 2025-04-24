import db from "../config/db.js";
import nodemailer from "nodemailer";
import cron from "node-cron";

const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecret';
const EMAIL_USER = process.env.EMAIL_USER || 'daniracyber@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'qtgw kigb jcsw lpzo';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const sendEmailAlert = (productos) => {
  const htmlContent = `
    <h2>Alerta: Medicamentos próximos a vencer</h2>
    <p>Los siguientes medicamentos están próximos a vencer en 7 días hábiles:</p>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #23539E; color: white;">
          <th style="border: 1px solid #ddd; padding: 8px;">ID Producto</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Nombre</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Fecha de Vencimiento</th>
        </tr>
      </thead>
      <tbody>
        ${productos
          .map(
            (producto) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${producto.ID_PRODUCTO}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${producto.nombre}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${formatDate(producto.fecha_vencimiento)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;

  const mailOptions = {
    from: EMAIL_USER,
    to: EMAIL_USER,
    subject: "Alerta: Medicamentos próximos a vencer",
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error enviando el correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });
};

const checkCaducidad = async () => {
  try {
    const [result] = await db.promise().query(
      `SELECT 
        p.ID_PRODUCTO,
        p.nombre,
        p.fecha_vencimiento
      FROM producto p
      WHERE p.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    );

    if (result.length > 0) {
      console.warn("Medicamentos próximos a vencer encontrados:", result);
      sendEmailAlert(result); 
    } else {
      console.log("No hay medicamentos próximos a vencer");
    }
  } catch (error) {
    console.error("Error al verificar la fecha de vencimiento:", error);
  }
};

cron.schedule("0 10 * * *", () => {
  console.log("Verificando fecha de vencimiento de productos...");
  checkCaducidad();
});

export const getFechavenci = async (req, res) => {
  try {
    const [result] = await db.promise().query(
      `SELECT 
        p.ID_PRODUCTO,
        p.nombre,
        p.fecha_vencimiento
      FROM producto p
      WHERE p.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    );

    if (result.length > 0) {
      console.warn("Medicamentos próximos a vencer encontrados:", result);
      res.status(200).json({
        message: "Verificación de medicamentos próximos a vencer completada",
        expiringMedicines: result, 
      });
    } else {
      console.log("No hay medicamentos próximos a vencer");
      res.status(200).json({
        message: "No hay medicamentos próximos a vencer",
        expiringMedicines: [], 
      });
    }
  } catch (error) {
    console.error("Error al verificar la fecha de vencimiento:", error);
    res.status(500).json({
      message: "Error al verificar la fecha de vencimiento",
      error: error.message,
    });
  }
};