// src/controllers/hv.controller.js
const db = require('../config/conexion.db'); // Corregido: Ajusta la ruta según tu estructura (antes era ../config/conexion.db)

class HvController {
    // Obtener todos los registros de Hv
    async obtenerTodos() {
        try {
            const [resultado] = await db.query('SELECT * FROM Hv');
            // Convertir hvImagenAntes y hvImagenDespues de Buffer a Base64 para el frontend
            return resultado.map(hv => ({
                ...hv,
                hvImagenAntes: hv.hvImagenAntes ? hv.hvImagenAntes.toString('base64') : null,
                hvImagenDespues: hv.hvImagenDespues ? hv.hvImagenDespues.toString('base64') : null
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
                // Convertir hvImagenAntes y hvImagenDespues de Buffer a Base64
                return {
                    ...resultado[0],
                    hvImagenAntes: resultado[0].hvImagenAntes ? resultado[0].hvImagenAntes.toString('base64') : null,
                    hvImagenDespues: resultado[0].hvImagenDespues ? resultado[0].hvImagenDespues.toString('base64') : null
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
            // Convertir imágenes de Base64 (string desde frontend) a Buffer para MySQL
            const hvImagenAntes = data.hvImagenAntes ? Buffer.from(data.hvImagenAntes, 'base64') : null;
            const hvImagenDespues = data.hvImagenDespues ? Buffer.from(data.hvImagenDespues, 'base64') : null;
            
            const [resultado] = await db.query(
                'INSERT INTO Hv (idCita, hvDesc, hvImagenAntes, hvImagenDespues) VALUES (?, ?, ?, ?)',
                [data.idCita, data.hvDesc, hvImagenAntes, hvImagenDespues]
            );
            // Retorna el registro creado con el nuevo ID
            const nuevoId = resultado.insertId;
            return { 
                ...data, 
                idHv: nuevoId, 
                hvImagenAntes: data.hvImagenAntes || null,
                hvImagenDespues: data.hvImagenDespues || null 
            };
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
            // Convertir imágenes de Base64 a Buffer si se proporcionan
            const hvImagenAntes = data.hvImagenAntes ? Buffer.from(data.hvImagenAntes, 'base64') : null;
            const hvImagenDespues = data.hvImagenDespues ? Buffer.from(data.hvImagenDespues, 'base64') : null;
            
            const [resultado] = await db.query(
                'UPDATE Hv SET idCita = ?, hvDesc = ?, hvImagenAntes = ?, hvImagenDespues = ? WHERE idHv = ?',
                [data.idCita, data.hvDesc, hvImagenAntes, hvImagenDespues, id]
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

    // Obtener información completa de HV con datos relacionados por ID de cliente
    async obtenerHvCompletaPorCliente(idCliente) {
        try {
            const query = `
                SELECT 
                    c.idCliente,
                    c.nombreCliente,
                    ci.idCita,
                    ci.fechaCita,
                    ci.horaCita,
                    s.servNombre AS servicio,
                    p.nombreProfesional,
                    h.idHv,
                    h.hvDesc,
                    h.hvFechaCreacion
                FROM cliente c
                INNER JOIN citas ci ON c.idCliente = ci.idCliente
                INNER JOIN hv h ON ci.idCita = h.idCita
                INNER JOIN profesional p ON ci.idProfesional = p.idProfesional
                INNER JOIN servicios s ON ci.idServicios = s.idServicios
                WHERE c.idCliente = ?
                ORDER BY h.hvFechaCreacion DESC
            `;
            
            const [resultado] = await db.query(query, [idCliente]);
            
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    // Obtener información completa de una HV específica por ID de HV
    async obtenerHvCompletaPorId(idHv) {
        try {
            const query = `
                SELECT 
                    c.idCliente,
                    c.nombreCliente,
                    ci.idCita,
                    ci.fechaCita,
                    ci.horaCita,
                    s.servNombre AS servicio,
                    p.nombreProfesional,
                    h.idHv,
                    h.hvDesc,
                    h.hvFechaCreacion
                FROM cliente c
                INNER JOIN citas ci ON c.idCliente = ci.idCliente
                INNER JOIN hv h ON ci.idCita = h.idCita
                INNER JOIN profesional p ON ci.idProfesional = p.idProfesional
                INNER JOIN servicios s ON ci.idServicios = s.idServicios
                WHERE h.idHv = ?
            `;
            
            const [resultado] = await db.query(query, [idHv]);
            
            if (resultado[0]) {
                return resultado[0];
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener todas las HV con información completa
    async obtenerTodasHvCompletas() {
        try {
            const query = `
                SELECT 
                    c.idCliente,
                    c.nombreCliente,
                    ci.idCita,
                    ci.fechaCita,
                    ci.horaCita,
                    s.servNombre AS servicio,
                    p.nombreProfesional,
                    h.idHv,
                    h.hvDesc,
                    h.hvFechaCreacion
                FROM cliente c
                INNER JOIN citas ci ON c.idCliente = ci.idCliente
                INNER JOIN hv h ON ci.idCita = h.idCita
                INNER JOIN profesional p ON ci.idProfesional = p.idProfesional
                INNER JOIN servicios s ON ci.idServicios = s.idServicios
                ORDER BY h.hvFechaCreacion DESC
            `;
            
            const [resultado] = await db.query(query);
            
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    // Obtener HV por ID de cita
    async obtenerPorIdCita(idCita) {
        try {
            const [resultado] = await db.query('SELECT * FROM Hv WHERE idCita = ?', [idCita]);
            if (resultado[0]) {
                // Convertir hvImagenAntes y hvImagenDespues de Buffer a Base64
                return {
                    ...resultado[0],
                    hvImagenAntes: resultado[0].hvImagenAntes ? resultado[0].hvImagenAntes.toString('base64') : null,
                    hvImagenDespues: resultado[0].hvImagenDespues ? resultado[0].hvImagenDespues.toString('base64') : null
                };
            }
            return null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new HvController();