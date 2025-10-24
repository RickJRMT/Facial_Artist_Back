const CrudController = require('./crud.controller'); // Ajusta path si es necesario

class ProfesionalesController {
    // GET all
    static async getAll(req, res) {
        try {
            const tabla = 'Profesional';
            const profesionales = await CrudController.obtenerTabla(tabla);
            res.json(profesionales);
        } catch (error) {
            console.error('Error al obtener profesionales:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // GET by ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const idProfesional = Number(id);
            if (isNaN(idProfesional)) {
                return res.status(400).json({ error: 'ID de profesional inválido' });
            }
            const tabla = 'Profesional';
            const profesional = await CrudController.obtenerTablaId(tabla, 'idProfesional', idProfesional);
            if (!profesional) {
                return res.status(404).json({ error: 'Profesional no encontrado' });
            }
            res.json(profesional);
        } catch (error) {
            console.error('Error al obtener profesional:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // POST create
    static async create(req, res) {
        try {
            const tabla = 'Profesional';
            const data = req.body; // Espera campos como nombreProfesional, correoProfesional, etc.
            const nuevoProfesional = await CrudController.crear(tabla, data);
            res.status(201).json(nuevoProfesional);
        } catch (error) {
            console.error('Error al crear profesional:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // PUT update
    static async update(req, res) {
        try {
            const { id } = req.params;
            const idProfesional = Number(id);
            if (isNaN(idProfesional)) {
                return res.status(400).json({ error: 'ID de profesional inválido' });
            }
            const tabla = 'Profesional';
            const data = req.body;
            const updatedProfesional = await CrudController.actualizar(tabla, 'idProfesional', idProfesional, data);
            res.json(updatedProfesional);
        } catch (error) {
            console.error('Error al actualizar profesional:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // DELETE
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const idProfesional = Number(id);
            if (isNaN(idProfesional)) {
                return res.status(400).json({ error: 'ID de profesional inválido' });
            }
            const tabla = 'Profesional';
            const result = await CrudController.eliminar(tabla, 'idProfesional', idProfesional);
            res.json(result);
        } catch (error) {
            console.error('Error al eliminar profesional:', error);
            res.status(404).json({ error: error.message });
        }
    }
}

module.exports = ProfesionalesController;