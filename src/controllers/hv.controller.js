// src/controllers/hv.controller.js
const db = require('../config/conexion.db'); // Corregido: Ajusta la ruta según tu estructura (antes era ../config/conexion.db)

class HvController {
    // Obtener todos los registros de Hv
    async obtenerTodos() {
        try {
            const [resultado] = await db.query('SELECT * FROM Hv');
            // Convertir hvImagen de Buffer a Base64 para el frontend
            return resultado.map(hv => ({
                ...hv,
                hvImagen: hv.hvImagen ? hv.hvImagen.toString('base64') : null
            }));
        } catch (error) {
            throw error;
        }
    }

    // Obtener un registro de Hv por ID
    async obtenerPorId(id) {
        try {
            const [resultado] = await db.query('SELECT * FROM Hv WHERE idHv = ?', [id]);
            if (resultado[0]) {
                // Convertir hvImagen de Buffer a Base64
                return {
                    ...resultado[0],
                    hvImagen: resultado[0].hvImagen ? resultado[0].hvImagen.toString('base64') : null
                };
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Crear un nuevo registro en Hv
    async crear(data) {
        try {
            // Convertir hvImagen de Base64 (string desde frontend) a Buffer para MySQL
            const hvImagen = data.hvImagen ? Buffer.from(data.hvImagen, 'base64') : null;
            const [resultado] = await db.query(
                'INSERT INTO Hv (idCita, hvDesc, servDescripcion, hvImagen) VALUES (?, ?, ?, ?)',
                [data.idCita, data.hvDesc, data.servDescripcion, hvImagen]
            );
            // Retorna el registro creado con el nuevo ID (hvImagen como Base64 para consistencia)
            const nuevoId = resultado.insertId;
            return { ...data, idHv: nuevoId, hvImagen: data.hvImagen || null };
        } catch (error) {
            throw error;
        }
    }

    // Actualizar un registro en Hv por ID
    async actualizar(id, data) {
        try {
            const existing = await this.obtenerPorId(id);
            if (!existing) {
                throw new Error('Registro no encontrado');
            }
            // Convertir hvImagen de Base64 a Buffer si se proporciona
            const hvImagen = data.hvImagen ? Buffer.from(data.hvImagen, 'base64') : null;
            const [resultado] = await db.query(
                'UPDATE Hv SET idCita = ?, hvDesc = ?, servDescripcion = ?, hvImagen = ? WHERE idHv = ?',
                [data.idCita, data.hvDesc, data.servDescripcion, hvImagen, id]
            );
            if (resultado.affectedRows === 0) {
                throw new Error('No se pudo actualizar el registro');
            }
            // Retorna el registro actualizado
            return await this.obtenerPorId(id);
        } catch (error) {
            throw error;
        }
    }

    // Eliminar un registro de Hv por ID
    async eliminar(id) {
        try {
            const [resultado] = await db.query('DELETE FROM Hv WHERE idHv = ?', [id]);
            if (resultado.affectedRows === 0) {
                throw new Error('Registro no encontrado');
            }
            return { mensaje: 'Registro eliminado exitosamente' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new HvController();