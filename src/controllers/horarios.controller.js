const db = require('../config/conexion.db');

class HorariosController {
    // Obtener todos los registros de Horarios
    async obtenerTodos() {
        try {
            const [resultado] = await db.query('SELECT * FROM Horarios');
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    // Obtener un registro de Horarios por ID
    async obtenerPorId(id) {
        try {
            const [resultado] = await db.query('SELECT * FROM Horarios WHERE idHorario = ?', [id]);
            return resultado[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Crear un nuevo registro en Horarios
    async crear(data) {
        try {
            // Validar campos requeridos (opcional, pero recomendado)
            if (!data.dias || !data.horaInicio || !data.horaFinal) {
                throw new Error('Faltan campos requeridos: dias, horaInicio, horaFinal');
            }
            const [resultado] = await db.query(
                'INSERT INTO Horarios (dias, horaInicio, horaFinal) VALUES (?, ?, ?)',
                [data.dias, data.horaInicio, data.horaFinal]
            );
            // Retorna el registro creado con el nuevo ID
            const nuevoId = resultado.insertId;
            return { ...data, idHorario: nuevoId };
        } catch (error) {
            throw error;
        }
    }

    // Actualizar un registro en Horarios por ID
    async actualizar(id, data) {
        try {
            const existing = await this.obtenerPorId(id);
            if (!existing) {
                throw new Error('Registro no encontrado');
            }
            const [resultado] = await db.query(
                'UPDATE Horarios SET dias = ?, horaInicio = ?, horaFinal = ? WHERE idHorario = ?',
                [data.dias, data.horaInicio, data.horaFinal, id]
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

    // Eliminar un registro de Horarios por ID
    async eliminar(id) {
        try {
            const [resultado] = await db.query('DELETE FROM Horarios WHERE idHorario = ?', [id]);
            if (resultado.affectedRows === 0) {
                throw new Error('Registro no encontrado');
            }
            return { mensaje: 'Registro eliminado exitosamente' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new HorariosController();