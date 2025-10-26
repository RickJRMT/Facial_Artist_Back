const db = require('../config/conexion.db');

class ServiciosController {
    // Obtener todos los registros de Servicios
    async obtenerTodos() {
        try {
            const [resultado] = await db.query('SELECT * FROM Servicios');
            // Convertir servImagen de Buffer a Base64 para el frontend
            return resultado.map(servicio => ({
                ...servicio,
                servImagen: servicio.servImagen ? servicio.servImagen.toString('base64') : null
            }));
        } catch (error) {
            throw error;
        }
    }

    // Obtener un registro de Servicios por ID
    async obtenerPorId(id) {
        try {
            const [resultado] = await db.query('SELECT * FROM Servicios WHERE idServicios = ?', [id]);
            if (resultado[0]) {
                // Convertir servImagen de Buffer a Base64
                return {
                    ...resultado[0],
                    servImagen: resultado[0].servImagen ? resultado[0].servImagen.toString('base64') : null
                };
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Crear un nuevo registro en Servicios
    async crear(data) {
        try {
            // Convertir servImagen de Base64 (string desde frontend) a Buffer para MySQL
            const servImagen = data.servImagen ? Buffer.from(data.servImagen, 'base64') : null;
            const [resultado] = await db.query(
                'INSERT INTO Servicios (servNombre, servDescripcion, servCosto, servImagen, servDuracion) VALUES (?, ?, ?, ?, ?)',
                [data.servNombre, data.servDescripcion, data.servCosto, servImagen, data.servDuracion || 60]
            );
            // Retorna el registro creado con el nuevo ID (servImagen como Base64 para consistencia)
            const nuevoId = resultado.insertId;
            return { ...data, idServicios: nuevoId, servImagen: data.servImagen || null };
        } catch (error) {
            throw error;
        }
    }

    // Actualizar un registro en Servicios por ID
    async actualizar(id, data) {
        try {
            const existing = await this.obtenerPorId(id);
            if (!existing) {
                throw new Error('Registro no encontrado');
            }
            // Convertir servImagen de Base64 a Buffer si se proporciona
            const servImagen = data.servImagen ? Buffer.from(data.servImagen, 'base64') : null;
            const [resultado] = await db.query(
                'UPDATE Servicios SET servNombre = ?, servDescripcion = ?, servCosto = ?, servImagen = ?, servDuracion = ? WHERE idServicios = ?',
                [data.servNombre, data.servDescripcion, data.servCosto, servImagen, data.servDuracion || existing.servDuracion || 60, id]
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

    // Eliminar un registro de Servicios por ID
    async eliminar(id) {
        try {
            const [resultado] = await db.query('DELETE FROM Servicios WHERE idServicios = ?', [id]);
            if (resultado.affectedRows === 0) {
                throw new Error('Registro no encontrado');
            }
            return { mensaje: 'Registro eliminado exitosamente' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ServiciosController();