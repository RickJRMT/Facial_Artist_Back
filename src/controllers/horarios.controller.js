// src/controllers/horarios.controller.js
const Crud = require('./crud.controller'); // Importa el genérico

class HorariosController {
    async obtenerTodos(req, res) {
        try {
            const horarios = await Crud.obtenerTabla('Horarios');
            res.json({ success: true, data: horarios, count: horarios.length });
        } catch (error) {
            console.error('Error al obtener Horarios:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }

    async obtenerPorId(req, res) {
        try {
            const horario = await Crud.obtenerTablaId('Horarios', 'idHorario', req.params.id);
            if (!horario) {
                return res.status(404).json({ success: false, message: 'Registro no encontrado' });
            }
            res.json({ success: true, data: horario });
        } catch (error) {
            console.error('Error al obtener Horario por ID:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }

    async crear(req, res) {
        try {
            const { dias, horaInicio, horaFinal } = req.body;
            if (!dias || !horaInicio || !horaFinal) {
                return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
            }
            const newHorario = await Crud.crear('Horarios', req.body);
            res.status(201).json({ success: true, data: newHorario });
        } catch (error) {
            console.error('Error al crear Horario:', error);
            res.status(400).json({ success: false, message: error.message || 'Error al crear' });
        }
    }

    async actualizar(req, res) {
        try {
            const updatedHorario = await Crud.actualizar('Horarios', 'idHorario', req.params.id, req.body);
            res.json({ success: true, data: updatedHorario });
        } catch (error) {
            console.error('Error al actualizar Horario:', error);
            res.status(400).json({ success: false, message: error.message || 'Error al actualizar' });
        }
    }

    async eliminar(req, res) {
        try {
            const result = await Crud.eliminar('Horarios', 'idHorario', req.params.id);
            res.json({ success: true, message: result.mensaje });
        } catch (error) {
            console.error('Error al eliminar Horario:', error);
            res.status(400).json({ success: false, message: error.message || 'Error al eliminar' });
        }
    }
}

module.exports = new HorariosController();