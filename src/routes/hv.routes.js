const express = require('express');
const router = express.Router();
const HvController = require('../controllers/hv.controller'); // Ajusta la ruta según tu estructura de carpetas (ej. si controllers está al mismo nivel que routes)

// Middleware para parsear JSON (y opcionalmente archivos para BLOBs como hvImagen)
router.use(express.json({ limit: '10mb' })); // Aumenta el límite para posibles BLOBs grandes
router.use(express.urlencoded({ extended: true, limit: '10mb' }));

// GET /api/hv - Obtener todos los registros de Hv
router.get('/', async (req, res) => {
    try {
        const hvs = await HvController.obtenerTodos();
        res.json({ 
            success: true, 
            data: hvs,
            count: hvs.length 
        });
    } catch (error) {
        console.error('Error al obtener Hv:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// GET /api/hv/:id - Obtener un registro de Hv por ID
router.get('/:id', async (req, res) => {
    try {
        const hv = await HvController.obtenerPorId(req.params.id);
        if (!hv) {
            return res.status(404).json({ 
                success: false, 
                message: 'Registro no encontrado' 
            });
        }
        res.json({ success: true, data: hv });
    } catch (error) {
        console.error('Error al obtener Hv por ID:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// POST /api/hv - Crear un nuevo registro en Hv
router.post('/', async (req, res) => {
    try {
        // Valida campos requeridos (opcional, pero recomendado)
        const { idCita, hvDesc, servDescripcion } = req.body;
        if (!idCita || !hvDesc || !servDescripcion) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos requeridos: idCita, hvDesc, servDescripcion' 
            });
        }

        // Mensaje: Si hvImagen viene como Base64 o archivo, conviértelo a Buffer aquí
        // Ejemplo: if (req.body.hvImagen) { data.hvImagen = Buffer.from(req.body.hvImagen, 'base64'); }
        const data = { ...req.body };
        const newHv = await HvController.crear(data);
        res.status(201).json({ success: true, data: newHv });
    } catch (error) {
        console.error('Error al crear Hv:', error);
        res.status(400).json({ 
            success: false, 
            message: error.message || 'Error al crear el registro' 
        });
    }
});

// PUT /api/hv/:id - Actualizar un registro en Hv por ID
router.put('/:id', async (req, res) => {
    try {
        // Mensaje: Similar a POST, maneja hvImagen como Buffer si es necesario
        const data = { ...req.body };
        const updatedHv = await HvController.actualizar(req.params.id, data);
        if (!updatedHv) {
            return res.status(404).json({ 
                success: false, 
                message: 'Registro no encontrado' 
            });
        }
        res.json({ success: true, data: updatedHv });
    } catch (error) {
        console.error('Error al actualizar Hv:', error);
        res.status(400).json({ 
            success: false, 
            message: error.message || 'Error al actualizar el registro' 
        });
    }
});

// DELETE /api/hv/:id - Eliminar un registro de Hv por ID
router.delete('/:id', async (req, res) => {
    try {
        const result = await HvController.eliminar(req.params.id);
        res.json({ success: true, message: result.mensaje });
    } catch (error) {
        console.error('Error al eliminar Hv:', error);
        res.status(400).json({ 
            success: false, 
            message: error.message || 'Error al eliminar el registro' 
        });
    }
});

// GET /api/hv/completa/todas - Obtener todas las HV con información completa
router.get('/completa/todas', async (req, res) => {
    try {
        const hvs = await HvController.obtenerTodasHvCompletas();
        res.json({ 
            success: true, 
            data: hvs,
            count: hvs.length 
        });
    } catch (error) {
        console.error('Error al obtener todas las HV completas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// GET /api/hv/completa/cliente/:idCliente - Obtener HV completas por ID de cliente
router.get('/completa/cliente/:idCliente', async (req, res) => {
    try {
        const hvs = await HvController.obtenerHvCompletaPorCliente(req.params.idCliente);
        res.json({ 
            success: true, 
            data: hvs,
            count: hvs.length 
        });
    } catch (error) {
        console.error('Error al obtener HV completas por cliente:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// GET /api/hv/completa/hv/:idHv - Obtener una HV específica con información completa
router.get('/completa/hv/:idHv', async (req, res) => {
    try {
        const hv = await HvController.obtenerHvCompletaPorId(req.params.idHv);
        if (!hv) {
            return res.status(404).json({ 
                success: false, 
                message: 'Hoja de vida no encontrada' 
            });
        }
        res.json({ success: true, data: hv });
    } catch (error) {
        console.error('Error al obtener HV completa por ID:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// GET /api/hv/cita/:idCita - Obtener HV por ID de cita
router.get('/cita/:idCita', async (req, res) => {
    try {
        const hv = await HvController.obtenerPorIdCita(req.params.idCita);
        if (!hv) {
            return res.status(404).json({ 
                success: false, 
                message: 'Hoja de vida no encontrada para esta cita' 
            });
        }
        res.json({ success: true, data: hv });
    } catch (error) {
        console.error('Error al obtener HV por ID de cita:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

module.exports = router;