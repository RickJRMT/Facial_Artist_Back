const db = require('../config/conexion.db');
const moment = require('moment'); // Para manejo local de fechas

class CitasProfesionalController {

    static async getAllCitas(req, res) {
        try {
            const query = `
                SELECT c.idCita, c.fechaCita, c.horaCita, c.estadoCita, c.idProfesional, 
                       s.servNombre as descripcionServicio, s.servDuracion, 
                       p.nombreProfesional, cl.nombreCliente
                FROM Citas c
                JOIN Servicios s ON c.idServicios = s.idServicios
                JOIN Profesional p ON c.idProfesional = p.idProfesional
                JOIN Cliente cl ON c.idCliente = cl.idCliente
                ORDER BY c.fechaCita, c.horaCita
            `;
            const [results] = await db.execute(query);
            console.log('DEBUG BACKEND All Citas: Raw results:', results.length);

            // Solo retornar los datos raw con fechaLocal para tabla, NO eventos de calendario
            const resultsWithLocal = results.map(row => ({
                ...row,
                fechaLocal: moment(row.fechaCita).local().format('DD/MM/YYYY')
            }));

            console.log('DEBUG BACKEND All Citas: Sin mapeo de eventos para calendario');
            // NO retornamos eventosParaCalendario para ocultar agendamientos del mapeo visual
            res.json({ citas: resultsWithLocal });
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
                SELECT c.idCita, c.fechaCita, c.horaCita, c.estadoCita, c.idProfesional, 
                       s.servNombre as descripcionServicio, s.servDuracion, 
                       p.nombreProfesional, cl.nombreCliente
                FROM Citas c
                JOIN Servicios s ON c.idServicios = s.idServicios
                JOIN Profesional p ON c.idProfesional = p.idProfesional
                JOIN Cliente cl ON c.idCliente = cl.idCliente
                WHERE c.idProfesional = ? 
                ORDER BY c.fechaCita, c.horaCita
            `;
            const [results] = await db.execute(query, [idProfesional]);
            console.log('DEBUG BACKEND Citas: Raw results from DB:', results.length, results);

            // Solo retornar los datos raw con fechaLocal para tabla, NO eventos de calendario
            const resultsWithLocal = results.map(row => ({
                ...row,
                fechaLocal: moment(row.fechaCita).local().format('DD/MM/YYYY')
            }));

            console.log('DEBUG BACKEND Citas: Sin mapeo de eventos para calendario profesional');
            // NO retornamos eventosParaCalendario para ocultar agendamientos del mapeo visual
            res.json({ citas: resultsWithLocal });
        } catch (error) {
            console.error('Error al obtener citas por profesional:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }

    static async getCitasByDate(req, res) {
        try {
            const { fecha } = req.params; // ej. '2025-10-20'
            if (!fecha) {
                return res.status(400).json({ error: 'Fecha inválida' });
            }

            const query = `
                SELECT c.idCita, c.fechaCita, c.horaCita, c.estadoCita, c.idProfesional, 
                       s.servNombre as descripcionServicio, s.servDuracion, 
                       p.nombreProfesional, cl.nombreCliente
                FROM Citas c
                JOIN Servicios s ON c.idServicios = s.idServicios
                JOIN Profesional p ON c.idProfesional = p.idProfesional
                JOIN Cliente cl ON c.idCliente = cl.idCliente
                WHERE DATE(c.fechaCita) = ? 
                ORDER BY c.horaCita
            `;
            const [results] = await db.execute(query, [fecha]);
            console.log('DEBUG BACKEND Citas by Date:', fecha, 'Results:', results.length, 'con nombres de cliente');

            // Agregar fechaLocal con Moment y asegurar que nombreCliente esté incluido
            const resultsWithLocal = results.map(row => ({
                ...row,
                fechaLocal: moment(row.fechaCita).local().format('DD/MM/YYYY') // Para tabla
            }));

            res.json(resultsWithLocal); // Raw + local + nombreCliente
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