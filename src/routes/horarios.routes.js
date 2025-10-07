const express = require('express');
const router = express.Router();
const HorariosController = require('../controllers/horarios.controller'); // Ajusta la ruta

// Middleware para parsear JSON
router.use(express.json({ limit: '10mb' })); // Límite bajo ya que no hay imágenes grandes
router.use(express.urlencoded({ extended: true, limit: '10mb' }));

// GET /api/horarios - Obtener todos los registros de Horarios
router.get('/', async (req, res) => {
    try {
        const horarios = await HorariosController.obtenerTodos();
        res.json({
            success: true,
            data: horarios,
            count: horarios.length
        });
    } catch (error) {
        console.error('Error al obtener Horarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// GET /api/horarios/:id - Obtener un Horario por ID
router.get('/:id', async (req, res) => {
    try {
        const horario = await HorariosController.obtenerPorId(req.params.id);
        if (!horario) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }
        res.json({ success: true, data: horario });
    } catch (error) {
        console.error('Error al obtener Horario por ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// POST /api/horarios - Crear un nuevo Horario
router.post('/', async (req, res) => {
    try {
        // Validar campos requeridos
        const { dias, horaInicio, horaFinal } = req.body;
        if (!dias || !horaInicio || !horaFinal) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: dias, horaInicio, horaFinal'
            });
        }

        const data = { ...req.body };
        const newHorario = await HorariosController.crear(data);
        res.status(201).json({ success: true, data: newHorario });
    } catch (error) {
        console.error('Error al crear Horario:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear el registro'
        });
    }
});

// PUT /api/horarios/:id - Actualizar un Horario por ID
router.put('/:id', async (req, res) => {
    try {
        const data = { ...req.body };
        const updatedHorario = await HorariosController.actualizar(req.params.id, data);
        if (!updatedHorario) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }
        res.json({ success: true, data: updatedHorario });
    } catch (error) {
        console.error('Error al actualizar Horario:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar el registro'
        });
    }
});

// DELETE /api/horarios/:id - Eliminar un Horario por ID
router.delete('/:id', async (req, res) => {
    try {
        const result = await HorariosController.eliminar(req.params.id);
        res.json({ success: true, message: result.mensaje });
    } catch (error) {
        console.error('Error al eliminar Horario:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al eliminar el registro'
        });
    }
});

module.exports = router;