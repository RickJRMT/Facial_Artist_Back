const express = require('express');
const router = express.Router();
const CitasProfesionalController = require('../controllers/citas_profesional.controller');

// Nuevo: GET /api/citas-profesional/all (todas citas globales)
router.get('/all', CitasProfesionalController.getAllCitas);

// GET /profesional/:id
router.get('/profesional/:id', CitasProfesionalController.getCitasByProfesional);

// GET /date/:fecha
router.get('/date/:fecha', CitasProfesionalController.getCitasByDate);

// GET /stats
router.get('/stats', CitasProfesionalController.getEstadisticasCitas);

module.exports = router;