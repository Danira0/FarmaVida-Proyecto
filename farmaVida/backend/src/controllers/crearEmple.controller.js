import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const getEmpleados = async (req, res) => {
    try {
        const [result] = await db.promise().query("SELECT * FROM usuario WHERE ROLID_ROL = 2");
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener el Empleado", error);
        res.status(500).json({ error: error.message });
    }
};

export const createEmple = async (req, res) => {
    const { nombre, apellido, correo, nombre_usuario, contrasena_usuario, ROLID_ROL } = req.body;
    
    if (!nombre || !apellido || !correo || !nombre_usuario || !contrasena_usuario) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    if (ROLID_ROL !== 2) {
        return res.status(403).json({ message: "Solo se pueden registrar empleados" });
    }

    const checkUserQuery = 'SELECT * FROM usuario WHERE correo = ?';
    const [existingUser] = await db.promise().execute(checkUserQuery, [correo]);

    if (existingUser.length > 0) {
        return res.status(400).json({ message: 'El correo ya está en uso' });
    }

    try {
        const hashedPassword = await bcrypt.hash(contrasena_usuario, 10);

        const query = `INSERT INTO usuario (nombre, apellido, correo, nombre_usuario, contrasena_usuario, ROLID_ROL) VALUES (?, ?, ?, ?, ?, 2)`;

        await db.promise().execute(query, [nombre, apellido, correo, nombre_usuario, hashedPassword]);

        res.status(201).json({ message: "Empleado creado correctamente" });
    } catch (error) {
        console.error("Error al crear el Empleado :", error);
        res.status(500).json({ message: "Error al crear el Empleado", error: error.message });
    }
};

export const updateEmple = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, correo, nombre_usuario, contrasena_usuario } = req.body;

    if (!nombre || !apellido || !correo || !nombre_usuario || !contrasena_usuario) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    try {
        const [rows] = await db.promise().query("SELECT * FROM usuario WHERE ID_Usuario = ? AND ROLID_ROL = 2", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Empleado no encontrado o no autorizado" });
        }

        const hashedPassword = await bcrypt.hash(contrasena_usuario, 10);

        const query = `UPDATE usuario SET nombre = ?, apellido = ?, correo = ?, nombre_usuario = ?, contrasena_usuario = ? WHERE ID_Usuario = ? AND ROLID_ROL = 2`;

        const [result] = await db.promise().execute(query, [nombre, apellido, correo, nombre_usuario, hashedPassword, id]);

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: "Error al actualizar datos del empleado" });
        }

        res.status(200).json({ message: "Empleado actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar el Empleado:", error);
        res.status(500).json({ message: "Error al actualizar el Empleado", error: error.message });
    }
};

export const deleteEmple = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "El ID es obligatorio" });
    }

    try {
        const [rows] = await db.promise().query("SELECT * FROM usuario WHERE ID_Usuario = ? AND ROLID_ROL = 2", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Empleado no encontrado o no autorizado" });
        }

        await db.promise().execute("DELETE FROM imagen WHERE ID_Usuario = ?", [id]);
        await db.promise().execute("DELETE FROM empleado WHERE UsuarioID_Usuario = ?", [id]);

        const [result] = await db.promise().execute("DELETE FROM usuario WHERE ID_Usuario = ? AND ROLID_ROL = 2", [id]);

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: "Error al eliminar el Empleado" });
        }

        res.status(200).json({ message: "Empleado eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar el Empleado:", error);
        res.status(500).json({ message: "Error al eliminar el Empleado", error: error.message });
    }
};