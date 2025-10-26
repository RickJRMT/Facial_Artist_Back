// Controlador para obtener todas las citas del admin
const db = require('../config/conexion.db');



class CitasController {
    // Método para obtener citas con detalles (JOINs)
    async obtenerCitasConDetalles() {
        try {
            const [resultado] = await db.query(`
                SELECT 
                    c.idCita,
                    cl.nombreCliente,
                    s.servNombre,
                    c.fechaCita,
                    c.horaCita,
                    p.nombreProfesional,
                    c.estadoPago,
                    c.estadoCita
                FROM Citas c
                JOIN Cliente cl ON c.idCliente = cl.idCliente
                JOIN Servicios s ON c.idServicios = s.idServicios
                JOIN Profesional p ON c.idProfesional = p.idProfesional
                ORDER BY c.fechaCita DESC, c.horaCita ASC
            `);
            return resultado;
        } catch (error) {
            console.error('Error al obtener las citas con detalles:', error);
            throw error;
        }
    }
}
module.exports = new CitasController(); 