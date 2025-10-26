const express = require('express');
const router = express.Router();
const CitasController = require('../controllers/citas_admin.controller');

// Obtener todas las citas con detalles
router.get('/', async (req, res) => {
    try {
        const citas = await CitasController.obtenerCitasConDetalles();
        res.json(citas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las citas', error: error.message });
    }
});

module.exports = router; 