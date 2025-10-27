const db = require('../config/conexion.db');

class CitasProfesionalController {

    static async getAllCitas(req, res) {
        try {
            const query = `
                SELECT c.idCita, c.fechaCita, c.horaCita, c.estadoCita, s.servNombre as descripcionServicio, s.servDuracion, p.nombreProfesional
                FROM Citas c
                JOIN Servicios s ON c.idServicios = s.idServicios
                JOIN Profesional p ON c.idProfesional = p.idProfesional
                ORDER BY c.fechaCita, c.horaCita
            `;
            const [results] = await db.execute(query);
            console.log('DEBUG BACKEND All Citas: Raw results:', results.length);

            const eventosCitas = results
                .filter(row => row.fechaCita && row.horaCita)
                .map(row => {
                    const fechaStr = row.fechaCita.toISOString().split('T')[0];
                    const startStr = `${fechaStr}T${row.horaCita}`;
                    const startDate = new Date(startStr);
                    if (isNaN(startDate.getTime())) {
                        console.warn('DEBUG BACKEND All Citas: Fecha inválida:', row);
                        return null;
                    }
                    const endDate = new Date(startDate.getTime() + row.servDuracion * 60 * 1000);
                    const endStr = endDate.toTimeString().slice(0, 5);
                    const endFullStr = `${fechaStr}T${endStr}`;
                    const className = row.estadoCita === 'confirmada' ? 'gh-cita-confirmada' :
                        row.estadoCita === 'cancelada' ? 'gh-cita-cancelada' : 'gh-cita-agendada';
                    const evento = {
                        id: row.idCita,
                        title: row.nombreProfesional, // ← FIX: Solo nombre pro para cita
                        start: startStr,
                        end: endFullStr,
                        classNames: [className],
                        backgroundColor: row.estadoCita === 'confirmada' ? '#28a745' :
                            row.estadoCita === 'cancelada' ? '#dc3545' : '#28a745', // Verde para agendada
                        borderColor: row.estadoCita === 'confirmada' ? '#28a745' :
                            row.estadoCita === 'cancelada' ? '#dc3545' : '#28a745',
                        extendedProps: {
                            estado: row.estadoCita,
                            nombreProfesional: row.nombreProfesional,
                            descripcionServicio: row.descripcionServicio // Para tabla
                        }
                    };
                    console.log('DEBUG BACKEND All Citas: Evento mapeado:', evento);
                    return evento;
                })
                .filter(evento => evento !== null);

            console.log('DEBUG BACKEND All Citas: Eventos finales:', eventosCitas.length);
            res.json({ citas: results, eventosParaCalendario: eventosCitas });
        } catch (error) {
            console.error('Error al obtener todas las citas:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }

    static async getCitasByProfesional(req, res) {
        try {
            const { id } = req.params;
            const idProfesional = Number(id);
            console.log('DEBUG BACKEND Citas: id recibido:', id, 'Tipo:', typeof id, 'Convertido:', idProfesional);
            if (!id || isNaN(idProfesional)) {
                console.log('DEBUG BACKEND Citas: Validación falló');
                return res.status(400).json({ error: 'ID de profesional inválido' });
            }

            const query = `
                SELECT c.idCita, c.fechaCita, c.horaCita, c.estadoCita, s.servNombre as descripcionServicio, s.servDuracion, p.nombreProfesional
                FROM Citas c
                JOIN Servicios s ON c.idServicios = s.idServicios
                JOIN Profesional p ON c.idProfesional = p.idProfesional
                WHERE c.idProfesional = ? 
                ORDER BY c.fechaCita, c.horaCita
            `;
            const [results] = await db.execute(query, [idProfesional]);
            console.log('DEBUG BACKEND Citas: Raw results from DB:', results.length, results);

            const eventosCitas = results
                .filter(row => row.fechaCita && row.horaCita)
                .map(row => {
                    const fechaStr = row.fechaCita.toISOString().split('T')[0];
                    const startStr = `${fechaStr}T${row.horaCita}`;
                    const startDate = new Date(startStr);
                    if (isNaN(startDate.getTime())) {
                        console.warn('DEBUG BACKEND Citas: Fecha inválida para cita:', row, 'startStr:', startStr);
                        return null;
                    }
                    const endDate = new Date(startDate.getTime() + row.servDuracion * 60 * 1000);
                    const endStr = endDate.toTimeString().slice(0, 5);
                    const endFullStr = `${fechaStr}T${endStr}`;
                    const className = row.estadoCita === 'confirmada' ? 'cita-confirmada' :
                        row.estadoCita === 'cancelada' ? 'cita-cancelada' : 'cita-pendiente'; // ← FIX: classNames para CSS
                    const evento = {
                        id: row.idCita,
                        title: `${row.nombreProfesional} - ${row.descripcionServicio}`,
                        start: startStr,
                        end: endFullStr,
                        classNames: [className], // ← FIX: Para CSS individual
                        backgroundColor: row.estadoCita === 'confirmada' ? '#28a745' :
                            row.estadoCita === 'cancelada' ? '#dc3545' : '#ffc107', // Fallback si CSS no carga
                        borderColor: row.estadoCita === 'confirmada' ? '#28a745' :
                            row.estadoCita === 'cancelada' ? '#dc3545' : '#ffc107',
                        extendedProps: {
                            estado: row.estadoCita,
                            nombreProfesional: row.nombreProfesional,
                            descripcionServicio: row.descripcionServicio
                        }
                    };
                    console.log('DEBUG BACKEND Citas: Evento mapeado (local válido):', evento);
                    return evento;
                })
                .filter(evento => evento !== null);

            console.log('DEBUG BACKEND Citas: Eventos finales:', eventosCitas.length);
            res.json({ citas: results, eventosParaCalendario: eventosCitas });
        } catch (error) {
            console.error('Error al obtener citas por profesional:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }

    // Nuevo: Citas por fecha (global, para click día)
    static async getCitasByDate(req, res) {
        try {
            const { fecha } = req.params; // ej. '2025-10-20'
            if (!fecha) {
                return res.status(400).json({ error: 'Fecha inválida' });
            }

            const query = `
                SELECT c.idCita, c.fechaCita, c.horaCita, c.estadoCita, s.servNombre as descripcionServicio, s.servDuracion, p.nombreProfesional
                FROM Citas c
                JOIN Servicios s ON c.idServicios = s.idServicios
                JOIN Profesional p ON c.idProfesional = p.idProfesional
                WHERE DATE(c.fechaCita) = ? 
                ORDER BY c.horaCita
            `;
            const [results] = await db.execute(query, [fecha]);
            console.log('DEBUG BACKEND Citas by Date:', fecha, 'Results:', results.length);

            res.json(results); // Raw para tabla (no formateado)
        } catch (error) {
            console.error('Error al obtener citas por fecha:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }

    static async getEstadisticasCitas(req, res) {
        try {
            const { id } = req.query;
            const whereClause = id ? 'WHERE idProfesional = ?' : '';
            const params = id ? [Number(id)] : [];

            const query = `
                SELECT 
                    COUNT(*) as totalCitas,
                    SUM(CASE WHEN estadoCita = 'pendiente' THEN 1 ELSE 0 END) as citasPendientes,
                    SUM(CASE WHEN estadoCita = 'confirmada' THEN 1 ELSE 0 END) as citasConfirmadas
                FROM Citas
                ${whereClause}
            `;
            const [results] = await db.execute(query, params);
            const [stats] = results;

            res.json(stats);
        } catch (error) {
            console.error('Error al obtener estadísticas de citas:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }
}

module.exports = CitasProfesionalController;