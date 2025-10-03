// Importa el pool de conexiones directamente desde config conexion.js
const db = require('../config/conexion.db');

class HvController {
    // Obtener todos los registros de Hv
    async obtenerTodos() {
        try {
            const [resultado] = await db.query('SELECT * FROM Hv');
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    // Obtener un registro de Hv por ID
    async obtenerPorId(id) {
        try {
            const [resultado] = await db.query('SELECT * FROM Hv WHERE idHv = ?', [id]);
            return resultado[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Crear un nuevo registro en Hv
    async crear(data) {
        try {
            // Nota: Para hvImagen (LONGBLOB), asegúrate de que data.hvImagen sea un Buffer en Node.js
            // Ejemplo: const fs = require('fs'); data.hvImagen = fs.readFileSync('path/to/image.jpg');
            // Los campos automáticos como hvFechaCreacion se manejan en la DB
            const [resultado] = await db.query(
                'INSERT INTO Hv (idCita, hvDesc, servDescripcion, hvImagen) VALUES (?, ?, ?, ?)',
                [data.idCita, data.hvDesc, data.servDescripcion, data.hvImagen || null]
            );
            // Retorna el registro creado con el nuevo ID
            const nuevoId = resultado.insertId;
            return { ...data, idHv: nuevoId };
        } catch (error) {
            throw error;
        }
    }

    // Actualizar un registro en Hv por ID
    async actualizar(id, data) {
        try {
            // Verifica si existe el registro
            const existing = await this.obtenerPorId(id);
            if (!existing) {
                throw new Error('Registro no encontrado');
            }

            // Nota: Similar para hvImagen, pasa un Buffer si se actualiza la imagen
            const [resultado] = await db.query(
                'UPDATE Hv SET idCita = ?, hvDesc = ?, servDescripcion = ?, hvImagen = ? WHERE idHv = ?',
                [data.idCita, data.hvDesc, data.servDescripcion, data.hvImagen || null, id]
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