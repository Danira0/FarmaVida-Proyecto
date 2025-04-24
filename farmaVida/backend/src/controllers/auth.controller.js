import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { createUser, getUserByEmail, savePasswordResetToken, updateUserPassword, getUserByResetToken, getUserById } from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecret';
const EMAIL_USER = process.env.EMAIL_USER || 'daniracyber@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'qtgw kigb jcsw lpzo';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export const register = async (req, res) => {
  const { correo } = req.query;
  try {
    const { nombre, apellido, correo, nombre_usuario, contrasena_usuario, ROLID_ROL } = req.body;

    if (!nombre || !apellido || !correo || !nombre_usuario || !contrasena_usuario || ![1, 2].includes(Number(ROLID_ROL))) {
      return res.status(400).json({ message: 'Campos requeridos faltantes o inválidos' });
    }

    const checkUserQuery = 'SELECT * FROM usuario WHERE correo = ?';
    const [existingUser] = await db.promise().execute(checkUserQuery, [correo]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El correo ya está en uso' });
    }

    const rolDescripcion = Number(ROLID_ROL) === 1 ? 'Administrador' : 'Empleado';

    const adminMailOptions = {
      from: `"Farmavida" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: 'Nuevo Usuario Registrado - Farmavida',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #23539E;">Notificación de Registro</h2>
          <p style="font-size: 16px; color: #333;">
            Se ha registrado un nuevo usuario con los siguientes datos:
          </p>
          <ul style="font-size: 16px; color: #333;">
            <li><strong>Nombre:</strong> ${nombre} ${apellido}</li>
            <li><strong>Correo:</strong> ${correo}</li>
            <li><strong>Rol:</strong> ${rolDescripcion}</li>
          </ul>
          <p style="font-size: 16px; color: #333;">
            Por favor, selecciona una opción para aprobar o denegar este registro:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="http://localhost:4000/api/verify?action=aprobar&correo=${correo}&nombre=${nombre}&apellido=${apellido}&nombre_usuario=${nombre_usuario}&ROLID_ROL=${ROLID_ROL}&contrasena_usuario=${contrasena_usuario}" style="margin-right: 10px; text-decoration: none; padding: 10px 20px; background-color: #4CAF50; color: white; border-radius: 5px;">Aprobar</a>
            <a href="http://localhost:4000/api/verify?action=denegar&correo=${correo}" style="text-decoration: none; padding: 10px 20px; background-color: #f44336; color: white; border-radius: 5px;">Denegar</a>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(adminMailOptions);
    res.status(200).json({
      message: 'Notificación enviada al administrador para aprobación.',
    });
  } catch (error) {
    console.error('Error al enviar la notificación al administrador:', error);
    return res.status(500).json({ message: 'Hubo un problema al enviar la notificación.', error: error.message });
  }
};

export const approveUser = async (req, res) => {
  const { correo, nombre, apellido, nombre_usuario, ROLID_ROL, contrasena_usuario } = req.query;
  if (!correo || !nombre || !apellido || !nombre_usuario || !ROLID_ROL || !contrasena_usuario) {
    return res.status(400).json({ message: 'Información incompleta para aprobar al usuario.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(contrasena_usuario, 10);
    const fechaRegistro = new Date();

    const { error, message } = await createUser({
      nombre,
      apellido,
      correo,
      nombre_usuario,
      contrasena_usuario: hashedPassword,
      ROLID_ROL,
      fecha_registro: fechaRegistro,
    });

    if (error) {
      return res.status(500).json({ message: 'Error al registrar al usuario.', error: message });
    }

    const userMailOptions = {
      from: `"Farmavida" <${EMAIL_USER}>`,
      to: correo,
      subject: 'Registro Aprobado - Farmavida',
      html: `
        <p>¡Hola!</p>
        <p>Tu registro en Farmavida ha sido aprobado por el administrador. Ahora puedes acceder al sistema.</p>
        <p>Saludos,</p>
        <p>Drogueria Farmavida</p>
      `,
    };

    await transporter.sendMail(userMailOptions);

    res.status(200).json({ message: 'El usuario ha sido aprobado y notificado.' });
  } catch (error) {
    console.error('Error al aprobar al usuario:', error);
    return res.status(500).json({ message: 'Hubo un problema al aprobar al usuario.', error: error.message });
  }
};

export const denyUser = async (req, res) => {
  const { correo } = req.query;

  try {
    const userMailOptions = {
      from: `"Farmavida" <${EMAIL_USER}>`,
      to: correo,
      subject: 'Registro Denegado - Farmavida',
      html: `
        <p>¡Hola!</p>
        <p>Lamentamos informarte que tu registro en Farmavida ha sido denegado.</p>
        <p>Si tienes preguntas, por favor contáctanos.</p>
        <p>Saludos,</p>
        <p>El equipo de Farmavida</p>
      `,
    };

    await transporter.sendMail(userMailOptions);

    res.status(200).json({ message: 'El usuario ha sido denegado y notificado.' });
  } catch (error) {
    console.error('Error al denegar al usuario:', error);
    return res.status(500).json({ message: 'Hubo un problema al denegar al usuario.', error: error.message });
  }
};

export const checkApproval = async (req, res) => {
  const { correo } = req.query;

  if (!correo) {
    return res.status(400).json({ message: 'Correo electrónico es requerido.' });
  }

  try {
    const query = 'SELECT usuario FROM usuario WHERE correo = ?';
    const [results] = await db.promise().execute(query, [correo]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const usuario = results[0];
    res.status(200).json({ aprobado: usuario.aprobado });
  } catch (error) {
    console.error('Error al verificar la aprobación del usuario:', error);
    return res.status(500).json({ message: 'Hubo un problema al verificar la aprobación.', error: error.message });
  }
};

export const login = async (req, res) => {
  const { nombre_usuario, contrasena_usuario, requestedRole } = req.body;

  if (!nombre_usuario || !contrasena_usuario || !requestedRole) {
    return res.status(400).json({ message: 'Nombre de usuario, contraseña y rol son requeridos.' });
  }

  const query = `
    SELECT usuario.*, rol.descripcion AS rol  
    FROM usuario 
    JOIN rol ON usuario.ROLID_ROL = rol.ID_ROL 
    WHERE usuario.nombre_usuario = ?`;

  try {
    const [results] = await db.promise().execute(query, [nombre_usuario]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const usuario = results[0];

    if (Number(requestedRole) !== usuario.ROLID_ROL) {
      return res.status(403).json({ message: 'No tienes permiso para acceder con este rol.' });
    }

    const passwordMatch = await bcrypt.compare(contrasena_usuario, usuario.contrasena_usuario);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    const payload = {
      usuarioId: usuario.ID_Usuario,
      nombre: usuario.nombre,
      rol: usuario.rol,
      rolId: usuario.ROLID_ROL
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) {
        console.error('Error al generar el token JWT:', err);
        return res.status(500).json({ message: 'Hubo un problema al generar el token.', error: err });
      }

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.status(200).json({
        message: 'Login exitoso.',
        token,
        user: {
          id: usuario.ID_Usuario,
          nombre: usuario.nombre,
          rol: usuario.rol,
          rolId: usuario.ROLID_ROL
        },
      });
    });
  } catch (error) {
    console.error('Error al procesar la solicitud de login:', error);
    return res.status(500).json({ message: 'Hubo un problema al procesar la solicitud.', error: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  return res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
}

export const requestPasswordReset = async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ message: 'El correo electrónico es requerido.' });
  }

  try {
    const user = await getUserByEmail(correo);
    
    if (!user) {
      return res.status(200).json({ 
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.' 
      });
    }

    const resetToken = jwt.sign({ userId: user.ID_Usuario }, JWT_SECRET, { expiresIn: '10m' });
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos desde ahora

    // Guardar token en la base de datos
    const saved = await savePasswordResetToken(user.ID_Usuario, resetToken, expirationDate);
    
    if (!saved) {
      throw new Error('No se pudo guardar el token de recuperación');
    }

    // Generar código de verificación de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Enviar correo con el código
    const mailOptions = {
      from: `"Farmavida" <${EMAIL_USER}>`,
      to: user.correo,
      subject: 'Restablecimiento de Contraseña - Farmavida',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #23539E;">Restablecer Contraseña</h2>
          <p style="font-size: 16px; color: #333;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
          </p>
          <p style="font-size: 16px; color: #333;">
            Utiliza el siguiente código de verificación para continuar con el proceso:
          </p>
          <div style="text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; color: #23539E;">
            ${verificationCode}
          </div>
          <p style="font-size: 14px; color: #777;">
            Este código expirará en 10 minutos. Si no solicitaste este cambio, por favor ignora este mensaje.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Enviar respuesta (no enviamos el código en la respuesta por seguridad)
    res.status(200).json({ 
      message: 'Se ha enviado un código de verificación a tu correo electrónico.',
      token: resetToken // Enviamos el token para que el frontend lo use en el siguiente paso
    });

  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    return res.status(500).json({ 
      message: 'Hubo un problema al procesar tu solicitud.', 
      error: error.message 
    });
  }
};

export const verifyResetCode = async (req, res) => {
  const { token, code } = req.body;

  if (!token || !code) {
    return res.status(400).json({ message: 'Token y código son requeridos.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserByResetToken(token);

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    // Generar un nuevo token específico para reset de contraseña
    const passwordResetToken = jwt.sign(
      { 
        userId: user.ID_Usuario, 
        purpose: 'password_reset'  // Asegúrate de incluir esto
      }, 
      JWT_SECRET, 
      { expiresIn: '10m' }
    );

    res.status(200).json({ 
      message: 'Código verificado correctamente.',
      resetToken: passwordResetToken  // Este es el token que debe usarse en reset-password
    });

  } catch (error) {
    console.error('Error en verifyResetCode:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'El token ha expirado. Por favor, solicita un nuevo código.' });
    }
    return res.status(500).json({ 
      message: 'Hubo un problema al verificar el código.', 
      error: error.message 
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token y nueva contraseña son requeridos.' });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ message: 'Token inválido para esta operación.' });
    }

    // Usar el userId del token decodificado
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    const updated = await updateUserPassword(user.ID_Usuario, hashedPassword);
    
    if (!updated) {
      throw new Error('No se pudo actualizar la contraseña');
    }

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'El token ha expirado. Por favor, solicita un nuevo código.' });
    }
    return res.status(500).json({ 
      message: 'Hubo un problema al actualizar la contraseña.', 
      error: error.message 
    });
  }
};