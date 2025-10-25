const db = require('../config/conexion.db');

class CitasProfesionalController {
    static async getCitasByProfesional(req, res) {
        try {
            const { id } = req.params;
            const idProfesional = Number(id);
            if (!id || isNaN(idProfesional)) {
                return res.status(400).json({ error: 'ID de profesional inválido' });
            }

            const query = `
                SELECT c.idCita, c.fechaCita, c.horaCita, c.estadoCita, s.servNombre as descripcionServicio, p.nombreProfesional
                FROM Citas c
                JOIN Servicios s ON c.idServicios = s.idServicios
                JOIN Profesional p ON c.idProfesional = p.idProfesional
                WHERE c.idProfesional = ? 
                ORDER BY c.fechaCita, c.horaCita
            `;
            const [results] = await db.execute(query, [idProfesional]);

            res.json({ citas: results, eventosParaCalendario: [] }); // Raw para mapping en frontend
        } catch (error) {
            console.error('Error al obtener citas por profesional:', error);
            res.status(500).json({ error: 'Error en la base de datos' });
        }
    }

    // ← NUEVO: All citas (sin filtro pro)
    static async getAllCitas(req, res) {
        try {
            const query = `
                SELECT c.idCita, c.fechaCita, c.horaCita, c.estadoCita, s.servNombre as descripcionServicio, p.nombreProfesional
                FROM Citas c
                JOIN Servicios s ON c.idServicios = s.idServicios
                JOIN Profesional p ON c.idProfesional = p.idProfesional
                ORDER BY c.fechaCita, c.horaCita
            `;
            const [results] = await db.execute(query);

            res.json({ citas: results, eventosParaCalendario: [] }); // Raw
        } catch (error) {
            console.error('Error al obtener todas citas:', error);
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