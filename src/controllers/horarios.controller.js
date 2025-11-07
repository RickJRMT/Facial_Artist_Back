const db = require('../config/conexion.db');
const moment = require('moment'); // Para manejo local de fechas

class HorariosController {
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

    static async getAllHorarios(req, res) {
        try {
            const query = `
                SELECT h.idHorario, h.fecha, h.hora_inicio, h.hora_fin, h.estado, p.nombreProfesional
                FROM Horarios h
                JOIN Profesional p ON h.idProfesional = p.idProfesional
                ORDER BY h.fecha, h.hora_inicio
            `;
            const [results] = await db.execute(query);

            const eventosHorarios = results
                .filter(row => row.fecha && row.hora_inicio)
                .map(row => {
                    // FIX: Usar Moment para local time (evita merma de día)
                    const fechaLocal = moment(row.fecha).local().format('YYYY-MM-DD');
                    const startStr = `${fechaLocal}T${row.hora_inicio}`;
                    const endStr = `${fechaLocal}T${row.hora_fin}`;
                    const startDate = moment(startStr).toDate(); // Local parse
                    if (isNaN(startDate.getTime())) {
                        return null;
                    }
                    const className = row.estado === 'activo' ? 'gh-horario-activo' : 'gh-horario-inactivo';
                    const estadoText = row.estado === 'activo' ? 'Activo' : 'Inactivo';
                    const evento = {
                        id: row.idHorario,
                        title: `${row.nombreProfesional} - ${estadoText}`, // Nombre + estado para bloque
                        start: startStr,
                        end: endStr,
                        classNames: [className],
                        backgroundColor: row.estado === 'activo' ? '#28a745' : '#dc3545',
                        borderColor: row.estado === 'activo' ? '#28a745' : '#dc3545',
                        extendedProps: {
                            estado: row.estado,
                            nombreProfesional: row.nombreProfesional,
                            idHorario: row.idHorario,
                            fechaLocal: fechaLocal
                        }
                    };
                    return evento;
                })
                .filter(evento => evento !== null);
            res.json({ horarios: results, eventosParaCalendario: eventosHorarios });
        } catch (error) {
            console.error('Error al obtener todos los horarios:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }

    static async getHorariosByDate(req, res) {
        try {
            const { fecha } = req.params;
            if (!fecha) {
                return res.status(400).json({ error: 'Fecha inválida' });
            }

            const query = `
                SELECT h.idHorario, h.fecha, h.hora_inicio, h.hora_fin, h.estado, p.nombreProfesional, h.idProfesional
                FROM Horarios h
                JOIN Profesional p ON h.idProfesional = p.idProfesional
                WHERE DATE(h.fecha) = ? 
                ORDER BY h.hora_inicio
            `;
            const [results] = await db.execute(query, [fecha]);

            // FIX: Agregar fechaLocal con Moment para consistencia
            const resultsWithLocal = results.map(row => ({
                ...row,
                fechaLocal: moment(row.fecha).local().format('DD/MM/YYYY') // Para tabla
            }));

            res.json(resultsWithLocal); // Raw + local para prefill/tabla
        } catch (error) {
            console.error('Error al obtener horarios por fecha:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }

    static async getHorariosByProfesional(req, res) {
        try {
            const { id } = req.params;

            const idProfesional = Number(id);
            if (!id || isNaN(idProfesional)) {
                return res.status(400).json({ error: 'ID de profesional inválido' });
            }

            const query = `
                SELECT idHorario, fecha, hora_inicio, hora_fin, estado, p.nombreProfesional
                FROM Horarios h
                JOIN Profesional p ON h.idProfesional = p.idProfesional
                WHERE h.idProfesional = ? 
                ORDER BY fecha, hora_inicio
            `;
            const [results] = await db.execute(query, [idProfesional]);

            const eventos = results.map(row => {
                // FIX: Moment para local time
                const fechaLocal = moment(row.fecha).local().format('YYYY-MM-DD');
                const startStr = `${fechaLocal}T${row.hora_inicio}`;
                const endStr = `${fechaLocal}T${row.hora_fin}`;
                return {
                    id: row.idHorario,
                    title: `${row.nombreProfesional} - ${row.estado === 'activo' ? 'Activo' : 'Inactivo'}`,
                    start: startStr,
                    end: endStr,
                    classNames: [row.estado === 'activo' ? 'gh-horario-activo' : 'gh-horario-inactivo'],
                    backgroundColor: row.estado === 'activo' ? '#28a745' : '#dc3545',
                    borderColor: row.estado === 'activo' ? '#28a745' : '#dc3545',
                    extendedProps: {
                        estado: row.estado,
                        nombreProfesional: row.nombreProfesional,
                        fechaLocal: fechaLocal
                    }
                };
            });
            res.json({ horarios: results, eventosParaCalendario: eventos });
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }

    // createHorario y updateHorario sin cambios, ya que no mapean eventos
    static async createHorario(req, res) {
        try {
            const { idProfesional, fecha, hora_inicio, hora_fin, estado = 'activo' } = req.body;
            HorariosController.#validarInputs(idProfesional, fecha, hora_inicio, hora_fin, estado);

            if (estado === 'activo') {
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
            } else {
                console.log('DEBUG BACKEND: Skip solapamiento para estado inactivo');
            }

            const insertQuery = `
                INSERT INTO Horarios (idProfesional, fecha, hora_inicio, hora_fin, estado) 
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await db.execute(insertQuery, [idProfesional, fecha, hora_inicio, hora_fin, estado]);
            res.status(201).json({ message: 'Horario creado exitosamente', id: result.insertId });

        } catch (error) {
            console.error('Error al crear horario:', error);
            res.status(400).json({ error: error.message || 'Error al crear horario' });
        }
    }

    static async updateHorario(req, res) {
        try {
            const { id } = req.params;
            const idHorario = Number(id);
            const { idProfesional, fecha, hora_inicio, hora_fin, estado } = req.body;

            if (!id || isNaN(idHorario)) {
                return res.status(400).json({ error: 'ID de horario inválido' });
            }

            if (hora_inicio && hora_fin) {
                HorariosController.#validarInputs(idProfesional || 0, fecha || '', hora_inicio, hora_fin, estado || 'activo');
                if (estado === 'activo' && idProfesional && fecha) {
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
                } else if (estado === 'inactivo') {
                    console.log('DEBUG BACKEND: Skip solapamiento para estado inactivo en update');
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
            res.json({ message: 'Horario actualizado exitosamente' });

        } catch (error) {
            console.error('Error al actualizar horario:', error);
            res.status(400).json({ error: error.message || 'Error al actualizar horario' });
        }
    }
}

module.exports = HorariosController;