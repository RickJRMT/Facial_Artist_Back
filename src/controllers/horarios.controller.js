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

    // GET (corregido con logs extra)
    static async getHorariosByProfesional(req, res) {
        try {
            const { id } = req.params; // ← FIX: 'id' de la ruta /:id
            console.log('DEBUG BACKEND GET: id recibido:', id, 'Tipo:', typeof id); // Log para debug

            const idProfesional = Number(id);
            if (!id || isNaN(idProfesional)) {
                console.log('DEBUG BACKEND: Validación falló - id inválido'); // Log
                return res.status(400).json({ error: 'ID de profesional inválido' });
            }
            console.log('DEBUG BACKEND: idProfesional válido:', idProfesional); // Log

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

            console.log('DEBUG BACKEND: Resultados encontrados:', results.length); // Log
            res.json({ horarios: results, eventosParaCalendario: eventos });
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }

    // POST (sin cambios, pero con log)
    static async createHorario(req, res) {
        try {
            console.log('DEBUG BACKEND POST: Body recibido:', req.body); // Log
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

            console.log('DEBUG BACKEND: Horario creado con ID:', result.insertId); // Log
            res.status(201).json({ message: 'Horario creado exitosamente', id: result.insertId });
        } catch (error) {
            console.error('Error al crear horario:', error);
            res.status(400).json({ error: error.message || 'Error al crear horario' });
        }
    }

    // PUT (corregido con { id } y logs)
    static async updateHorario(req, res) {
        try {
            console.log('DEBUG BACKEND PUT: Params y Body:', req.params, req.body); // Log
            const { id } = req.params; // ← FIX: 'id' de la ruta /:id
            const idHorario = Number(id);
            const { idProfesional, fecha, hora_inicio, hora_fin, estado } = req.body;

            if (!id || isNaN(idHorario)) {
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
            params.push(idHorario);

            const [result] = await db.execute(query, params);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Horario no encontrado' });
            }

            console.log('DEBUG BACKEND: Horario actualizado:', result.affectedRows); // Log
            res.json({ message: 'Horario actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar horario:', error);
            res.status(400).json({ error: error.message || 'Error al actualizar horario' });
        }
    }
}

module.exports = HorariosController;