const db = require('../config/conexion.db');

class HorariosController {
    // Método privado estático
    static #validarInputs(idProfesional, fecha, hora_inicio, hora_fin, estado) {
        if (!idProfesional || !fecha || !hora_inicio || !hora_fin) {
            throw new Error('Faltan campos requeridos');
        }
        if (!['activo', 'inactivo'].includes(estado)) {
            throw new Error('Estado inválido: debe ser "activo" o "inactivo"');
        }
        if (new Date(`2000-01-01T${hora_inicio}`) >= new Date(`2000-01-01T${hora_fin}`)) {
            throw new Error('Hora inicio debe ser menor que hora fin');
        }
    }

    static async getHorariosByProfesional(req, res) {
        try {
            const { id } = req.params; // ← Aquí está el problema si no llega
            console.log('DEBUG GET Horarios - req.params:', req.params); // ← LOG CLAVE

            if (!id) {
                return res.status(400).json({ error: 'Falta ID de profesional' });
            }

            const idProfesional = Number(id);
            if (isNaN(idProfesional)) {
                return res.status(400).json({ error: 'ID de profesional inválido' });
            }

            const query = `
            SELECT idHorario, fecha, hora_inicio, hora_fin, estado 
            FROM Horarios 
            WHERE idProfesional = ? 
            ORDER BY fecha, hora_inicio
        `;
            const [results] = await db.execute(query, [idProfesional]);

            const eventos = results.map(row => ({
                id: row.idHorario,
                title: row.estado === 'activo' ? `Disponible - ${row.hora_inicio} a ${row.hora_fin}` : 'Agenda Cerrada',
                start: `${row.fecha}T${row.hora_inicio}`,
                end: `${row.fecha}T${row.hora_fin}`,
                backgroundColor: row.estado === 'activo' ? '#28a745' : '#dc3545',
                borderColor: row.estado === 'activo' ? '#28a745' : '#dc3545'
            }));

            res.json({ horarios: results, eventosParaCalendario: eventos });
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }

    // POST (con log)
    static async createHorario(req, res) {
        try {
            console.log('DEBUG POST: Body recibido:', req.body); // LOG TEMPORAL
            const { idProfesional, fecha, hora_inicio, hora_fin, estado = 'activo' } = req.body;
            HorariosController.#validarInputs(idProfesional, fecha, hora_inicio, hora_fin, estado);

            // Chequear solapamiento
            const checkQuery = `
                SELECT COUNT(*) as count FROM Citas 
                WHERE idProfesional = ? AND fechaCita = ? 
                AND ((horaCita < ? AND (fin_cita IS NULL OR fin_cita > ?)) OR 
                     (horaCita >= ? AND horaCita < ?))
            `;
            const [checkResult] = await db.execute(checkQuery, [idProfesional, fecha, hora_fin, hora_inicio, hora_inicio, hora_fin]);
            if (checkResult[0].count > 0) {
                return res.status(400).json({ error: 'Solapamiento con citas existentes' });
            }

            const insertQuery = `
                INSERT INTO Horarios (idProfesional, fecha, hora_inicio, hora_fin, estado) 
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await db.execute(insertQuery, [idProfesional, fecha, hora_inicio, hora_fin, estado]);

            console.log('DEBUG: Horario creado con ID:', result.insertId); // LOG
            res.status(201).json({ message: 'Horario creado exitosamente', id: result.insertId });
        } catch (error) {
            console.error('Error al crear horario:', error);
            res.status(400).json({ error: error.message || 'Error al crear horario' });
        }
    }

    // PUT (con log)
    static async updateHorario(req, res) {
        try {
            console.log('DEBUG PUT: Params y Body:', req.params, req.body); // LOG TEMPORAL
            const { idHorario } = req.params;
            const { idProfesional, fecha, hora_inicio, hora_fin, estado } = req.body;

            if (!idHorario || isNaN(Number(idHorario))) {
                return res.status(400).json({ error: 'ID de horario inválido' });
            }

            if (hora_inicio && hora_fin) {
                HorariosController.#validarInputs(idProfesional || 0, fecha || '', hora_inicio, hora_fin, estado || 'activo');
                if (idProfesional && fecha) {
                    const checkQuery = `
                        SELECT COUNT(*) as count FROM Citas 
                        WHERE idProfesional = ? AND fechaCita = ? 
                        AND ((horaCita < ? AND (fin_cita IS NULL OR fin_cita > ?)) OR 
                             (horaCita >= ? AND horaCita < ?))
                    `;
                    const [checkResult] = await db.execute(checkQuery, [idProfesional, fecha, hora_fin, hora_inicio, hora_inicio, hora_fin]);
                    if (checkResult[0].count > 0) {
                        return res.status(400).json({ error: 'Solapamiento con citas existentes al actualizar' });
                    }
                }
            }

            const updates = [];
            const params = [];
            if (estado !== undefined) { updates.push('estado = ?'); params.push(estado); }
            if (hora_inicio && hora_fin) {
                updates.push('hora_inicio = ?, hora_fin = ?');
                params.push(hora_inicio, hora_fin);
            }
            if (fecha) { updates.push('fecha = ?'); params.push(fecha); }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No hay campos para actualizar' });
            }

            const query = `UPDATE Horarios SET ${updates.join(', ')} WHERE idHorario = ?`;
            params.push(Number(idHorario));

            const [result] = await db.execute(query, params);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Horario no encontrado' });
            }

            console.log('DEBUG: Horario actualizado:', result.affectedRows); // LOG
            res.json({ message: 'Horario actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar horario:', error);
            res.status(400).json({ error: error.message || 'Error al actualizar horario' });
        }
    }
}

module.exports = HorariosController; // Exporta la CLASE (métodos estáticos)