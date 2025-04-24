import db from '../config/db.js';

export const getMedicamentos = async () => {
    const query = 'SELECT * FROM producto';
    const [result] = await db.promise().execute(query);
    return result;
};

export const createFormatopresentacion = async (Formatopresentacion) => {
    const {
        nombre,
        descripcion,
        imagen_producto,
        fecha_entrada,
        valor_unitario,
        CategoriaID_Categoria,
        LaboratorioID_Laboratorio,
        IVAID_IVA,
        stock_minimo,
        fecha_actualizacion,
        contenido_neto,
        cantidad_frascos,
        lote,
        fecha_vencimiento,
    } = Formatopresentacion;

    const query = `
        INSERT INTO producto (
            nombre, descripcion, imagen_producto, fecha_entrada, valor_unitario, 
            CategoriaID_Categoria, LaboratorioID_Laboratorio, IVAID_IVA, stock_minimo, 
            fecha_actualizacion, contenido_neto, cantidad_frascos, 
            lote, fecha_vencimiento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    try {
        const [result] = await db.promise().execute(query, [
            nombre,
            descripcion,
            imagen_producto,
            fecha_entrada,
            valor_unitario,
            CategoriaID_Categoria,
            LaboratorioID_Laboratorio,
            IVAID_IVA,
            stock_minimo,
            fecha_actualizacion,
            contenido_neto,
            cantidad_frascos,
            lote,
            fecha_vencimiento,
        ]);

        return result.insertId;
    } catch (error) {
        console.error("Error en el modelo al crear el formato (jarabe, crema, gota):", error);
        throw new Error("Error al crear el formato de (jarabe, crema, gota) en la base de datos");
    }
};

export const updateFormatopresentacion = async (ID_PRODUCTO, Formatopresentacion) => {
    const {
        nombre,
        descripcion,
        imagen_producto,
        fecha_entrada,
        valor_unitario,
        CategoriaID_Categoria,
        LaboratorioID_Laboratorio,
        IVAID_IVA,
        stock_minimo,
        fecha_actualizacion,
        contenido_neto,
        cantidad_frascos,
        lote,
        fecha_vencimiento,
    } = Formatopresentacion;

    const query = `
        UPDATE producto SET 
            nombre = ?, 
            descripcion = ?, 
            imagen_producto = ?, 
            fecha_entrada = ?, 
            valor_unitario = ?, 
            CategoriaID_Categoria = ?, 
            LaboratorioID_Laboratorio = ?, 
            IVAID_IVA = ?, 
            stock_minimo = ?, 
            fecha_actualizacion = ?, 
            contenido_neto = ?,
            cantidad_frascos = ?,
            lote = ?, 
            fecha_vencimiento = ? 
        WHERE ID_PRODUCTO = ?
    `;

    const [result] = await db.promise().execute(query, [
        nombre,
        descripcion,
        imagen_producto,
        fecha_entrada,
        valor_unitario,
        CategoriaID_Categoria,
        LaboratorioID_Laboratorio,
        IVAID_IVA,
        stock_minimo,
        fecha_actualizacion,
        contenido_neto,
        cantidad_frascos,
        lote,
        fecha_vencimiento,
        ID_PRODUCTO,
    ]);

    return result.affectedRows;
};

export const deleteFormatopresentacion = async (ID_PRODUCTO) => {
    const query = 'DELETE FROM producto WHERE ID_PRODUCTO = ?';
    const [result] = await db.promise().execute(query, [ID_PRODUCTO]);
    return result.affectedRows;
};